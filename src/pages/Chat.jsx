import React, { useEffect, useState, useRef, useCallback } from "react";
import "./Chat.css";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import chatAPI from "../utils/chatAPI";
import { createSocketConnection } from "../utils/socket";

const Chat = () => {
  const { targetUserId } = useParams();
  const navigate = useNavigate();
  const user = useSelector((store) => store.user);

  const currentUserId = user?._id;
  const token = user?.token;

  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const socketRef = useRef(null);
  const activeChatIdRef = useRef(activeChatId);

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  // 🚀 CONNECT SOCKET
  useEffect(() => {
    if (!currentUserId) return;

    const socket = createSocketConnection();
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      if (activeChatIdRef.current) {
        socket.emit("joinChat", activeChatIdRef.current);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("🔌 Socket disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error.message);
    });

    socket.on("messageReceived", (message) => {
      if (message.chatId === activeChatIdRef.current) {
        setMessages((prev) => {
          // ❗ avoid duplicates
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }

      updateChatPreview(message.chatId, message);
    });

    return () => socket.disconnect();
  }, [currentUserId]);

  // 🚀 JOIN CHAT ROOM
  useEffect(() => {
    if (!activeChatId || !socketRef.current) return;

    // join the room immediately if we are already connected
    if (socketRef.current.connected) {
      socketRef.current.emit("joinChat", activeChatId);
    }
  }, [activeChatId]);

  // 🚀 LOAD CHATS
  const loadChats = async () => {
    try {
      const data = await chatAPI.getChats();
      setChats(data);

      if (targetUserId) {
        const existing = data.find((chat) =>
          chat.participants.some((p) => p._id === targetUserId)
        );

        if (existing) {
          setActiveChatId(existing._id);
        } else {
          const newChat = await chatAPI.createChat([
            currentUserId,
            targetUserId,
          ]);
          setChats((prev) => [newChat, ...prev]);
          setActiveChatId(newChat._id);
          navigate(`/chat/${targetUserId}`, { replace: true });
        }
      } else if (data.length > 0) {
        setActiveChatId(data[0]._id);
      }
    } catch (err) {
      toast.error("Failed to load chats");
    }
  };

  useEffect(() => {
    if (currentUserId) loadChats();
  }, [currentUserId]);

  // 🚀 LOAD MESSAGES
  const loadMessages = async (chatId) => {
    try {
      const data = await chatAPI.getMessages(chatId);
      setMessages(data.reverse());
    } catch {
      toast.error("Failed to load messages");
    }
  };

  useEffect(() => {
    if (activeChatId) loadMessages(activeChatId);
  }, [activeChatId]);

  // 🚀 UPDATE CHAT PREVIEW
  const updateChatPreview = (chatId, message) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat._id === chatId ? { ...chat, lastMessage: message } : chat
      )
    );
  };

  // 🚀 SEND MESSAGE (SOCKET)
  const sendMessage = () => {
    const trimmed = text.trim();
    if (!trimmed || !activeChatId) return;

    setText("");

    // 🔥 REAL-TIME SEND
    socketRef.current.emit("sendMessage", {
      chatId: activeChatId,
      text: trimmed,
    });
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="chat-page">
      <div className="chat-shell">

        {/* 🔥 SIDEBAR */}
        <aside className="chat-sidebar">
          <div className="chat-title">Chats</div>

          {chats.map((chat) => {
            const other = chat.participants.find(
              (p) => p._id !== currentUserId
            );

            return (
              <div
                key={chat._id}
                className={`chat-convo ${activeChatId === chat._id ? "active" : ""
                  }`}
                onClick={() => setActiveChatId(chat._id)}
              >
                <div>{other?.firstName}</div>
                <div>{chat.lastMessage?.text || "No messages"}</div>
              </div>
            );
          })}
        </aside>

        {/* 🔥 CHAT AREA */}
        <section className="chat-thread">

          <div className="chat-thread-body">
            {messages.map((m) => {
              const isMine =
                m.senderId === currentUserId ||
                m.senderId?._id === currentUserId;

              return (
                <div
                  key={m._id}
                  className={`chat-msg ${isMine ? "me" : "them"}`}
                >
                  <div className="chat-bubble">
                    {m.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 🔥 INPUT */}
          <div className="chat-composer">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type..."
            />

            <button onClick={sendMessage}>Send</button>
          </div>

        </section>
      </div>
    </div>
  );
};

export default Chat;