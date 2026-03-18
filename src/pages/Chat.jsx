import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./Chat.css";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import chatAPI from "../utils/chatAPI";

const Chat = () => {
  const { targetUserId } = useParams();
  const navigate = useNavigate();
  const user = useSelector((store) => store.user);
  const currentUserId = user?._id;

  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [pageError, setPageError] = useState("");
  const messageLoadRequestRef = useRef(0);

  const activeChat = useMemo(
    () => chats.find((chat) => chat._id === activeChatId) || null,
    [chats, activeChatId]
  );

  const getOtherParticipant = (chat) => {
    const participants = chat?.participants || [];
    return (
      participants.find((participant) => participant?._id !== currentUserId) ||
      participants[0] ||
      null
    );
  };

  const getMessageText = (chat) => {
    if (!chat?.lastMessage) return "No messages yet";
    if (chat.lastMessage.isDeleted) return "Message deleted";
    return chat.lastMessage.text || "No messages yet";
  };

  const getMessageKey = useCallback(
    (message) => message?._id || message?.clientTempId,
    []
  );

  const mergeMessages = useCallback(
    (existing, incoming) => {
      const incomingKeys = new Set(
        incoming.map((message) => getMessageKey(message))
      );
      const optimisticMessages = existing.filter(
        (message) =>
          message?._optimistic && !incomingKeys.has(getMessageKey(message))
      );

      const merged = [...incoming, ...optimisticMessages];
      return merged.sort(
        (a, b) =>
          new Date(a?.createdAt || 0).getTime() -
          new Date(b?.createdAt || 0).getTime()
      );
    },
    [getMessageKey]
  );

  const loadMessages = useCallback(async (chatId) => {
    if (!chatId) return;

    const requestId = ++messageLoadRequestRef.current;
    setIsLoadingMessages(true);
    setPageError("");
    try {
      const fetchedMessages = await chatAPI.getMessages(chatId, 1, 100);
      const ordered = [...fetchedMessages].reverse();
      if (requestId !== messageLoadRequestRef.current) return;
      setMessages((prev) => mergeMessages(prev, ordered));
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Unable to load messages.";
      setPageError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [mergeMessages]);

  const ensureActiveChat = useCallback(async (fetchedChats) => {
    if (!currentUserId) return;

    if (targetUserId) {
      const existing = fetchedChats.find((chat) =>
        (chat?.participants || []).some(
          (participant) => participant?._id === targetUserId
        )
      );

      if (existing) {
        setActiveChatId(existing._id);
        return;
      }

      const createdChat = await chatAPI.createChat([currentUserId, targetUserId]);
      setChats((prev) => [createdChat, ...prev]);
      setActiveChatId(createdChat._id);
      navigate(`/chat/${targetUserId}`, { replace: true });
      return;
    }

    if (fetchedChats.length > 0) {
      setActiveChatId((prev) => prev || fetchedChats[0]._id);
    }
  }, [currentUserId, navigate, targetUserId]);

  const loadChats = useCallback(async () => {
    setIsLoadingChats(true);
    setPageError("");
    try {
      const fetchedChats = await chatAPI.getChats();
      setChats(fetchedChats);
      await ensureActiveChat(fetchedChats);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Unable to load chats.";
      setPageError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoadingChats(false);
    }
  }, [ensureActiveChat]);

  useEffect(() => {
    if (!currentUserId) return;
    loadChats();
  }, [currentUserId, targetUserId, loadChats]);

  useEffect(() => {
    if (!activeChatId) return;
    loadMessages(activeChatId);
  }, [activeChatId, loadMessages]);

  if (!user) return <div>Loading...</div>;

  const updateChatPreview = (chatId, message) => {
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat._id === chatId ? { ...chat, lastMessage: message } : chat
      )
    );
  };

  const sendMessage = async () => {
    const trimmed = text.trim();
    if (!trimmed || !activeChatId) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      _id: tempId,
      clientTempId: tempId,
      chatId: activeChatId,
      senderId: currentUserId,
      text: trimmed,
      createdAt: new Date().toISOString(),
      isEdited: false,
      isDeleted: false,
      _optimistic: true,
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    updateChatPreview(activeChatId, optimisticMessage);
    setText("");
    setIsSending(true);
    try {
      const sentMessage = await chatAPI.sendMessage(activeChatId, trimmed);
      if (!sentMessage?._id) {
        await loadMessages(activeChatId);
        return;
      }

      setMessages((prev) =>
        prev.map((message) =>
          message.clientTempId === tempId ? sentMessage : message
        )
      );
      updateChatPreview(activeChatId, sentMessage);
    } catch (error) {
      setMessages((prev) =>
        prev.filter((message) => message.clientTempId !== tempId)
      );
      const errorMessage =
        error?.response?.data?.message || "Unable to send message.";
      toast.error(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const startEditMessage = (message) => {
    if (!message?._id) return;
    setEditingMessageId(message._id);
    setEditingText(message.text || "");
  };

  const cancelEditMessage = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  const saveEditedMessage = async () => {
    const trimmed = editingText.trim();
    if (!editingMessageId || !trimmed) return;

    try {
      const updatedMessage = await chatAPI.editMessage(editingMessageId, trimmed);
      setMessages((prev) =>
        prev.map((message) =>
          message._id === updatedMessage._id ? updatedMessage : message
        )
      );
      updateChatPreview(activeChatId, updatedMessage);
      cancelEditMessage();
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Unable to edit message.";
      toast.error(errorMessage);
    }
  };

  const deleteMessage = async (messageId) => {
    if (!messageId) return;

    try {
      const deletedMessage = await chatAPI.deleteMessage(messageId);
      setMessages((prev) =>
        prev.map((message) =>
          message._id === deletedMessage._id ? deletedMessage : message
        )
      );
      if (activeChat?.lastMessage?._id === messageId) {
        updateChatPreview(activeChatId, deletedMessage);
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Unable to delete message.";
      toast.error(errorMessage);
    }
  };

  const getDisplayName = (chat) => {
    const other = getOtherParticipant(chat);
    if (!other) return "Unknown user";
    return `${other.firstName || ""} ${other.lastName || ""}`.trim();
  };

  return (
    <div className="chat-page">
      <div className="chat-shell">
        <aside className="chat-sidebar">
          <div className="chat-sidebar-top">
            <div>
              <div className="chat-title">Chats</div>
              <div className="chat-subtitle">Your conversations</div>
            </div>
          </div>

          <div className="chat-conversations">
            {isLoadingChats && <div className="chat-empty">Loading chats...</div>}

            {!isLoadingChats && chats.length === 0 && (
              <div className="chat-empty">No chats available.</div>
            )}

            {!isLoadingChats &&
              chats.map((chat) => {
                const peer = getOtherParticipant(chat);
                const displayName = getDisplayName(chat);

                return (
                  <button
                    key={chat._id}
                    className={`chat-convo ${
                      activeChatId === chat._id ? "active" : ""
                    }`}
                    onClick={() => setActiveChatId(chat._id)}
                  >
                    <div className="chat-avatar-wrap">
                      <img
                        className="chat-avatar"
                        src={peer?.photoUrl || "https://i.pravatar.cc/150?img=12"}
                        alt={displayName}
                      />
                    </div>

                    <div className="chat-convo-meta">
                      <div className="chat-convo-row">
                        <div className="chat-convo-name">{displayName}</div>
                      </div>
                      <div className="chat-convo-snippet">{getMessageText(chat)}</div>
                    </div>
                  </button>
                );
              })}
          </div>
        </aside>

        <section className="chat-thread">
          <header className="chat-thread-header">
            <div className="chat-peer-meta">
              <div className="chat-peer-name">
                {activeChat ? getDisplayName(activeChat) : "Select a chat"}
              </div>
              <div className="chat-peer-status">
                {activeChat ? `Chat ID: ${activeChat._id}` : "No active chat"}
              </div>
            </div>
          </header>

          <div className="chat-thread-body">
            {pageError && <div className="chat-error">{pageError}</div>}

            {isLoadingMessages && activeChat && (
              <div className="chat-empty">Loading messages...</div>
            )}

            {!isLoadingMessages && !activeChat && (
              <div className="chat-empty">Choose a chat to start messaging.</div>
            )}

            {!isLoadingMessages && activeChat && messages.length === 0 && (
              <div className="chat-empty">No messages yet. Say hello.</div>
            )}

            {!isLoadingMessages &&
              messages.map((m) => {
                const isMine = m.senderId === currentUserId || m.senderId?._id === currentUserId;
                const isEditing = editingMessageId === m._id;

                return (
                  <div key={m._id} className={`chat-msg ${isMine ? "me" : "them"}`}>
                    <div className={`chat-bubble ${isMine ? "me" : "them"}`}>
                      {isEditing ? (
                        <div className="chat-edit-wrap">
                          <textarea
                            className="chat-edit-input"
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                          />
                          <div className="chat-msg-actions">
                            <button className="chat-mini-btn" onClick={saveEditedMessage}>
                              Save
                            </button>
                            <button
                              className="chat-mini-btn muted"
                              onClick={cancelEditMessage}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="chat-text">
                          {m.isDeleted ? "Message deleted" : m.text}
                        </div>
                      )}

                      <div className="chat-meta">
                        <span className="chat-time">
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>

                        {m.isEdited && <span>(edited)</span>}

                        {isMine && !m.isDeleted && !isEditing && (
                          <>
                            <button
                              className="chat-text-btn"
                              onClick={() => startEditMessage(m)}
                            >
                              Edit
                            </button>
                            <button
                              className="chat-text-btn danger"
                              onClick={() => deleteMessage(m._id)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          <footer className="chat-composer">
            <textarea
              className="chat-input"
              placeholder={activeChat ? "Type a message..." : "Select a chat first"}
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={!activeChat || isSending}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />

            <button
              className="chat-send-btn"
              onClick={sendMessage}
              disabled={!activeChat || isSending}
            >
              {isSending ? "Sending..." : "Send"}
            </button>
          </footer>
        </section>
      </div>
    </div>
  );
};

export default Chat;