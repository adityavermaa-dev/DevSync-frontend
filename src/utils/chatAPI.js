import axios from "axios";
import { BASE_URL } from "../constants/commonData";

const normalizeArrayResponse = (res, key) => {
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.[key])) return res.data[key];
  return [];
};

const normalizeObjectResponse = (res, key) => {
  if (res?.data?.[key]) return res.data[key];
  if (res?.data?.data?.[key]) return res.data.data[key];
  if (res?.data?.data && typeof res.data.data === "object") return res.data.data;
  return res?.data;
};

export const chatAPI = {
  async createChat(participants) {
    const res = await axios.post(
      `${BASE_URL}/create/chat`,
      { participants },
      { withCredentials: true }
    );
    return normalizeObjectResponse(res, "chat");
  },

  async getChats() {
    const res = await axios.get(`${BASE_URL}/get/chats`, {
      withCredentials: true,
    });
    return normalizeArrayResponse(res, "chats");
  },

  async getMessages(chatId, page = 1, limit = 20) {
    const res = await axios.get(`${BASE_URL}/messages/${chatId}`, {
      params: { page, limit },
      withCredentials: true,
    });
    return normalizeArrayResponse(res, "messages");
  },

  async sendMessage(chatId, text) {
    const res = await axios.post(
      `${BASE_URL}/send/message`,
      { chatId, text },
      { withCredentials: true }
    );
    return normalizeObjectResponse(res, "message");
  },

  async editMessage(messageId, text) {
    const res = await axios.put(
      `${BASE_URL}/edit/message/${messageId}`,
      { text },
      { withCredentials: true }
    );
    return normalizeObjectResponse(res, "message");
  },

  async deleteMessage(messageId) {
    const res = await axios.delete(`${BASE_URL}/delete/message/${messageId}`, {
      withCredentials: true,
    });
    return normalizeObjectResponse(res, "message");
  },
};

export default chatAPI;
