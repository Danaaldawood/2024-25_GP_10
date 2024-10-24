import React, { useState, useEffect } from 'react';
import './UserProfilePage.css';
import Notification from '../Modorater/Notification';
import DeleteConfirmation from '../Modorater/DeleteConfirmation';
import defaultProfilePic from '../Modorater/userpro.jpg';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../Register/firebase'; 
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { deleteUser, onAuthStateChanged } from 'firebase/auth';

const UserProfilePage = () => {
  const [profileName, setProfileName] = useState(localStorage.getItem('profileName') || '');
  const [email, setEmail] = useState(localStorage.getItem('email') || '');
  const [region, setRegion] = useState(localStorage.getItem('region') || '');
  const [notification, setNotification] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // Fetch user data from Firestore when authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Fetch user data from Firestore
        const fetchUserData = async () => {
          try {
            const userDoc = await getDoc(doc(db, 'Users', user.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setProfileName(userData.fullName || '');
              setEmail(userData.email || '');
              setRegion(userData.region || '');

              // Store in local storage for persistence
              localStorage.setItem('profileName', userData.fullName || '');
              localStorage.setItem('email', userData.email || '');
              localStorage.setItem('region', userData.region || '');
            } else {
              console.log('No such document!');
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        };

        fetchUserData();
      } else {
        console.log('No authenticated user.');
      }
    });

    return () => unsubscribe(); // Cleanup subscription on component unmount
  }, []);

  // Function to handle saving profile data
  const handleSaveProfile = async () => {
    if (!profileName.trim()) {
      setNotification({ type: 'warning', message: 'Full name cannot be empty. Please enter a valid name.' });
      return;
    }

    try {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'Users', user.uid);
        await updateDoc(userDocRef, {
          fullName: profileName,
          email: email,
          region: region,
        });

        localStorage.setItem('profileName', profileName);
        localStorage.setItem('email', email);
        localStorage.setItem('region', region);

        setNotification({ type: 'success', message: 'Profile saved successfully!' });

        setTimeout(() => {
          setNotification(null); 
        }, 1000); 
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

      // Delete user document from Firestore first
      const userDocRef = doc(db, 'Users', user.uid);
      await deleteDoc(userDocRef);

      // Delete user authentication from Firebase Auth
      await deleteUser(user);

      // Clear local storage
      localStorage.removeItem('profileName');
      localStorage.removeItem('email');
      localStorage.removeItem('region');

      // Trigger success notification with checkmark icon
      setNotification({ type: 'success', message: 'Account deleted successfully.' });

      // Redirect to sign-in page immediately after successful deletion
      navigate('/sign'); 
    } catch (error) {
      console.error('Error deleting account:', error.message);
      setNotification({ type: 'error', message: `Failed to delete account: ${error.message}` });
    } finally {
      setShowModal(false); 
    }
  };

  const closeNotification = () => {
    setNotification(null); 
  };

  return (
    <div className="profile-page-container">
      <header className="profile-header">
        <button className="back-btn" onClick={() => navigate('/HomePage')}>
          <FaArrowLeft className="back-icon" />
        </button>
        <h1>User Profile</h1>
      </header>

      <div className="profile-content">
        <div className="profile-details">
          <img src={defaultProfilePic} alt="Profile" className="profile-pic" /> 
          <h3>{profileName}</h3>
          <p>{region}</p>
        </div>
        <div className="profile-form-container">
          <h2>User Information</h2>

          <div className="form-row">
            <label>Full Name</label>
            <input
              type="text"
              className="formProf-input"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
            />
          </div>

          <div className="form-row">
            <label>Email</label>
            <input
              type="email"
              className="formProf-input"
              value={email}
              readOnly
            />
          </div>

          <div className="form-row">
            <label>Region</label>
            <input
              type="text"
              className="formProf-input"
              value={region}
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

      {showModal && <DeleteConfirmation onConfirm={handleConfirmDelete} onCancel={() => setShowModal(false)} />}

      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={closeNotification}
        />
      )}

      <footer className="footer">
        <p>© 2024 CultureLens. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default UserProfilePage;
