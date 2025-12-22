import { useState, useEffect } from 'react';
import { MdGroup } from 'react-icons/md';
import { networkService } from '../../services/networkService.js';
import './ConnectionsCount.css';

export default function ConnectionsCount({ showLabel = true, size = 'medium', detailed = false }) {
  const [stats, setStats] = useState({ following: 0, followers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await networkService.getNetworkStats();
      setStats({
        following: response.following_count,
        followers: response.followers_count
      });
    } catch (error) {
      console.error('Error loading connection stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="connections-loading">
        <div className="stat-item">
          <span className="stat-number">...</span>
          <span className="stat-label">Followers</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">...</span>
          <span className="stat-label">Following</span>
        </div>
      </div>
    );
  }

  if (detailed) {
    return (
      <div className="profile-stats">
        <div className="stat-item">
          <span className="stat-number">{stats.followers}</span>
          <span className="stat-label">Followers</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.following}</span>
          <span className="stat-label">Following</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`connections-count ${size}`}>
      <MdGroup className="connections-icon" />
      <span className="connections-number">{stats.followers + stats.following}</span>
      {showLabel && <span className="connections-label">Connections</span>}
    </div>
  );
}