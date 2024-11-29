import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ref, get, push, set } from 'firebase/database';
import { realtimeDb, auth } from '../Register/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Helmet } from 'react-helmet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

import { Header } from '../Header/Header';
import { Footer } from '../Footer/Footer';
import "./Notifymodrator.css";

export const Notifymodrator = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [userId, setUserId] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [notificationData, setNotificationData] = useState({
    topic: location.state?.topic || "",
    description: "",
    suggestion: "",
    PreviousValue: location.state?.selectedValue || "", 
    status: "pending",
    timestamp: new Date().toISOString(),
    attribute: location.state?.attribute || "",
    userId: "",
    region: location.state?.region || ""
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const lastFourUID = user.uid.slice(-4);
        setUserId(`user_${lastFourUID}`);
      } else {
        console.error("User is not authenticated");
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!location.state) {
      alert("No data available for notification");
      navigate("/View");
    }
  }, [location.state, navigate]);

  useEffect(() => {
    if (userId) {
      setNotificationData(prev => ({
        ...prev,
        userId: userId
      }));
    }
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNotificationData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    if (name === 'description' && value.length > 0) {
      setShowError(false);
    }
  };

  // Check for duplicate notifications
  const checkExistingNotification = (notifications) => {
    return notifications.some(notification => 
      notification.attribute === notificationData.attribute && 
      notification.PreviousValue === notificationData.PreviousValue &&
      notification.status === "pending"
    );
  };

  // Submit notification to database
  const handleSubmitNotification = async () => {
    // Validate description field
    if (!notificationData.description) {
      setShowError(true);
      return;
    }

    // Validate suggestion language (English only)
    const nonEnglishPattern = /[^\x00-\x7F]+/;
    if (notificationData.suggestion && nonEnglishPattern.test(notificationData.suggestion)) {
      setErrorMessage("Please enter the suggestion in English only.");
      setShowErrorPopup(true);
      return;
    }

    // Check for duplicate suggestions
    if (notificationData.suggestion) {
      const suggestionLower = notificationData.suggestion.toLowerCase();
      const allValuesLower = location.state?.allValues.map(value => value.toLowerCase()) || [];
      
      if (allValuesLower.includes(suggestionLower)) {
        setErrorMessage(`The value "${notificationData.suggestion}" already exists in the dataset.`);
        setShowErrorPopup(true);
        return;
      }
    }

    try {
      // Get reference to notifications in database
      const notificationsRef = ref(realtimeDb, `notifications/${id}`);
      const snapshot = await get(notificationsRef);
      let existingNotifications = [];
      
      // Check for existing notifications
      if (snapshot.exists()) {
        existingNotifications = snapshot.val().notifications || [];
        
        if (checkExistingNotification(existingNotifications)) {
          setErrorMessage("A notification for this attribute and value is already pending.");
          setShowErrorPopup(true);
          return;
        }
      }

      // Create new notification object
      const newNotification = {
        ...notificationData,
        timestamp: new Date().toISOString(),
        notificationId: push(ref(realtimeDb)).key
      };

      // Update database with new notification
      await set(notificationsRef, {
        notifications: [...existingNotifications, newNotification]
      });
      
      // Show success message and redirect
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate("/View");
      }, 2000);
    } catch (error) {
      console.error("Error submitting notification:", error);
    }
  };

  return (
    <div>
      <Header />
      <div className="notify-form-container">
        {/* SEO metadata */}
        <Helmet>
          <title>Notify Moderator</title>
          <meta name="description" content="Notify moderator page" />
        </Helmet>
          
        {/* Form header */}
        <div className="notify-header">
          <div className="notify-title">
            Notify Moderator
          </div>
          <div className="underline"></div>
          <div className="notiyfy-attribute-display">
            {location.state?.attribute}
          </div>
        </div>

        {/* Form inputs */}
        <div className="notify-inputs">
          {/* Topic input */}
          <div className="notify-input">
            <label className="label">Topic:</label>
            <input
              type="text"
              name="topic"
              value={notificationData.topic}
              readOnly 
            />
          </div>

          {/* Previous value selection */}
          <div className="notify-input">
            <label className="label">Previous Value:</label>
            <select
              name="PreviousValue"
              value={notificationData.PreviousValue}
              onChange={handleInputChange}
              className="notify-select"
            >
              {location.state?.selectedValue && (
                <option value={location.state.selectedValue}>
                  {location.state.selectedValue}
                </option>
              )}
              {location.state?.allValues
                ?.filter(value => value !== location.state.selectedValue)
                .map((value, index) => (
                  <option key={index} value={value}>
                    {value}
                  </option>
              ))}
            </select>
          </div>

          {/* Description textarea */}
          <div className="notify-input">
            <label className="label">Description:</label>
            <textarea
              name="description"
              value={notificationData.description}
              onChange={handleInputChange}
              placeholder={showError ? "Please provide a description" : "Describe the issue in detail"}
              className={showError && !notificationData.description ? "error-input" : ""}
              rows={4}
            />
          </div>

          {/* Suggestion input */}
          <div className="notify-input">
            <label className="label">Suggestion for New Value (optional):</label>
            <input
              type="text"
              name="suggestion"
              value={notificationData.suggestion}
              onChange={handleInputChange}
              placeholder="Suggest a new value"
            />
          </div>
        </div>

        {/* Submit button */}
        <div className="notify-submit-container">
          <button onClick={handleSubmitNotification} className="notify-submit-button">
            Notify
          </button>
        </div>

        {/* Success and error popups */}
        {showSuccess && (
          <div className="success-popup">
            <FontAwesomeIcon icon={faCheckCircle} className="success-icon" />
            <p className="success-message">Notification submitted successfully.</p>
          </div>
        )}

        {showErrorPopup && (
          <div className="error-popup">
            <div className="error-title">Error</div>
            <div className="error-message">{errorMessage}</div>
            <div className="error-actions">
              <button className="confirm-btn" onClick={() => setShowErrorPopup(false)}>
                OK
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Notifymodrator;