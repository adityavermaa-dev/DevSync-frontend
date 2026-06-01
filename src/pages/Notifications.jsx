import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import notificationAPI from "../utils/notificationAPI";
import {
  setNotifications,
  setLoadingNotifications,
  markNotificationRead,
  markAllRead,
  removeNotification,
  clearNotifications,
} from "../redux/notificationSlice";
import "./Notifications.css";


const TYPE_CONFIG = {
  project: { emoji: "🚀", label: "Project", cssClass: "project" },
  project_application: { emoji: "📋", label: "Project", cssClass: "project" },
  project_accepted: { emoji: "🎉", label: "Project", cssClass: "project" },
  connection: { emoji: "🤝", label: "Connection", cssClass: "connection" },
  connection_request: { emoji: "👋", label: "Connection", cssClass: "connection" },
  connection_accepted: { emoji: "✅", label: "Connection", cssClass: "connection" },
  message: { emoji: "💬", label: "Message", cssClass: "message" },
  comment: { emoji: "💬", label: "Comment", cssClass: "comment" },
  system: { emoji: "🔔", label: "System", cssClass: "system" },
  default: { emoji: "🔔", label: "Update", cssClass: "system" },
};

const getTypeConfig = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.default;


const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString([], { month: "short", day: "numeric" });
};

const isToday = (dateStr) => new Date(dateStr).toDateString() === new Date().toDateString();
const isYesterday = (dateStr) => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return new Date(dateStr).toDateString() === d.toDateString();
};


const TABS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "project", label: "Projects" },
  { key: "connection", label: "Connections" },
  { key: "message", label: "Messages" },
];

const Notifications = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, loading, unreadCount } = useSelector((s) => s.notifications);
  const [activeTab, setActiveTab] = useState("all");

  
  const fetchNotifications = useCallback(async () => {
    dispatch(setLoadingNotifications(true));
    try {
      const data = await notificationAPI.getNotifications();
      dispatch(setNotifications(data));
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      dispatch(setLoadingNotifications(false));
    }
  }, [dispatch]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  
  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      dispatch(markAllRead());
      toast.success("All marked as read");
    } catch {
      toast.error("Failed");
    }
  };

  const handleClearAll = async () => {
    try {
      await notificationAPI.clearAll();
      dispatch(clearNotifications());
      toast.success("Notifications cleared");
    } catch {
      toast.error("Failed");
    }
  };

  const handleDismiss = async (e, id) => {
    e.stopPropagation();
    try {
      await notificationAPI.deleteNotification(id);
      dispatch(removeNotification(id));
    } catch {
      toast.error("Failed");
    }
  };

  const handleClick = async (notif) => {
    
    if (!notif.read) {
      try {
        await notificationAPI.markAsRead(notif._id);
        dispatch(markNotificationRead(notif._id));
      } catch {  }
    }

    
    const type = notif.type || "";
    if (type.startsWith("project") && notif.projectId) {
      navigate(`/projects/${notif.projectId}`);
    } else if (type.startsWith("connection") && notif.fromUserId) {
      navigate(`/requests`);
    } else if (type === "message" && notif.chatId) {
      navigate(`/chat`);
    }
  };

  
  const filtered = useMemo(() => {
    if (activeTab === "all") return list;
    if (activeTab === "unread") return list.filter((n) => !n.read);
    return list.filter((n) => (n.type || "").startsWith(activeTab));
  }, [list, activeTab]);

  
  const grouped = useMemo(() => {
    const groups = [];
    let currentLabel = "";

    filtered.forEach((n) => {
      let label;
      if (isToday(n.createdAt)) label = "Today";
      else if (isYesterday(n.createdAt)) label = "Yesterday";
      else label = "Earlier";

      if (label !== currentLabel) {
        groups.push({ type: "label", label, key: `label-${label}` });
        currentLabel = label;
      }
      groups.push({ type: "item", data: n, key: n._id });
    });

    return groups;
  }, [filtered]);

  
  const tabCounts = useMemo(() => ({
    all: list.length,
    unread: unreadCount,
    project: list.filter((n) => (n.type || "").startsWith("project")).length,
    connection: list.filter((n) => (n.type || "").startsWith("connection")).length,
    message: list.filter((n) => n.type === "message").length,
  }), [list, unreadCount]);

  return (
    <div className="notifications-page">
      {}
      <div className="notif-header">
        <div className="notif-header-left">
          <div className="notif-header-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
            </svg>
          </div>
          <div>
            <h1>Notifications</h1>
            <span className="notif-header-count">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
            </span>
          </div>
        </div>

        <div className="notif-header-actions">
          {unreadCount > 0 && (
            <button className="notif-action-btn" onClick={handleMarkAllRead}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              Mark all read
            </button>
          )}
          {list.length > 0 && (
            <button className="notif-action-btn danger" onClick={handleClearAll}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
              Clear all
            </button>
          )}
        </div>
      </div>

      {}
      <div className="notif-filter-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`notif-tab ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            {tabCounts[tab.key] > 0 && (
              <span className="notif-tab-count">{tabCounts[tab.key]}</span>
            )}
          </button>
        ))}
      </div>

      {}
      <div className="notif-list">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div className="notif-skeleton" key={`skel-${i}`} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="notif-skeleton-icon" />
              <div className="notif-skeleton-lines">
                <div className="notif-skeleton-line" />
                <div className="notif-skeleton-line" />
              </div>
            </div>
          ))
        ) : grouped.length === 0 ? (
          <div className="notif-empty">
            <div className="notif-empty-icon">🔔</div>
            <h3>{activeTab === "unread" ? "No unread notifications" : "No notifications yet"}</h3>
            <p>
              {activeTab === "unread"
                ? "You're all caught up! Great job."
                : "When someone interacts with you, you'll see it here."}
            </p>
          </div>
        ) : (
          grouped.map((entry) => {
            if (entry.type === "label") {
              return (
                <div key={entry.key} className="notif-group-label">
                  {entry.label}
                </div>
              );
            }

            const n = entry.data;
            const config = getTypeConfig(n.type);

            return (
              <div
                key={entry.key}
                className={`notif-item ${n.read ? "" : "unread"}`}
                onClick={() => handleClick(n)}
                style={{ animationDelay: `${0.03}s` }}
              >
                <div className={`notif-icon ${config.cssClass}`}>
                  {config.emoji}
                </div>

                <div className="notif-content">
                  <p className="notif-text" dangerouslySetInnerHTML={{ __html: n.message || n.text || "New notification" }} />
                  <div className="notif-meta">
                    <span className="notif-time">{timeAgo(n.createdAt)}</span>
                    <span className={`notif-type-badge ${config.cssClass}`}>
                      {config.label}
                    </span>
                  </div>
                </div>

                <button
                  className="notif-dismiss"
                  onClick={(e) => handleDismiss(e, n._id)}
                  title="Dismiss"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Notifications;
