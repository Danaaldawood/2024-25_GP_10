import React, { useEffect } from 'react';

const Notification = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  // Styles based on notification type (success, warning)
  const notificationStyles = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: type === 'warning' ? '#f8d7da' : '#d4edda',  // Red for warning, green for success
    color: type === 'warning' ? '#721c24' : '#155724',  // Text colors based on type
    border: type === 'warning' ? '2px solid #f5c6cb' : '2px solid #c3e6cb',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
    textAlign: 'center',
    width: '300px',
    fontSize: '16px',
  };

  const buttonStyles = {
    backgroundColor: type === 'warning' ? '#f5c6cb' : '#28a745',
    border: 'none',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    marginTop: '15px',
  };

  return (
    <div style={notificationStyles}>
      <strong>{type === 'warning' ? 'Warning!' : 'Success!'}</strong>
      <p>{message}</p>
      {/* Conditionally render the close button only for warning notifications */}
      {type === 'warning' && (
        <button style={buttonStyles} onClick={onClose}>
          Close
        </button>
      )}
    </div>
  );
};

export default Notification;