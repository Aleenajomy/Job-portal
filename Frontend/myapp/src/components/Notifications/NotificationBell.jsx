import { useState, useEffect } from 'react';
import { CiBellOn } from 'react-icons/ci';
import { IoMdNotifications } from 'react-icons/io';
import { notificationService } from '../../services/notificationService';
import './Notifications.css';

const NotificationBell = ({ onViewAll, onUnreadCountChange }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
      // Notify parent component
      onUnreadCountChange && onUnreadCountChange(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Handle bell click - navigate directly to notifications page
  const handleBellClick = () => {
    if (onViewAll) {
      onViewAll();
    }
  };

  // Fetch unread count on component mount and periodically
  useEffect(() => {
    fetchUnreadCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <button 
      className="nav-icon-btn notification-bell" 
      onClick={handleBellClick}
    >
      <div className="bell-icon-wrapper">
        {unreadCount > 0 ? (
          <IoMdNotifications size={20} className="bell-icon active" />
        ) : (
          <CiBellOn size={20} className="bell-icon" />
        )}
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>
      <span>Notifications</span>
    </button>
  );
};

export default NotificationBell;