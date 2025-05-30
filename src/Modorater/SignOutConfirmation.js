// --- Imports ---
import React from "react";
import { useTranslation } from 'react-i18next';

// Displays a modal to confirm user sign out
const SignOutConfirmation = ({ onConfirm, onCancel }) => {
    const { t, i18n } = useTranslation('headerpage');
  
  // --- Style Definitions ---
  // Modal container styles
  const modalStyles = {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
    zIndex: 1000,
    width: "300px",
    textAlign: "center",
  };

  // Warning header styles
  const modalHeaderStyles = {
    fontWeight: "bold",
    color: "#dc172b",
    marginBottom: "10px",
    fontSize: "30px",
  };

  // Modal message styles
  const modalBodyStyles = {
    color: "#000",
    fontSize: "17px",
    fontFamily:
      "'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif",
    marginBottom: "20px",
  };

  // Button container styles
  const buttonContainerStyles = {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
  };

  // Confirm button styles
  const confirmButtonStyles = {
    backgroundColor: "#dc172b",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "15px",
  };

  // Cancel button styles
  const cancelButtonStyles = {
    backgroundColor: "#ffffff",
    color: "#000",
    border: "1px solid #000",
    borderRadius: "5px",
    padding: "10px 20px",
    cursor: "pointer",
    fontSize: "15px",
  };

  return (
    <div style={modalStyles}>
      {/* Warning Header */}
      <div style={modalHeaderStyles}>
        <h3>{t("Warning")}</h3>
      </div>

      {/* Modal Content */}
      <div style={modalBodyStyles}>
        <p>{t("Are you sure you want to Log out?")}</p>
        {/* Action Buttons */}
        <div style={buttonContainerStyles}>
          <button style={cancelButtonStyles} onClick={onCancel}>
           {t("Cancel")}
          </button>
          <button style={confirmButtonStyles} onClick={onConfirm}>
            {t("Confirm")}
          </button>
        </div>
      </div>
    </div>
  );
};
 
export default SignOutConfirmation;
