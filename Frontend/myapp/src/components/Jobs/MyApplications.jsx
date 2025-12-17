import { useState, useEffect } from 'react';
import './Jobs.css';
import './MyApplications.css';
import { MdLocationOn, MdAttachMoney, MdWork, MdLanguage, MdCalendarToday } from 'react-icons/md';
import { IoMdClipboard } from "react-icons/io";
import { FaHourglassHalf, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { MdOutlineRateReview } from "react-icons/md";
import { BsPersonCheckFill } from "react-icons/bs";

export default function MyApplications({ onBack }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    fetchMyApplications();
  }, [statusFilter]);

  const fetchMyApplications = async () => {
    try {
      const url = `${import.meta.env.VITE_API_BASE_URL}/api/my-applied-jobs/${statusFilter !== 'all' ? `?status=${statusFilter}` : ''}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch applications');
      
      const data = await response.json();
      setApplications(data.results || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
  const icons = {
    submitted: <IoMdClipboard size={20} color="#6b7280" />,
    reviewing: <MdOutlineRateReview size={20} color="#3b82f6" />,
    shortlisted: <FaCheckCircle size={20} color="#22c55e" />,
    rejected: <FaTimesCircle size={20} color="#ef4444" />,
    hired: <BsPersonCheckFill size={20} color="#16a34a" />
  };

  return icons[status] || <IoMdClipboard size={20} />;
};


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) return <div className="loading">Loading your applications...</div>;

  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="my-applications-container">
      <button className="back-btn" onClick={onBack}>←</button>
      
      <div className="applications-header">
        <div className="header-content">
          <h1>My Applications</h1>
          {/* <div className="applications-stats">
            <div className="stat-item">
              <span className="stat-number">{applications.length}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{statusCounts.submitted || 0}</span>
              <span className="stat-label">Submitted</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{statusCounts.reviewing || 0}</span>
              <span className="stat-label">Reviewing</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{statusCounts.shortlisted || 0}</span>
              <span className="stat-label">Shortlisted</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{statusCounts.rejected || 0}</span>
              <span className="stat-label">Rejected</span>
            </div>
          </div> */}
        </div>
        
        <div className="filter-section">
          <select 
            className="status-filter-select" 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Applications</option>
            <option value="submitted">Submitted</option>
            <option value="reviewing">Under Review</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
            <option value="hired">Hired</option>
          </select>
        </div>
      </div>

      <div className="applications-layout">
        <div className="applications-list-panel">
          {applications.length > 0 ? (
            applications.map(app => (
              <div 
                key={app.id} 
                className={`application-item ${selectedApp?.id === app.id ? 'selected' : ''}`}
                onClick={() => setSelectedApp(app)}
              >
                <div className="item-header">
                  <h4 className="item-title">{app.job.title}</h4>
                  <div className={`status-badge status-${app.status}`}>
                    <span>{getStatusIcon(app.status)}</span>
                  </div>
                </div>
                <p className="item-company">{app.job.company_name}</p>
                <div className="item-meta">
                  {app.job.location && <span><MdLocationOn /> {app.job.location}</span>}
                  <span className="item-date">Applied {formatDate(app.applied_at)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-list">
              <div className="empty-icon"><IoMdClipboard /></div>
              <p>No applications found</p>
            </div>
          )}
        </div>

        <div className="application-detail-panel">
          {selectedApp ? (
            <div className="detail-content">
              <div className="detail-header">
                <div className="detail-title-section">
                  <h2>{selectedApp.job.title}</h2>
                  <p className="detail-company">{selectedApp.job.company_name}</p>
                </div>
                <div className={`detail-status status-${selectedApp.status}`}>
                  <span className="status-icon">
                      {getStatusIcon(selectedApp.status)}
                  </span>
                  <span className="status-text">
                      {selectedApp.status}
                  </span>
                </div>

              </div>

              <div className="detail-info">
                <div className="info-grid">
                  {selectedApp.job.location && (
                    <div className="info-item">
                      <MdLocationOn className="info-icon" />
                      <span>Location: {selectedApp.job.location}</span>
                    </div>
                  )}
                  {selectedApp.job.salary && (
                    <div className="info-item">
                      <MdAttachMoney className="info-icon" />
                      <span>Salary: {selectedApp.job.salary}</span>
                    </div>
                  )}
                  {selectedApp.job.experience && (
                    <div className="info-item">
                      <MdWork className="info-icon" />
                      <span>Experience: {selectedApp.job.experience}</span>
                    </div>
                  )}
                  {selectedApp.job.work_mode && (
                    <div className="info-item">
                      <MdLanguage className="info-icon" />
                      <span>Work Mode: {selectedApp.job.work_mode}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="detail-description">
                <h3>Job Description</h3>
                <p>{selectedApp.job.description || 'No description available.'}</p>
              </div>

              <div className="application-timeline">
                <h3>Application Timeline</h3>
                <div className="timeline-item">
                  <MdCalendarToday className="timeline-icon" />
                  <div>
                    <strong>Applied</strong>
                    <p>{formatDate(selectedApp.applied_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <div className="no-selection-content">
                <h3>Select an Application</h3>
                <p>Choose an application from the list to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}