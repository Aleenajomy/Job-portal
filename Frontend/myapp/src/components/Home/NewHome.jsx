import { useState } from 'react';
import './NewHome.css';
import JobList from '../Jobs/JobList';
import JobDetail from '../Jobs/JobDetail';


export default function NewHome({ onLogout, onChangePassword, userEmail, userName, jobRole }) {
  const [showProfile, setShowProfile] = useState(false);
  const [currentView, setCurrentView] = useState('home'); // 'home', 'jobs', 'jobDetail'
  const [selectedJob, setSelectedJob] = useState(null);

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
            <button className="nav-icon-btn" title="Jobs" onClick={() => setCurrentView('jobs')}>
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
          <button className="nav-icon-btn" onClick={() => setShowProfile(true)} title="Profile">
            <span className="icon">👤</span>
            Profile
          </button>
          <button className="header-btn" onClick={onChangePassword}>
            Change Password
          </button>
          <button className="header-btn logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {showProfile ? (
        <div className="profile-page">
          <button className="back-btn" onClick={() => setShowProfile(false)}>
            ←
          </button>
          <div className="profile-content">
            <div className="profile-avatar-large">
              {(userName || userEmail).charAt(0).toUpperCase()}
            </div>
            <div className="profile-details">
              <p>{userName || userEmail.split('@')[0]}</p>
              <p>{userEmail}</p>
              <p>{jobRole || 'Job Seeker'}</p>
            </div>
          </div>
        </div>
      ) : currentView === 'jobs' ? (
        <JobList 
          onJobClick={(job) => {
            setSelectedJob(job);
            setCurrentView('jobDetail');
          }}
          onBack={() => setCurrentView('home')}
        />
      ) : currentView === 'jobDetail' ? (
        <JobDetail 
          job={selectedJob}
          onBack={() => setCurrentView('jobs')}
          onApply={(job) => {
            alert(`Applied to ${job.title} at ${job.company}!`);
          }}
        />
      ) : (
        <main className="new-home-main">
          <div className="welcome-section">
            <h1>Welcome, {userName || userEmail}!</h1>
            <p>Your professional journey starts here.</p>
          </div>
          
          <div className="empty-body">
            <div style={{textAlign: 'center', padding: '40px'}}>
              <h2 style={{color: '#666', marginBottom: '20px'}}>Ready to find your next opportunity?</h2>
              <button 
                className="header-btn" 
                onClick={() => setCurrentView('jobs')}
                style={{fontSize: '16px', padding: '12px 24px'}}
              >
                Browse Jobs
              </button>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}