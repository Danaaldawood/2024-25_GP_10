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
import { Footer } from '../Footer/Footer';
import { Helmet } from 'react-helmet';

const ProfilePage = () => {
  const [profileName, setProfileName] = useState(localStorage.getItem('profileName') || '');
  const [email, setEmail] = useState(localStorage.getItem('email') || '');
  const [notification, setNotification] = useState(null);
  const [showModal, setShowModal] = useState(false); // State to handle the modal visibility
  const navigate = useNavigate();

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

  const handleSaveProfile = async () => {
    if (!profileName.trim()) {
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
        setTimeout(() => {
          setNotification(null); 
        }, 3000);
      } else {
        setNotification({ type: 'error', message: 'No user logged in.' });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setNotification({ type: 'error', message: 'Failed to save profile.' });
    }
  };

  const handleDeleteAccount = () => {
    setShowModal(true); // Show the modal on clicking delete
  };

  const handleConfirmDelete = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setNotification({ type: 'error', message: 'No user is logged in.' });
        return;
      }

      await deleteUser(user);
      const userDocRef = doc(db, 'Moderators', user.uid);
      await deleteDoc(userDocRef);

      localStorage.removeItem('profileName');
      localStorage.removeItem('email');

      setNotification({ type: 'success', message: 'Account deleted successfully.' });

      navigate('/sign'); // Navigate to sign-up or login page after deletion
    } catch (error) {
      console.error('Error deleting account:', error.message);
      setNotification({ type: 'error', message: `Failed to delete account: ${error.message}` });
    }
    setShowModal(false); // Hide the modal after the action
  };

  const closeNotification = () => {
    setNotification(null); // Close the notification
  };

  return (
    <div className="profile-page-container">
      <Helmet>
        <title>Profile Page</title>
        <meta name="description" content="This is Profile page" />
      </Helmet>
      <header className="profile-header">
        <button className="back-btn" onClick={() => navigate('/moderator')}>
          <FaArrowLeft className="back-icon" />
        </button>
        <h1>Moderator Profile</h1>
      </header>

      <div className="profile-content">
        <div className="profile-details">
          <img src={defaultProfilePic} alt="Profile" className="profile-pic" />
          <h3>{profileName}</h3>
        </div>
        <div className="profile-form-container">
          <h2 className="headname">Moderator Information</h2>
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

            <button className="save-button" onClick={handleSaveProfile}>
              Save Profile
            </button>

            <button className="delete-button" onClick={handleDeleteAccount}>
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Modal Confirmation for Account Deletion */}
      {showModal && <DeleteConfirmation onConfirm={handleConfirmDelete} onCancel={() => setShowModal(false)} />}

      {/* Notification system */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={closeNotification}
        />
      )}

      <Footer />
    </div>
  );
};

export default ProfilePage;
