import { useState, useEffect } from 'react';
import './Jobs.css';

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

  // Sample jobs for demonstration - replace with API call
  useEffect(() => {
    // This would be replaced with actual API call to fetch user's posted jobs
    const sampleUserJobs = [
      {
        id: 1,
        title: "Senior React Developer",
        description: "We are looking for an experienced React developer...",
        location: "San Francisco, CA",
        salary: "$120,000 - $150,000",
        experience: "3-5 years",
        job_type: "fulltime",
        work_mode: "remote",
        created_at: "2024-01-15",
        applications_count: 12,
        is_active: true
      },
      {
        id: 2,
        title: "Python Backend Engineer",
        description: "Join our backend team to develop scalable APIs...",
        location: "New York, NY",
        salary: "$100,000 - $130,000",
        experience: "2-4 years",
        job_type: "fulltime",
        work_mode: "hybrid",
        created_at: "2024-01-10",
        applications_count: 8,
        is_active: true
      }
    ];
    setJobs(sampleUserJobs);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingJob) {
      // Update existing job
      setJobs(prev => prev.map(job => 
        job.id === editingJob.id 
          ? { ...job, ...formData, updated_at: new Date().toISOString().split('T')[0] }
          : job
      ));
      setEditingJob(null);
    } else {
      // Create new job
      const newJob = {
        id: Date.now(),
        ...formData,
        created_at: new Date().toISOString().split('T')[0],
        applications_count: 0,
        is_active: true
      };
      setJobs(prev => [newJob, ...prev]);
    }
    
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
    setShowCreateForm(false);
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

  const handleDelete = (jobId) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      setJobs(prev => prev.filter(job => job.id !== jobId));
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
          <h3>{jobs.reduce((sum, job) => sum + job.applications_count, 0)}</h3>
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