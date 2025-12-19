import { useState, useEffect } from 'react';
import { MdGroup } from 'react-icons/md';
import { networkService } from '../../services/networkService.js';
import './ConnectionsCount.css';

export default function ConnectionsCount({ showLabel = true, size = 'medium', detailed = false }) {
  const [stats, setStats] = useState({ total: 0, following: 0, followers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await networkService.getNetworkStats();
      setStats({
        total: response.total_connections,
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
      <div className={`connections-count ${size}`}>
        <MdGroup className="connections-icon" />
        <span className="connections-number">...</span>
        {showLabel && <span className="connections-label">Connections</span>}
      </div>
    );
  }

  if (detailed) {
    return (
      <div className="connections-detailed">
        <div className="stat">
          <span className="count">{stats.followers}</span>
          <span className="label">Followers</span>
        </div>
        <div className="stat">
          <span className="count">{stats.following}</span>
          <span className="label">Following</span>
        </div>
        <div className="stat total">
          <span className="count">{stats.total}</span>
          <span className="label">Total Connections</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`connections-count ${size}`}>
      <MdGroup className="connections-icon" />
      <span className="connections-number">{stats.total}</span>
      {showLabel && <span className="connections-label">Connections</span>}
    </div>
  );
}