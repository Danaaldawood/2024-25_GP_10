import React from 'react';

const DeleteConfirmation = ({ onConfirm, onCancel }) => {
  // Modal container styles
  const modalStyles = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#fff',  
    padding: '0',  
    borderRadius: '10px',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
    width: '300px',
    maxWidth: '90%',
    textAlign: 'center',
    overflow: 'hidden',
  };

  // Top half red
  const modalHeaderStyles = {
    backgroundColor: '#f8d7da',  
    color: '#721c24', 
    padding: '20px',
    borderBottom: '1px solid #f5c6cb',
  };

  const modalBodyStyles = {
    padding: '20px',
  };

  const buttonContainerStyles = {
    display: 'flex',
    justifyContent: 'space-around',
    marginTop: '20px',
  };

  const confirmButtonStyles = {
    backgroundColor: '#dc3545',  
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    padding: '10px 20px',
    cursor: 'pointer',
    fontSize: '14px',
  };

  const cancelButtonStyles = {
    backgroundColor: '#ffffff', 
    color: '#721c24',
    border: '1px solid #f5c6cb',  
    borderRadius: '5px',
    padding: '10px 20px',
    cursor: 'pointer',
    fontSize: '14px',
  };

  return (
    <div style={modalStyles}>
      {/* Red Header */}
      <div style={modalHeaderStyles}>
        <h3>Warning!</h3>
      </div>

      {/* Body */}
      <div style={modalBodyStyles}>
        <p>Are you sure you want to delete your account? This action cannot be undone.</p>
        
        <div style={buttonContainerStyles}>
          <button style={confirmButtonStyles} onClick={onConfirm}>Confirm</button>
          <button style={cancelButtonStyles} onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;