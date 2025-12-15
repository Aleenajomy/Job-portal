import { useState, useEffect } from 'react';
import './Jobs.css';
import { jobAPI } from '../../utils/api';

export default function JobManagement({ userRole, onBack }) {
  const [jobs, setJobs] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
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
      const response = await fetch('http://127.0.0.1:8000/api/my-posted-jobs/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        console.error('API Error:', response.status, response.statusText);
        setJobs([]);
        return;
      }
      
      const data = await response.json();
      setJobs(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
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
    try {
      if (editingJob) {
        await jobAPI.updateJob(editingJob.id, formData);
      } else {
        await jobAPI.createJob(formData);
      }
      fetchJobs(); // Refresh job list
      resetForm();
    } catch (error) {
      alert(error.message || 'Failed to save job');
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

  const toggleJobStatus = (jobId) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId 
        ? { ...job, is_active: !job.is_active }
        : job
    ));
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
                  <label>Experience Required</label>
                  <input
                    type="text"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    placeholder="e.g. 2-4 years"
                  />
                </div>
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
          <h3>{jobs.reduce((sum, job) => sum + (job.applications_count || job.total_applicants || 0), 0)}</h3>
          <p>Total Applications</p>
        </div>
      </div>

      <div className="posted-jobs-list">
        <h2>Your Posted Jobs</h2>
        {jobs.length > 0 ? (
          jobs.map(job => (
            <div key={job.id} className={`posted-job-card ${!job.is_active ? 'inactive' : ''}`}>
              <div className="posted-job-header">
                <div className="job-title-section">
                  <h3>{job.title}</h3>
                  <span className={`status-badge ${job.is_active ? 'active' : 'inactive'}`}>
                    {job.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="job-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => handleEdit(job)}
                  >
                    Edit
                  </button>
                  {/* <button 
                    className={`toggle-btn ${job.is_active ? 'deactivate' : 'activate'}`}
                    onClick={() => toggleJobStatus(job.id)}
                  >
                    {job.is_active ? 'Deactivate' : 'Activate'}
                  </button> */}
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(job.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <div className="posted-job-details">
                <div className="detail-item">
                  <span className="detail-icon">📍</span>
                  <span>{job.location}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">💼</span>
                  <span>{job.experience}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">💰</span>
                  <span>{job.salary}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">🌐</span>
                  <span>{job.work_mode}</span>
                </div>
              </div>
              
              <p className="posted-job-description">{job.description}</p>
              
              <div className="posted-job-footer">
                <div className="job-meta">
                  <span>Posted: {job.created_at}</span>
                  <span>{job.applications_count} applications</span>
                </div>
                <button className="view-applications-btn">
                  View Applications ({job.applications_count})
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-jobs-posted">
            <p>You haven't posted any jobs yet.</p>
            <button 
              className="create-first-job-btn"
              onClick={() => setShowCreateForm(true)}
            >
              Post Your First Job
            </button>
          </div>
        )}
      </div>
    </div>
  );
}