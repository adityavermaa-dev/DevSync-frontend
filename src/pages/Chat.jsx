import React, { useEffect, useState, useRef } from "react";
import "./Chat.css";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { createSocketConnection } from "../utils/socket";

const Chat = () => {
  const { targetUserId } = useParams();
  const user = useSelector((store) => store.user);
  const userId = user?._id;

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const socketRef = useRef(null);

  useEffect(() => {
    const socket = createSocketConnection();
    socketRef.current = socket;

    socket.emit("joinChat", { userId, targetUserId });

    socket.on("messageReceived", ({ firstName, text }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          firstName,
          text,
          from: firstName === user?.firstName ? "me" : "them",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    });

    return () => {
      socket.off("messageReceived");
      socket.disconnect();
    };
  }, [userId, targetUserId, user?.firstName]);

  if (!user) {
    return <div>Loading...</div>;
  }

  const sendMessage = () => {
  if (!text.trim()) return;

  const socket = socketRef.current;
  if (!socket) return;

  socket.emit("sendMessage", {
    firstName: user.firstName,
    userId,
    targetUserId,
    text,
  });

  setText("");
};

    // setMessages((prev) => [
    //   ...prev,
    //   {
    //     id: Date.now(),
    //     firstName: user.firstName,
    //     text,
    //     from: "me",
    //     time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    //   },
    // ]);

  //   setText("");
  // };

  return (
    <div className="chat-page">
      <div className="chat-shell single">
        <section className="chat-thread">

          <header className="chat-thread-header">
            <div className="chat-peer-meta">
              <div className="chat-peer-name">Chat</div>
              <div className="chat-peer-status">
                {targetUserId ? `Chatting with: ${targetUserId}` : "Open a chat"}
              </div>
            </div>
          </header>

          <div className="chat-thread-body">

            {messages.length === 0 && (
              <div className="chat-empty">Type a message to start.</div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={`chat-msg ${m.from === "me" ? "me" : "them"}`}
              >
                <div className={`chat-bubble ${m.from === "me" ? "me" : "them"}`}>
                  <div className="chat-text">{m.text}</div>
                  <div className="chat-meta">
                    <span className="chat-time">{m.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <footer className="chat-composer">
            <div className="chat-input-wrap">
              <textarea
                className="chat-input"
                rows={1}
                placeholder="Type a message…"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
            </div>

            <button className="chat-send-btn" onClick={sendMessage}>
              <span className="chat-send-icon">{sendIcon}</span>
              <span className="chat-send-text">Send</span>
            </button>
          </footer>

        </section>
      </div>
    </div>
  );
};

/* Icons */

const sendIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 12 16.5-7.5-6.3 16.5-2.7-7.2-7.5-1.8Z" />
  </svg>
);

export default Chat;