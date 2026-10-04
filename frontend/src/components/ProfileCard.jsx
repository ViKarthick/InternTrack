import React from 'react';
import '../styles/ProfileCard.css';
import profilePhoto from '../assets/photo.jpg';

const ProfileCard = ({
  onEditInternship,
  onViewInternship,
  onAddInternship,
  onLogout
}) => {
  const storedUser = sessionStorage.getItem('internTrackUser');
  const user = storedUser ? JSON.parse(storedUser) : {};

  const name = user.Name || '';

  const registerNumber =
    user['Register Number'] ||
    user.RegisterNumber ||
    user.registerNumber ||
    '';

  return (
    <div className="profile-card">

      <div className="profile-header">
        <img
          src={profilePhoto}
          alt="Profile"
          className="profile-img"
        />

        <div className="profile-info">
          <h1 className="profile-name">{name}</h1>

          <p className="profile-registration">
            Registration Number: {registerNumber}
          </p>
        </div>
      </div>

      <div className="profile-skills">
        <h2>Skills</h2>

        <ul className="skills-list">
          <li>
            <span className="skill-category">
              Programming:
            </span>
            <span>Python, JavaScript</span>
          </li>

          <li>
            <span className="skill-category">
              Graphic Design:
            </span>
            <span>Canva, Photoshop</span>
          </li>

          <li>
            <span className="skill-category">
              Soft Skills:
            </span>
            <span>Communication, Teamwork</span>
          </li>
        </ul>
      </div>

      <div className="profile-actions">
      <button className="action-btn add-btn" onClick={onAddInternship}>
        Add Internship
      </button>

      <button className="action-btn view-btn" onClick={onViewInternship}>
        View Internship Details
      </button>

      <button className="action-btn logout-btn" onClick={onLogout}>
        Log Out
      </button>
    </div>

    </div>
  );
};

export default ProfileCard;