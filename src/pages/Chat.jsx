import React, { useEffect,useState } from 'react';
import './Chat.css';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { createSocketConnection } from '../utils/socket';

const Chat = () => {
  const { targetUserId } = useParams();
  const user = useSelector(store => store.user);
  const userId = user._id;
  const targetUser = user.filter((u) => u._id === targetUserId);
  const [newMessage,setNewMessage] = useState([]);
  
  useEffect(() => {
    const socket = createSocketConnection();
    socket.emit("joinChat",{userId,targetUserId})

    socket.on("messageReceived",({firstName,text}) => {
      setNewMessage((newMessage => [...newMessage,{firstName,text}]))
    })

    return () => {
      socket.disconnect();
    }
  },[userId,targetUserId])

  const sendMessage = () => {
    const socket = createSocketConnection();
    socket.emit("sendMessage",{
      firstName : user.firstName,
      userId,
      targetUserId,
      text : newMessage
    })
  }

  return (
    <div className="chat-page">
      <div className="chat-shell single">
        <section className="chat-thread" aria-label="Chat thread">
          <header className="chat-thread-header">
            <div className="chat-peer">
              <div className="chat-avatar-wrap large">
                <img className="chat-avatar large" src={targetUser.photoUrl} alt={targetUser.firstName} />
                <span className="chat-presence" aria-hidden="true" />
              </div>
              <div className="chat-peer-meta">
                <div className="chat-peer-name">{targetUser.firstName}</div>
                <div className="chat-peer-status">
                  <span className="chat-status-dot" aria-hidden="true" />
                  {targetUserId ? `Chatting with: ${targetUserId}` : 'Open from Connections → Chat'}
                </div>
              </div>
            </div>
          </header>

          <div className="chat-thread-body" role="log" aria-label="Messages">
            {newMessage.length ? (
              <div className="chat-day-divider"><span>Today</span></div>
            ) : (
              <div className="chat-empty" aria-hidden="true">
                Type a message to start.
              </div>
            )}

            {newMessage.map((m) => (
              <div key={m.id} className={`chat-msg ${m.from === 'me' ? 'me' : 'them'}`}>
                <div className={`chat-bubble ${m.from === 'me' ? 'me' : 'them'}`}>
                  <div className="chat-text">{m.text}</div>
                  <div className="chat-meta">
                    <span className="chat-time">{m.time}</span>
                    {m.from === 'me' ? (
                      <span className="chat-check" aria-hidden="true">{doubleCheckIcon}</span>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
            {/* <div ref={bottomRef} /> */}
          </div>

          <footer className="chat-composer" aria-label="Message composer">
            <div className="chat-input-wrap">
              <textarea
                className="chat-input"
                rows={1}
                placeholder="Type a message…"
                aria-label="Type a message"
                value={newMessage}
                onChange={(e) =>
                  setNewMessage(e.target.value)
                  }
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
            </div>

            <button className="chat-send-btn" type="button" aria-label="Send message" onClick={sendMessage}>
              <span className="chat-send-icon" aria-hidden="true">{sendIcon}</span>
              <span className="chat-send-text">Send</span>
            </button>
          </footer>
        </section>
      </div>
    </div>
  );
};

/* ── Icons (inline SVG) ── */
const sendIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 12 16.5-7.5-6.3 16.5-2.7-7.2-7.5-1.8Z" />
  </svg>
);

const doubleCheckIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 12.75l2.25 2.25L15 9.75" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 12.75l2.25 2.25L21 9.75" />
  </svg>
);

export default Chat;
