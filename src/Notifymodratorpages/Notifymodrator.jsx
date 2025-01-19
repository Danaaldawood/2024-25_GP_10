import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ref, get, push, set } from "firebase/database";
import { realtimeDb, auth } from "../Register/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Helmet } from "react-helmet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { Header } from "../Header/Header";
import { Footer } from "../Footer/Footer";
import "./Notifymodrator.css";

export const Notifymodrator = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  // State variables
  const [userId, setUserId] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
 
  // full form with retrive values from location state
  const { t ,i18n} = useTranslation("notifyPage");   

  const [notificationData, setNotificationData] = useState({
    topic: t(`notifyPage.Topic_Names.${location.state?.topic}`) || "",  
    description: "",
    suggestion: "",
    PreviousValue: location.state?.selectedValue || "",
    status: "pending",
    timestamp: new Date().toISOString(),
    attribute: location.state?.attribute || "",
    userId: "",
    region: location.state?.region || "",
  });
  
  // monitor authentication state and set user ID
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

  // Ensure if location state is available
  useEffect(() => {
    if (!location.state) {
      alert(t("notifyPage.noDataAlert"));
      navigate("/View");
    }
  }, [location.state, navigate]);

  useEffect(() => {
    if (userId) {
      setNotificationData((prev) => ({
        ...prev,
        userId: userId,
      }));
    }
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNotificationData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    if (name === "description" && value.length > 0) {
      setShowError(false);
    }
  };

  // Check for duplicate notifications
  const checkExistingNotification = (notifications) => {
    return notifications.some(
      (notification) =>
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
    if (
      notificationData.suggestion &&
      nonEnglishPattern.test(notificationData.suggestion)
    ) {
      setErrorMessage(t("notifyPage.suggestionError"));
      setShowErrorPopup(true);
      return;
    }

    // Check for duplicate suggestions
    if (notificationData.suggestion) {
      const suggestionLower = notificationData.suggestion.toLowerCase();
      const allValuesLower =
        location.state?.allValues.map((value) => value.toLowerCase()) || [];

      if (allValuesLower.includes(suggestionLower)) {
        setErrorMessage(
          `The value "${notificationData.suggestion}" already exists in the dataset.`
        );
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
          setErrorMessage(t("notifyPage.pendingNotificationError"));

          setShowErrorPopup(true);
          return;
        }
      }

      // Create new notification object
      const newNotification = {
        ...notificationData,
        timestamp: new Date().toISOString(),
        notificationId: push(ref(realtimeDb)).key,
      };

      // Update database with new notification
      await set(notificationsRef, {
        notifications: [...existingNotifications, newNotification],
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
    <div className="notifypage">
      <Header />
      <div className="notify-form-container">
        {/* tab tag */}
        <Helmet>
        <title>Notify Moderator</title>           
          <meta name="description" content="Notify moderator page" />
        </Helmet>

        {/* Form header */}
        <div className="notify-header">
        <div className="notify-title">{t("notifyPage.notify-title")}</div>
        <div className="underline"></div>
          <div className="notiyfy-attribute-display">
            {location.state?.attribute}
          </div>
        </div>
        {/* Form inputs */}
        <div className="notify-inputs">
          {/* input of topic*/}
          <div className="notify-input">
          <label className="label">{t("notifyPage.label")}</label>
          <input
              type="text"
              name="topic"
              value={notificationData.topic}
              readOnly
            />
          </div>
          {/* Previous value selection */}
          <div className="notify-input">
            <label className="label2">{t("notifyPage.label2")}</label>
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
                ?.filter((value) => value !== location.state.selectedValue)
                .map((value, index) => (
                  <option key={index} value={value}>
                    {value}
                  </option>
                ))}
            </select>
          </div>

          {/* Description of notify  */}
          <div className="notify-input">
            <label className="label3">{t("notifyPage.label3")}</label>
            <textarea
              name="description"
              value={notificationData.description}
              onChange={handleInputChange}
              placeholder={
                showError
                  ? t("notifyPage.errorPlaceholder")
                  : t("notifyPage.detailPlaceholder")
              }
              className={
                showError && !notificationData.description ? "error-input" : ""
              }
              rows={4}
            />
            </div>

          {/* Suggestion input */}
          <div className="notify-input">
          <label className="label4">{t("notifyPage.label4")}</label>

            <input
              type="text"
              name="suggestion"
              value={notificationData.suggestion}
              onChange={handleInputChange}
              placeholder={t("notifyPage.placeholder1")}
              />
          </div>
        </div>

        {/* Submit button */}
        <div className="notify-submit-container">
          <button
            onClick={handleSubmitNotification}
            className="notify-submit-button"
          >
  {t("notifyPage.submitButton")}
  </button>
        </div>

        {/* Success and error popups */}
        {showSuccess && (
  <div className="success-popup">
    <FontAwesomeIcon icon={faCheckCircle} className="success-icon" />
    <p className="success-message">
      {t("notifyPage.successMessage")}
    </p>
  </div>
)}

{showErrorPopup && (
  <div className="error-popup">
    <div className="error-title">{t("notifyPage.errorTitle")}</div>
    <div className="error-message">{errorMessage}</div>
    <div className="error-actions">
      <button
        className="confirm-btn"
        onClick={() => setShowErrorPopup(false)}
      >
        {t("notifyPage.errorOkButton")}
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
