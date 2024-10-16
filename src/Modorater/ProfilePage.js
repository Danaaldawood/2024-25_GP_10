import React, { useState, useEffect } from 'react';
import './ProfilePage.css';
import Notification from './Notification';
import DeleteConfirmation from './DeleteConfirmation';
import defaultProfilePic from './userpro.jpg';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../Register/firebase';
import { doc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';

const ProfilePage = () => {
  const [profileName, setProfileName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
          } else {
            console.log('No such document!');
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  // Function to check if email is valid
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Function to check if email exists in Firestore
  const isEmailInUse = async (email) => {
    const q = query(collection(db, 'Moderators'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  // Function to handle saving profile data
  const handleSaveProfile = async () => {
    try {
      if (!isValidEmail(email)) {
        setNotification({ type: 'warning', message: 'Invalid email format. Please try again.' });
        return;
      }

      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'Moderators', user.uid);
        const userDoc = await getDoc(userDocRef);

        // Only check if email is in use if it has changed
        if (userDoc.exists() && email !== userDoc.data().email) {
          const emailExists = await isEmailInUse(email);
          if (emailExists) {
            setNotification({ type: 'warning', message: 'Email already in use. Please choose another one.' });
            return;
          }
        }

        // Update Firestore document with new data
        await updateDoc(userDocRef, {
          fullName: profileName,
          email: email,
        });

        setNotification({ type: 'success', message: 'Profile Saved Successfully!' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setNotification({ type: 'error', message: 'Failed to save profile.' });
    }
  };

  // Function to handle deleting account
  const handleDeleteAccount = () => {
    setShowModal(true); // Show confirmation modal
  };

  // Function to confirm account deletion
  const handleConfirmDelete = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'Moderators', user.uid);

        await deleteDoc(userDocRef); // Delete user document from Firestore
        await deleteUser(user); // Delete user authentication

        setNotification({ type: 'success', message: 'Account deleted successfully.' });

        navigate('/sign'); // Redirect to sign-in page
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      setNotification({ type: 'error', message: 'Failed to delete account.' });
    }
    setShowModal(false); // Hide confirmation modal
  };

  const closeNotification = () => {
    setNotification(null); // Close notification
  };

  return (
    <div className="profile-page-container">

      <header className="profile-header">
        <button className="back-btn" onClick={() => navigate('/moderator')}>
          <FaArrowLeft className="back-icon" />
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
              <input
                type="password"
                className="formProf-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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