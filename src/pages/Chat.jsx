import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import "./Chat.css";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import chatAPI from "../utils/chatAPI";
import { createSocketConnection } from "../utils/socket";
import defaultAvatar from '../assests/images/default-user-image.png';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const formatTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatDay = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
};

const Chat = () => {
  const { targetUserId } = useParams();
  const navigate = useNavigate();
  const user = useSelector((store) => store.user);
  const currentUserId = user?._id;

  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const [lastSeenMessageId, setLastSeenMessageId] = useState(null);
  const [showMembersPanel, setShowMembersPanel] = useState(false);

  const socketRef = useRef(null);
  const activeChatIdRef = useRef(activeChatId);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const conversationsRef = useRef(null);
  const typingStopTimeoutRef = useRef(null);
  const didResetSidebarScrollRef = useRef(false);

  useEffect(() => { activeChatIdRef.current = activeChatId; }, [activeChatId]);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // Auto-resize composer textarea
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [text]);

  // Socket connection
  useEffect(() => {
    if (!currentUserId) return;
    const socket = createSocketConnection();
    socketRef.current = socket;

    socket.on("connect", () => {
      if (activeChatIdRef.current) socket.emit("joinChat", activeChatIdRef.current);
    });

    socket.on("messageReceived", (message) => {
      if (message.chatId === activeChatIdRef.current) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });

        const senderId = typeof message.senderId === "object" ? message.senderId?._id : message.senderId;
        if (senderId && senderId !== currentUserId && message?._id) {
          socket.emit("markSeen", { chatId: message.chatId, messageId: message._id });
        }
      }
      updateChatPreview(message.chatId, message);
    });

    socket.on("messageEdited", ({ messageId, text: newText }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, text: newText, edited: true } : m))
      );
    });

    socket.on("messageDeleted", ({ messageId }) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    });

    // Typing indicators (event names may need to match backend)
    socket.on("typing", ({ chatId, userId } = {}) => {
      if (chatId !== activeChatIdRef.current) return;
      if (userId && userId === currentUserId) return;
      setIsPeerTyping(true);
    });

    socket.on("stopTyping", ({ chatId, userId } = {}) => {
      if (chatId !== activeChatIdRef.current) return;
      if (userId && userId === currentUserId) return;
      setIsPeerTyping(false);
    });

    // Seen/read receipts (event name may need to match backend)
    socket.on("messageSeen", ({ chatId, messageId }) => {
      if (chatId === activeChatIdRef.current && messageId) {
        setLastSeenMessageId(messageId);
      }
    });

    return () => socket.disconnect();
  }, [currentUserId]);

  useEffect(() => {
    if (!activeChatId || !socketRef.current) return;
    if (socketRef.current.connected) socketRef.current.emit("joinChat", activeChatId);
    setIsPeerTyping(false);
    setLastSeenMessageId(null);

    return () => {
      if (typingStopTimeoutRef.current) clearTimeout(typingStopTimeoutRef.current);
      socketRef.current?.emit("stopTyping", { chatId: activeChatId });
    };
  }, [activeChatId]);

  // Load chats
  const loadChats = useCallback(async () => {
    try {
      const data = await chatAPI.getChats();
      setChats(data);
      if (targetUserId) {
        const existing = data.find((chat) => chat.participants.some((p) => p._id === targetUserId));
        if (existing) {
          setActiveChatId(existing._id);
        } else {
          const newChat = await chatAPI.createChat([currentUserId, targetUserId]);
          setChats((prev) => [newChat, ...prev]);
          setActiveChatId(newChat._id);
          navigate(`/chat/${targetUserId}`, { replace: true });
        }
      } else if (data.length > 0) {
        setActiveChatId(data[0]._id);
      }
    } catch { toast.error("Failed to load chats"); }
  }, [currentUserId, navigate, targetUserId]);

  useEffect(() => { if (currentUserId) loadChats(); }, [currentUserId, loadChats]);

  // On refresh/first load, keep the conversation list pinned to top
  useEffect(() => {
    if (didResetSidebarScrollRef.current) return;
    if (!conversationsRef.current) return;
    if (!chats?.length) return;
    conversationsRef.current.scrollTop = 0;
    didResetSidebarScrollRef.current = true;
  }, [chats?.length]);

  // Load messages
  const loadMessages = useCallback(async (chatId) => {
    try {
      const data = await chatAPI.getMessages(chatId);
      setMessages(data.reverse());
    } catch { toast.error("Failed to load messages"); }
  }, []);

  useEffect(() => { if (activeChatId) loadMessages(activeChatId); }, [activeChatId, loadMessages]);

  useEffect(() => {
    if (activeChatId) inputRef.current?.focus();
  }, [activeChatId]);

  const updateChatPreview = (chatId, message) => {
    const sidebarEl = conversationsRef.current;
    const shouldReorder = !sidebarEl || sidebarEl.scrollTop < 8;

    setChats((prev) => {
      const index = prev.findIndex((c) => c._id === chatId);
      if (index === -1) return prev;
      const updated = { ...prev[index], lastMessage: message };
      if (!shouldReorder) {
        return prev.map((c) => (c._id === chatId ? updated : c));
      }
      return [updated, ...prev.slice(0, index), ...prev.slice(index + 1)];
    });
  };

  // Active chat + peer derived state
  const activeChat = useMemo(() => chats.find((c) => c._id === activeChatId), [activeChatId, chats]);
  const isGroupChat = useMemo(
    () => activeChat?.isGroup || (activeChat?.participants?.length > 2),
    [activeChat]
  );
  const peer = useMemo(
    () => isGroupChat ? null : activeChat?.participants?.find((p) => p._id !== currentUserId),
    [activeChat, currentUserId, isGroupChat]
  );
  const groupMembers = useMemo(
    () => isGroupChat ? (activeChat?.participants || []) : [],
    [activeChat, isGroupChat]
  );
  const groupName = activeChat?.name || activeChat?.projectName || 'Group Chat';

  const lastOutgoingMessageId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const m = messages[i];
      const isMine = m.senderId === currentUserId || m.senderId?._id === currentUserId;
      if (isMine && !m._optimisticFailed && !m._optimisticPending) return m._id;
    }
    return null;
  }, [currentUserId, messages]);

  const emitTyping = useCallback(() => {
    if (!activeChatIdRef.current) return;
    socketRef.current?.emit("typing", { chatId: activeChatIdRef.current });

    if (typingStopTimeoutRef.current) clearTimeout(typingStopTimeoutRef.current);
    typingStopTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("stopTyping", { chatId: activeChatIdRef.current });
    }, 900);
  }, []);

  const markSeen = useCallback((chatId, messageId) => {
    if (!chatId) return;
    socketRef.current?.emit("markSeen", { chatId, messageId });
  }, []);

  // Mark latest incoming message as seen when viewing the thread
  useEffect(() => {
    if (!activeChatId || !peer?._id) return;
    const latestIncoming = [...messages]
      .reverse()
      .find((m) => {
        const senderId = typeof m.senderId === "object" ? m.senderId?._id : m.senderId;
        return senderId && senderId === peer._id;
      });

    if (latestIncoming?._id && !latestIncoming._optimisticPending && !latestIncoming._optimisticFailed) {
      markSeen(activeChatId, latestIncoming._id);
    }
  }, [activeChatId, markSeen, messages, peer?._id]);

  // Send
  const sendMessage = async () => {
    const trimmed = text.trim();
    if (!trimmed || !activeChatId) return;
    const tempId = `tmp-${Date.now()}`;
    const optimistic = {
      _id: tempId,
      chatId: activeChatId,
      senderId: currentUserId,
      text: trimmed,
      createdAt: new Date().toISOString(),
      _optimisticPending: true,
      _optimisticFailed: false,
    };

    setText("");
    setMessages((prev) => [...prev, optimistic]);
    updateChatPreview(activeChatId, optimistic);

    try {
      const created = await chatAPI.sendMessage(activeChatId, trimmed);
      const message = created?.chatId ? created : { ...created, chatId: activeChatId };

      if (message?._id) {
        setMessages((prev) => {
          const withoutTemp = prev.filter((m) => m._id !== tempId);
          if (withoutTemp.some((m) => m._id === message._id)) return withoutTemp;
          return [...withoutTemp, message];
        });
        updateChatPreview(activeChatId, message);
      }
    } catch {
      toast.error("Failed to send message");
      setMessages((prev) =>
        prev.map((m) => (m._id === tempId ? { ...m, _optimisticPending: false, _optimisticFailed: true } : m))
      );
    } finally {
      inputRef.current?.focus();
    }
  };

  const retrySend = async (tempMessage) => {
    if (!tempMessage?.chatId || !tempMessage?.text) return;
    setMessages((prev) =>
      prev.map((m) => (m._id === tempMessage._id ? { ...m, _optimisticPending: true, _optimisticFailed: false } : m))
    );
    try {
      const created = await chatAPI.sendMessage(tempMessage.chatId, tempMessage.text);
      const message = created?.chatId ? created : { ...created, chatId: tempMessage.chatId };
      if (message?._id) {
        setMessages((prev) => {
          const withoutTemp = prev.filter((m) => m._id !== tempMessage._id);
          if (withoutTemp.some((m) => m._id === message._id)) return withoutTemp;
          return [...withoutTemp, message];
        });
        updateChatPreview(tempMessage.chatId, message);
      }
    } catch {
      toast.error("Still failed to send");
      setMessages((prev) =>
        prev.map((m) => (m._id === tempMessage._id ? { ...m, _optimisticPending: false, _optimisticFailed: true } : m))
      );
    }
  };

  // Edit
  const startEdit = (msg) => {
    setEditingId(msg._id);
    setEditText(msg.text);
    setDeleteConfirmId(null);
  };

  const cancelEdit = () => { setEditingId(null); setEditText(""); };

  const saveEdit = async (msgId) => {
    const trimmed = editText.trim();
    if (!trimmed) return;
    try {
      await chatAPI.editMessage(msgId, trimmed);
      setMessages((prev) =>
        prev.map((m) => (m._id === msgId ? { ...m, text: trimmed, edited: true } : m))
      );
      socketRef.current?.emit("editMessage", { chatId: activeChatId, messageId: msgId, text: trimmed });
      setEditingId(null);
      setEditText("");
      toast.success("Message edited");
    } catch { toast.error("Failed to edit message"); }
  };

  // Delete
  const confirmDelete = (msgId) => { setDeleteConfirmId(msgId); setEditingId(null); };

  const executeDelete = async (msgId) => {
    try {
      await chatAPI.deleteMessage(msgId);
      setMessages((prev) => prev.filter((m) => m._id !== msgId));
      socketRef.current?.emit("deleteMessage", { chatId: activeChatId, messageId: msgId });
      setDeleteConfirmId(null);
      toast.success("Message deleted");
    } catch { toast.error("Failed to delete message"); }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleComposerChange = (e) => {
    setText(e.target.value);
    emitTyping();
  };

  // Filter chats
  const filteredChats = chats.filter((chat) => {
    const other = chat.participants.find((p) => p._id !== currentUserId);
    const name = `${other?.firstName || ""} ${other?.lastName || ""}`.toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  // Group messages by day
  const groupedMessages = [];
  let lastDay = "";
  messages.forEach((m) => {
    const day = formatDay(m.createdAt);
    if (day !== lastDay) {
      groupedMessages.push({ type: "divider", day, key: `div-${m._id}` });
      lastDay = day;
    }
    groupedMessages.push({ type: "message", message: m, key: m._id });
  });

  if (!user) return <div className="chat-page"><div className="chat-loading">Loading...</div></div>;

  return (
    <div className="chat-page">
      <div className={`chat-shell ${!activeChatId ? 'no-active' : ''}`}>

        {/* ── SIDEBAR ── */}
        <aside className="chat-sidebar">
          <div className="chat-sidebar-header">
            <h2 className="chat-sidebar-title">Messages</h2>
            <span className="chat-sidebar-count">{chats.length}</span>
          </div>

          <div className="chat-search">
            <svg className="chat-search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
            <input className="chat-search-input" placeholder="Search conversations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>

          <div className="chat-conversations" ref={conversationsRef}>
            {filteredChats.map((chat) => {
              const chatIsGroup = chat.isGroup || chat.participants?.length > 2;
              const other = chatIsGroup ? null : chat.participants.find((p) => p._id !== currentUserId);
              const isActive = activeChatId === chat._id;
              const avatarUrl = chatIsGroup ? defaultAvatar : (other?.photoUrl || defaultAvatar);
              const chatDisplayName = chatIsGroup
                ? (chat.name || chat.projectName || 'Group Chat')
                : `${other?.firstName || ''} ${other?.lastName?.[0] ? `${other.lastName[0]}.` : ''}`;

              return (
                <button key={chat._id} className={`chat-convo ${isActive ? "active" : ""}`} onClick={() => { setActiveChatId(chat._id); setShowMembersPanel(false); }}>
                  <div className="chat-convo-avatar">
                    <img src={avatarUrl} alt="" className="chat-avatar" onError={(e) => { e.target.src = defaultAvatar; }} />
                    {!chatIsGroup && <span className="chat-online-dot" />}
                  </div>
                  <div className="chat-convo-info">
                    <div className="chat-convo-top">
                      <span className="chat-convo-name">{chatDisplayName}</span>
                      {chatIsGroup && <span className="chat-convo-group-badge">Group</span>}
                      <span className="chat-convo-time">{chat.lastMessage ? formatTime(chat.lastMessage.createdAt) : ''}</span>
                    </div>
                    <p className="chat-convo-snippet">{chat.lastMessage?.text || "Start a conversation..."}</p>
                  </div>
                </button>
              );
            })}

            {filteredChats.length === 0 && (
              <div className="chat-empty-sidebar">
                <p>No conversations yet</p>
              </div>
            )}
          </div>
        </aside>

        {/* ── THREAD ── */}
        <section className="chat-thread">
          {activeChatId && (peer || isGroupChat) ? (
            <>
              {/* Header */}
              <div className="chat-thread-header">
                {isGroupChat ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <div className="chat-group-header-info">
                      <div className="chat-group-avatar-stack">
                        {groupMembers.slice(0, 3).map((member) => (
                          <img key={member._id} src={member.photoUrl || defaultAvatar} alt="" onError={(e) => { e.target.src = defaultAvatar; }} />
                        ))}
                      </div>
                      <div>
                        <h3 className="chat-group-name">{groupName}</h3>
                        <span className="chat-group-meta">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>
                          {groupMembers.length} members
                        </span>
                      </div>
                    </div>
                    <button
                      className={`chat-members-toggle ${showMembersPanel ? 'active' : ''}`}
                      onClick={() => setShowMembersPanel(!showMembersPanel)}
                      title="Members"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" /></svg>
                    </button>
                  </div>
                ) : (
                  <div className="chat-peer-info">
                    <img src={peer?.photoUrl || defaultAvatar} alt="" className="chat-peer-avatar" onError={(e) => { e.target.src = defaultAvatar; }} />
                    <div>
                      <h3 className="chat-peer-name">{peer.firstName} {peer.lastName}</h3>
                      <span className="chat-peer-status">
                        <span className={`chat-status-dot ${isPeerTyping ? "typing" : "online"}`} />
                        {isPeerTyping ? (
                          <span className="chat-typing-indicator">
                            <span></span><span></span><span></span>
                          </span>
                        ) : (
                          "Online"
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Thread body + optional members panel */}
              <div className={isGroupChat ? 'chat-thread-with-panel' : ''} style={isGroupChat ? { display: 'flex', flex: 1, minHeight: 0 } : { display: 'contents' }}>
                <div className={isGroupChat ? 'chat-thread-main' : ''} style={isGroupChat ? {} : { display: 'contents' }}>
                  {/* Messages */}
                  <div className="chat-messages" ref={messagesContainerRef}>
                    {groupedMessages.map((item) => {
                      if (item.type === "divider") {
                        return <div key={item.key} className="chat-day-divider"><span>{item.day}</span></div>;
                      }

                      const m = item.message;
                      const isMine = m.senderId === currentUserId || m.senderId?._id === currentUserId;

                      // For group chats, resolve sender info
                      let senderAvatar, senderName;
                      if (isGroupChat) {
                        const senderId = typeof m.senderId === 'object' ? m.senderId?._id : m.senderId;
                        const sender = isMine ? user : groupMembers.find((p) => p._id === senderId);
                        senderAvatar = sender?.photoUrl || defaultAvatar;
                        senderName = isMine ? null : `${sender?.firstName || 'User'} ${sender?.lastName?.[0] || ''}.`;
                      } else {
                        senderAvatar = isMine
                          ? (user?.photoUrl || defaultAvatar)
                          : (peer?.photoUrl || defaultAvatar);
                        senderName = null;
                      }

                      return (
                        <div key={item.key} className={`chat-msg ${isMine ? "me" : "them"}`}>
                          {!isMine && (
                            <img src={senderAvatar} alt="" className="chat-msg-avatar" onError={(e) => { e.target.src = defaultAvatar; }} />
                          )}

                          <div className="chat-msg-content">
                            {/* Sender name label for group chats */}
                            {isGroupChat && senderName && (
                              <span className="chat-msg-sender-name">{senderName}</span>
                            )}

                            {editingId === m._id ? (
                              <div className="chat-edit-zone">
                                <textarea className="chat-edit-input" value={editText} onChange={(e) => setEditText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveEdit(m._id); } if (e.key === 'Escape') cancelEdit(); }} autoFocus rows={2} />
                                <div className="chat-edit-actions">
                                  <button className="chat-edit-save" onClick={() => saveEdit(m._id)}>Save</button>
                                  <button className="chat-edit-cancel" onClick={cancelEdit}>Cancel</button>
                                </div>
                              </div>
                            ) : deleteConfirmId === m._id ? (
                              <div className="chat-delete-confirm">
                                <p>Delete this message?</p>
                                <div className="chat-delete-actions">
                                  <button className="chat-delete-yes" onClick={() => executeDelete(m._id)}>Delete</button>
                                  <button className="chat-delete-no" onClick={() => setDeleteConfirmId(null)}>Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className={`chat-bubble ${isMine ? 'me' : 'them'}`}>
                                  <div className="chat-bubble-text chat-markdown">
                                    <ReactMarkdown
                                      remarkPlugins={[remarkGfm]}
                                      components={{
                                        code({ node, inline, className, children, ...props }) {
                                          const match = /language-(\w+)/.exec(className || '');
                                          const codeString = String(children).replace(/\n$/, '');
                                          if (!inline && match) {
                                            return (
                                              <div className="chat-code-block-wrap">
                                                <div className="chat-code-header">
                                                  <span className="chat-code-lang">{match[1]}</span>
                                                  <button className="chat-code-copy" onClick={() => { navigator.clipboard.writeText(codeString); toast.success('Copied!'); }}>Copy</button>
                                                </div>
                                                <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div" customStyle={{ margin: 0, borderRadius: '0 0 12px 12px', fontSize: '0.85rem' }} {...props}>
                                                  {codeString}
                                                </SyntaxHighlighter>
                                              </div>
                                            );
                                          }
                                          if (!inline) {
                                            return (
                                              <div className="chat-code-block-wrap">
                                                <div className="chat-code-header">
                                                  <span className="chat-code-lang">code</span>
                                                  <button className="chat-code-copy" onClick={() => { navigator.clipboard.writeText(codeString); toast.success('Copied!'); }}>Copy</button>
                                                </div>
                                                <SyntaxHighlighter style={oneDark} PreTag="div" customStyle={{ margin: 0, borderRadius: '0 0 12px 12px', fontSize: '0.85rem' }} {...props}>
                                                  {codeString}
                                                </SyntaxHighlighter>
                                              </div>
                                            );
                                          }
                                          return <code className="chat-inline-code" {...props}>{children}</code>;
                                        },
                                        a({ href, children }) {
                                          return <a href={href} target="_blank" rel="noopener noreferrer" className="chat-md-link">{children}</a>;
                                        }
                                      }}
                                    >
                                      {m.text}
                                    </ReactMarkdown>
                                  </div>
                                  {m.edited && <span className="chat-edited-tag">(edited)</span>}
                                </div>
                                <div className="chat-msg-meta">
                                  <span className="chat-msg-time">{formatTime(m.createdAt)}</span>
                                  {isMine && m._optimisticPending && (
                                    <span className="chat-msg-status">Sending…</span>
                                  )}
                                  {isMine && m._optimisticFailed && (
                                    <button className="chat-msg-retry" onClick={() => retrySend(m)} type="button">
                                      Failed • Retry
                                    </button>
                                  )}
                                  {isMine && !m._optimisticPending && !m._optimisticFailed && lastSeenMessageId && m._id === lastSeenMessageId && m._id === lastOutgoingMessageId && (
                                    <span className="chat-msg-status">Seen</span>
                                  )}
                                </div>
                              </>
                            )}

                            {/* Hover actions for own messages */}
                            {isMine && !editingId && !deleteConfirmId && !m._optimisticPending && !m._optimisticFailed && (
                              <div className="chat-msg-hover-actions">
                                <button className="chat-hover-btn" onClick={() => startEdit(m)} title="Edit">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" /></svg>
                                </button>
                                <button className="chat-hover-btn chat-hover-btn-danger" onClick={() => confirmDelete(m._id)} title="Delete">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Composer */}
                  <div className="chat-composer">
                    <div className="chat-input-wrap">
                      <textarea ref={inputRef} className="chat-input" value={text} onChange={handleComposerChange} onKeyDown={handleKeyDown} placeholder={isGroupChat ? `Message ${groupName}...` : "Type a message..."} rows={1} />
                    </div>
                    <button className="chat-send-btn" onClick={sendMessage} disabled={!text.trim()}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" /></svg>
                    </button>
                  </div>
                </div>

                {/* Members Panel (Group only) */}
                {isGroupChat && showMembersPanel && (
                  <div className="chat-members-panel">
                    <div className="chat-members-panel-header">
                      <h4>Members · {groupMembers.length}</h4>
                    </div>
                    <div className="chat-members-list">
                      {groupMembers.map((member) => (
                        <div key={member._id} className="chat-member-item">
                          <img
                            src={member.photoUrl || defaultAvatar}
                            alt=""
                            className="chat-member-avatar"
                            onError={(e) => { e.target.src = defaultAvatar; }}
                          />
                          <span className="chat-member-name">
                            {member.firstName} {member.lastName}
                          </span>
                          {member._id === currentUserId && (
                            <span className="chat-member-role">You</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="chat-empty-thread">
              <div className="chat-empty-icon animate-float">💬</div>
              <h3 className="text-gradient">Select a conversation</h3>
              <p>Choose from your existing conversations or start a new one.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Chat;