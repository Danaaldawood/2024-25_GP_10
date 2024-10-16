import React from 'react';

const Notification = ({ type, message, onClose }) => {
  // Styles based on notification type (success, warning)
  const notificationStyles = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: type === 'warning' ? '#f8d7da' : '#d4edda',  
    color: type === 'warning' ? '#721c24' : '#155724',  
    border: type === 'warning' ? '2px solid #f5c6cb' : '2px solid #c3e6cb',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    zIndex: 9999, 
    textAlign: 'center',
    width: '300px',
    fontSize: '16px',
  };
  const buttonStyles = {
    backgroundColor: type === 'warning' ? '#dc3545' : '#28a745', // Red for warnings, green for success
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
        <strong>{type === 'warning' ? 'Warning!' : 'Success!'}</strong>
        <p>{message}</p>
        <button style={buttonStyles} onClick={onClose}>
          Close
        </button>
      </div>
    </>
  );
};

export default Notification;