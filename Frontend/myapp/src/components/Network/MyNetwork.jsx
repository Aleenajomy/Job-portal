import { useState, useEffect } from 'react';
import './MyNetwork.css';
import { MdPersonAdd, MdPersonRemove, MdSearch, MdGroup } from 'react-icons/md';
import { networkService } from '../../services/networkService.js';

export default function MyNetwork({ userRole, userName, userEmail }) {
  const [activeTab, setActiveTab] = useState('suggestions');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState({});
  const [stats, setStats] = useState({ following: 0, followers: 0, total: 0 });

  const tabs = [
    { id: 'suggestions', label: 'Suggestions', icon: MdPersonAdd },
    { id: 'following', label: 'Following', icon: MdGroup, count: stats.following },
    { id: 'followers', label: 'Followers', icon: MdGroup, count: stats.followers }
  ];

  useEffect(() => {
    loadNetworkStats();
    loadTabData(activeTab);
  }, [activeTab]);

  // Refresh data when component mounts to ensure sync
  useEffect(() => {
    const refreshData = async () => {
      await loadNetworkStats();
      await loadTabData('suggestions');
    };
    refreshData();
  }, []);

  const loadNetworkStats = async () => {
    try {
      const response = await networkService.getNetworkStats();
      setStats({
        following: response.following_count,
        followers: response.followers_count,
        total: response.total_connections
      });
    } catch (error) {
      console.error('Error loading network stats:', error);
    }
  };

  const loadTabData = async (tab) => {
    setLoading(true);
    try {
      switch (tab) {
        case 'suggestions':
          const suggestionsResponse = await networkService.getUserSuggestions();
          const suggestions = suggestionsResponse.suggestions || [];
          // Ensure isFollowing is properly set
          const updatedSuggestions = suggestions.map(user => ({
            ...user,
            isFollowing: user.isFollowing || false
          }));
          setUsers(updatedSuggestions);
          break;
        case 'following':
          const followingResponse = await networkService.getMyFollowing();
          setFollowing(followingResponse.following || []);
          break;
        case 'followers':
          const followersResponse = await networkService.getMyFollowers();
          setFollowers(followersResponse.followers || []);
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (id) => {
    if (followLoading[id]) return;
    
    setFollowLoading(prev => ({ ...prev, [id]: true }));
    try {
      await networkService.followUser(id);
      
      // Update local state immediately
      setUsers(prev => prev.map(user => 
        user.id === id ? { ...user, isFollowing: true } : user
      ));
      setFollowers(prev => prev.map(user => 
        user.id === id ? { ...user, isFollowing: true } : user
      ));
      
      // Add to following list if not already there
      const userToAdd = [...users, ...followers].find(u => u.id === id);
      if (userToAdd && !following.some(f => f.id === id)) {
        setFollowing(prev => [...prev, { ...userToAdd, isFollowing: true }]);
      }
      
      // Reload data to get fresh stats
      await loadNetworkStats();
      await loadTabData(activeTab);
    } catch (error) {
      console.error('Error following user:', error);
      // If already following, update the UI state
      if (error.message.includes('Already following')) {
        setUsers(prev => prev.map(user => 
          user.id === id ? { ...user, isFollowing: true } : user
        ));
      }
    } finally {
      setFollowLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleUnfollow = async (id) => {
    if (followLoading[id]) return;
    
    setFollowLoading(prev => ({ ...prev, [id]: true }));
    try {
      await networkService.unfollowUser(id);
      
      // Update local state immediately
      setFollowing(prev => prev.filter(user => user.id !== id));
      setUsers(prev => prev.map(user => 
        user.id === id ? { ...user, isFollowing: false } : user
      ));
      setFollowers(prev => prev.map(user => 
        user.id === id ? { ...user, isFollowing: false } : user
      ));
      
      // Reload data to get fresh stats
      await loadNetworkStats();
      await loadTabData(activeTab);
    } catch (error) {
      console.error('Error unfollowing user:', error);
      // If not following, update the UI state
      if (error.message.includes('Not following')) {
        setUsers(prev => prev.map(user => 
          user.id === id ? { ...user, isFollowing: false } : user
        ));
      }
    } finally {
      setFollowLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const filteredData = () => {
    const data = activeTab === 'suggestions' ? users : 
                 activeTab === 'following' ? following : followers;
    
    if (!searchQuery) return data;
    
    return data.filter(user => 
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.company?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const renderUserCard = (user, showUnfollow = false) => {
    // Determine if we're following this user
    let isFollowingBack = user.isFollowing;
    if (activeTab === 'followers') {
      isFollowingBack = following.some(f => f.id === user.id);
    }
    
    return (
      <div key={user.id} className="network-card user-card">
        <div className="card-avatar">
          <div className="avatar-placeholder">{user.name.charAt(0)}</div>
        </div>
        <div className="card-content">
          <h3>{user.name}</h3>
          <p className="role">{user.role}</p>
          <p className="company">{user.company}</p>
          <div className="user-stats">
            {user.total_connections !== undefined && (
              <span className="stat">
                <strong>{user.total_connections}</strong> connections
              </span>
            )}
            {user.posts_count !== undefined && (
              <span className="stat">
                <strong>{user.posts_count}</strong> posts
              </span>
            )}
          </div>
        </div>
        <div className="card-actions">
          {showUnfollow ? (
            <button 
              className="action-btn unfollow"
              onClick={() => handleUnfollow(user.id)}
              disabled={followLoading[user.id]}
            >
              {followLoading[user.id] ? '...' : (
                <><MdPersonRemove /> Unfollow</>
              )}
            </button>
          ) : (
            <button 
              className={`action-btn ${isFollowingBack ? 'following' : 'follow'}`}
              onClick={() => {
                if (isFollowingBack) {
                  handleUnfollow(user.id);
                } else {
                  handleFollow(user.id);
                }
              }}
              disabled={followLoading[user.id]}
            >
              {followLoading[user.id] ? '...' : (
                isFollowingBack ? (
                  <><MdPersonRemove /> Following</>
                ) : (
                  <><MdPersonAdd /> {activeTab === 'followers' ? 'Follow Back' : 'Follow'}</>
                )
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    if (loading) {
      return <div className="loading">Loading...</div>;
    }

    const data = filteredData();
    
    if (data.length === 0) {
      const emptyMessages = {
        suggestions: 'No user suggestions available',
        following: 'Not following anyone yet',
        followers: 'No followers yet'
      };
      return <div className="empty-state">{emptyMessages[activeTab]}</div>;
    }

    return (
      <div className="network-grid">
        {data.map(user => renderUserCard(user, activeTab === 'following'))}
      </div>
    );
  };

  return (
    <div className="my-network-container">
      <div className="network-header">
        <h1>My Network</h1>
        <div className="network-stats">
          <div className="stat-item">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Total Connections</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.following}</span>
            <span className="stat-label">Following</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.followers}</span>
            <span className="stat-label">Followers</span>
          </div>
        </div>
      </div>

      <div className="search-section">
        <div className="search-bar">
          <MdSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, title, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="network-tabs">
        {tabs.map(tab => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <IconComponent />
              <span>{tab.label}</span>
              {tab.count > 0 && <span className="tab-count">{tab.count}</span>}
            </button>
          );
        })}
      </div>

      <div className="network-content">
        {renderTabContent()}
      </div>
    </div>
  );
}