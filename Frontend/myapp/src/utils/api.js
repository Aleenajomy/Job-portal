const API_BASE_URL = 'http://127.0.0.1:8000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const jobAPI = {
  // Get all jobs
  getJobs: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/jobs/${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });
    if (!response.ok) throw new Error(`Failed to fetch jobs: ${response.status}`);
    return response.json();
  },

  // Get single job
  getJob: async (id) => {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}/`);
    if (!response.ok) throw new Error('Failed to fetch job');
    return response.json();
  },

  // Create job
  createJob: async (jobData) => {
    const response = await fetch(`${API_BASE_URL}/jobs/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(jobData)
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to create job');
    return data;
  },

  // Update job
  updateJob: async (id, jobData) => {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(jobData)
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to update job');
    return data;
  },

  // Delete job
  deleteJob: async (id) => {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to delete job');
    return response.json();
  },

  // Apply to job
  applyToJob: async (jobId, formData) => {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/apply/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to apply');
    return data;
  },

  // Get user permissions
  getUserPermissions: async () => {
    const response = await fetch(`${API_BASE_URL}/user-permissions/`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to get permissions');
    return response.json();
  }
};