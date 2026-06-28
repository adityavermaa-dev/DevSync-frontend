import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import chatAPI from "../utils/chatAPI";
import { createSocketConnection } from "../utils/socket";
import defaultAvatar from '../assests/images/default-user-image.png';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Peer from 'peerjs';
import VideoCallModal from '../components/VideoCallModal';
import { extractGithubUsername, fetchGithubActivity, fetchGithubRepos, summarizeGithubEvent } from "../utils/githubAPI";

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
  const [sidebarTab, setSidebarTab] = useState("direct"); 

  
  const [githubEvents, setGithubEvents] = useState([]);
  const [githubRepos, setGithubRepos] = useState([]);
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubError, setGithubError] = useState(null);

  
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [isIncoming, setIsIncoming] = useState(false);
  const [isOutgoing, setIsOutgoing] = useState(false);
  const [callerName, setCallerName] = useState("");
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callStatus, setCallStatus] = useState(null); 

  const peerRef = useRef(null);
  const currentCallRef = useRef(null);
  const localStreamRef = useRef(null);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const targetProjectId = queryParams.get("project");

  const socketRef = useRef(null);
  const activeChatIdRef = useRef(activeChatId);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const conversationsRef = useRef(null);
  const typingStopTimeoutRef = useRef(null);
  const didResetSidebarScrollRef = useRef(false);

  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  useEffect(() => { activeChatIdRef.current = activeChatId; }, [activeChatId]);

  
  const scrollToBottom = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [text]);

  const endCallUI = useCallback(() => {
    setIsVideoCallOpen(false);
    setIsIncoming(false);
    setIsOutgoing(false);
    setCallStatus(null);
    setCallerName("");

    const activeLocalStream = localStreamRef.current;
    if (activeLocalStream) {
      activeLocalStream.getTracks().forEach((track) => track.stop());
    }
    localStreamRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    currentCallRef.current = null;
  }, []);

  
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

    socket.on("messageSeen", ({ chatId, messageId }) => {
      if (chatId === activeChatIdRef.current && messageId) {
        setLastSeenMessageId(messageId);
      }
    });

    
    const peer = new Peer(currentUserId);
    peerRef.current = peer;

    peer.on('call', (call) => {
      
      setIsVideoCallOpen(true);
      setIsIncoming(true);
      setCallStatus('calling');
      setCallerName('Incoming Caller');
      currentCallRef.current = call;
      
      call.on('stream', (rStream) => {
        setRemoteStream(rStream);
      });
      call.on('close', () => {
        endCallUI();
      });
    });

    return () => {
      socket.disconnect();
      peer.destroy();
    };
  }, [currentUserId, endCallUI]);

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

  
  const loadChats = useCallback(async () => {
    try {
      const data = await chatAPI.getChats();
      setChats(data);
      if (targetProjectId) {
        const existingProjectChat = data.find((chat) => chat.projectId === targetProjectId);
        if (existingProjectChat) {
          setActiveChatId(existingProjectChat._id);
          setSidebarTab("projects");
        }
      } else if (targetUserId) {
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
  }, [currentUserId, navigate, targetUserId, targetProjectId]);

  useEffect(() => { if (currentUserId) loadChats(); }, [currentUserId, loadChats]);

  
  useEffect(() => {
    if (didResetSidebarScrollRef.current) return;
    if (!conversationsRef.current) return;
    if (!chats?.length) return;
    conversationsRef.current.scrollTop = 0;
    didResetSidebarScrollRef.current = true;
  }, [chats?.length]);

  
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

  
  const activeChat = useMemo(() => chats.find((c) => c._id === activeChatId), [activeChatId, chats]);
  const isGroupChat = useMemo(
    () => activeChat?.isGroup || (activeChat?.participants?.length > 2),
    [activeChat]
  );
  const peer = useMemo(
    () => isGroupChat ? null : activeChat?.participants?.find((p) => p._id !== currentUserId),
    [activeChat, currentUserId, isGroupChat]
  );

  const peerGithubUsername = useMemo(() => extractGithubUsername(peer), [peer]);
  const groupMembers = useMemo(
    () => isGroupChat ? (activeChat?.participants || []) : [],
    [activeChat, isGroupChat]
  );
  const groupName = activeChat?.name || activeChat?.projectName || 'Group Chat';

  
  useEffect(() => {
    if (!peerGithubUsername || isGroupChat) {
      setGithubEvents([]);
      setGithubRepos([]);
      setGithubLoading(false);
      setGithubError(null);
      return;
    }

    const controller = new AbortController();
    setGithubLoading(true);
    setGithubError(null);

    Promise.all([
      fetchGithubActivity(peerGithubUsername, { perPage: 5, signal: controller.signal }),
      fetchGithubRepos(peerGithubUsername, { perPage: 3, signal: controller.signal }),
    ])
      .then(([events, repos]) => {
        setGithubEvents(Array.isArray(events) ? events : []);
        setGithubRepos(Array.isArray(repos) ? repos : []);
      })
      .catch((err) => {
        
        if (controller.signal.aborted) return;
        console.error("Failed to load GitHub data", err);
        setGithubError("GitHub activity unavailable");
        setGithubEvents([]);
        setGithubRepos([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setGithubLoading(false);
      });

    return () => controller.abort();
  }, [isGroupChat, peerGithubUsername]);

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

  
  const openMediaStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      return stream;
    } catch {
      toast.error("Failed to access camera and microphone");
      return null;
    }
  };

  const initiateCall = async () => {
    if (!peer || !peer._id) return;
    const stream = await openMediaStream();
    if (!stream) return;

    setIsVideoCallOpen(true);
    setIsOutgoing(true);
    setCallStatus('calling');
    setCallerName(peer.firstName);

    const call = peerRef.current.call(peer._id, stream);
    currentCallRef.current = call;

    call.on('stream', (rStream) => {
      setRemoteStream(rStream);
      setCallStatus('connected');
    });

    call.on('close', () => {
      endCallUI();
    });
  };

  const activeAcceptCall = async () => {
    const stream = await openMediaStream();
    if (!stream) {
        endCallUI();
        return;
    }
    
    setCallStatus('connected');
    currentCallRef.current.answer(stream);
  };

  const declineOrEndCall = () => {
    if (currentCallRef.current) {
        currentCallRef.current.close();
    }
    endCallUI();
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

  
  const filteredChats = chats.filter((chat) => {
    const isGroup = chat.isGroup || chat.participants?.length > 2;
    
    
    const isTeam = !!chat.teamId;
    
    if (sidebarTab === "direct" && isGroup) return false;
    if (sidebarTab === "teams" && (!isGroup || !isTeam)) return false;
    if (sidebarTab === "projects" && (!isGroup || isTeam)) return false;

    
    if (isGroup) {
      const name = (chat.name || chat.projectName || "").toLowerCase();
      return name.includes(searchQuery.toLowerCase());
    } else {
      const other = chat.participants.find((p) => p._id !== currentUserId);
      const name = `${other?.firstName || ""} ${other?.lastName || ""}`.toLowerCase();
      return name.includes(searchQuery.toLowerCase());
    }
  });

  
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

  if (!user) return <div className="flex h-full w-full items-center justify-center bg-[var(--bg-primary)]"><div className="text-[var(--text-secondary)]">Loading...</div></div>;

  return (
    <>
    <div className="fixed top-0 left-0 right-0 bottom-[60px] md:bottom-0 md:left-[240px] flex overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] z-10">
      <div className="flex w-full h-full">

        {/* Sidebar */}
        <aside className="w-80 flex-shrink-0 flex flex-col bg-[var(--bg-secondary)] border-r border-[var(--border-color)]">
          <div className="p-4 flex items-center justify-between border-b border-[var(--border-color)]">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Messages</h2>
            <span className="text-xs bg-[var(--border-color)] text-[var(--text-secondary)] px-2 py-0.5 rounded-full">{chats.length}</span>
          </div>

          <div className="flex p-2 gap-1 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
            <button 
              className={`flex-1 py-1.5 text-sm font-medium rounded-md text-center transition-colors ${sidebarTab === 'direct' ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]'}`}
              onClick={() => setSidebarTab('direct')}
            >
              Direct
            </button>
            <button 
              className={`flex-1 py-1.5 text-sm font-medium rounded-md text-center transition-colors ${sidebarTab === 'teams' ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]'}`}
              onClick={() => setSidebarTab('teams')}
            >
              Teams
            </button>
            <button 
              className={`flex-1 py-1.5 text-sm font-medium rounded-md text-center transition-colors ${sidebarTab === 'projects' ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]'}`}
              onClick={() => setSidebarTab('projects')}
            >
              Projects
            </button>
          </div>

          <div className="p-3 border-b border-[var(--border-color)] relative flex items-center bg-[var(--bg-secondary)]">
            <svg className="w-4 h-4 absolute left-5 text-[var(--text-secondary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
            <input className="w-full pl-9 pr-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md text-sm text-[var(--text-primary)] outline-none focus:border-[var(--color-primary)] transition-colors" placeholder="Search conversations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>

          <div className="flex-1 overflow-y-auto" ref={conversationsRef}>
            {filteredChats.map((chat) => {
              const chatIsGroup = chat.isGroup || chat.participants?.length > 2;
              const other = chatIsGroup ? null : chat.participants.find((p) => p._id !== currentUserId);
              const isActive = activeChatId === chat._id;
              const avatarUrl = chatIsGroup ? defaultAvatar : (other?.photoUrl || defaultAvatar);
              const chatDisplayName = chatIsGroup
                ? (chat.name || chat.projectName || 'Group Chat')
                : `${other?.firstName || ''} ${other?.lastName?.[0] ? `${other.lastName[0]}.` : ''}`;

              return (
                <button key={chat._id} className={`w-full flex items-start gap-3 p-3 border-b border-[var(--border-color)] transition-colors text-left ${isActive ? 'bg-[var(--bg-primary)] border-l-2 border-l-[var(--color-primary)]' : 'hover:bg-[var(--bg-primary)]'}`} onClick={() => { setActiveChatId(chat._id); setShowMembersPanel(false); }}>
                  <div className="relative w-10 h-10 flex-shrink-0">
                    <img src={avatarUrl} alt="" className="w-full h-full rounded-full object-cover border border-[var(--border-color)]" onError={(e) => { e.target.src = defaultAvatar; }} />
                    {!chatIsGroup && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[var(--bg-secondary)] rounded-full" />}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="font-medium text-sm text-[var(--text-primary)] truncate">{chatDisplayName}</span>
                      {chatIsGroup && <span className="text-[10px] bg-[var(--border-color)] text-[var(--text-secondary)] px-1.5 py-0.5 rounded ml-2">Group</span>}
                      <span className="text-[11px] text-[var(--text-secondary)] flex-shrink-0">{chat.lastMessage ? formatTime(chat.lastMessage.createdAt) : ''}</span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] truncate">{chat.lastMessage?.text || "Start a conversation..."}</p>
                  </div>
                </button>
              );
            })}

            {filteredChats.length === 0 && (
              <div className="p-6 text-center text-sm text-[var(--text-secondary)]">
                <p>No conversations yet</p>
              </div>
            )}
          </div>
        </aside>

        {/* Main Thread */}
        <section className="flex-1 flex flex-col min-w-0 bg-[var(--bg-primary)]">
          {activeChatId && (peer || isGroupChat) ? (
            <>
              {/* Header */}
              <div className="h-16 flex-shrink-0 px-6 flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
                {isGroupChat ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-2">
                        {groupMembers.slice(0, 3).map((member) => (
                          <img key={member._id} src={member.photoUrl || defaultAvatar} alt="" className="w-8 h-8 rounded-full border-2 border-[var(--bg-primary)] object-cover" onError={(e) => { e.target.src = defaultAvatar; }} />
                        ))}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[var(--text-primary)] text-sm">{groupName}</h3>
                        <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>
                          {groupMembers.length} members
                        </span>
                      </div>
                    </div>
                    <button
                      className={`p-2 rounded-md transition-colors ${showMembersPanel ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'}`}
                      onClick={() => setShowMembersPanel(!showMembersPanel)}
                      title="Members"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" /></svg>
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <div className="flex items-center gap-3">
                    <img src={peer?.photoUrl || defaultAvatar} alt="" className="w-10 h-10 rounded-full object-cover border border-[var(--border-color)]" onError={(e) => { e.target.src = defaultAvatar; }} />
                    <div>
                      <h3 className="font-semibold text-[var(--text-primary)] text-sm">{peer.firstName} {peer.lastName}</h3>
                      <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5 mt-0.5">
                        <span className={`w-2 h-2 rounded-full ${isPeerTyping ? "bg-[var(--color-primary)] animate-pulse" : "bg-green-500"}`} />
                        {isPeerTyping ? (
                          <span className="flex gap-0.5 items-center">
                            <span className="w-1 h-1 bg-[var(--color-primary)] rounded-full animate-bounce"></span><span className="w-1 h-1 bg-[var(--color-primary)] rounded-full animate-bounce" style={{animationDelay: "0.1s"}}></span><span className="w-1 h-1 bg-[var(--color-primary)] rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></span>
                          </span>
                        ) : (
                          "Online"
                        )}
                      </span>

                      {peerGithubUsername && (
                        <div className="flex items-center gap-2 mt-1 text-xs text-[var(--text-secondary)]">
                          <a
                            className="hover:text-[var(--color-primary)] transition-colors"
                            href={`https://github.com/${peerGithubUsername}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            @{peerGithubUsername}
                          </a>
                          {githubLoading ? (
                            <span className="opacity-70">Loading GitHub…</span>
                          ) : githubError ? (
                            <span className="opacity-70">{githubError}</span>
                          ) : githubEvents.length > 0 ? (
                            <div className="flex gap-2">
                              {githubEvents.slice(0, 2).map((ev) => (
                                <div key={ev.id} className="bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded border border-[var(--border-color)] truncate max-w-[120px]" title={summarizeGithubEvent(ev)}>
                                  {summarizeGithubEvent(ev)}
                                </div>
                              ))}
                            </div>
                          ) : null}

                          {!githubLoading && !githubError && githubRepos.length > 0 && (
                            <div className="flex gap-2">
                              {githubRepos.slice(0, 2).map((repo) => (
                                <a
                                  key={repo.id}
                                  className="hover:text-[var(--color-primary)] underline decoration-[var(--border-color)] underline-offset-2 transition-colors truncate max-w-[100px]"
                                  href={repo.html_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={repo.full_name}
                                >
                                  {repo.name}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={initiateCall} title="Voice Call" style={{ background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.color='var(--text-primary)'; e.currentTarget.style.borderColor='var(--text-secondary)'; }} onMouseOut={(e) => { e.currentTarget.style.color='var(--text-secondary)'; e.currentTarget.style.borderColor='var(--border-color)'; }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.273-3.973-6.869-6.869l1.293-.97c.362-.271.527-.733.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" /></svg>
                    </button>
                    <button onClick={initiateCall} title="Video Call" style={{ background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.color='var(--text-primary)'; e.currentTarget.style.borderColor='var(--text-secondary)'; }} onMouseOut={(e) => { e.currentTarget.style.color='var(--text-secondary)'; e.currentTarget.style.borderColor='var(--border-color)'; }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
                    </button>
                  </div>
                </div>
                )}
              </div>

              {/* Thread Content */}
              <div className={isGroupChat ? 'flex-1 flex min-h-0' : ''} style={isGroupChat ? {} : { display: 'contents' }}>
                <div className={isGroupChat ? 'flex-1 flex flex-col min-w-0' : ''} style={isGroupChat ? {} : { display: 'contents' }}>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={messagesContainerRef}>
                    {groupedMessages.map((item) => {
                      if (item.type === "divider") {
                        return <div key={item.key} className="flex justify-center my-6"><span className="text-xs text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-3 py-1 rounded-full border border-[var(--border-color)]">{item.day}</span></div>;
                      }

                      const m = item.message;
                      const isMine = m.senderId === currentUserId || m.senderId?._id === currentUserId;

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
                        <div key={item.key} className={`flex max-w-[85%] gap-2 ${isMine ? "ml-auto flex-row-reverse" : ""}`}>
                          {!isMine && (
                            <img src={senderAvatar} alt="" className="w-8 h-8 rounded-full object-cover border border-[var(--border-color)] mt-auto" onError={(e) => { e.target.src = defaultAvatar; }} />
                          )}

                          <div className="flex flex-col gap-1 relative group">
                            {isGroupChat && senderName && (
                              <span className="text-[11px] text-[var(--text-secondary)] ml-1">{senderName}</span>
                            )}

                            {editingId === m._id ? (
                              <div className="flex flex-col gap-2 w-full max-w-md">
                                <textarea className="w-full p-2 bg-[var(--bg-primary)] border border-[var(--color-primary)] rounded-md text-sm text-[var(--text-primary)] outline-none resize-none" value={editText} onChange={(e) => setEditText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveEdit(m._id); } if (e.key === 'Escape') cancelEdit(); }} autoFocus rows={2} />
                                <div className="flex gap-2 justify-end">
                                  <button className="text-xs bg-[var(--color-primary)] text-white px-3 py-1.5 rounded-md hover:brightness-110 transition-all" onClick={() => saveEdit(m._id)}>Save</button>
                                  <button className="text-xs bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] px-3 py-1.5 rounded-md hover:bg-[var(--border-color)] transition-all" onClick={cancelEdit}>Cancel</button>
                                </div>
                              </div>
                            ) : deleteConfirmId === m._id ? (
                              <div className="flex flex-col gap-2 bg-[var(--bg-secondary)] p-3 rounded-lg border border-[var(--border-color)]">
                                <p className="text-sm text-[var(--text-primary)]">Delete this message?</p>
                                <div className="flex gap-2">
                                  <button className="text-xs bg-red-500/10 text-red-500 hover:bg-red-500/20 px-3 py-1.5 rounded-md transition-all" onClick={() => executeDelete(m._id)}>Delete</button>
                                  <button className="text-xs bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-color)] px-3 py-1.5 rounded-md hover:bg-[var(--border-color)] transition-all" onClick={() => setDeleteConfirmId(null)}>Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className={`px-4 py-2.5 rounded-2xl text-sm relative ${isMine ? "bg-[var(--color-primary)] text-white rounded-tr-sm" : "bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-tl-sm"}`}>
                                  <div className="whitespace-pre-wrap break-words leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                                    <ReactMarkdown
                                      remarkPlugins={[remarkGfm]}
                                      components={{
                                        code({ className, children, ...props }) {
                                          const match = /language-(\w+)/.exec(className || '');
                                          const codeString = String(children).replace(/\n$/, '');
                                          const isBlock = match || codeString.includes('\n');

                                          if (isBlock) {
                                            const lang = match ? match[1] : 'code';
                                            return (
                                              <div className="my-2 rounded-xl overflow-hidden border border-[var(--border-color)] bg-[#282c34]">
                                                <div className="flex items-center justify-between px-3 py-1.5 bg-black/20 border-b border-white/10">
                                                  <span className="text-[10px] text-gray-400 font-mono uppercase">{lang}</span>
                                                  <button className="text-[10px] text-gray-400 hover:text-white transition-colors" onClick={() => { navigator.clipboard.writeText(codeString); toast.success('Copied!'); }}>Copy</button>
                                                </div>
                                                <SyntaxHighlighter style={oneDark} language={match ? match[1] : 'javascript'} PreTag="div" customStyle={{ margin: 0, borderRadius: '0 0 12px 12px', fontSize: '0.85rem', background: 'transparent' }} {...props}>
                                                  {codeString}
                                                </SyntaxHighlighter>
                                              </div>
                                            );
                                          }
                                          return <code className="font-mono text-[13px] bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded text-inherit" {...props}>{children}</code>;
                                        },
                                        a({ href, children }) {
                                          return <a href={href} target="_blank" rel="noopener noreferrer" className="underline hover:text-opacity-80">{children}</a>;
                                        }
                                      }}
                                    >
                                      {m.text}
                                    </ReactMarkdown>
                                  </div>
                                  {m.edited && <span className="text-[10px] opacity-60 ml-2 italic">(edited)</span>}
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-[11px] text-[var(--text-secondary)]">
                                  <span>{formatTime(m.createdAt)}</span>
                                  {isMine && m._optimisticPending && (
                                    <span>Sending…</span>
                                  )}
                                  {isMine && m._optimisticFailed && (
                                    <button className="text-red-500 hover:underline cursor-pointer" onClick={() => retrySend(m)} type="button">
                                      Failed • Retry
                                    </button>
                                  )}
                                  {isMine && !m._optimisticPending && !m._optimisticFailed && lastSeenMessageId && m._id === lastSeenMessageId && m._id === lastOutgoingMessageId && (
                                    <span>Seen</span>
                                  )}
                                </div>
                              </>
                            )}

                            {/* Hover Actions */}
                            {isMine && !editingId && !deleteConfirmId && !m._optimisticPending && !m._optimisticFailed && (
                              <div className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-md shadow-sm p-1">
                                <button className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] rounded" onClick={() => startEdit(m)} title="Edit">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" /></svg>
                                </button>
                                <button className="p-1 text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 rounded" onClick={() => confirmDelete(m._id)} title="Delete">
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
                  <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-primary)] flex items-end gap-3">
                    <div className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl relative focus-within:border-[var(--color-primary)] transition-colors">
                      <textarea ref={inputRef} className="w-full bg-transparent text-sm text-[var(--text-primary)] p-3 outline-none resize-none max-h-32 min-h-[44px]" value={text} onChange={handleComposerChange} onKeyDown={handleKeyDown} placeholder={isGroupChat ? `Message ${groupName}...` : "Type a message..."} rows={1} />
                    </div>
                    <button className="w-11 h-11 flex-shrink-0 bg-[var(--color-primary)] text-white rounded-xl flex items-center justify-center hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed" onClick={sendMessage} disabled={!text.trim()}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" /></svg>
                    </button>
                  </div>
                </div>

                {/* Group Members Panel */}
                {isGroupChat && showMembersPanel && (
                  <div className="w-64 flex-shrink-0 flex flex-col bg-[var(--bg-secondary)] border-l border-[var(--border-color)] overflow-y-auto">
                    <div className="p-4 border-b border-[var(--border-color)] text-sm font-semibold text-[var(--text-primary)]">
                      <h4>Members · {groupMembers.length}</h4>
                    </div>
                    <div className="flex flex-col p-2 gap-1">
                      {groupMembers.map((member) => (
                        <div key={member._id} className="flex items-center gap-3 p-2 hover:bg-[var(--bg-primary)] rounded-md transition-colors">
                          <img
                            src={member.photoUrl || defaultAvatar}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover border border-[var(--border-color)]"
                            onError={(e) => { e.target.src = defaultAvatar; }}
                          />
                          <span className="text-sm text-[var(--text-primary)] truncate flex-1">
                            {member.firstName} {member.lastName}
                          </span>
                          {member._id === currentUserId && (
                            <span className="text-[10px] bg-[var(--bg-primary)] text-[var(--text-secondary)] px-1.5 py-0.5 rounded border border-[var(--border-color)]">You</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full w-full bg-[var(--bg-primary)] text-center p-12">
              <div className="w-24 h-24 bg-[var(--bg-secondary)] rounded-3xl flex items-center justify-center mb-6 border border-[var(--border-color)]">
                <svg className="w-10 h-10 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Your Conversations</h3>
              <p className="text-[var(--text-secondary)] text-sm max-w-sm mb-6">Select a chat from the sidebar to start messaging, or browse projects to find new teams.</p>
              <button 
                onClick={() => navigate('/projects')}
                className="px-6 py-2.5 rounded-lg font-medium text-white bg-[var(--color-primary)] hover:brightness-110 transition-all flex items-center gap-2"
              >
                Explore Projects
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
      <VideoCallModal 
        isOpen={isVideoCallOpen} 
        isIncoming={isIncoming} 
        isOutgoing={isOutgoing} 
        callerName={callerName} 
        localStream={localStream} 
        remoteStream={remoteStream} 
        onAccept={activeAcceptCall} 
        onDecline={declineOrEndCall} 
        onEndCall={declineOrEndCall} 
        callStatus={callStatus} 
      />
    </>
  );
};

export default Chat;
