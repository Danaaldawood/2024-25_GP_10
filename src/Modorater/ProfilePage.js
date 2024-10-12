import React, { useState } from 'react';
import './ProfilePage.css';  
import Notification from './Notification';  
import DeleteConfirmation from './DeleteConfirmation';
import defaultProfilePic from './userpro.jpg';  
import { useNavigate } from 'react-router-dom'; 
import { FaArrowLeft } from 'react-icons/fa';  // Import the back arrow icon

const ProfilePage = () => {
  const [profileName, setProfileName] = useState('John Doe');
  const [email, setEmail] = useState('john_doe12@bbb.com'); 
  const [region, setRegion] = useState('United States'); 
  const [password, setPassword] = useState(''); 
  const [notification, setNotification] = useState(null);  
  const [showModal, setShowModal] = useState(false);  
  const navigate = useNavigate();

  const handleSaveProfile = () => {
    setNotification({ type: 'success', message: 'Profile Saved Successfully!' });
  };

  const handleDeleteAccount = () => {
    setShowModal(true);
  };

  const handleConfirmDelete = () => {
    setShowModal(false);
    setNotification({ type: 'warning', message: 'Account deleted successfully.' });
  };

  const closeNotification = () => {
    setNotification(null);
  };

  return (
    <div className="profile-page-container">
      {/* Header with Back Arrow  */}
      <header className="profile-header">
        <button className="back-btn" onClick={() => navigate('/moderator')}>
          <FaArrowLeft className="back-icon" /> Back
        </button>
        <h1>Profile Management</h1>
      </header>

      <div className="profile-content">
        <div className="profile-details">
          <img src={defaultProfilePic} alt="Profile" className="profile-pic" />
          <h3>{profileName}</h3> 
        </div>

        <div className="profile-form-container">
          <h2 className='headname'>Profile</h2>
          <div className="profile-form">
            <div className="form-row">
              <input
                type="text"
                className="formProf-input"
                placeholder="Name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
              />
            </div>

            <div className="form-row">
              <input
                type="email"
                className="formProf-input"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-row">
              <select
                className="formProf-input"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                <option value="">Select Your Region</option>
                <option value="NA">North America</option>
                <option value="EU">Europe</option>
                <option value="ASIA">Asia</option>
                <option value="AF">Africa</option>
                <option value="SA">South America</option>
                <option value="AU">Australia</option>
              </select>
            </div>

            <div className="form-row">
              <input
                type="password"
                className="formProf-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button className="save-button" onClick={handleSaveProfile}>
              Save Profile
            </button>

            <button className="delete-button" onClick={handleDeleteAccount}>
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {showModal && <DeleteConfirmation onConfirm={handleConfirmDelete} onCancel={() => setShowModal(false)} />}

      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={closeNotification}
        />
      )}
         {/* Footer */}
         <footer className="footer">
        <p>© 2024 CultureLens. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default ProfilePage;


