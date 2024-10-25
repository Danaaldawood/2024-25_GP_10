import React, { useState, useEffect } from 'react';
import './UserProfilePage.css';
import Notification from '../Modorater/Notification';
import DeleteConfirmation from '../Modorater/DeleteConfirmation';
import defaultProfilePic from '../Modorater/userpro.jpg';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../Register/firebase'; 
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { deleteUser, onAuthStateChanged, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { Footer } from '../Footer/Footer';
import { Helmet } from 'react-helmet';

const UserProfilePage = () => {
  const [profileName, setProfileName] = useState(localStorage.getItem('profileName') || '');
  const [email, setEmail] = useState(localStorage.getItem('email') || '');
  const [region, setRegion] = useState(localStorage.getItem('region') || '');
  const [notification, setNotification] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // Fetch user data from Firestore when authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const fetchUserData = async () => {
          try {
            const userDoc = await getDoc(doc(db, 'Users', user.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setProfileName(userData.fullName || '');
              setEmail(userData.email || '');
              setRegion(userData.region || '');
              localStorage.setItem('profileName', userData.fullName || '');
              localStorage.setItem('email', userData.email || '');
              localStorage.setItem('region', userData.region || '');
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        };
        fetchUserData();
      }
    });
    return () => unsubscribe();
  }, []);

  // Handle Save Profile
  const handleSaveProfile = async () => {
    if (!profileName.trim()) {
      setNotification({ type: 'error', message: 'Full name cannot be empty. Please enter a valid name.' });
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

      } else {
        setNotification({ type: 'error', message: 'No user logged in.' });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setNotification({ type: 'error', message: 'Failed to save profile.' });
    }
  };

  const handleDeleteAccount = () => {
    setShowModal(true);
  };

  const handleConfirmDelete = async (password) => {
    setErrorMessage('');
    try {
      const user = auth.currentUser;
      if (!user) {
        setNotification({ type: 'error', message: 'No user is logged in.' });
        return;
      }

      const credential = EmailAuthProvider.credential(user.email, password);

      // Re-authenticate the user
      await reauthenticateWithCredential(user, credential);

      const userDocRef = doc(db, 'Users', user.uid);
      await deleteDoc(userDocRef);
      await deleteUser(user);

      localStorage.removeItem('profileName');
      localStorage.removeItem('email');
      localStorage.removeItem('region');

      setNotification({ type: 'success', message: 'Account deleted successfully.' });
      navigate('/sign');
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        setErrorMessage('Incorrect password. Please try again.');
      } else {
        setErrorMessage(`Error: ${error.message}`);
      }
    }
  };

  const closeNotification = () => {
    setNotification(null);
  };

  return (
    <div className="profile-page-container">
      <Helmet>
        <title>Profile Page</title>
        <meta name="description" content="This is Profile page" />
      </Helmet>

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

      {showModal && (
        <DeleteConfirmation
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowModal(false)}
          errorMessage={errorMessage}
        />
      )}

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

export default UserProfilePage;
