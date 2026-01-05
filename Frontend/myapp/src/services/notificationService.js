const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class NotificationService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api/notifications`;
  }

  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getNotifications() {
    try {
      const response = await fetch(`${this.baseURL}/`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  async getUnreadCount() {
    try {
      const response = await fetch(`${this.baseURL}/unread-count/`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch unread count');
      }
      
      const data = await response.json();
      return data.unread_count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  }

  async markAsRead(notificationId) {
    try {
      const response = await fetch(`${this.baseURL}/${notificationId}/read/`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markAllAsRead() {
    try {
      const response = await fetch(`${this.baseURL}/mark-all-read/`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Real-time notification polling
  startPolling(callback, interval = 30000) {
    const poll = async () => {
      try {
        const count = await this.getUnreadCount();
        callback(count);
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    // Initial call
    poll();
    
    // Set up interval
    const intervalId = setInterval(poll, interval);
    
    return () => clearInterval(intervalId);
  }
}

export const notificationService = new NotificationService();