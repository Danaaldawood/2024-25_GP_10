import React, { useState, useEffect } from 'react';
import './UserProfilePage.css';
import Notification from '../Modorater/Notification';
import DeleteConfirmation from '../Modorater/DeleteConfirmation';
import defaultProfilePic from '../Modorater/userpro.jpg';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../Register/firebase'; 
import { doc, getDoc } from 'firebase/firestore';

const UserProfilePage = () => {
  const [profileName, setProfileName] = useState('');
  const [email, setEmail] = useState('');
  const [region, setRegion] = useState('');
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        
        if (user) {
          console.log('User ID:', user.uid);  // Check if the user is authenticated
          
          const userDoc = await getDoc(doc(db, 'Moderators', user.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('User Data:', userData);  // Debugging log to check the fetched data
            
            setProfileName(userData.fullName || '');
            setEmail(userData.email || '');
            setRegion(userData.region || '');
          } else {
            console.log('No such document!');
          }
        } else {
          console.log('No authenticated user.');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

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
          <img src={defaultProfilePic} alt="Profile" className="profile-pic" /> {/* Corrected profile picture path */}
          <h3>{profileName}</h3>
          <p>{region}</p> {/* Display region */}
        </div>
        <div className="profile-form-container">
          <h2>User Information</h2>

          <div className="form-row">
            <label>Full Name</label>
            <input
              type="text"
              className="formProf-input"
              value={profileName}
              readOnly
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
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>© 2024 CultureLens. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default UserProfilePage;
