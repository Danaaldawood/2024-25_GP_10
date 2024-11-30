import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

const Notification = ({ type, message, onClose }) => {
  useEffect(() => {
    if (type === 'success') {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Auto-close success messages after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [type, onClose]);

  // Embedded styles
  const styles = {
    container: {
      backgroundColor:' #fff',
      padding: '20px',
      borderRadius: '10px',
      width: '300px',
      textAlign: 'center',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 1000,
    },
    success: {
      color: '#28a745',
    },
    error: {
      color: '#dc172b',
    },
    warningTitle: {
      fontWeight: 'bold',
      fontSize: '26px', 
      color: '#dc172b',
      marginBottom: '10px',
    },
    errorMessage: {
      fontSize: '17px',
      fontFamily: "'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif",
      marginBottom: '20px',
      color: '#dc172b',
    },
    confirmBtn: {
      backgroundColor: '#dc172b',
      color: '#fff',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '5px',
      cursor: 'pointer',
      marginTop: '10px',
    },
    confirmBtnHover: {
      backgroundColor: '#ff5c5c',
    },
    successIcon: {
      fontSize: '48px',
      color: '#28a745',
      marginBottom: '15px',
    },
  };

  return (
    <div
      style={{
        ...styles.container,
        ...(type === 'error' && styles.error),
      }}
    >
      {type === 'success' && (
        <div style={styles.successIcon}>
          <FontAwesomeIcon icon={faCheckCircle} />
        </div>
      )}
      {type === 'error' && <p style={styles.warningTitle}>Warning!</p>}
      <p style={type === 'error' ? styles.errorMessage : styles.success}>{message}</p>
      {type === 'error' && (
        <button
          style={styles.confirmBtn}
          onMouseOver={(e) => (e.target.style.backgroundColor = styles.confirmBtnHover.backgroundColor)}
          onMouseOut={(e) => (e.target.style.backgroundColor = styles.confirmBtn.backgroundColor)}
          onClick={onClose}
        >
          Try again
        </button>
      )}
    </div>
  );
};

export default Notification;
