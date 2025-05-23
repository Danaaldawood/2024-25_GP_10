// --- Imports ---
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { auth, db } from '../Register/firebase'; 
import { doc, deleteDoc } from 'firebase/firestore';
import { deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { useTranslation } from "react-i18next";

// --- DeleteConfirmation Component ---
const DeleteConfirmation = ({ onCancel }) => {
  // --- State Management ---
  const [password, setPassword] = useState(''); 
  const [errorMessage, setErrorMessage] = useState(''); 
  const [notification, setNotification] = useState(null); 
  const navigate = useNavigate(); 
    const { t ,i18n} = useTranslation("userProfile");   

  // --- Style Definitions ---
  const modalStyles = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#fff', 
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',  
    zIndex: 1000,
    width: '400px',
    textAlign: 'center',
    overflow: 'hidden',
  };

  const modalHeaderStyles = {
    fontWeight: 'bold',
    color: '#dc172b',  
    marginBottom: '10px',
    fontSize: '30px',
  };

  const modalBodyStyles = {
    color: '#000',  
    fontSize: '17px',
    fontFamily: "'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif",
    marginBottom: '20px',
  };

  const buttonContainerStyles = {
    display: 'flex',
    justifyContent: 'space-around',
    marginTop: '20px',
  };

  const confirmButtonStyles = {
    backgroundColor: '#dc172b', 
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '15px',
  };

  const cancelButtonStyles = {
    backgroundColor: '#ffffff',
    color: '#000',
    border: '1px solid #000',
    borderRadius: '5px',
    padding: '10px 20px',
    cursor: 'pointer',
    fontSize: '15px',
  };

  const inputStyles = {
    width: '100%',
    padding: '10px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    marginBottom: '10px',
  };

  const errorStyles = {
    color: 'red',
    fontSize: '14px',
    marginBottom: '10px',
  };

  const notificationStyles = {
    color: 'green',
    fontSize: '14px',
    marginBottom: '10px',
  };

  // --- Helper Functions ---
  const getCustomErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/wrong-password':
        return (t('userProfile.The password you entered is incorrect. Please try again.'));
        case 'auth/invalid-credential':
          return (t( 'userProfile.The password you entered is incorrect. Please try again.'));
      default:
        return (t('userProfile.An error occurred. Please try again later.'));
    }
  };

  // --- Event Handlers ---
  const handleConfirmDelete = async () => {
    setErrorMessage(''); 
    try {
      const user = auth.currentUser;
      if (!user) {
        setErrorMessage(t('userProfile.No user is logged in.'));
        return;
      }

      // Re-authenticate the user with email and password
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);

      // Delete the user's document from Firestore
      const userDocRef = doc(db, 'Users', user.uid);
      await deleteDoc(userDocRef);

      // Delete the user from Firebase Auth
      await deleteUser(user);

      setNotification (t('userProfile.Account deleted successfully.'));

      // Redirect to the sign-in page after 2 seconds
      setTimeout(() => {
        navigate('/sign'); 
      }, 2000);

    } catch (error) {
      const customMessage = getCustomErrorMessage(error.code);
      setErrorMessage(customMessage);
    }
  };

  return (
    <div style={modalStyles}>
      {/* Warning Header */}
      <div style={modalHeaderStyles}>
        <h3>{t("userProfile.Warning")}</h3>
      </div>

      {/* Modal Content */}
      <div style={modalBodyStyles}>
        <p>{t("userProfile.Please enter your password to confirm account deletion:")}</p>
        <input
          type="password"
          placeholder={t("userProfile.Enter your password")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyles}
        />
        {errorMessage && <div style={errorStyles}>{errorMessage}</div>}
        {notification && <div style={notificationStyles}>{notification}</div>}
        <div style={buttonContainerStyles}>
          <button style={cancelButtonStyles} onClick={onCancel}>{t("userProfile.Cancel")}</button>
          <button style={confirmButtonStyles} onClick={handleConfirmDelete}>{t("userProfile.Confirm")}</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;