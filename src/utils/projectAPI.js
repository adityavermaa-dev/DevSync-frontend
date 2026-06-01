import axios from "axios";
import { BASE_URL } from "../constants/commonData";

const normalizeArrayResponse = (res, key) => {
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.[key])) return res.data[key];
  if (res?.data?.data && Array.isArray(res.data.data)) return res.data.data;
  return [];
};

const normalizeObjectResponse = (res, key) => {
  if (res?.data?.[key]) return res.data[key];
  if (res?.data?.data && typeof res.data.data === "object") return res.data.data;
  return res?.data;
};

export const projectAPI = {
  
  async getProjects(params = {}) {
    const res = await axios.get(`${BASE_URL}/projects`, {
      params,
      withCredentials: true,
    });
    return normalizeArrayResponse(res, "projects");
  },

  
  async getProject(projectId) {
    const res = await axios.get(`${BASE_URL}/projects/${projectId}`, {
      withCredentials: true,
    });
    return normalizeObjectResponse(res, "project");
  },

  
  async createProject(projectData) {
    const res = await axios.post(`${BASE_URL}/project`, projectData, {
      withCredentials: true,
    });
    return res.data;
  },

  
  async updateProject(projectId, updateData) {
    const res = await axios.patch(`${BASE_URL}/projects/${projectId}`, updateData, {
      withCredentials: true,
    });
    return res.data;
  },

  
  async deleteProject(projectId) {
    const res = await axios.delete(`${BASE_URL}/projects/${projectId}`, {
      withCredentials: true,
    });
    return normalizeObjectResponse(res, "project");
  },

  
  async applyToProject(projectId, role, message) {
    const res = await axios.post(
      `${BASE_URL}/projects/${projectId}/join`,
      { role, message },
      { withCredentials: true }
    );
    return res.data;
  },

  
  async handleApplication(projectId, applicationId, status) {
    
    const res = await axios.post(
      `${BASE_URL}/projects/${projectId}/request/${applicationId}/respond`,
      { action: status },
      { withCredentials: true }
    );
    return res.data;
  },
};

export default projectAPI;
