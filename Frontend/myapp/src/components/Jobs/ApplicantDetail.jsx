import { useState, useEffect } from 'react';
import './Jobs.css';
import { MdLocationOn, MdAttachMoney, MdWork } from 'react-icons/md';

export default function ApplicantDetail({ applicationId, onBack }) {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplicationDetail();
  }, [applicationId]);

  const fetchApplicationDetail = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/applications/${applicationId}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch application details');
      
      const data = await response.json();
      setApplication(data);
    } catch (error) {
      console.error('Error fetching application details:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/applications/${applicationId}/status/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) throw new Error('Failed to update status');
      
      fetchApplicationDetail(); // Refresh data
      alert('Status updated successfully');
    } catch (error) {
      alert('Failed to update application status');
    }
  };

  const downloadResume = async (applicationId, applicantName) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/applications/${applicationId}/resume/download/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          alert('Resume not found for this application');
          return;
        }
        throw new Error('Failed to download resume');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${applicantName.replace(/\s+/g, '_')}_Resume.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading resume:', error);
      alert('Failed to download resume');
    }
  };

  if (loading) return <div className="loading">Loading application details...</div>;
  if (!application) return <div className="error">Application not found</div>;

  return (
    <div className="applicant-detail-container">
      <div className="applicant-detail-header">
        <div className="header-content">
          <button className="back-btn" onClick={onBack}>
            ← 
          </button>
          <h1>Application Details</h1>
          <span className={`status-badge status-${application.status || 'submitted'}`}>
            {application.status ? 
              application.status.charAt(0).toUpperCase() + application.status.slice(1) : 
              'Submitted'
            }
          </span>
        </div>
      </div>

      <div className="applicant-detail-content">
        <div className="applicant-profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              <img 
                src={application.profile_image || '/default-avatar.png'} 
                alt={application.applicant_name}
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(application.applicant_name)}&background=0a66c2&color=fff&size=120`;
                }}
              />
            </div>
            <div className="profile-info">
              <h2 className="applicant-name">{application.applicant_name}</h2>
              <p className="applicant-email">{application.applicant_email}</p>
              <div className="application-meta">
                <span className="applied-date">
                  Applied on {new Date(application.applied_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
                <span className={`status-indicator ${application.status || 'submitted'}`}>
                  {application.status ? 
                    application.status.charAt(0).toUpperCase() + application.status.slice(1) : 
                    'Submitted'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="job-info-card">
          <h3>Applied Position</h3>
          <div className="job-details">
            <h4>{application.job.title}</h4>
            <p className="company-name">{application.job.company_name}</p>
            <div className="job-meta">
              <span><MdLocationOn /> {application.job.location}</span>
              <span><MdAttachMoney /> {application.job.salary}</span>
              <span><MdWork /> {application.job.experience}</span>
            </div>
          </div>
        </div>

        {application.cover_letter && (
          <div className="cover-letter-section">
            <h2>Cover Letter</h2>
            <div className="cover-letter-content">
              {application.cover_letter}
            </div>
          </div>
        )}

        <div className="resume-section">
          <h2>Resume</h2>
          <div className="resume-actions">
            <button 
              className="download-resume-btn"
              onClick={() => downloadResume(applicationId, application.applicant_name)}
            >
              📄 Download Resume
            </button>
            {application.resume && (
              <a 
                href={`${import.meta.env.VITE_API_BASE_URL}${application.resume}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="view-resume-link"
              >
                👁️ View Resume
              </a>
            )}
          </div>
        </div>

        <div className="status-update-section">
          <h2>Update Application Status</h2>
          <div className="status-buttons">
            <button 
              className="status-btn reviewing"
              onClick={() => updateStatus('reviewing')}
            >
              Mark as Reviewing
            </button>
            <button 
              className="status-btn shortlisted"
              onClick={() => updateStatus('shortlisted')}
            >
              Shortlist
            </button>
            <button 
              className="status-btn rejected"
              onClick={() => updateStatus('rejected')}
            >
              Reject
            </button>
            <button 
              className="status-btn hired"
              onClick={() => updateStatus('hired')}
            >
              Hire
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}