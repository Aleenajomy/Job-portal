import { useState, useEffect } from 'react';
import './Jobs.css';
import './ViewApplications.css';
import { IoMdClipboard,IoMdTime } from "react-icons/io";
import { FaHourglassHalf, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { MdOutlineRateReview } from "react-icons/md";
import { BsPersonCheckFill } from "react-icons/bs";

export default function ViewApplications({ jobId, jobTitle, onBack, onViewApplicant }) {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [updating, setUpdating] = useState(false);

  const getStatusIcon = (status) => {
    const icons = {
      submitted: <IoMdClipboard />,
      reviewing: <MdOutlineRateReview />,
      shortlisted: <FaCheckCircle />,
      rejected: <FaTimesCircle />,
      hired: <BsPersonCheckFill />
    };
    return icons[status] || <IoMdClipboard />;
  };

  useEffect(() => {
    fetchApplicants();
  }, [jobId, statusFilter]);

  const fetchApplicants = async () => {
    try {
      const baseUrl = `${import.meta.env.VITE_API_BASE_URL}/api/jobs/${jobId}/applicants/`;
      const url = statusFilter !== 'all' ? `${baseUrl}?status=${statusFilter}` : baseUrl;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch applicants');
      
      const data = await response.json();
      setApplicants(data.applicants || []);
    } catch (error) {
      console.error('Error fetching applicants:', error);
      setApplicants([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (applicationId, newStatus) => {
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || 
                       localStorage.getItem('csrfToken') || 
                       sessionStorage.getItem('csrfToken');
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/applications/${applicationId}/status/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update status (${response.status})`);
      }
      
      fetchApplicants(); // Refresh list
    } catch (error) {
      console.error('Error updating application status:', error);
      alert(error.message || 'Failed to update application status');
    }
  };

  if (loading) return <div className="loading">Loading applications...</div>;

  return (
    <div className="view-applications-container">
      <button className="back-btn" onClick={onBack}>←</button>
      
      <div className="applications-header">
        <h1>Applications for {jobTitle}</h1>
        <div className="status-filter">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Applications</option>
            <option value="submitted">Submitted</option>
            <option value="reviewing">Reviewing</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
            <option value="hired">Hired</option>
          </select>
        </div>
      </div>

      <div className="applicants-layout">
        <div className="applicants-list-panel">
          {applicants.length > 0 ? (
            applicants.map(applicant => (
              <div 
                key={applicant.id} 
                className={`applicant-item ${selectedApplicant?.id === applicant.id ? 'selected' : ''}`}
                onClick={() => setSelectedApplicant(applicant)}
              >
                <div className="item-header">
                  <h4 className="item-title">{applicant.applicant_name}</h4>
                  <span className={`status-badge status-${applicant.status}`}>
                    {getStatusIcon(applicant.status)}
                  </span>
                </div>
                <p className="item-email">{applicant.applicant_email}</p>
                <div className="item-meta">
                  <span className="item-date">Applied {new Date(applicant.applied_at).toLocaleDateString()}</span>
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

        <div className="applicant-detail-panel">
          {selectedApplicant ? (
            <div className="detail-content">
              <div className="detail-header">
                <div className="detail-title-section">
                  <h2>{selectedApplicant.applicant_name}</h2>
                  <p className="detail-email">{selectedApplicant.applicant_email}</p>
                </div>
                <div className="detail-actions">
                  <button 
                    className="view-full-btn"
                    onClick={() => onViewApplicant(selectedApplicant.id)}
                  >
                    View Full Profile
                  </button>
                </div>
              </div>

              <div className="applicant-status-section">
                <h3>Application Status</h3>
                <div className={`current-status status-${selectedApplicant.status}`}>
                  <span className="status-icon">
                    {getStatusIcon(selectedApplicant.status)}
                  </span>
                  <span className="status-text">{selectedApplicant.status}</span>
                </div>
              </div>

              <div className="application-timeline">
                <h3>Application Timeline</h3>
                <div className="timeline-item">
                  <div className="timeline-icon"><IoMdTime/></div>
                  <div>
                    <strong>Application Submitted</strong>
                    <p>{new Date(selectedApplicant.applied_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="quick-actions">
                <h3>Quick Actions</h3>
                <div className="action-buttons">
                  <button 
                    className="action-btn shortlist"
                    onClick={() => updateStatus(selectedApplicant.id, 'shortlisted')}
                    disabled={selectedApplicant.status === 'shortlisted'}
                  >
                    <FaCheckCircle /> Shortlist
                  </button>
                  <button 
                    className="action-btn reject"
                    onClick={() => updateStatus(selectedApplicant.id, 'rejected')}
                    disabled={selectedApplicant.status === 'rejected'}
                  >
                    <FaTimesCircle /> Reject
                  </button>
                  <button 
                    className="action-btn hire"
                    onClick={() => updateStatus(selectedApplicant.id, 'hired')}
                    disabled={selectedApplicant.status === 'hired'}
                  >
                    <BsPersonCheckFill /> Hire
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <div className="no-selection-content">
                <h3>Select an Applicant</h3>
                <p>Choose an applicant from the list to view details and manage their application</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}