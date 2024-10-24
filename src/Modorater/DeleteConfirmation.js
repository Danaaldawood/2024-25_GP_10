import React from 'react';

const DeleteConfirmation = ({ onConfirm, onCancel }) => {
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
    width: '300px',
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
    color: '#721c24',
    border: '1px solid #f5c6cb',  
    borderRadius: '5px',
    padding: '10px 20px',
    cursor: 'pointer',
    fontSize: '15px',
  };

  return (
    <div style={modalStyles}>
      <div style={modalHeaderStyles}>
        <h3>Warning!</h3>
      </div>

      <div style={modalBodyStyles}>
        <p>Are you sure you want to delete your account? </p>
        <div style={buttonContainerStyles}>
          <button style={confirmButtonStyles} onClick={onConfirm}>Confirm</button>
          <button style={cancelButtonStyles} onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;