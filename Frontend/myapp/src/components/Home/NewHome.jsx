import { useState } from 'react';
import './NewHome.css';


export default function NewHome({ onLogout, onChangePassword, userEmail, userName }) {


  const handleLogout = () => {
    localStorage.removeItem('token');
    onLogout();
  };



  return (
    <div className="new-home-container">
      <header className="new-home-header">
        <div className="header-left">
          <div className="logo">JobPortal</div>
          <nav className="nav-icons">
            <button className="nav-icon-btn" title="Network">
              <span className="icon">👥</span>
              Network
            </button>
            <button className="nav-icon-btn" title="Jobs">
              <span className="icon">💼</span>
              Jobs
            </button>
            <button className="nav-icon-btn" title="Posts">
              <span className="icon">📝</span>
              Posts
            </button>
            <button className="nav-icon-btn" title="Notifications">
              <span className="icon">🔔</span>
              Notifications
            </button>
          </nav>
        </div>
        <div className="header-right">
          <button className="header-btn" onClick={onChangePassword}>
            Change Password
          </button>
          <button className="header-btn logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="new-home-main">
        <div className="welcome-section">
          <h1>Welcome, {userName || userEmail}!</h1>
          <p>Your professional journey starts here.</p>
        </div>
        
        <div className="empty-body">
          {/* Empty body section - will be discussed later */}
        </div>
      </main>
    </div>
  );
}