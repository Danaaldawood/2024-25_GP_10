import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'; 

const Notification = ({ type, message, onClose }) => {
  // Styles based on notification type (success, warning, error)
  const notificationStyles = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: type === 'warning' || type === 'error' ? '#f8d7da' : '#fff', 
    color: type === 'warning' || type === 'error' ? '#721c24' : '#28a745', 
    border: type === 'warning' || type === 'error' ? '2px solid #f5c6cb' : '2px solid #c3e6cb',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    zIndex: 9999,
    textAlign: 'center',
    width: '300px',
    fontSize: '16px',
  };

  const iconStyles = {
    fontSize: '48px', 
    color: '#28a745', 
    marginBottom: '15px',
  };

  const buttonStyles = {
    backgroundColor: type === 'warning' || type === 'error' ? '#dc3545' : '#28a745',
    border: 'none',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    marginTop: '15px',
  };

  const overlayStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 9998,
  };

  return (
    <>
      {/* Overlay to prevent interaction with the rest of the page */}
      <div style={overlayStyles} onClick={onClose}></div>
      <div style={notificationStyles}>
        {/* Show checkmark icon if success */}
        {type === 'success' && <FontAwesomeIcon icon={faCheckCircle} style={iconStyles} />}    
        <p>{message}</p>
      </div>
    </>
  );
};

export default Notification;
