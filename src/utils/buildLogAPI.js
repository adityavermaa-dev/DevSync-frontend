import axios from 'axios';
import { BASE_URL } from '../constants/commonData';

export const buildLogAPI = {
  async getLogs() {
    const res = await axios.get(`${BASE_URL}/build-logs`, { withCredentials: true });
    return res.data;
  },

  async createLog(data) {
    const res = await axios.post(`${BASE_URL}/build-logs`, data, { withCredentials: true });
    return res.data;
  },

  async toggleLike(logId) {
    const res = await axios.post(`${BASE_URL}/build-logs/${logId}/like`, {}, { withCredentials: true });
    return res.data;
  },

  async deleteLog(logId) {
    const res = await axios.delete(`${BASE_URL}/build-logs/${logId}`, { withCredentials: true });
    return res.data;
  }
};

export default buildLogAPI;
