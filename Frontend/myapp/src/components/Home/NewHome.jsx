import { useState, useEffect } from 'react';
import './NewHome.css';
import '../Posts/PostImages.css';
import JobList from '../Jobs/JobList';
import JobDetail from '../Jobs/JobDetail';
import JobManagement from '../Jobs/JobManagement';
import MyApplications from '../Jobs/MyApplications';
import CommentSection from '../Posts/CommentSection';
import ImageSlider from '../Posts/ImageSlider';
import PostCard from '../Posts/PostCard';
import MyNetwork from '../Network/MyNetwork';
import { ConnectionsCount } from '../Network';
import { Profile } from '../Profile';
import { networkService } from '../../services/networkService';
import { postService } from '../../services/postService';
import { AiOutlineTeam, AiOutlineHome, AiOutlineUser, AiOutlineLike, AiOutlineComment, AiFillLike } from "react-icons/ai";
import { CiBellOn } from "react-icons/ci";
import { MdPostAdd, MdWork, MdImage, MdClose, MdEdit, MdDelete, MdMoreVert } from "react-icons/md";
import { IoSettingsOutline, IoLogOutOutline } from "react-icons/io5";
import { BiText } from "react-icons/bi";
import { RiUserFollowLine } from "react-icons/ri";
import Snowfall from 'react-snowfall';

import { apiService } from '../../services/apiService';
import { STORAGE_KEYS } from '../../constants/index.js';

const API_BASE_URL = apiService.getBaseUrl();

export default function NewHome({ onLogout, onChangePassword, userEmail, userName, jobRole }) {
  const [showProfile, setShowProfile] = useState(false);
  const [currentView, setCurrentView] = useState('home'); // 'home', 'jobs', 'jobDetail', 'management', 'myApplications', 'posts', 'network'
  const [selectedJob, setSelectedJob] = useState(null);
  const [managedJobs, setManagedJobs] = useState([]);
  const [jobListRefresh, setJobListRefresh] = useState(0);
  const [showPostModal, setShowPostModal] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [showPostMenu, setShowPostMenu] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [imageSlider, setImageSlider] = useState({ show: false, images: [], currentIndex: 0 });
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [connectionStatsKey, setConnectionStatsKey] = useState(0);
  const [userProfileImage, setUserProfileImage] = useState(null);

  // Load posts from API
  const loadPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const postsData = currentView === 'posts' 
        ? await postService.getUserPosts() 
        : await postService.getAllPosts();
      console.log('Posts loaded:', postsData);
      if (postsData.length > 0 && postsData[0].images) {
        console.log('First post images:', postsData[0].images);
      }
      setPosts(postsData);
    } catch (error) {
      console.error('Error loading posts:', error);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
    fetchUserProfile();
  }, [currentView]);

  const fetchUserProfile = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const url = currentUser?.job_role === 'Company' 
        ? `${API_BASE_URL}/profiles/company-profile/`
        : `${API_BASE_URL}/profiles/user-profile/`;
        
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const profile = await response.json();
        // For company users, check both company_logo and profile_image
        const profileImage = currentUser?.job_role === 'Company' 
          ? (profile.company_logo || profile.profile_image)
          : profile.profile_image;
        setUserProfileImage(profileImage);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleLogout = () => {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    onLogout();
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setSelectedImages(prev => [...prev, ...imageUrls]);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreatePost = async () => {
    if (!postContent.trim() && selectedFiles.length === 0) return;
    
    try {
      await postService.createPost({ content: postContent }, selectedFiles);
      setPostContent('');
      setSelectedImages([]);
      setSelectedFiles([]);
      setShowPostModal(false);
      loadPosts(); // Refresh posts
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create post');
    }
  };

  const openPostModal = () => {
    setShowPostModal(true);
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setPostContent(post.content);
    // For editing, we'll show existing images but won't modify them unless new ones are selected
    console.log('Editing post images:', post.images);
    const existingImageUrls = post.images?.map(img => `${API_BASE_URL}${img.image}`) || [];
    setSelectedImages(existingImageUrls);
    setSelectedFiles([]);
    setShowPostModal(true);
    setShowPostMenu(null);
  };

  const handleDeletePost = async (postId) => {
    try {
      await postService.deletePost(postId);
      loadPosts(); // Refresh posts
      setShowPostMenu(null);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('Failed to delete post');
    }
  };

  const confirmDelete = (postId) => {
    setShowDeleteConfirm(postId);
    setShowPostMenu(null);
  };

  const handleUpdatePost = async () => {
    if (!postContent.trim() && selectedFiles.length === 0 && selectedImages.length === 0) return;
    
    try {
      await postService.updatePost(editingPost.id, { content: postContent }, selectedFiles);
      setPostContent('');
      setSelectedImages([]);
      setSelectedFiles([]);
      setEditingPost(null);
      setShowPostModal(false);
      loadPosts(); // Refresh posts
    } catch (error) {
      console.error('Error updating post:', error);
      setError('Failed to update post');
    }
  };

  const closeModal = () => {
    setShowPostModal(false);
    setEditingPost(null);
    setPostContent('');
    setSelectedImages([]);
    setSelectedFiles([]);
  };

  const isCurrentUserPost = (post) => {
    const currentUser = userName || userEmail?.split('@')[0];
    console.log('Checking post ownership:', { 
      postAuthor: post.author_name, 
      currentUser, 
      userName, 
      userEmail,
      match: post.author_name === currentUser || post.author_name === userEmail
    });
    return post.author_name === currentUser || post.author_name === userEmail;
  };

  const openImageSlider = (images, index = 0) => {
    const imageUrls = images.map(img => {
      if (typeof img === 'string') {
        return img;
      }
      // If img.image already contains full URL (http://), use it directly
      if (img.image && img.image.startsWith('http')) {
        return img.image.replace('http://127.0.0.1:8000', 'http://localhost:8000');
      }
      // Otherwise, prepend API_BASE_URL
      return `${API_BASE_URL}${img.image}`;
    });
    console.log('Opening slider with images:', imageUrls);
    setImageSlider({ show: true, images: imageUrls, currentIndex: index });
  };

  const closeImageSlider = () => {
    setImageSlider({ show: false, images: [], currentIndex: 0 });
  };

  const handleLike = async (postId, isCurrentlyLiked) => {
    try {
      if (isCurrentlyLiked) {
        await postService.unlikePost(postId);
      } else {
        await postService.likePost(postId);
      }
      loadPosts(); // Refresh to get updated like count
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleCommentCountChange = (postId, newCount) => {
    setPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, comments_count: newCount } : post
    ));
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${diffInHours}h`;
    return date.toLocaleDateString();
  };



  return (
    <div className="new-home-container">
      <header className="new-home-header">
        <div className="header-left">
          <div className="logo">JobPortal</div>
          <nav className="nav-icons">
            <button className="nav-icon-btn" onClick={() => { setCurrentView('home'); setShowProfile(false); }}>
              <AiOutlineHome size={20} />
              <span>Home</span>
            </button>
            <button className="nav-icon-btn" onClick={() => { setCurrentView('network'); setShowProfile(false); }}>
              <AiOutlineTeam size={20} />
              <span>Network</span>
            </button>
            <button className="nav-icon-btn" onClick={() => { setCurrentView('jobs'); setShowProfile(false); }}>
              <MdWork size={20} />
              <span>Jobs</span>
            </button>
            <button className="nav-icon-btn" onClick={() => { setCurrentView('posts'); setShowProfile(false); }}>
              <MdPostAdd size={20} />
              <span>Posts</span>
            </button>
            <button className="nav-icon-btn" onClick={() => setShowProfile(false)}>
              <CiBellOn size={20} />
              <span>Notifications</span>
            </button>
          </nav>
          <button className="hamburger-menu" onClick={() => setShowMobileNav(!showMobileNav)}>
            <div className="hamburger-line"></div>
            <div className="hamburger-line"></div>
            <div className="hamburger-line"></div>
          </button>
        </div>
        <div className="header-right">
          <button className="nav-icon-btn" onClick={() => { setShowProfile(true); setCurrentView('home'); }}>
            <AiOutlineUser size={20} />
            <span>Profile</span>
          </button>
          <button className="nav-icon-btn" onClick={() => { onChangePassword(); setShowProfile(false); }}>
            <IoSettingsOutline size={20} />
            <span>ChangePassword</span>
          </button>
          <button className="nav-icon-btn logout" onClick={handleLogout}>
            <IoLogOutOutline size={20} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <div className={`mobile-nav ${showMobileNav ? 'open' : ''}`}>
        <div className="mobile-nav-grid">
          <button className="mobile-nav-btn" onClick={() => { setCurrentView('home'); setShowProfile(false); setShowMobileNav(false); }}>
            <AiOutlineHome size={24} />
            <span>Home</span>
          </button>
          <button className="mobile-nav-btn" onClick={() => { setCurrentView('network'); setShowProfile(false); setShowMobileNav(false); }}>
            <AiOutlineTeam size={24} />
            <span>Network</span>
          </button>
          <button className="mobile-nav-btn" onClick={() => { setCurrentView('jobs'); setShowProfile(false); setShowMobileNav(false); }}>
            <MdWork size={24} />
            <span>Jobs</span>
          </button>
          <button className="mobile-nav-btn" onClick={() => { setCurrentView('posts'); setShowProfile(false); setShowMobileNav(false); }}>
            <MdPostAdd size={24} />
            <span>Posts</span>
          </button>
          <button className="mobile-nav-btn" onClick={() => { setShowProfile(false); setShowMobileNav(false); }}>
            <CiBellOn size={24} />
            <span>Notifications</span>
          </button>
          <button className="mobile-nav-btn" onClick={() => { setShowProfile(true); setCurrentView('home'); setShowMobileNav(false); }}>
            <AiOutlineUser size={24} />
            <span>Profile</span>
          </button>
          <button className="mobile-nav-btn" onClick={() => { onChangePassword(); setShowProfile(false); setShowMobileNav(false); }}>
            <IoSettingsOutline size={24} />
            <span>Settings</span>
          </button>
          <button className="mobile-nav-btn" onClick={() => { handleLogout(); setShowMobileNav(false); }}>
            <IoLogOutOutline size={24} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {showProfile ? (
        <div className="profile-page">
          <Profile />
        </div>
      ) : currentView === 'jobs' ? (
        <JobList 
          onJobClick={(job) => {
            setSelectedJob(job);
            setCurrentView('jobDetail');
          }}
          onBack={() => setCurrentView('home')}
          userRole={jobRole}
          onManageJobs={() => setCurrentView('management')}
          onMyApplications={() => setCurrentView('myApplications')}
          refreshTrigger={jobListRefresh}
        />
      ) : currentView === 'jobDetail' ? (
        <JobDetail 
          job={selectedJob}
          onBack={() => setCurrentView('jobs')}
          userRole={jobRole}
        />
      ) : currentView === 'management' ? (
        <JobManagement 
          userRole={jobRole}
          onBack={() => {
            setCurrentView('jobs');
            setJobListRefresh(prev => prev + 1);
          }}
          jobs={managedJobs}
          setJobs={setManagedJobs}
        />
      ) : currentView === 'myApplications' ? (
        <MyApplications 
          onBack={() => setCurrentView('jobs')}
        />
      ) : currentView === 'network' ? (
        <MyNetwork 
          userRole={jobRole}
          userName={userName}
          userEmail={userEmail}
        />
      ) : currentView === 'posts' ? (
        <main className="new-home-main">
          {/* <button className="back-btn" onClick={() => setCurrentView('home')}>
            ← Back to Home
          </button> */}
          <div className="post-creation-card">
            <div className="post-creator">
              <div className="user-avatar">
                {(userName || userEmail).charAt(0).toUpperCase()}
              </div>
              <input 
                type="text" 
                placeholder="Start a post..."
                className="post-input"
                onClick={openPostModal}
                readOnly
              />
            </div>
            <div className="post-buttons">
              <button className="post-btn" onClick={openPostModal}>
                <BiText size={16} />
                Text post
              </button>
              <button className="post-btn" onClick={openPostModal}>
                <MdImage size={16} />
                Image post
              </button>
            </div>
          </div>

          <div className="posts-feed">
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                isCurrentUserPost={isCurrentUserPost}
                showPostMenu={showPostMenu}
                onMenuToggle={(postId) => setShowPostMenu(showPostMenu === postId ? null : postId)}
                onEdit={handleEditPost}
                onDelete={confirmDelete}
                onLike={handleLike}
                onImageClick={openImageSlider}
                onCommentCountChange={handleCommentCountChange}
                formatTimestamp={formatTimestamp}
                showFollowButton={false}
              />
            ))}
          </div>
        </main>
      ) : (
        // <div style={{ position: 'relative', height: '100vh' }}>
        //   <Snowfall
        //     color="white"
        //     snowflakeCount={2000}
        //     style={{
        //       position: 'absolute',
        //       width: '100%',
        //       height: '100%',
        //     }}
        //   />
          
          <div className="home-layout" >
            <aside className="sidebar">
            <div className="profile-card">
              <div className="profile-header">
                <div className="profile-photo">
                  {userProfileImage ? (
                    <img 
                      src={userProfileImage.startsWith('http') ? userProfileImage : `http://localhost:8000${userProfileImage}`}
                      alt="Profile"
                      className="profile-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="profile-initials" style={{ display: userProfileImage ? 'none' : 'flex' }}>
                    {(userName || userEmail).charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="profile-info">
                  <h3>{userName || userEmail.split('@')[0]}</h3>
                  {/* <p className="role">{jobRole || 'Job Seeker'}</p> */}
                  <p className="headline">Passionate about technology and innovation</p>
                </div>
              </div>
              <div className="profile-stats">
                <ConnectionsCount detailed={true} key={connectionStatsKey} />
              </div>
            </div>
          </aside>
          
          <main className="main-content">
            <div className="suggestions-header">
              <h4>Suggested Posts</h4>
              {/* <p>Discover content from your network</p> */}
            </div>
            
            <div className="posts-feed">
              {posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  isCurrentUserPost={isCurrentUserPost}
                  showPostMenu={showPostMenu}
                  onMenuToggle={(postId) => setShowPostMenu(showPostMenu === postId ? null : postId)}
                  onEdit={handleEditPost}
                  onDelete={confirmDelete}
                  onLike={handleLike}
                  onImageClick={openImageSlider}
                  onCommentCountChange={handleCommentCountChange}
                  formatTimestamp={formatTimestamp}
                  showFollowButton={true}
                  onFollowAction={() => setConnectionStatsKey(prev => prev + 1)}
                />
              ))}
            </div>
          </main>
          
          <aside className="right-sidebar">
            <div className="trending-card">
              <h3>Trending</h3>
              <div className="trending-item">
                <p className="trend-title">React Development</p>
                <span className="trend-posts">1,234 posts</span>
              </div>
              <div className="trending-item">
                <p className="trend-title">Remote Work</p>
                <span className="trend-posts">892 posts</span>
              </div>
              <div className="trending-item">
                <p className="trend-title">Tech Jobs</p>
                <span className="trend-posts">567 posts</span>
              </div>
            </div>
          </aside>
         
        </div>
      )}
      
      {showPostModal && (
        <div className="post-modal-overlay" onClick={closeModal}>
          <div className="post-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingPost ? 'Edit post' : 'Create a post'}</h3>
              <button className="close-btn" onClick={closeModal}>
                <MdClose size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="post-author">
                <div className="user-avatar">
                  {(userName || userEmail).charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4>{userName || userEmail.split('@')[0]}</h4>
                  <p>{jobRole || 'Job Seeker'}</p>
                </div>
              </div>
              
              <textarea
                className="post-textarea"
                placeholder="What do you want to talk about?"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                rows={4}
              />
              
              {selectedImages.length > 0 && (
                <div className="selected-images">
                  <div className="images-header">
                    <span className="images-count">{selectedImages.length} image{selectedImages.length > 1 ? 's' : ''} selected</span>
                  </div>
                  <div className="images-preview">
                    {selectedImages.map((image, index) => (
                      <div key={index} className="image-preview">
                        <img src={image} alt={`Preview ${index + 1}`} />
                        <button 
                          className="remove-image-btn"
                          onClick={() => removeImage(index)}
                        >
                          <MdClose size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="modal-actions">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={{ display: 'none' }}
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="upload-btn">
                  <MdImage size={20} />
                  {selectedImages.length > 0 ? 'Add more images' : 'Add images'}
                </label>
                
                <button 
                  className="post-submit-btn"
                  onClick={editingPost ? handleUpdatePost : handleCreatePost}
                  disabled={!postContent.trim() && selectedImages.length === 0}
                >
                  {editingPost ? 'Update' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showDeleteConfirm && (
        <div className="post-modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Post</h3>
              <button className="close-btn" onClick={() => setShowDeleteConfirm(null)}>
                <MdClose size={24} />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this post? This action cannot be undone.</p>
              <div className="confirm-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  Cancel
                </button>
                <button 
                  className="delete-confirm-btn"
                  onClick={() => handleDeletePost(showDeleteConfirm)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {imageSlider.show && (
        <ImageSlider
          images={imageSlider.images}
          initialIndex={imageSlider.currentIndex}
          onClose={closeImageSlider}
        />
      )}
    </div>
  );
}
