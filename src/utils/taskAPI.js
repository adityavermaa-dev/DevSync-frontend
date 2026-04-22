import axios from "axios";
import { BASE_URL } from "../constants/commonData";

const normalizeTaskArrayResponse = (res) => {
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.tasks)) return res.data.tasks;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (Array.isArray(res?.data?.data?.tasks)) return res.data.data.tasks;
  return [];
};

const normalizeTaskObjectResponse = (res) => {
  if (res?.data?._id) return res.data;
  if (res?.data?.task?._id) return res.data.task;
  if (res?.data?.data?._id) return res.data.data;
  if (res?.data?.data?.task?._id) return res.data.data.task;
  return res?.data;
};

export const taskAPI = {
  async getTasks(projectId) {
    const res = await axios.get(`${BASE_URL}/projects/${projectId}/tasks`, { withCredentials: true });
    return normalizeTaskArrayResponse(res);
  },
  async createTask(projectId, taskData) {
    const res = await axios.post(`${BASE_URL}/projects/${projectId}/tasks`, taskData, { withCredentials: true });
    return normalizeTaskObjectResponse(res);
  },
  async updateTask(projectId, taskId, updateData) {
    const res = await axios.patch(`${BASE_URL}/projects/${projectId}/tasks/${taskId}`, updateData, { withCredentials: true });
    return normalizeTaskObjectResponse(res);
  },
  async deleteTask(projectId, taskId) {
    const res = await axios.delete(`${BASE_URL}/projects/${projectId}/tasks/${taskId}`, { withCredentials: true });
    return normalizeTaskObjectResponse(res);
  }
};
