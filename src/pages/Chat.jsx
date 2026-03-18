import React, { useEffect, useState, useRef } from "react";
import "./Chat.css";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { createSocketConnection } from "../utils/socket";
import axios from "axios";
import { BASE_URL } from "../constants/commonData";

const Chat = () => {
  const { chatId } = useParams();
  const user = useSelector((store) => store.user);
  const token = user?.token;

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);

  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const bottomRef = useRef(null);

  // 🔥 Fetch messages
  useEffect(() => {
    if (!chatId || !token) return;

    const fetchMessages = async () => {
      const res = await axios.get(`${BASE_URL}/messages/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessages(res.data.reverse());
    };

    fetchMessages();
  }, [chatId, token]);

  // 🔥 Socket setup
  useEffect(() => {
    if (!chatId || !token) return;

    const socket = createSocketConnection(token);
    socketRef.current = socket;

    socket.emit("joinChat", chatId);

    // ✅ mark seen AFTER socket ready
    socket.emit("markSeen", { chatId });

    socket.on("messageReceived", (message) => {
      setMessages((prev) => [...prev, message]);

      // mark seen when new message comes
      socket.emit("markSeen", { chatId });
    });

    socket.on("typing", ({ userId }) => {
      if (userId !== user._id) {
        setTypingUser(userId);
      }
    });

    socket.on("stopTyping", () => {
      setTypingUser(null);
    });

    socket.on("messagesSeen", ({ userId }) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (!msg.readBy?.includes(userId)) {
            return {
              ...msg,
              readBy: [...(msg.readBy || []), userId],
            };
          }
          return msg;
        })
      );
    });

    return () => {
      socket.off("messageReceived");
      socket.off("typing");
      socket.off("stopTyping");
      socket.off("messagesSeen");
      socket.disconnect();
    };
  }, [chatId, token, user?._id]);

  // 🔥 Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!user) return <div>Loading...</div>;

  // 🔥 Send message
  const sendMessage = () => {
    if (!text.trim()) return;

    socketRef.current.emit("sendMessage", { chatId, text });

    setText("");
    setIsTyping(false);
    socketRef.current.emit("stopTyping", chatId);
  };

  // 🔥 Typing handler (FIXED)
  const handleTyping = (e) => {
    setText(e.target.value);

    if (!isTyping) {
      socketRef.current.emit("typing", chatId);
      setIsTyping(true);
    }

    clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit("stopTyping", chatId);
      setIsTyping(false);
    }, 1500);
  };

  const isSeen = (msg) => msg.readBy?.length > 1;

  return (
    <div className="chat-page">
      <div className="chat-shell single">
        <section className="chat-thread">

          <header className="chat-thread-header">
            <div className="chat-peer-meta">
              <div className="chat-peer-name">Chat</div>
              <div className="chat-peer-status">Chat ID: {chatId}</div>
            </div>
          </header>

          <div className="chat-thread-body">

            {messages.map((m) => (
              <div
                key={m._id}
                className={`chat-msg ${m.senderId === user._id ? "me" : "them"
                  }`}
              >
                <div className={`chat-bubble ${m.senderId === user._id ? "me" : "them"
                  }`}>
                  <div className="chat-text">
                    {m.isDeleted ? "Message deleted" : m.text}
                  </div>

                  <div className="chat-meta">
                    <span className="chat-time">
                      {new Date(m.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>

                    {m.isEdited && <span> (edited)</span>}

                    {/* ✅ Seen status */}
                    {m.senderId === user._id && (
                      <span className="seen-status">
                        {isSeen(m) ? " ✔✔ Seen" : " ✔ Sent"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* 🔥 Typing indicator */}
            {typingUser && (
              <div className="typing-indicator">Typing...</div>
            )}

            <div ref={bottomRef} />
          </div>

          <footer className="chat-composer">
            <textarea
              className="chat-input"
              placeholder="Type a message…"
              value={text}
              onChange={handleTyping} // ✅ FIXED
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />

            <button className="chat-send-btn" onClick={sendMessage}>
              Send
            </button>
          </footer>

        </section>
      </div>
    </div>
  );
};

export default Chat;