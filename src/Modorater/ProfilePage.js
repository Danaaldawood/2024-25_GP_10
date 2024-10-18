import React, { useState, useEffect } from 'react';
import './ProfilePage.css';
import Notification from './Notification';
import DeleteConfirmation from './DeleteConfirmation';
import defaultProfilePic from './userpro.jpg';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../Register/firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';

const ProfilePage = () => {
  const [profileName, setProfileName] = useState(localStorage.getItem('profileName') || '');
  const [email, setEmail] = useState(localStorage.getItem('email') || '');
  const [notification, setNotification] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // Fetch moderator data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, 'Moderators', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setProfileName(userData.fullName || '');
            setEmail(userData.email || '');
            localStorage.setItem('profileName', userData.fullName || '');
            localStorage.setItem('email', userData.email || '');
          } else {
            console.log('No such document!');
          }
        } else {
          console.error('No authenticated user.');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  // Function to handle saving profile data
  const handleSaveProfile = async () => {
    if (!profileName.trim()) {
      // Check if full name is null or empty
      setNotification({ type: 'warning', message: 'Full name cannot be empty. Please enter a valid name.' });
      return;
    }

    try {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'Moderators', user.uid);

        await updateDoc(userDocRef, {
          fullName: profileName,
          email: email,
        });

        localStorage.setItem('profileName', profileName);
        localStorage.setItem('email', email);

        setNotification({ type: 'success', message: 'Profile saved successfully!' });
      } else {
        setNotification({ type: 'error', message: 'No user logged in.' });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setNotification({ type: 'error', message: 'Failed to save profile.' });
    }
  };

  // Function to handle deleting account
  const handleDeleteAccount = () => {
    setShowModal(true); 
  };

  // Function to confirm account deletion
  const handleConfirmDelete = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setNotification({ type: 'error', message: 'No user is logged in.' });
        return;
      }

      // Delete moderator authentication from Firebase Auth
      await deleteUser(user);

      // Delete moderator document from Firestore
      const userDocRef = doc(db, 'Moderators', user.uid);
      await deleteDoc(userDocRef);

      localStorage.removeItem('profileName');
      localStorage.removeItem('email');

      setNotification({ type: 'success', message: 'Account deleted successfully.' });

      navigate('/sign'); 
    } catch (error) {
      console.error('Error deleting account:', error.message);
      setNotification({ type: 'error', message: `Failed to delete account: ${error.message}` });
    }
    setShowModal(false); 
  };

  const closeNotification = () => {
    setNotification(null); 
  };

  return (
    <div className="profile-page-container">

      <header className="profile-header">
        <button className="back-btn" onClick={() => navigate('/moderator')}>
          <FaArrowLeft className="back-icon" />
        </button>
        <h1>Moderator Profile </h1>
      </header>

      <div className="profile-content">
        <div className="profile-details">
          <img src={defaultProfilePic} alt="Profile" className="profile-pic" />
          <h3>{profileName}</h3>
        </div>
        <div className="profile-form-container">
          <h2 className='headname'>Moderator Information</h2>
          <div className="profile-form">
         
            <div className="form-row">
            <label>Full Name</label>
              <input
                type="text"
                className="formProf-input"
                placeholder="Name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
              />
            </div>

            <div className="form-row">
            <label>Email</label>
              <input
                type="email"
                className="formProf-input"
                placeholder="Email"
                value={email}
                readOnly 
              />
            </div>

            {/* Save and Delete buttons */}
            <button className="save-button" onClick={handleSaveProfile}>
              Save Profile
            </button>

            <button className="delete-button" onClick={handleDeleteAccount}>
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Show delete confirmation modal */}
      {showModal && <DeleteConfirmation onConfirm={handleConfirmDelete} onCancel={() => setShowModal(false)} />}

      {/* Show notifications */}
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
