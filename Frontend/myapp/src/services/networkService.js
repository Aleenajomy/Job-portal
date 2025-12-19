import { apiService } from './apiService.js';
import { API_ENDPOINTS } from '../constants/index.js';

const NETWORK_BASE_URL = `${apiService.getBaseUrl()}${API_ENDPOINTS.NETWORK}`;

export const networkService = {
  // Get network statistics (following, followers, total connections)
  getNetworkStats: async () => {
    return await apiService.get(`${NETWORK_BASE_URL}/network-stats/`);
  },

  // Get user suggestions for following
  getUserSuggestions: async () => {
    return await apiService.get(`${NETWORK_BASE_URL}/suggestions/`);
  },

  // Get list of users I'm following
  getMyFollowing: async () => {
    return await apiService.get(`${NETWORK_BASE_URL}/my-following/`);
  },

  // Get list of my followers
  getMyFollowers: async () => {
    return await apiService.get(`${NETWORK_BASE_URL}/my-followers/`);
  },

  // Follow a user
  followUser: async (userId) => {
    return await apiService.post(`${NETWORK_BASE_URL}/follow/${userId}/`);
  },

  // Unfollow a user
  unfollowUser: async (userId) => {
    return await apiService.delete(`${NETWORK_BASE_URL}/unfollow/${userId}/`);
  },
};