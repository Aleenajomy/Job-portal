import { apiService } from '../services/apiService';

const API_BASE_URL = apiService.getJobsApiUrl();

const getCsrfToken = async () => {
  try {
    const response = await fetch(`${apiService.getBaseUrl()}/accounts/csrf/`, {
      credentials: 'same-origin'
    });
    const data = await response.json();
    return data.csrfToken;
  } catch {
    return null;
  }
};

export const jobAPI = {
  // Get all jobs
  getJobs: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/jobs/${queryString ? `?${queryString}` : ''}`;
    return apiService.get(url);
  },

  // Get single job
  getJob: async (id) => {
    if (!id || !/^[1-9]\d*$/.test(String(id)) || parseInt(id) > 2147483647) {
      throw new Error('Invalid job ID');
    }
    return apiService.get(`${API_BASE_URL}/jobs/${id}/`);
  },

  // Create job
  createJob: (jobData) => apiService.post(`${API_BASE_URL}/jobs/`, jobData),
  // Update job
  updateJob: async (id, jobData) => {
    if (!id || !/^[1-9]\d*$/.test(String(id)) || parseInt(id) > 2147483647) {
      throw new Error('Invalid job ID');
    }
    return apiService.patch(`${API_BASE_URL}/jobs/${id}/`, jobData);
  },

  // Delete job
  deleteJob: async (id) => {
    if (!id || !/^[1-9]\d*$/.test(String(id)) || parseInt(id) > 2147483647) {
      throw new Error('Invalid job ID');
    }
    return apiService.delete(`${API_BASE_URL}/jobs/${id}/`);
  },

  // Apply to job
  applyToJob: async (jobId, formData) => {
    if (!jobId || !/^[1-9]\d*$/.test(String(jobId)) || parseInt(jobId) > 2147483647) {
      throw new Error('Invalid job ID');
    }
    return apiService.postFormData(`${API_BASE_URL}/jobs/${jobId}/apply/`, formData);
  },

  // Get user permissions
  getUserPermissions: () => apiService.get(`${API_BASE_URL}/user-permissions/`)
};