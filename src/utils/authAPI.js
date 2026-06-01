
import axios from 'axios';
import { BASE_URL } from '../constants/commonData';

const API_BASE_URL = BASE_URL || '/api';

export const authAPI = {
    
    signup: async (userData) => {
        return axios.post(`${API_BASE_URL}/signup`, userData, { withCredentials: true });
    },

    
    login: async (email, password) => {
        return axios.post(`${API_BASE_URL}/login`, { email, password }, { withCredentials: true });
    },

    
    forgotPassword: async (email) => {
        return axios.post(`${API_BASE_URL}/forgot-password`, { email }, { withCredentials: true });
    },

    
    resetPassword: async (token, password) => {
        return axios.post(`${API_BASE_URL}/reset-password/${token}`, { password }, { withCredentials: true });
    },

    
    resendVerification: async (email) => {
        return axios.post(`${API_BASE_URL}/resend-verification`, { email }, { withCredentials: true });
    },

    
    logout: async () => {
        return axios.post(`${API_BASE_URL}/logout`, {}, { withCredentials: true });
    },

    
    googleLogin: async (credential) => {
        return axios.post(`${API_BASE_URL}/auth/google/callback`, { credential }, { withCredentials: true });
    },

    
    getProfile: async () => {
        return axios.get(`${API_BASE_URL}/profile/view`, { withCredentials: true });
    }
};

export default authAPI;
