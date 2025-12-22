import React from 'react';
import { useParams } from 'react-router-dom';
import Profile from './Profile';

const PublicProfile = () => {
  const { userId } = useParams();
  
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Profile userId={userId} isPublicView={true} />
    </div>
  );
};

export default PublicProfile;