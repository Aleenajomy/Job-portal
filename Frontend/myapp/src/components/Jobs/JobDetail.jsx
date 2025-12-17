import React, { useState } from 'react';
import './Jobs.css';
import { validateJobApplication, canApplyToJobs, USER_ROLES } from '../../utils/roleValidation';
import { jobAPI } from '../../utils/api';
import { MdCheckCircle } from 'react-icons/md';



const JobDetail = ({ job, onBack, userRole }) => {
  const [applying, setApplying] = useState(false);
  const [fullJob, setFullJob] = useState(job);
  const [loading, setLoading] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationData, setApplicationData] = useState({
    resume: null,
    coverLetter: ''
  });

  // Fetch full job details when component mounts
  React.useEffect(() => {
    const fetchJobDetails = async () => {
      if (!job?.id) return;
      
      setLoading(true);
      try {
        const jobDetails = await jobAPI.getJob(job.id);
        setFullJob(jobDetails);
      } catch (error) {
        console.error('Error fetching job details:', error);
        setFullJob(job); // Fallback to original job data
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [job?.id]);

  const isLoggedIn = !!localStorage.getItem('token');
  
  // Get user info from localStorage with proper fallbacks
  const userEmail = localStorage.getItem('userEmail') || localStorage.getItem('email') || localStorage.getItem('user_email');
  const userName = localStorage.getItem('userName') || localStorage.getItem('name') || localStorage.getItem('user_name');
  
  // Get current user ID with proper parsing and validation
  const getUserId = () => {
    const storedId = localStorage.getItem('userId') || localStorage.getItem('user_id');
    if (!storedId) return null;
    const parsedId = parseInt(storedId);
    return isNaN(parsedId) ? null : parsedId;
  };
  
  const currentUserId = getUserId();
  
  // Check if user can apply: Employee OR Employer (but not to own jobs)
  const canUserApply = (userRole === 'Employee' || userRole === 'Employer') && isLoggedIn;
  
  // Improved ownership detection with better validation
  const checkJobOwnership = () => {
    if (!fullJob) return false;
    
    // Method 1: Check by user ID (most reliable)
    if (currentUserId && fullJob.publisher) {
      const publisherId = typeof fullJob.publisher === 'object' ? fullJob.publisher.id : fullJob.publisher;
      if (publisherId === currentUserId) {
        return true;
      }
    }
    
    // Method 2: Check by email (fallback)
    if (userEmail && fullJob.publisher_email) {
      if (fullJob.publisher_email.toLowerCase() === userEmail.toLowerCase()) {
        return true;
      }
    }
    
    // Method 3: Check if publisher object has email that matches current user
    if (userEmail && fullJob.publisher && typeof fullJob.publisher === 'object' && fullJob.publisher.email) {
      if (fullJob.publisher.email.toLowerCase() === userEmail.toLowerCase()) {
        return true;
      }
    }
    
    return false;
  };
  
  const isOwnJob = checkJobOwnership();
  const hasApplied = fullJob?.has_applied || false;
  const canApply = canUserApply && !isOwnJob && !hasApplied;

  const handleApply = () => {
    if (!canApply) {
      alert('You cannot apply to this job');
      return;
    }
    setShowApplicationForm(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a PDF, DOC, or DOCX file');
        return;
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setApplicationData(prev => ({ ...prev, resume: file }));
    }
  };

  const handleCoverLetterChange = (e) => {
    setApplicationData(prev => ({ ...prev, coverLetter: e.target.value }));
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    
    if (!applicationData.resume) {
      alert('Please upload your resume');
      return;
    }
    
    setApplying(true);
    
    const formData = new FormData();
    formData.append('resume', applicationData.resume);
    formData.append('cover_letter', applicationData.coverLetter);
    
    try {
      await jobAPI.applyToJob(fullJob.id, formData);
      alert('Application submitted successfully!');
      setShowApplicationForm(false);
      setApplicationData({ resume: null, coverLetter: '' });
      
      // Refresh job data to update has_applied status
      try {
        const updatedJob = await jobAPI.getJob(fullJob.id);
        setFullJob(updatedJob);
      } catch (refreshError) {
        console.error('Error refreshing job data:', refreshError);
        // Manually set has_applied to true as fallback
        setFullJob(prev => ({ ...prev, has_applied: true }));
      }
    } catch (error) {
      alert(error.message || 'Error submitting application');
    } finally {
      setApplying(false);
    }
  };

  const handleCloseForm = () => {
    setShowApplicationForm(false);
    setApplicationData({ resume: null, coverLetter: '' });
  };

  const handleSaveJob = () => {
    alert(`Job saved: ${fullJob.title}`);
  };

  if (!job) return <div className="job-detail-container">Job not found</div>;
  if (loading) return <div className="job-detail-container">Loading job details...</div>;

  return (
    <div className="job-detail-container">
      <button className="back-btn" onClick={onBack}>
        ←
      </button>
      
      {showApplicationForm && (
        <div className="application-form-overlay">
          <div className="application-form-container">
            <div className="application-form-header">
              <h2>Apply for {fullJob.title}</h2>
              <button className="close-btn" onClick={handleCloseForm}>×</button>
            </div>
            
            <form onSubmit={handleSubmitApplication} className="application-form">
              <div className="form-group">
                <label htmlFor="resume">Resume *</label>
                <input
                  type="file"
                  id="resume"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  required
                />
                <small className="file-info">
                  Accepted formats: PDF, DOC, DOCX (Max size: 5MB)
                </small>
                {applicationData.resume && (
                  <div className="file-selected">
                    <MdCheckCircle /> {applicationData.resume.name}
                  </div>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="coverLetter">Cover Letter (Optional)</label>
                <textarea
                  id="coverLetter"
                  value={applicationData.coverLetter}
                  onChange={handleCoverLetterChange}
                  rows="6"
                  placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                />
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={handleCloseForm} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={applying}>
                  {applying ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <div className="job-detail-header">
        <div className="job-detail-title-section">
          <h1 className="job-detail-title">{fullJob.title}</h1>
          <div className="job-detail-company">
            <span className="company-name">{fullJob.company_name}</span>
          </div>
        </div>

      </div>

      <div className="job-detail-content">
        <div className="job-detail-main">
          <div className="job-overview-card">
            <h2>Job Overview</h2>
            <div className="overview-grid">
              <div className="overview-item">
                <span className="overview-label">Job Type</span>
                <span className="overview-value">{fullJob.job_type || fullJob.jobType || 'Not specified'}</span>
              </div>
              <div className="overview-item">
                <span className="overview-label">Work Mode</span>
                <span className="overview-value">{fullJob.work_mode || fullJob.workMode || 'Not specified'}</span>
              </div>
              <div className="overview-item">
                <span className="overview-label">Location</span>
                <span className="overview-value">{fullJob.location || 'Not specified'}</span>
              </div>
              <div className="overview-item">
                <span className="overview-label">Experience</span>
                <span className="overview-value">{fullJob.experience || 'Not specified'}</span>
              </div>
              <div className="overview-item">
                <span className="overview-label">Salary</span>
                <span className="overview-value salary">{fullJob.salary || 'Not disclosed'}</span>
              </div>
            </div>
          </div>

          <div className="job-section-card">
            <h2>Job Description</h2>
            <div className="job-full-description">
              {fullJob.description ? (
                <div>{fullJob.description}</div>
              ) : (
                <div>No description available</div>
              )}
            </div>
          </div>

          {fullJob.requirements && (Array.isArray(fullJob.requirements) ? fullJob.requirements.length > 0 : fullJob.requirements.trim()) && (
            <div className="job-section-card">
              <h2>Requirements</h2>
              <div className="job-full-description">
                {Array.isArray(fullJob.requirements) ? (
                  <ul className="job-list">
                    {fullJob.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                ) : (
                  <div>{fullJob.requirements}</div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="job-detail-sidebar">
          {canApply ? (
            <div className="apply-card">
              <h3>Ready to Apply?</h3>
              <p>Join our team and take your career to the next level!</p>
              <button 
                className="apply-btn"
                onClick={handleApply}
                disabled={applying}
              >
                Apply Now
              </button>
              <button 
                className="save-btn"
                onClick={handleSaveJob}
              >
                Save Job
              </button>
            </div>
          ) : (
            <div className="apply-card">
              {!isLoggedIn ? (
                <>
                  <h3>Want to Apply?</h3>
                  <p>Please log in as an Employee or Employer to apply for this position.</p>
                  <button className="login-required-btn" disabled>
                    Login Required
                  </button>
                </>
              ) : hasApplied ? (
                <>
                  <h3>Application Submitted</h3>
                  <p>You have already applied to this position. We'll be in touch soon!</p>
                  <button className="already-applied-btn" disabled>
                    Already Applied
                  </button>
                  <button 
                    className="save-btn"
                    onClick={handleSaveJob}
                  >
                    Save Job
                  </button>
                </>
              ) : userRole === 'Company' ? (
                <>
                  <h3>Company Account</h3>
                  <p>Companies cannot apply for jobs. You can only post jobs and view applicants.</p>
                  <button className="not-applicable-btn" disabled>
                    Application Not Available
                  </button>
                </>
              ) : isOwnJob ? (
                <>
                  <h3>Your Job Posting</h3>
                  <p>You cannot apply to your own job posting.</p>
                  <button className="not-applicable-btn" disabled>
                    Cannot Apply to Own Job
                  </button>
                </>
              ) : (
                <>
                  <h3>Access Restricted</h3>
                  <p>Only Employees and Employers can apply for jobs.</p>
                  <button className="not-applicable-btn" disabled>
                    Application Not Available
                  </button>
                </>
              )}
            </div>
          )}

          <div className="company-info-card">
            <h3>About the Company</h3>
            {/* <div className="company-stats">
              <div className="stat-item">
                <span className="stat-number">50+</span>
                <span className="stat-label">Employees</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">5+</span>
                <span className="stat-label">Years</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">10+</span>
                <span className="stat-label">Projects</span>
              </div>
            </div> */}
            <div className="company-description">
              {job.company_name || 'Company'} is a leading company in the industry, committed to innovation and excellence.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;