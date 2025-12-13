import { useState } from 'react';
import './Jobs.css';

const sampleJobs = [
  {
    id: 1,
    title: "Senior React Developer",
    company: "TechCorp Solutions",
    jobType: "Full time",
    experience: "3-5 years",
    location: "San Francisco, CA",
    salary: "$120,000 - $150,000",
    description: "We are looking for an experienced React developer to join our dynamic team and build cutting-edge web applications.",
    workMode: "Remote"
  },
  {
    id: 2,
    title: "Python Backend Engineer",
    company: "DataFlow Inc",
    jobType: "Full time", 
    experience: "2-4 years",
    location: "New York, NY",
    salary: "$100,000 - $130,000",
    description: "Join our backend team to develop scalable APIs and microservices using Python and Django framework.",
    workMode: "Hybrid"
  },
  {
    id: 3,
    title: "UI/UX Designer",
    company: "Creative Studios",
    jobType: "Part time",
    experience: "1-3 years", 
    location: "Los Angeles, CA",
    salary: "$60,000 - $80,000",
    description: "Create beautiful and intuitive user interfaces for web and mobile applications with modern design principles.",
    workMode: "On-site"
  },
  {
    id: 4,
    title: "DevOps Engineer",
    company: "CloudTech Systems",
    jobType: "Full time",
    experience: "4-6 years",
    location: "Seattle, WA", 
    salary: "$130,000 - $160,000",
    description: "Manage cloud infrastructure and CI/CD pipelines to ensure reliable and scalable application deployment.",
    workMode: "Remote"
  },
  {
    id: 5,
    title: "Marketing Intern",
    company: "StartupHub",
    jobType: "Intern",
    experience: "Fresh graduate",
    location: "Austin, TX",
    salary: "$2,000/month",
    description: "Learn digital marketing strategies and help execute campaigns for our growing startup ecosystem.",
    workMode: "Hybrid"
  }
];

export default function JobList({ onJobClick, onBack }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredJobs = sampleJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || job.jobType.toLowerCase().replace(' ', '') === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="jobs-container">
      <button className="back-btn" onClick={onBack}>
        ←
      </button>
      <div className="jobs-header">
        <h1>Available Jobs</h1>
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
        {filteredJobs.length > 0 ? (
          filteredJobs.map(job => (
            <div key={job.id} className="job-card" onClick={() => onJobClick(job)}>
              <div className="job-header">
                <h3 className="job-title">{job.title}</h3>
                <span className={`job-type-badge ${job.jobType.toLowerCase().replace(' ', '')}`}>
                  {job.jobType}
                </span>
              </div>
              
              <div className="job-company">
                <span className="company-icon">🏢</span>
                {job.company}
              </div>
              
              <div className="job-details">
                <div className="job-detail-item">
                  <span className="detail-icon">💼</span>
                  <span>{job.experience}</span>
                </div>
                <div className="job-detail-item">
                  <span className="detail-icon">📍</span>
                  <span>{job.location}</span>
                </div>
                <div className="job-detail-item">
                  <span className="detail-icon">💰</span>
                  <span>{job.salary}</span>
                </div>
                <div className="job-detail-item">
                  <span className="detail-icon">🌐</span>
                  <span>{job.workMode}</span>
                </div>
              </div>
              
              <p className="job-description">{job.description}</p>
              
              <div className="job-actions">
                <button className="view-details-btn">View Details</button>
              </div>
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