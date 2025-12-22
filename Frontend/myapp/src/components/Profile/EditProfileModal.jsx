import React, { useState, useEffect } from 'react';
import { X, Save, Upload } from 'lucide-react';
import { profileService } from '../../services/profileService';
import './EditProfileModal.css';

const EditProfileModal = ({ isOpen, onClose, profile, onProfileUpdate }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    location: '',
    bio: '',
    skills: [],
    education: '',
    experience_years: '',
    company_name: '',
    company_website: '',
    company_phone: '',
    company_address: '',
    company_description: ''
  });
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile && isOpen) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || profile.company_phone || '',
        location: profile.location || profile.company_address || '',
        bio: profile.bio || profile.company_description || '',
        skills: profile.skills || [],
        education: profile.education_summary || '',
        experience_years: profile.experience_years || '',
        company_name: profile.company_name || '',
        company_website: profile.company_website || '',
        company_phone: profile.company_phone || '',
        company_address: profile.company_address || '',
        company_description: profile.company_description || ''
      });
    }
  }, [profile, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const isCompany = currentUser?.job_role === 'Company';
      
      let updateData = {};
      
      if (isCompany) {
        updateData = {
          company_name: formData.company_name,
          company_phone: formData.company_phone,
          company_website: formData.company_website,
          company_address: formData.company_address,
          company_description: formData.company_description
        };
      } else {
        updateData = {
          phone: formData.phone,
          location: formData.location,
          bio: formData.bio,
          skills: formData.skills,
          education_summary: formData.education,
          experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
          company_name: formData.company_name
        };
      }

      await profileService.updateProfile(updateData, isCompany);
      onProfileUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentUser = JSON.parse(localStorage.getItem('user'));
  const isCompany = currentUser?.job_role === 'Company';

  return (
    <div className="edit-modal-overlay" onClick={onClose}>
      <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="edit-modal-header">
          <h2>Edit Profile</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-modal-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {isCompany ? (
            // Company Profile Fields
            <>
              <div className="form-group">
                <label htmlFor="company_name">Company Name</label>
                <input
                  type="text"
                  id="company_name"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  placeholder="Enter company name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="company_phone">Phone</label>
                <input
                  type="tel"
                  id="company_phone"
                  name="company_phone"
                  value={formData.company_phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="company_website">Website</label>
                <input
                  type="url"
                  id="company_website"
                  name="company_website"
                  value={formData.company_website}
                  onChange={handleInputChange}
                  placeholder="https://www.example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="company_address">Address</label>
                <input
                  type="text"
                  id="company_address"
                  name="company_address"
                  value={formData.company_address}
                  onChange={handleInputChange}
                  placeholder="Enter company address"
                />
              </div>

              <div className="form-group">
                <label htmlFor="company_description">Description</label>
                <textarea
                  id="company_description"
                  name="company_description"
                  value={formData.company_description}
                  onChange={handleInputChange}
                  placeholder="Describe your company..."
                  rows={4}
                />
              </div>
            </>
          ) : (
            // Employee/Employer Profile Fields
            <>
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Enter your location"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label htmlFor="experience_years">Years of Experience</label>
                <input
                  type="number"
                  id="experience_years"
                  name="experience_years"
                  value={formData.experience_years}
                  onChange={handleInputChange}
                  placeholder="Enter years of experience"
                  min="0"
                  max="50"
                />
              </div>

              <div className="form-group">
                <label htmlFor="company_name">Current Company</label>
                <input
                  type="text"
                  id="company_name"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  placeholder="Enter current company name"
                />
              </div>

              <div className="form-group">
                <label>Skills</label>
                <div className="skills-input-container">
                  <div className="add-skill-input">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="add-skill-btn"
                    >
                      Add
                    </button>
                  </div>
                  <div className="skills-list">
                    {formData.skills.map((skill, index) => (
                      <span key={index} className="skill-tag editable">
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="remove-skill-btn"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Education</label>
                <div className="education-section">
                  {/* Existing Education */}
                  {profile?.education && profile.education.length > 0 && (
                    <div className="existing-education">
                      {profile.education.map((edu, index) => (
                        <div key={index} className="education-item">
                          <h4>{edu.degree}</h4>
                          <p>{edu.school}</p>
                          <span>{edu.start_year} - {edu.is_current ? 'Present' : edu.end_year}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Simple Education Input */}
                  <input
                    type="text"
                    name="education"
                    value={formData.education || ''}
                    onChange={handleInputChange}
                    placeholder="e.g., Bachelor's in Computer Science from XYZ University"
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="loading-spinner-small"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;