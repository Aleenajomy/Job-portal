import { useState, useEffect } from 'react';
import './MyNetwork.css';
import { MdPersonAdd, MdPersonRemove, MdSearch, MdGroup } from 'react-icons/md';

export default function MyNetwork({ userRole, userName, userEmail }) {
  const [activeTab, setActiveTab] = useState('suggestions');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ following: 0, followers: 0 });

  const tabs = [
    { id: 'suggestions', label: 'Suggestions', icon: MdPersonAdd },
    { id: 'following', label: 'Following', icon: MdGroup, count: stats.following },
    { id: 'followers', label: 'Followers', icon: MdGroup, count: stats.followers }
  ];

  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab]);

  const loadTabData = async (tab) => {
    setLoading(true);
    try {
      const allUsers = [
        { id: 1, name: 'Alice Johnson', role: 'Senior UX Designer', company: 'Design Studio', connections: 245, posts: 12, isFollowing: false },
        { id: 2, name: 'Bob Wilson', role: 'Data Scientist', company: 'AI Labs', connections: 189, posts: 8, isFollowing: true },
        { id: 3, name: 'Carol Brown', role: 'Marketing Manager', company: 'Brand Co', connections: 356, posts: 24, isFollowing: false },
        { id: 4, name: 'David Chen', role: 'Full Stack Developer', company: 'Tech Startup', connections: 167, posts: 15, isFollowing: true },
        { id: 5, name: 'Emma Davis', role: 'Product Manager', company: 'Innovation Corp', connections: 298, posts: 18, isFollowing: false },
        { id: 6, name: 'Frank Miller', role: 'DevOps Engineer', company: 'Cloud Solutions', connections: 134, posts: 6, isFollowing: false },
        { id: 7, name: 'Grace Lee', role: 'UI/UX Designer', company: 'Creative Agency', connections: 278, posts: 21, isFollowing: true },
        { id: 8, name: 'Henry Taylor', role: 'Software Architect', company: 'Enterprise Tech', connections: 412, posts: 9, isFollowing: false }
      ];

      switch (tab) {
        case 'suggestions':
          setUsers(allUsers.filter(user => !user.isFollowing));
          break;
        case 'following':
          setFollowing(allUsers.filter(user => user.isFollowing));
          break;
        case 'followers':
          setFollowers([
            { id: 9, name: 'Sarah Johnson', role: 'Junior Developer', company: 'StartupXYZ', connections: 89, posts: 4 },
            { id: 10, name: 'Mike Brown', role: 'QA Engineer', company: 'TestCorp', connections: 156, posts: 7 },
            { id: 11, name: 'Lisa Wang', role: 'Business Analyst', company: 'DataCorp', connections: 203, posts: 11 }
          ]);
          break;
      }
      
      setStats({ following: 3, followers: 3 });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = (id) => {
    setUsers(prev => prev.map(user => 
      user.id === id ? { ...user, isFollowing: !user.isFollowing } : user
    ));
    setFollowing(prev => {
      const user = users.find(u => u.id === id);
      if (user && !user.isFollowing) {
        return [...prev, { ...user, isFollowing: true }];
      }
      return prev.filter(u => u.id !== id);
    });
    setStats(prev => ({
      ...prev,
      following: prev.following + (users.find(u => u.id === id)?.isFollowing ? -1 : 1)
    }));
  };

  const handleUnfollow = (id) => {
    setFollowing(prev => prev.filter(user => user.id !== id));
    setUsers(prev => prev.map(user => 
      user.id === id ? { ...user, isFollowing: false } : user
    ));
    setStats(prev => ({ ...prev, following: prev.following - 1 }));
  };

  const filteredData = () => {
    const data = activeTab === 'suggestions' ? users : 
                 activeTab === 'following' ? following : followers;
    
    if (!searchQuery) return data;
    
    return data.filter(user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.company.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const renderUserCard = (user, showUnfollow = false) => (
    <div key={user.id} className="network-card user-card">
      <div className="card-avatar">
        <div className="avatar-placeholder">{user.name.charAt(0)}</div>
      </div>
      <div className="card-content">
        <h3>{user.name}</h3>
        <p className="role">{user.role}</p>
        <p className="company">{user.company}</p>
        <div className="user-stats">
          <span className="stat">
            <strong>{user.connections}</strong> connections
          </span>
          <span className="stat">
            <strong>{user.posts}</strong> posts
          </span>
        </div>
      </div>
      <div className="card-actions">
        {showUnfollow ? (
          <button 
            className="action-btn unfollow"
            onClick={() => handleUnfollow(user.id)}
          >
            <MdPersonRemove /> Unfollow
          </button>
        ) : (
          <button 
            className={`action-btn ${user.isFollowing ? 'following' : 'follow'}`}
            onClick={() => handleFollow(user.id)}
          >
            {user.isFollowing ? (
              <><MdPersonRemove /> Following</>
            ) : (
              <><MdPersonAdd /> Follow</>
            )}
          </button>
        )}
      </div>
    </div>
  );

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