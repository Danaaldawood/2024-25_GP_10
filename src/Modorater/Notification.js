// --- Imports ---
import React, { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
// Displays success or error notifications with auto-close functionality
const Notification = ({ type, message, onClose }) => {
    const { t ,i18n} = useTranslation("userProfile");   
  // --- Auto-close Effect ---
  useEffect(() => {
    if (type === "success") {
      // Close success messages after 3 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [type, onClose]);

  // --- Style Definitions ---
  // Base container styles
  const styles = {
    container: {
      backgroundColor: " #fff",
      padding: "20px",
      borderRadius: "10px",
      width: "300px",
      textAlign: "center",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      zIndex: 1000,
    },

    // Message type styles
    success: {
      color: "#28a745",
    },
    error: {
      color: "#dc172b",
    },

    // Warning title styles
    warningTitle: {
      fontWeight: "bold",
      fontSize: "26px",
      color: "#dc172b",
      marginBottom: "10px",
    },

    // Error message styles
    errorMessage: {
      fontSize: "17px",
      fontFamily:
        "'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif",
      marginBottom: "20px",
      color: "#dc172b",
    },

    // Button styles
    confirmBtn: {
      backgroundColor: "#dc172b",
      color: "#fff",
      border: "none",
      padding: "8px 16px",
      borderRadius: "5px",
      cursor: "pointer",
      marginTop: "10px",
    },
    confirmBtnHover: {
      backgroundColor: "#ff5c5c",
    },

    // Success icon styles
    successIcon: {
      fontSize: "48px",
      color: "#28a745",
      marginBottom: "15px",
    },
  };

  return (
    <div
      style={{
        ...styles.container,
        ...(type === "error" && styles.error),
      }}
    >
      {/* Success Icon */}
      {type === "success" && (
        <div style={styles.successIcon}>
          <FontAwesomeIcon icon={faCheckCircle} />
        </div>
      )}

      {/* Warning Title for Errors */}
      {type === "error" && <p style={styles.warningTitle}>{t("userProfile.Warning")}</p>}

      {/* Notification Message */}
      <p style={type === "error" ? styles.errorMessage : styles.success}>
        {message}
      </p>

      {/* Try Again Button for Errors */}
      {type === "error" && (
        <button
          style={styles.confirmBtn}
          onMouseOver={(e) =>
            (e.target.style.backgroundColor =
              styles.confirmBtnHover.backgroundColor)
          }
          onMouseOut={(e) =>
            (e.target.style.backgroundColor = styles.confirmBtn.backgroundColor)
          }
          onClick={onClose}
        >
          {t("userProfile.Tryagain")}
        </button>
      )}
    </div>
  );
};

export default Notification;
