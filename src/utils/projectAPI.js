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
  // Get all projects (public feed)
  async getProjects(params = {}) {
    const res = await axios.get(`${BASE_URL}/projects`, {
      params,
      withCredentials: true,
    });
    return normalizeArrayResponse(res, "projects");
  },

  // Get single project
  async getProject(projectId) {
    const res = await axios.get(`${BASE_URL}/projects/${projectId}`, {
      withCredentials: true,
    });
    return normalizeObjectResponse(res, "project");
  },

  // Create new project
  async createProject(projectData) {
    const res = await axios.post(`${BASE_URL}/projects`, projectData, {
      withCredentials: true,
    });
    return normalizeObjectResponse(res, "project");
  },

  // Update project
  async updateProject(projectId, updateData) {
    const res = await axios.put(`${BASE_URL}/projects/${projectId}`, updateData, {
      withCredentials: true,
    });
    return normalizeObjectResponse(res, "project");
  },

  // Delete project
  async deleteProject(projectId) {
    const res = await axios.delete(`${BASE_URL}/projects/${projectId}`, {
      withCredentials: true,
    });
    return normalizeObjectResponse(res, "project");
  },

  // Apply to join a project
  async applyToProject(projectId, role, message) {
    const res = await axios.post(
      `${BASE_URL}/projects/${projectId}/apply`,
      { role, message },
      { withCredentials: true }
    );
    return res.data;
  },

  // Project admin: accept/reject application
  async handleApplication(projectId, applicationId, status) {
    // status should be 'accepted' or 'rejected'
    const res = await axios.post(
      `${BASE_URL}/projects/${projectId}/applications/${applicationId}`,
      { status },
      { withCredentials: true }
    );
    return res.data;
  },
};

export default projectAPI;
