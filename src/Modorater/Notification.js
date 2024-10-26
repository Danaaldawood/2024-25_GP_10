import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'; 

const Notification = ({ type, message, onClose }) => {
  // Automatically close the notification after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(); 
    }, 2000); 

   
    return () => clearTimeout(timer);
  }, [onClose]);

  const notificationStyles = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#ffffff', // Set background to white
    color: type === 'warning' || type === 'error' ? '#721c24' : '#155724', // Color based on type
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
    color: type === 'success' ? '#28a745' : (type === 'warning' ? '#856404' : '#721c24'), 
    marginBottom: '15px',
  };
  

  return (
    <div style={notificationStyles}>
      {/* Show checkmark icon if success */}
      {type === 'success' && <FontAwesomeIcon icon={faCheckCircle} style={iconStyles} />}    
      <p>{message}</p>
    </div>
  );
};

export default Notification;
