import { DEFAULTS, STORAGE_KEYS } from '../constants/index.js';

// Centralized API service with consistent patterns
const validateBaseUrl = (url) => {
  if (!url) throw new Error('API base URL not configured');
  const urlObj = new URL(url);
  if (urlObj.protocol !== 'https:' && urlObj.protocol !== 'http:') {
    throw new Error('Invalid protocol in API base URL');
  }
  return url;
};

const API_BASE_URL = validateBaseUrl(
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || DEFAULTS.API_BASE_URL
);

const getAuthHeaders = () => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const getAuthHeadersWithContentType = () => ({
  ...getAuthHeaders(),
  'Content-Type': 'application/json',
});

const handleResponse = async (response) => {
  if (response.status === 401) {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    throw new Error('Session expired. Please login again.');
  }
  
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || data.error || `Request failed: ${response.status}`);
  }
  
  return response.json().catch(() => ({}));
};

const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      credentials: 'same-origin',
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`API Error (${url}):`, error);
    throw error;
  }
};

export const apiService = {
  // Base URLs
  getBaseUrl: () => API_BASE_URL,
  getJobsApiUrl: () => `${API_BASE_URL}/api`,
  getPostsApiUrl: () => `${API_BASE_URL}/api-post`,
  
  // Common request methods
  get: (url) => apiRequest(url),
  post: (url, data) => apiRequest(url, {
    method: 'POST',
    headers: getAuthHeadersWithContentType(),
    body: JSON.stringify(data),
  }),
  patch: (url, data) => apiRequest(url, {
    method: 'PATCH',
    headers: getAuthHeadersWithContentType(),
    body: JSON.stringify(data),
  }),
  delete: (url) => apiRequest(url, { method: 'DELETE' }),
  
  // Form data requests (for file uploads)
  postFormData: (url, formData) => apiRequest(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  }),
  patchFormData: (url, formData) => apiRequest(url, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: formData,
  }),
};