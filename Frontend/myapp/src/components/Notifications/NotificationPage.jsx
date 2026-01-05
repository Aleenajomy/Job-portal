import { useState, useEffect } from 'react';
import { AiOutlineUser, AiOutlineHeart, AiOutlineComment } from 'react-icons/ai';
import { MdWork, MdPostAdd } from 'react-icons/md';
import { RiUserFollowLine } from 'react-icons/ri';
import { BiLoaderAlt } from 'react-icons/bi';
import { notificationService } from '../../services/notificationService';
import './NotificationPage.css';

const NotificationPage = ({ onUnreadCountChange }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => {
        const updated = prev.map(notif => 
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        );
        // Notify parent of unread count change
        const newUnreadCount = updated.filter(n => !n.is_read).length;
        onUnreadCountChange && onUnreadCountChange(newUnreadCount);
        return updated;
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => {
        const updated = prev.map(notif => ({ ...notif, is_read: true }));
        // Notify parent of unread count change
        onUnreadCountChange && onUnreadCountChange(0);
        return updated;
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'follow':
        return <RiUserFollowLine className="notification-icon follow" />;
      case 'post':
        return <MdPostAdd className="notification-icon post" />;
      case 'like':
        return <AiOutlineHeart className="notification-icon like" />;
      case 'comment':
        return <AiOutlineComment className="notification-icon comment" />;
      case 'job_post':
        return <MdWork className="notification-icon job" />;
      case 'job_application':
        return <AiOutlineUser className="notification-icon application" />;
      default:
        return <AiOutlineUser className="notification-icon default" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.is_read;
    if (filter === 'read') return notification.is_read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="notification-page">
      <div className="notification-page-header">
        <div className="header-left">
          <h1>Notifications</h1>
        </div>
        
        <div className="header-actions">
          {unreadCount > 0 && (
            <button className="mark-all-read-btn" onClick={markAllAsRead}>
              Mark all as read ({unreadCount})
            </button>
          )}
        </div>
      </div>

      <div className="notification-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({notifications.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
          onClick={() => setFilter('unread')}
        >
          Unread ({unreadCount})
        </button>
        <button 
          className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
          onClick={() => setFilter('read')}
        >
          Read ({notifications.length - unreadCount})
        </button>
      </div>

      <div className="notification-page-content">
        {loading ? (
          <div className="loading-container">
            <BiLoaderAlt className="loading-spinner" />
            <span>Loading notifications...</span>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <h3>
              {filter === 'unread' ? 'No unread notifications' : 
               filter === 'read' ? 'No read notifications' : 
               'No notifications yet'}
            </h3>
            <p>
              {filter === 'unread' ? 'All caught up! Check back later for new updates.' :
               filter === 'read' ? 'No notifications have been read yet.' :
               'When you get notifications, they\'ll show up here'}
            </p>
          </div>
        ) : (
          <div className="notifications-list">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-card ${!notification.is_read ? 'unread' : ''}`}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
              >
                <div className="notification-card-content">
                  <div className="notification-icon-wrapper">
                    {getNotificationIcon(notification.notification_type)}
                  </div>
                  
                  <div className="notification-details">
                    <div className="notification-message">
                      {notification.message}
                    </div>
                    <div className="notification-meta">
                      <span className="notification-time">
                        {formatTimestamp(notification.created_at)}
                      </span>
                      <span className="notification-type">
                        {notification.notification_type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  
                  {!notification.is_read && (
                    <div className="unread-indicator"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;