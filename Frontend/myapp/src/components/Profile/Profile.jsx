import React, { useState, useEffect } from 'react';
import { Camera, MapPin, Edit, Briefcase, GraduationCap, Phone, Mail, Globe, Calendar, Award, ExternalLink } from 'lucide-react';
import { profileService } from '../../services/profileService';
import EditProfileModal from './EditProfileModal';
import './NewProfile.css';

const Profile = ({ userId, isPublicView = false }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [imageKey, setImageKey] = useState(0);

  useEffect(() => {
    fetchProfile();
  }, [userId, isPublicView]);

  const fetchProfile = async () => {
    try {
      const currentUserId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No authentication token found');
        return;
      }
      
      const ownProfile = !userId || userId === currentUserId || !isPublicView;
      setIsOwnProfile(ownProfile);
      
      let data;
      if (ownProfile && !isPublicView) {
        data = await profileService.getCurrentUserProfile();
        console.log('Profile data received:', data);
      } else {
        data = await profileService.getPublicProfile(userId);
      }
      
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.message.includes('Session expired') || error.message.includes('Authentication required')) {
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewPublicProfile = () => {
    window.open(`/profile/${localStorage.getItem('userId')}/public`, '_blank');
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      await profileService.uploadProfileImage(file);
      setImageKey(prev => prev + 1);
      await fetchProfile();
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    }
  };

  const handleProfileUpdate = () => {
    fetchProfile();
    setShowEditModal(false);
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-error">
        <div className="error-content">
          <h3>Profile not found</h3>
          <p>The profile you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const getProfileImage = () => {
    const defaultCompany = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjNGY0NmU1Ii8+Cjx0ZXh0IHg9Ijc1IiB5PSI4MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Q29tcGFueTwvdGV4dD4KPC9zdmc+';
    const defaultUser = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjNjM2NmYxIi8+Cjx0ZXh0IHg9Ijc1IiB5PSI4MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VXNlcjwvdGV4dD4KPC9zdmc+';
    
    if (!profile) return defaultUser;
    
    if (profile.job_role === 'Company') {
      // For company users, check both company_logo and profile_image fields
      const imageUrl = profile.company_logo || profile.profile_image;
      if (imageUrl) {
        return imageUrl.startsWith('http') ? imageUrl : `http://localhost:8000${imageUrl}`;
      }
      return defaultCompany;
    }
    
    if (profile.profile_image) {
      return profile.profile_image.startsWith('http') 
        ? profile.profile_image 
        : `http://localhost:8000${profile.profile_image}`;
    }
    return defaultUser;
  };

  const getDisplayName = () => {
    if (!profile) return 'Loading...';
    
    if (profile.job_role === 'Company') {
      // For company users, use full_name first, then company_name, then fallback
      return profile.full_name || profile.company_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Company Name';
    }
    
    return profile.full_name || 'User Name';
  };

  const getLocation = () => {
    if (profile.job_role === 'Company') {
      return profile.company_address;
    }
    return profile.location;
  };

  const getBio = () => {
    if (!profile) return '';
    
    if (profile.job_role === 'Company') {
      return profile.company_description || 'We are a professional company committed to excellence.';
    }
    return profile.bio || 'No description available.';
  };

  return (
    <div className="modern-profile-container">
      {/* Profile Header */}
      <div className="profile-hero">
        <div className="hero-background"></div>
        <div className="hero-content">
          <div className="profile-avatar-section">
            <div className="avatar-container">
              <img 
                key={imageKey}
                src={getProfileImage()}
                alt="Profile" 
                className="profile-avatar"
                style={{
                  width: '150px',
                  height: '150px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid rgba(255,255,255,0.2)'
                }}
              />
              {isOwnProfile && !isPublicView && (
                <label className="avatar-upload">
                  <Camera size={18} />
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="profile-header-info">
            <div className="profile-title-section">
              <h1 className="profile-title">{getDisplayName()}</h1>
              <div className="profile-badges">
                <span className={`role-badge ${profile.job_role?.toLowerCase()}`}>
                  {profile.job_role}
                </span>
                {profile.is_verified && (
                  <span className="verified-badge">
                    <Award size={14} />
                    Verified
                  </span>
                )}
              </div>
            </div>
            
            <p className="profile-tagline">
              {profile.job_role === 'Company' 
                ? (profile.company_description || 'Professional company providing quality services')
                : (profile.bio || 'Professional looking for opportunities')
              }
            </p>
            
            <div className="profile-meta">
              {getLocation() && (
                <div className="meta-item">
                  <MapPin size={16} />
                  <span>{getLocation()}</span>
                </div>
              )}
              {profile.email && (
                <div className="meta-item">
                  <Mail size={16} />
                  <span>{profile.email}</span>
                </div>
              )}
              {(profile.phone_number || profile.phone || '+1 (555) 123-4567') && (
                <div className="meta-item">
                  <Phone size={16} />
                  <span>{profile.phone_number || profile.phone || '+1 (555) 123-4567'}</span>
                </div>
              )}
              {profile.company_website && (
                <div className="meta-item">
                  <Globe size={16} />
                  <a href={profile.company_website} target="_blank" rel="noopener noreferrer">
                    {profile.company_website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>

            {isOwnProfile && !isPublicView && (
              <div className="profile-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowEditModal(true)}
                >
                  <Edit size={16} />
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="profile-stats">
        <div className="stat-card">
          <div className="stat-number">{(profile.followers_count || 0) + (profile.following_count || 0)}</div>
          <div className="stat-label">Connections</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{profile.posts_count || 0}</div>
          <div className="stat-label">Posts</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{profile.following_count || 0}</div>
          <div className="stat-label">Following</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{profile.followers_count || 0}</div>
          <div className="stat-label">Followers</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="profile-nav">
        <button 
          className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        {profile.job_role !== 'Company' && (
          <button 
            className={`nav-tab ${activeTab === 'education' ? 'active' : ''}`}
            onClick={() => setActiveTab('education')}
          >
            Education
          </button>
        )}
        <button 
          className={`nav-tab ${activeTab === 'contact' ? 'active' : ''}`}
          onClick={() => setActiveTab('contact')}
        >
          Contact
        </button>
      </div>

      {/* Content Sections */}
      <div className="profile-content">
        {activeTab === 'overview' && (
          <div className="content-grid">
            {/* About Section */}
            <div className="content-card">
              <div className="card-header">
                <h3>About</h3>
                {isOwnProfile && !isPublicView && (
                  <button className="edit-btn" onClick={() => setShowEditModal(true)}>
                    <Edit size={16} />
                  </button>
                )}
              </div>
              <div className="card-body">
                <p>{getBio() || 'No description available.'}</p>
              </div>
            </div>

            {/* Skills Section */}
            {profile.job_role !== 'Company' && (
              <div className="content-card">
                <div className="card-header">
                  <h3>Skills & Expertise</h3>
                  {isOwnProfile && !isPublicView && (
                    <button className="edit-btn" onClick={() => setShowEditModal(true)}>
                      <Edit size={16} />
                    </button>
                  )}
                </div>
                <div className="card-body">
                  {profile.skills && profile.skills.length > 0 ? (
                    <div className="skills-grid">
                      {profile.skills.map((skill, index) => (
                        <span key={index} className="skill-chip">{skill}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="empty-state">No skills added yet.</p>
                  )}
                </div>
              </div>
            )}

            {/* Experience Section */}
            <div className="content-card">
              <div className="card-header">
                <Briefcase size={20} />
                <h3>{profile.job_role === 'Company' ? 'Company Information' : 'Professional Experience'}</h3>
                {isOwnProfile && !isPublicView && (
                  <button className="edit-btn" onClick={() => setShowEditModal(true)}>
                    <Edit size={16} />
                  </button>
                )}
              </div>
              <div className="card-body">
                {profile.job_role === 'Company' ? (
                  <div className="info-list">
                    {profile.company_website && (
                      <div className="info-item">
                        <Globe size={16} />
                        <div>
                          <label>Website</label>
                          <a href={profile.company_website} target="_blank" rel="noopener noreferrer">
                            {profile.company_website}
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      </div>
                    )}
                    {profile.company_phone && (
                      <div className="info-item">
                        <Phone size={16} />
                        <div>
                          <label>Phone</label>
                          <span>{profile.company_phone}</span>
                        </div>
                      </div>
                    )}
                    <div className="info-item">
                      <Mail size={16} />
                      <div>
                        <label>Email</label>
                        <span>{profile.email}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="info-list">
                    {profile.experience_years && (
                      <div className="info-item">
                        <Calendar size={16} />
                        <div>
                          <label>Experience</label>
                          <span>{profile.experience_years} years</span>
                        </div>
                      </div>
                    )}
                    {profile.company_name && (
                      <div className="info-item">
                        <Briefcase size={16} />
                        <div>
                          <label>Current Company</label>
                          <span>{profile.company_name}</span>
                        </div>
                      </div>
                    )}
                    {profile.education_summary && (
                      <div className="info-item">
                        <GraduationCap size={16} />
                        <div>
                          <label>Education</label>
                          <span>{profile.education_summary}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'education' && profile.job_role !== 'Company' && (
          <div className="content-grid">
            <div className="content-card full-width">
              <div className="card-header">
                <GraduationCap size={20} />
                <h3>Education</h3>
                {isOwnProfile && !isPublicView && (
                  <button className="edit-btn" onClick={() => setShowEditModal(true)}>
                    <Edit size={16} />
                  </button>
                )}
              </div>
              <div className="card-body">
                {profile.education_summary ? (
                  <div className="education-simple">
                    <p>{profile.education_summary}</p>
                  </div>
                ) : (
                  <div className="empty-state-large">
                    <GraduationCap size={48} />
                    <h4>No education details</h4>
                    <p>Add your education details in Edit Profile.</p>
                    {isOwnProfile && !isPublicView && (
                      <button className="btn btn-primary" onClick={() => setShowEditModal(true)}>
                        Edit Profile
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="content-grid">
            <div className="content-card">
              <div className="card-header">
                <h3>Contact Information</h3>
                {isOwnProfile && !isPublicView && (
                  <button className="edit-btn" onClick={() => setShowEditModal(true)}>
                    <Edit size={16} />
                  </button>
                )}
              </div>
              <div className="card-body">
                <div className="contact-grid">
                  <div className="contact-item">
                    <Mail size={20} />
                    <div>
                      <label>Email</label>
                      <span>{profile.email}</span>
                    </div>
                  </div>
                  {(profile.phone || profile.company_phone) && (
                    <div className="contact-item">
                      <Phone size={20} />
                      <div>
                        <label>Phone</label>
                        <span>{profile.phone || profile.company_phone}</span>
                      </div>
                    </div>
                  )}
                  {getLocation() && (
                    <div className="contact-item">
                      <MapPin size={20} />
                      <div>
                        <label>Location</label>
                        <span>{getLocation()}</span>
                      </div>
                    </div>
                  )}
                  {profile.company_website && (
                    <div className="contact-item">
                      <Globe size={20} />
                      <div>
                        <label>Website</label>
                        <a href={profile.company_website} target="_blank" rel="noopener noreferrer">
                          {profile.company_website.replace(/^https?:\/\//, '')}
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        profile={profile}
        onProfileUpdate={handleProfileUpdate}
      />
    </div>
  );
};

export default Profile;