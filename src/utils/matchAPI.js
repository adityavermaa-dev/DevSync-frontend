import axios from 'axios';
import { BASE_URL } from '../constants/commonData';

export const matchAPI = {
  async getRecommendations() {
    const res = await axios.get(`${BASE_URL}/matches/recommendations`, { withCredentials: true });
    return res.data;
  }
};

export default matchAPI;
