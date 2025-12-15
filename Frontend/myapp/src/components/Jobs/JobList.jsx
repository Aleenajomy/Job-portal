import { useState, useEffect } from 'react';
import './Jobs.css';
import { canCreateJobs } from '../../utils/roleValidation';
import { jobAPI } from '../../utils/api';



export default function JobList({ onJobClick, onBack, userRole, onManageJobs }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Check if user is logged in and can manage jobs
  const isLoggedIn = !!localStorage.getItem('token');
  const canManageJobs = isLoggedIn && canCreateJobs(userRole);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const data = await jobAPI.getJobs();
      console.log('Fetched jobs:', data);
      setJobs(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (job.company_name && job.company_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterType === 'all' || job.job_type.toLowerCase().replace(' ', '') === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="jobs-container">
      <button className="back-btn" onClick={onBack}>
        ←
      </button>
      <div className="jobs-header">
        <div className="header-content">
          <h1>Available Jobs</h1>
          {isLoggedIn && canManageJobs && (
            <button className="manage-jobs-btn" onClick={onManageJobs}>
              Manage My Jobs
            </button>
          )}
        </div>
        {!isLoggedIn && (
          <div className="login-prompt">
            <p>Please log in to apply for jobs or post new opportunities.</p>
          </div>
        )}

      </div>

      <div className="jobs-filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search jobs or companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            All Jobs
          </button>
          <button 
            className={`filter-btn ${filterType === 'fulltime' ? 'active' : ''}`}
            onClick={() => setFilterType('fulltime')}
          >
            Full Time
          </button>
          <button 
            className={`filter-btn ${filterType === 'parttime' ? 'active' : ''}`}
            onClick={() => setFilterType('parttime')}
          >
            Part Time
          </button>
          <button 
            className={`filter-btn ${filterType === 'intern' ? 'active' : ''}`}
            onClick={() => setFilterType('intern')}
          >
            Internship
          </button>
        </div>
      </div>

      <div className="jobs-list">
        {loading ? (
          <div className="loading">Loading jobs...</div>
        ) : filteredJobs.length > 0 ? (
          filteredJobs.map(job => (
            <div key={job.id} className="job-card" onClick={() => onJobClick(job)}>
              <div className="job-header">
                <h3 className="job-title">{job.title}</h3>
                <span className={`job-type-badge ${job.job_type.toLowerCase().replace(' ', '')}`}>
                  {job.job_type}
                </span>
              </div>
              
              <div className="job-company">
                <span className="company-icon">🏢</span>
                {job.company_name || 'Company'}
              </div>
              
              <div className="job-details">
                <div className="job-detail-item">
                  <span className="detail-icon">💼</span>
                  <span>{job.experience || 'Not specified'}</span>
                </div>
                <div className="job-detail-item">
                  <span className="detail-icon">📍</span>
                  <span>{job.location || 'Not specified'}</span>
                </div>
                <div className="job-detail-item">
                  <span className="detail-icon">💰</span>
                  <span>{job.salary || 'Not disclosed'}</span>
                </div>
                <div className="job-detail-item">
                  <span className="detail-icon">🌐</span>
                  <span>{job.work_mode}</span>
                </div>
              </div>
              
              <p className="job-description">{job.description}</p>
            </div>
          ))
        ) : (
          <div className="no-jobs">
            <p>No jobs found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}