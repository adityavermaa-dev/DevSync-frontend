import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    list: [],
    loading: false,
    unreadCount: 0,
  },
  reducers: {
    setNotifications(state, action) {
      state.list = action.payload;
      state.unreadCount = action.payload.filter((n) => !n.read).length;
    },
    setLoadingNotifications(state, action) {
      state.loading = action.payload;
    },
    addNotification(state, action) {
      
      state.list.unshift(action.payload);
      if (!action.payload.read) state.unreadCount += 1;
    },
    markNotificationRead(state, action) {
      const id = action.payload;
      const notif = state.list.find((n) => n._id === id);
      if (notif && !notif.read) {
        notif.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllRead(state) {
      state.list.forEach((n) => {
        n.read = true;
      });
      state.unreadCount = 0;
    },
    removeNotification(state, action) {
      const id = action.payload;
      const notif = state.list.find((n) => n._id === id);
      if (notif && !notif.read) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.list = state.list.filter((n) => n._id !== id);
    },
    clearNotifications(state) {
      state.list = [];
      state.unreadCount = 0;
    },
  },
});

export const {
  setNotifications,
  setLoadingNotifications,
  addNotification,
  markNotificationRead,
  markAllRead,
  removeNotification,
  clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
