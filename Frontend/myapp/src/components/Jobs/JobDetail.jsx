import './Jobs.css';

export default function JobDetail({ job, onBack, onApply }) {
  if (!job) return null;

  const requirements = [
    "Bachelor's degree in Computer Science or related field",
    "Strong proficiency in React.js and modern JavaScript",
    "Experience with state management (Redux/Context API)",
    "Knowledge of RESTful APIs and HTTP protocols",
    "Familiarity with version control systems (Git)",
    "Excellent problem-solving and communication skills"
  ];

  const responsibilities = [
    "Develop and maintain high-quality React applications",
    "Collaborate with cross-functional teams to define and implement features",
    "Write clean, maintainable, and efficient code",
    "Participate in code reviews and technical discussions",
    "Stay up-to-date with the latest industry trends and technologies",
    "Mentor junior developers and contribute to team growth"
  ];

  const benefits = [
    "Competitive salary and equity package",
    "Comprehensive health, dental, and vision insurance",
    "Flexible working hours and remote work options",
    "Professional development opportunities",
    "Annual learning and conference budget",
    "Team building events and company retreats"
  ];

  return (
    <div className="job-detail-container">
      <button className="back-btn" onClick={onBack}>
        ←
      </button>
      <div className="job-detail-header">
        <div className="job-detail-title-section">
          <h1 className="job-detail-title">{job.title}</h1>
          <div className="job-detail-company">
            <span className="company-icon">🏢</span>
            <span className="company-name">{job.company}</span>
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
                <span className={`job-type-badge ${job.jobType.toLowerCase().replace(' ', '')}`}>
                  {job.jobType}
                </span>
              </div>
              <div className="overview-item">
                <span className="overview-label">Experience</span>
                <span className="overview-value">{job.experience}</span>
              </div>
              <div className="overview-item">
                <span className="overview-label">Location</span>
                <span className="overview-value">{job.location}</span>
              </div>
              <div className="overview-item">
                <span className="overview-label">Work Mode</span>
                <span className="overview-value">{job.workMode}</span>
              </div>
              <div className="overview-item">
                <span className="overview-label">Salary</span>
                <span className="overview-value salary">{job.salary}</span>
              </div>
            </div>
          </div>

          <div className="job-section-card">
            <h2>Job Description</h2>
            <p className="job-full-description">
              {job.description} We are seeking a talented and motivated individual to join our growing team. 
              This role offers an excellent opportunity to work on challenging projects and contribute to 
              innovative solutions that impact thousands of users worldwide.
            </p>
          </div>

          <div className="job-section-card">
            <h2>Key Responsibilities</h2>
            <ul className="job-list">
              {responsibilities.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="job-section-card">
            <h2>Requirements</h2>
            <ul className="job-list">
              {requirements.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="job-section-card">
            <h2>Benefits & Perks</h2>
            <ul className="job-list">
              {benefits.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="job-detail-sidebar">
          <div className="apply-card">
            <h3>Ready to Apply?</h3>
            <p>Join our team and take your career to the next level!</p>
            <button className="apply-btn" onClick={() => onApply(job)}>
              Apply Now
            </button>
            <button className="save-btn">
              Save Job
            </button>
          </div>

          <div className="company-info-card">
            <h3>About {job.company}</h3>
            <div className="company-stats">
              <div className="stat-item">
                <span className="stat-number">500+</span>
                <span className="stat-label">Employees</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">2015</span>
                <span className="stat-label">Founded</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">Tech</span>
                <span className="stat-label">Industry</span>
              </div>
            </div>
            <p className="company-description">
              A leading technology company focused on creating innovative solutions 
              that transform how businesses operate in the digital age.
            </p>
          </div>

          <div className="similar-jobs-card">
            <h3>Similar Jobs</h3>
            <div className="similar-job-item">
              <h4>Frontend Developer</h4>
              <p>TechStart Inc</p>
              <span className="similar-job-salary">$90k - $120k</span>
            </div>
            <div className="similar-job-item">
              <h4>React Native Developer</h4>
              <p>Mobile Solutions</p>
              <span className="similar-job-salary">$100k - $140k</span>
            </div>
            <div className="similar-job-item">
              <h4>Full Stack Developer</h4>
              <p>WebCorp</p>
              <span className="similar-job-salary">$110k - $150k</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}