import axios from "axios";
import { BASE_URL } from "../constants/commonData";

const normalizeArrayResponse = (res, key) => {
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.[key])) return res.data[key];
  if (res?.data?.data && Array.isArray(res.data.data)) return res.data.data;
  return [];
};

export const notificationAPI = {
  
  async getNotifications() {
    const res = await axios.get(`${BASE_URL}/notifications`, {
      withCredentials: true,
    });
    return normalizeArrayResponse(res, "notifications");
  },

  
  async markAsRead(notificationId) {
    const res = await axios.patch(
      `${BASE_URL}/notifications/${notificationId}/read`,
      {},
      { withCredentials: true }
    );
    return res.data;
  },

  
  async markAllAsRead() {
    const res = await axios.patch(
      `${BASE_URL}/notifications/read-all`,
      {},
      { withCredentials: true }
    );
    return res.data;
  },

  
  async deleteNotification(notificationId) {
    const res = await axios.delete(
      `${BASE_URL}/notifications/${notificationId}`,
      { withCredentials: true }
    );
    return res.data;
  },

  
  async clearAll() {
    const res = await axios.delete(`${BASE_URL}/notifications`, {
      withCredentials: true,
    });
    return res.data;
  },
};

export default notificationAPI;
