import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileCard from './ProfileCard';

const Home = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem('internTrackUser');
    sessionStorage.removeItem('internTrackLoggedIn');
    navigate('/');
  };

  return (
    <ProfileCard
      onAddInternship={() =>
        navigate('/internship-form', {
          state: { addNew: true }
        })
      }
      onViewInternship={() =>
        navigate('/internship-list')
      }
      onLogout={handleLogout}
    />
  );
};

export default Home;