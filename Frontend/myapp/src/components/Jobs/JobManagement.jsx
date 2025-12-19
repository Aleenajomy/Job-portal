import { useState, useEffect } from 'react';
import './Jobs.css';
import './JobManagement.css';
import { jobAPI } from '../../utils/api';
import ViewApplications from './ViewApplications';
import ApplicantDetail from './ApplicantDetail';
import { MdDeleteOutline, MdLocationOn, MdWork, MdAttachMoney, MdLanguage, MdCheckCircle, MdPause } from "react-icons/md";
import { CiEdit } from "react-icons/ci";

export default function JobManagement({ userRole, onBack, jobs, setJobs }) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [viewingApplications, setViewingApplications] = useState(null);
  const [viewingApplicant, setViewingApplicant] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    salary: '',
    experience: '',
    job_type: 'fulltime',
    work_mode: 'onsite'
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/my-posted-jobs/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        setJobs([]);
        return;
      }
      
      const data = await response.json();
      const jobsArray = Array.isArray(data) ? data : data.results || [];
      setJobs(jobsArray);
    } catch (error) {
      setJobs([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (!token) {
      alert('Please login to continue');
      window.location.reload();
      return;
    }
    
    if (!userRole || (userRole !== 'Employer' && userRole !== 'Company')) {
      alert('Access denied. Only Employers and Companies can create jobs.');
      return;
    }
    
    try {
      if (editingJob) {
        // Don't send is_active in regular updates to prevent accidental changes
      const { is_active, ...updateData } = formData;
      await jobAPI.updateJob(editingJob.id, updateData);
        alert('Job updated successfully!');
      } else {
        await jobAPI.createJob(formData);
        alert('Job created successfully!');
      }
      fetchJobs(); // Refresh job list
      resetForm();
    } catch (error) {
      console.error('Job submission error:', error);
      if (error.message.includes('Session expired') || error.message.includes('Authentication required')) {
        alert('Your session has expired. Please login again.');
        localStorage.clear();
        window.location.reload();
      } else {
        alert(error.message || 'Failed to save job');
      }
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      description: job.description,
      requirements: job.requirements || '',
      location: job.location,
      salary: job.salary,
      experience: job.experience,
      job_type: job.job_type,
      work_mode: job.work_mode
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      try {
        await jobAPI.deleteJob(jobId);
        fetchJobs();
      } catch (error) {
        alert(error.message || 'Failed to delete job');
      }
    }
  };

  const toggleJobStatus = async (jobId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to continue');
        window.location.reload();
        return;
      }

      const job = jobs.find(j => j.id === jobId);
      if (!job) return;
      
      const newStatus = !job.is_active;
      const endpoint = newStatus ? 'activate' : 'deactivate';
      
      console.log(`Toggling job ${jobId} from ${job.is_active} to ${newStatus}`);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/jobs/${jobId}/${endpoint}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.clear();
        window.location.reload();
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Toggle failed:', errorData);
        throw new Error('Failed to update job status');
      }
      
      console.log('Toggle successful');
      
      // Update jobs state
      setJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, is_active: newStatus }
          : job
      ));
      
      // Update selected job if it's the one being toggled
      if (selectedJob && selectedJob.id === jobId) {
        setSelectedJob(prev => ({ ...prev, is_active: newStatus }));
      }
    } catch (error) {
      console.error('Toggle error:', error);
      alert(error.message || 'Failed to update job status');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      requirements: '',
      location: '',
      salary: '',
      experience: '',
      job_type: 'fulltime',
      work_mode: 'onsite'
    });
    setEditingJob(null);
    setShowCreateForm(false);
  };

  if (viewingApplicant) {
    return (
      <ApplicantDetail 
        applicationId={viewingApplicant}
        onBack={() => setViewingApplicant(null)}
      />
    );
  }

  if (viewingApplications) {
    return (
      <ViewApplications 
        jobId={viewingApplications.id}
        jobTitle={viewingApplications.title}
        onBack={() => setViewingApplications(null)}
        onViewApplicant={(applicationId) => setViewingApplicant(applicationId)}
      />
    );
  }

  if (userRole === 'Employee') {
    return (
      <div className="job-management-container">
        <button className="back-btn" onClick={onBack}>←</button>
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>Only employers and companies can manage job postings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="job-management-container">
      <button className="back-btn" onClick={onBack}>←</button>
      
      <div className="management-header">
        <h1>Job Management</h1>
        <button 
          className="create-job-btn"
          onClick={() => setShowCreateForm(true)}
        >
          + Post New Job
        </button>
      </div>

      {showCreateForm && (
        <div className="job-form-overlay">
          <div className="job-form-container">
            <div className="job-form-header">
              <h2>{editingJob ? 'Edit Job' : 'Post New Job'}</h2>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="job-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Job Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Senior React Developer"
                  />
                </div>
                <div className="form-group">
                  <label>Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. San Francisco, CA"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Job Type *</label>
                  <select
                    name="job_type"
                    value={formData.job_type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="fulltime">Full Time</option>
                    <option value="parttime">Part Time</option>
                    <option value="intern">Internship</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Work Mode *</label>
                  <select
                    name="work_mode"
                    value={formData.work_mode}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="onsite">On-site</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Experience</label>
                  <input
                    type="text"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    placeholder="e.g. 2-4 years"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Salary Range</label>
                  <input
                    type="text"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    placeholder="e.g. $80,000 - $120,000"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Job Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
                />
              </div>

              <div className="form-group">
                <label>Requirements</label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="List the skills, qualifications, and experience required..."
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingJob ? 'Update Job' : 'Post Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="jobs-stats">
        <div className="stat-card">
          <h3>{jobs.length}</h3>
          <p>Total Jobs Posted</p>
        </div>
        <div className="stat-card">
          <h3>{jobs.filter(job => job.is_active).length}</h3>
          <p>Active Jobs</p>
        </div>
        <div className="stat-card">
          <h3>{jobs.reduce((sum, job) => sum + (job.application_count || 0), 0)}</h3>
          <p>Total Applications</p>
        </div>
      </div>

      <div className="jobs-layout">
        <div className="jobs-list-panel">
          {jobs.length > 0 ? (
            jobs.map(job => (
              <div 
                key={job.id} 
                className={`job-item ${selectedJob?.id === job.id ? 'selected' : ''} ${!job.is_active ? 'inactive' : ''}`}
                onClick={() => setSelectedJob(job)}
              >
                <div className="item-header">
                  <h4 className="item-title">{job.title}</h4>
                  <span className={`status-badge ${job.is_active ? 'active' : 'inactive'}`}>
                    {job.is_active ? <MdCheckCircle /> : <MdPause />}
                  </span>
                </div>
                <p className="item-company">{job.company_name}</p>
                <div className="item-meta">
                  <span><MdLocationOn /> {job.location}</span>
                  <span className="item-date">{job.application_count || 0} applications</span>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-list">
              <div className="empty-icon"><MdWork /></div>
              <p>No jobs posted yet</p>
            </div>
          )}
        </div>

        <div className="job-detail-panel">
          {selectedJob ? (
            <div className="detail-content">
              <div className="detail-header">
                <div className="detail-title-section">
                  <h2>{selectedJob.title}</h2>
                  <p className="detail-company">{selectedJob.company_name}</p>
                </div>
                <div className="detail-actions">
                  <button className="edit-btn" onClick={() => handleEdit(selectedJob)}>
                    <CiEdit />
                  </button>
                  <button 
                    className={`job-toggle ${selectedJob.is_active ? 'active' : ''}`}
                    onClick={() => toggleJobStatus(selectedJob.id)}
                    title={selectedJob.is_active ? 'Active' : 'Inactive'}
                  >
                    <div className="toggle-slider"></div>
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(selectedJob.id)}>
                    <MdDeleteOutline /> 
                  </button>
                </div>
              </div>

              <div className="detail-info">
                <div className="info-grid">
                  <div className="info-item">
                    <MdLocationOn className="info-icon" />
                    <span>Location: {selectedJob.location}</span>
                  </div>
                  <div className="info-item">
                    <MdAttachMoney className="info-icon" />
                    <span>Salary: {selectedJob.salary}</span>
                  </div>
                  <div className="info-item">
                    <MdWork className="info-icon" />
                    <span>Experience: {selectedJob.experience}</span>
                  </div>
                  <div className="info-item">
                    <MdLanguage className="info-icon" />
                    <span>Work Mode: {selectedJob.work_mode}</span>
                  </div>
                </div>
              </div>

              <div className="detail-description">
                <h3>Job Description</h3>
                <p>{selectedJob.description}</p>
              </div>

              <div className="job-stats">
                <h3>Job Statistics</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-number">{selectedJob.application_count || 0}</span>
                    <span className="stat-label">Applications</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{selectedJob.is_active ? 'Active' : 'Inactive'}</span>
                    <span className="stat-label">Status</span>
                  </div>
                </div>
                <button 
                  className="view-applications-btn"
                  onClick={() => setViewingApplications(selectedJob)}
                >
                  View All Applications ({selectedJob.application_count || 0})
                </button>
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <div className="no-selection-content">
                <h3>Select a Job</h3>
                <p>Choose a job from the list to view details and manage applications</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}