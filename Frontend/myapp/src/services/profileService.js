const API_BASE_URL = 'http://localhost:8000';

class ProfileService {
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  getAuthHeadersForFormData() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  async getCurrentUserProfile() {
    try {
      const token = localStorage.getItem('token');
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // For Company users, use company-profile endpoint directly
      const url = currentUser?.job_role === 'Company' 
        ? `${API_BASE_URL}/profiles/company-profile/`
        : `${API_BASE_URL}/profiles/user-profile/`;

      const response = await fetch(url, {
        headers: this.getAuthHeaders(),
      });

      if (response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching current user profile:', error);
      throw error;
    }
  }

  async getPublicProfile(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/profiles/public-profile/${userId}/`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching public profile:', error);
      throw error;
    }
  }

  async updateProfile(profileData, isCompany = false) {
    try {
      const url = isCompany 
        ? `${API_BASE_URL}/profiles/company-profile/`
        : `${API_BASE_URL}/profiles/user-profile/`;

      const response = await fetch(url, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async updateUserBasicInfo(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/update-profile/`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating user basic info:', error);
      throw error;
    }
  }

  async saveEducation(educationList) {
    try {
      const response = await fetch(`${API_BASE_URL}/profiles/education/`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(educationList),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving education:', error);
      throw error;
    }
  }

  async uploadProfileImage(file, isCompany = false) {
    try {
      const formData = new FormData();
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Use correct field name based on user role
      const fieldName = currentUser?.job_role === 'Company' ? 'company_logo' : 'profile_image';
      formData.append(fieldName, file);

      // Use correct endpoint based on user role
      const url = currentUser?.job_role === 'Company'
        ? `${API_BASE_URL}/profiles/company-profile/`
        : `${API_BASE_URL}/profiles/user-profile/`;

      const response = await fetch(url, {
        method: 'PATCH',
        headers: this.getAuthHeadersForFormData(),
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  }

  async getPublicUsers() {
    try {
      const response = await fetch(`${API_BASE_URL}/profiles/public-users/`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching public users:', error);
      throw error;
    }
  }
}

export const profileService = new ProfileService();