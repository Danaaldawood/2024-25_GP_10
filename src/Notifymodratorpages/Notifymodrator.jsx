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
  const { t, i18n } = useTranslation("notifyPage");   

  // State variables
  const [userId, setUserId] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Function to get the correct display attribute based on language
  const getDisplayAttribute = () => {
    const currentLang = i18n.language;
    const attributeData = location.state?.attribute;
    
    if (currentLang === "ar" && attributeData?.ar) {
      return attributeData.ar;
    } else if (currentLang === "ch" && attributeData?.ch) {
      return attributeData.ch;
    }
    return attributeData?.en || "";
  };

  // Function to get the correct display value based on language
  const getDisplayValue = (value) => {
    const currentLang = i18n.language;
    if (currentLang === "ar" && location.state?.region === "Arab") {
      return value.values?.[0] || value.en_values?.[0] || "";
    } else if (currentLang === "ch" && location.state?.region === "Chinese") {
      return value.values?.[0] || value.en_values?.[0] || "";
    }
    return value.en_values?.[0] || "";
  };

  // Initialize first selected value
  const getInitialValue = () => {
    const firstValue = location.state?.allValues?.[0];
    if (firstValue) {
      let valuePairs = {
        en: firstValue.en_values?.[0] || ""
      };

      if (location.state?.region === "Arab") {
        valuePairs.ar = firstValue.values?.[0] || "";
      } else if (location.state?.region === "Chinese") {
        valuePairs.ch = firstValue.values?.[0] || "";
      }

      return valuePairs;
    }
    return { en: "" };
  };

  const [notificationData, setNotificationData] = useState({
    topic: t(`notifyPage.Topic_Names.${location.state?.topic}`) || "",
    topic_lan: location.state?.topic_lan || "",
    description: "",
    PreviousValue: getInitialValue(),
    status: "pending",
    timestamp: new Date().toISOString(),
    attribute: {
      en: location.state?.attribute?.en || "",
      ar: location.state?.attribute?.ar || "",
      ch: location.state?.attribute?.ch || ""
    },
    userId: { fullId: "", shortId: "" },
    region: location.state?.region || "",
    region_lan: location.state?.region_lan || "",
    modAction: "noaction"
  });

  // Update topic translation when language changes
  useEffect(() => {
    setNotificationData(prev => ({
      ...prev,
      topic: t(`notifyPage.Topic_Names.${location.state?.topic}`) || ""
    }));
  }, [i18n.language, t, location.state?.topic]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId({
          fullId: user.uid,
          shortId: `user_${user.uid.slice(-4)}`
        });
      } else {
        console.error("User is not authenticated");
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!location.state) {
      alert(t("notifyPage.noDataAlert"));
      navigate("/View");
    }
  }, [location.state, navigate, t]);

  useEffect(() => {
    if (userId) {
      setNotificationData(prev => ({
        ...prev,
        userId: userId,
      }));
    }
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "PreviousValue") {
      // Find the selected value object from allValues
      const selectedValueObj = location.state?.allValues?.find(val => 
        getDisplayValue(val) === value
      );

      if (selectedValueObj) {
        // Initialize with English value
        let valuePairs = {
          en: selectedValueObj.en_values[0]
        };

        // Add appropriate translation based on region
        if (location.state?.region === "Arab") {
          valuePairs = {
            en: selectedValueObj.en_values[0],
            ar: selectedValueObj.values[0]
          };
        } else if (location.state?.region === "Chinese") {
          valuePairs = {
            en: selectedValueObj.en_values[0],
            ch: selectedValueObj.values[0]
          };
        }

        setNotificationData(prevState => ({
          ...prevState,
          PreviousValue: valuePairs
        }));
      }
    } else {
      setNotificationData(prevState => ({
        ...prevState,
        [name]: value,
      }));
    }
    
    if (name === "description" && value.length > 0) {
      setShowError(false);
    }
  };

  const checkExistingNotification = (notifications) => {
    if (!notifications || !Array.isArray(notifications)) {
      return false;
    }
  
    // Let's filter out any notifications where modAction is not "noaction"
    const pendingNotifications = notifications.filter(notification => {
      // Check if exact same attribute
      const sameAttribute = notification.attribute.en === notificationData.attribute.en;
      // Check if same previous value
      const samePreviousValue = notification.PreviousValue.en === notificationData.PreviousValue.en;
      // Check if no action taken yet
      const isPending = notification.modAction === "noaction";
      
      return sameAttribute && samePreviousValue && isPending;
    });
  
    // If we find any pending notifications, return true to prevent submission
    return pendingNotifications.length > 0;
  };

  const prepareNotificationData = () => {
    let prepared = {
      ...notificationData,
      attribute: { en: notificationData.attribute.en },
      PreviousValue: { en: notificationData.PreviousValue.en }
    };

    if (location.state?.region === "Arab") {
      prepared.attribute.ar = notificationData.attribute.ar;
      prepared.PreviousValue.ar = notificationData.PreviousValue.ar;
    } else if (location.state?.region === "Chinese") {
      prepared.attribute.ch = notificationData.attribute.ch;
      prepared.PreviousValue.ch = notificationData.PreviousValue.ch;
    }

    return prepared;
  };

  const handleSubmitNotification = async () => {
    if (!notificationData.description) {
      setShowError(true);
      return;
    }

    try {
      const notificationsRef = ref(realtimeDb, `notifications/${id}`);
      const snapshot = await get(notificationsRef);
      let existingNotifications = [];

      if (snapshot.exists()) {
        existingNotifications = snapshot.val().notifications || [];

        if (checkExistingNotification(existingNotifications)) {
          setErrorMessage(t("notifyPage.pendingNotificationError"));
          setShowErrorPopup(true);
          return;
        }
      }

      const preparedNotification = {
        ...prepareNotificationData(),
        timestamp: new Date().toISOString(),
        notificationId: push(ref(realtimeDb)).key,
      };

      await set(notificationsRef, {
        notifications: [...existingNotifications, preparedNotification],
      });

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
        <Helmet>
          <title>Notify Moderator</title>           
          <meta name="description" content="Notify moderator page" />
        </Helmet>

        <div className="notify-header">
          <div className="notify-title">{t("notifyPage.notify-title")}</div>
          <div className="underline"></div>
          <div className="notiyfy-attribute-display">
            {getDisplayAttribute()}
          </div>
        </div>

        <div className="notify-inputs">
          <div className="notify-input">
            <label className="label">{t("notifyPage.label")}</label>
            <input
              type="text"
              name="topic"
              value={notificationData.topic}
              readOnly
            />
          </div>

          <div className="notify-input">
            <label className="label2">{t("notifyPage.label2")}</label>
            <select
              name="PreviousValue"
              value={getDisplayValue(location.state?.allValues?.find(v => 
                v.en_values?.[0] === notificationData.PreviousValue.en
              ) || {})}
              onChange={handleInputChange}
              className="notify-select"
            >
              {location.state?.allValues?.map((value, index) => (
                <option key={index} value={getDisplayValue(value)}>
                  {getDisplayValue(value)}
                </option>
              ))}
            </select>
          </div>

          <div className="notify-input">
            <label className="label3">{t("notifyPage.label3")}</label>
            <textarea
              name="description"
              value={notificationData.description}
              onChange={handleInputChange}
              placeholder={showError ? t("notifyPage.errorPlaceholder") : t("notifyPage.detailPlaceholder")}
              className={showError && !notificationData.description ? "error-input" : ""}
              rows={4}
            />
          </div>
        </div>

        <div className="notify-submit-container">
          <button onClick={handleSubmitNotification} className="notify-submit-button">
            {t("notifyPage.submitButton")}
          </button>
        </div>

        {showSuccess && (
          <div className="success-popup">
            <FontAwesomeIcon icon={faCheckCircle} className="success-icon" />
            <p className="success-message">{t("notifyPage.successMessage")}</p>
          </div>
        )}

        {showErrorPopup && (
          <div className="error-popup">
            <div className="error-title">{t("notifyPage.errorTitle")}</div>
            <div className="error-message">{errorMessage}</div>
            <div className="error-actions">
              <button className="confirm-btn" onClick={() => setShowErrorPopup(false)}>
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