import React, { useState, useEffect } from 'react';
import './Jobs.css';

const sampleJobs = [
  {
    id: 1,
    title: "Senior React Developer",
    company_name: "TechCorp Solutions",
    job_type: "Full time",
    experience: "3-5 years",
    location: "San Francisco, CA",
    salary: "$120,000 - $150,000",
    description: "We are looking for an experienced React developer to join our dynamic team and build cutting-edge web applications.",
    work_mode: "Remote",
    requirements: ["React.js", "JavaScript", "HTML/CSS", "Node.js"]
  },
  {
    id: 2,
    title: "Python Backend Engineer",
    company_name: "DataFlow Inc",
    job_type: "Full time", 
    experience: "2-4 years",
    location: "New York, NY",
    salary: "$100,000 - $130,000",
    description: "Join our backend team to develop scalable APIs and microservices using Python and Django framework.",
    work_mode: "Hybrid",
    requirements: ["Python", "Django", "REST APIs", "PostgreSQL"]
  },
  {
    id: 3,
    title: "UI/UX Designer",
    company_name: "Creative Studios",
    job_type: "Part time",
    experience: "1-3 years", 
    location: "Los Angeles, CA",
    salary: "$60,000 - $80,000",
    description: "Create beautiful and intuitive user interfaces for web and mobile applications with modern design principles.",
    work_mode: "On-site",
    requirements: ["Figma", "Adobe Creative Suite", "Prototyping", "User Research"]
  },
  {
    id: 4,
    title: "DevOps Engineer",
    company_name: "CloudTech Systems",
    job_type: "Full time",
    experience: "4-6 years",
    location: "Seattle, WA", 
    salary: "$130,000 - $160,000",
    description: "Manage cloud infrastructure and CI/CD pipelines to ensure reliable and scalable application deployment.",
    work_mode: "Remote",
    requirements: ["AWS", "Docker", "Kubernetes", "Jenkins"]
  },
  {
    id: 5,
    title: "Marketing Intern",
    company_name: "StartupHub",
    job_type: "Intern",
    experience: "Fresh graduate",
    location: "Austin, TX",
    salary: "$2,000/month",
    description: "Learn digital marketing strategies and help execute campaigns for our growing startup ecosystem.",
    work_mode: "Hybrid",
    requirements: ["Social Media", "Content Creation", "Analytics", "Communication"]
  }
];

const JobDetail = ({ selectedJob, onBack, userRole }) => {
  const [user, setUser] = useState(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Use selectedJob prop or find from sampleJobs if needed
  const job = selectedJob || sampleJobs[0];

  const handleApply = () => {
    if (!user) {
      alert('Please log in to apply for jobs');
      return;
    }

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.doc,.docx';
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      setApplying(true);
      // Simulate application submission
      setTimeout(() => {
        alert('Application submitted successfully!');
        setApplying(false);
      }, 1000);
    };
    fileInput.click();
  };

  const canEdit = false;
  const canApply = user && userRole === 'Employee';

  if (!job) return <div className="job-detail-container">Job not found</div>;

  return (
    <div className="job-detail-container">
      <button className="back-btn" onClick={onBack}>
        ←
      </button>
      
      <div className="job-detail-header">
        <div className="job-detail-title-section">
          <h1 className="job-detail-title">{job.title}</h1>
          <div className="job-detail-company">
            <span className="company-name">{job.company_name}</span>
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
                <span className="overview-value">{job.job_type}</span>
              </div>
              <div className="overview-item">
                <span className="overview-label">Work Mode</span>
                <span className="overview-value">{job.work_mode}</span>
              </div>
              <div className="overview-item">
                <span className="overview-label">Location</span>
                <span className="overview-value">{job.location || 'Not specified'}</span>
              </div>
              <div className="overview-item">
                <span className="overview-label">Experience</span>
                <span className="overview-value">{job.experience || 'Not specified'}</span>
              </div>
              <div className="overview-item">
                <span className="overview-label">Salary</span>
                <span className="overview-value salary">{job.salary || 'Not disclosed'}</span>
              </div>
            </div>
          </div>

          <div className="job-section-card">
            <h2>Job Description</h2>
            <div className="job-full-description">
              {job.description}
            </div>
          </div>

          {job.requirements && job.requirements.length > 0 && (
            <div className="job-section-card">
              <h2>Requirements</h2>
              <ul className="job-list">
                {job.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="job-detail-sidebar">
          {canApply && (
            <div className="apply-card">
              <h3>Apply for this job</h3>
              <p>Submit your resume to apply for this position.</p>
              <button 
                className="apply-btn"
                onClick={handleApply}
                disabled={applying}
              >
                {applying ? 'Submitting...' : 'Apply Now'}
              </button>
              <button 
                className="save-btn"
                onClick={() => alert('Job saved!')}
              >
                Save Job
              </button>
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
              {job.company_name} is a leading company in the industry, committed to innovation and excellence.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;