import React, { useState } from 'react';
import './Jobs.css';
import { validateJobApplication, canApplyToJobs, USER_ROLES } from '../../utils/roleValidation';
import { jobAPI } from '../../utils/api';



const JobDetail = ({ job, onBack, userRole }) => {
  const [applying, setApplying] = useState(false);
  const [fullJob, setFullJob] = useState(job);
  const [loading, setLoading] = useState(false);

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
  const currentUserId = parseInt(localStorage.getItem('userId') || localStorage.getItem('user_id')); // Get current user ID
  
  // Get user info from localStorage - try multiple possible keys
  const userEmail = localStorage.getItem('email') || localStorage.getItem('user_email') || localStorage.getItem('userEmail');
  const userName = localStorage.getItem('name') || localStorage.getItem('user_name') || localStorage.getItem('userName');
  
  // Show all localStorage keys for debugging
  console.log('All localStorage keys:', Object.keys(localStorage));
  console.log('All localStorage data:', {
    token: localStorage.getItem('token'),
    userId: localStorage.getItem('userId'),
    user_id: localStorage.getItem('user_id'),
    email: localStorage.getItem('email'),
    user_email: localStorage.getItem('user_email'),
    userEmail: localStorage.getItem('userEmail'),
    name: localStorage.getItem('name'),
    user_name: localStorage.getItem('user_name'),
    userName: localStorage.getItem('userName')
  });
  
  // Debug logging
  console.log('Original job data:', job);
  console.log('Full job data:', fullJob);
  console.log('Job description:', fullJob?.description);
  console.log('Job requirements:', fullJob?.requirements);
  console.log('Current user ID:', currentUserId);
  console.log('Current user email:', userEmail);
  console.log('Job publisher:', job?.publisher);
  console.log('Job publisher email:', job?.publisher_email);
  console.log('User role:', userRole);
  
  // Check if user can apply: Employee OR Employer (but not to own jobs)
  const canUserApply = (userRole === 'Employee' || userRole === 'Employer') && isLoggedIn;
  
  // Check ownership using multiple methods
  const isOwnJobById = fullJob && fullJob.publisher && !isNaN(currentUserId) && (fullJob.publisher === currentUserId);
  const isOwnJobByEmail = fullJob && fullJob.publisher_email && userEmail && (fullJob.publisher_email === userEmail);
  const isOwnJob = isOwnJobById || isOwnJobByEmail;
  
  const canApply = canUserApply && !isOwnJob;
  
  console.log('Is own job (by ID):', isOwnJobById);
  console.log('Is own job (by email):', isOwnJobByEmail);
  console.log('Is own job (final):', isOwnJob);
  console.log('Final can apply:', canApply);

  const handleApply = () => {
    if (!canApply) {
      alert('You cannot apply to this job');
      return;
    }

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.doc,.docx';
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      setApplying(true);
      
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('cover_letter', '');
      
      try {
        await jobAPI.applyToJob(fullJob.id, formData);
        alert('Application submitted successfully!');
      } catch (error) {
        alert(error.message || 'Error submitting application');
      } finally {
        setApplying(false);
      }
    };
    fileInput.click();
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

          {fullJob.requirements && fullJob.requirements.trim() && (
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
                {applying ? 'Submitting...' : 'Apply Now'}
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