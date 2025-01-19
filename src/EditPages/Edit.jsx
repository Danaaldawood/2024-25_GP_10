import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ref, update, push } from 'firebase/database';
import { realtimeDb, auth } from '../Register/firebase';
import { onAuthStateChanged } from "firebase/auth";
import "./Add.css";
import { Header } from '../Header/Header';
import { Footer } from '../Footer/Footer';
import { Helmet } from 'react-helmet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

export const AddCultureValue = () => {
  const { t, i18n } = useTranslation("addpage");
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // State management
  const [showSuccess, setShowSuccess] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [userId, setUserId] = useState("");

  const [regionCode, detailId] = (id || "").split("-");

  const [itemData, setItemData] = useState({
    topic: location.state?.topic || "",
    topic_lan: location.state?.topic_lan || "",
    attribute: location.state?.attribute || "",
    question: location.state?.question || "",
    en_question: location.state?.en_question || "",
    value: location.state?.selectedValue || "",
    region: location.state?.region || localStorage.getItem('region') || "",
    region_lan: location.state?.region_lan || "",
    allValues: location.state?.allValues || [],
    newvalue: "", // English value
    nativevalue: "", // Arabic/Chinese value
    reason: "",
    showPlaceholderError: false,
    showNativePlaceholderError: false
  });

  // Display helper functions
  // Get display value for attribute based on current language and region
  const getDisplayAttribute = () => {
    // For Western region, always show English
    if (itemData.region === "Western") {
      return itemData.en_question;
    }
    
    // For Arabic region
    if (itemData.region === "Arab") {
      // Show Arabic question when language is Arabic
      if (i18n.language === "ar" && itemData.question) {
        return itemData.question;
      }
      // Fallback to English for other languages
      return itemData.en_question;
    }
    
    // For Chinese region
    if (itemData.region === "Chinese") {
      // Show Chinese question when language is Chinese
      if (i18n.language === "ch" && itemData.question) {
        return itemData.question;
      }
      // Fallback to English for other languages
      return itemData.en_question;
    }

    // Default fallback to English question
    return itemData.en_question;
  };

  const getDisplayRegion = () => {
    const currentLang = i18n.language;
    if (currentLang === "ar" && itemData.region === "Arab" && itemData.region_lan) {
      return itemData.region_lan;
    } else if (currentLang === "ch" && itemData.region === "Chinese" && itemData.region_lan) {
      return itemData.region_lan;
    }
    return itemData.region;
  };

  const getDisplayTopic = () => {
    const currentLang = i18n.language;
    if (currentLang === "ar" && itemData.region === "Arab" && itemData.topic_lan) {
      return itemData.topic_lan;
    } else if (currentLang === "ch" && itemData.region === "Chinese" && itemData.topic_lan) {
      return itemData.topic_lan;
    }
    return itemData.topic;
  };

  // Check for data availability
  useEffect(() => {
    if (!location.state) {
      alert(t("addPage.alerts.noData"));
      navigate("/view");
    }
  }, [location.state, navigate, t]);

  // User authentication check
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setItemData((prevState) => ({
      ...prevState,
      [name]: value,
      showPlaceholderError: false
    }));
  };

  const handleAddClick = async () => {
    // Validate English input
    const nonEnglishPattern = /[^\x00-\x7F]+/;
    if (nonEnglishPattern.test(itemData.newvalue)) {
      setErrorMessage(t("addPage.errorPopup.englishOnly"));
      setShowErrorPopup(true);
      return;
    }

    // Validate required fields
    const needsNativeValue = (itemData.region === "Arab" || itemData.region === "Chinese");
    if (!itemData.newvalue || !itemData.reason || (needsNativeValue && !itemData.nativevalue)) {
      setItemData(prev => ({
        ...prev,
        showPlaceholderError: !itemData.newvalue || !itemData.reason,
        showNativePlaceholderError: needsNativeValue && !itemData.nativevalue
      }));
      return;
    }

    // Check for duplicates in English values
    const newValueLower = itemData.newvalue.toLowerCase();
    const allValuesLower = itemData.allValues.map(value => {
      if (typeof value === 'object' && value !== null) {
        return value.en_values?.[0]?.toLowerCase() || '';
      }
      return typeof value === 'string' ? value.toLowerCase() : '';
    });

    if (allValuesLower.includes(newValueLower)) {
      setErrorMessage(t("addPage.errorPopup.duplicateValue", { value: itemData.newvalue }));
      setShowErrorPopup(true);
      return;
    }

    try {
      // Get translated reason based on region
      let reasonTranslation = "";
      if (itemData.region === "Arab") {
        reasonTranslation = t(`addPage.form.reasonOptions.${itemData.reason.toLowerCase()}`);
      } else if (itemData.region === "Chinese") {
        reasonTranslation = t(`addPage.form.reasonOptions.${itemData.reason.toLowerCase()}`);
      }

      // Update annotations
      const itemRef = ref(realtimeDb, `${regionCode}/Details/${detailId}/annotations/${itemData.allValues.length}`);
      const newAnnotation = {
        en_values: [itemData.newvalue],
        reason: itemData.reason,
        reason_lan: reasonTranslation || null,
        user_id: userId || "user_undefined",
        values: [
          (itemData.region === "Arab" || itemData.region === "Chinese") 
            ? itemData.nativevalue 
            : itemData.newvalue
        ]
      };
      await update(itemRef, newAnnotation);

      // Add to ViewEdit collection
      const viewEditRef = ref(realtimeDb, `Viewedit/${itemData.region}`);
      const newEntry = {
        en_question: itemData.en_question || itemData.attribute,
        question: itemData.question || null,
        userId: userId,
        region: itemData.region,
        region_lan: itemData.region_lan || null,
        topic: itemData.topic,
        topic_lan: itemData.topic_lan || null,
        value: itemData.newvalue,
        native_value: needsNativeValue ? itemData.nativevalue : null,
        reason: itemData.reason,
        reason_lan: reasonTranslation || null
      };

      // Remove any undefined or null properties
      Object.keys(newEntry).forEach(key => 
        (newEntry[key] === undefined || newEntry[key] === null) && delete newEntry[key]
      );

      await push(viewEditRef, newEntry);

      // Show success and redirect
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate("/view");
      }, 1000);
    } catch (error) {
      console.error("Error updating data:", error);
      // Show error message to user
      setErrorMessage(t("addPage.errorPopup.updateFailed"));
      setShowErrorPopup(true);
    }
  };

  return (
    <div className={`addpage ${i18n.language === "ar" ? "rtl" : "ltr"}`}>
      <Header />
      <div className="addformcontainer">
        <Helmet>
          <title>{t("addPage.helmetTitle")}</title>
          <meta name="description" content={t("addPage.helmetDescription")} />
        </Helmet>

        {showErrorPopup && (
          <div className="error-popup">
            <div className="error-title">{t("addPage.errorPopup.title")}</div>
            <div className="error-message">{errorMessage}</div>
            <div className="error-actions">
              <button 
                className="confirm-btn" 
                onClick={() => setShowErrorPopup(false)}
              >
                {t("addPage.errorPopup.okButton")}
              </button>
            </div>
          </div>
        )}

        <div className="addheader">
          <div className="add-title">{t("addPage.header.title")}</div>
          <div className="underline"></div>
        </div>

        <div className="add-inputs">
          <div className="add-input attribute-container">
            <div className="attribute-display">{getDisplayAttribute()}</div>
          </div>

          <div className="add-input">
            <label className="label">{t("addPage.form.labels.topic")}</label>
            <input
              type="text"
              id="topic"
              name="topic"
              value={getDisplayTopic()}
              readOnly
            />
          </div>

          <div className="add-input">
            <label className="label">{t("addPage.form.labels.allValues")}</label>
            <ul className="all-values-list">
              {Array.isArray(itemData.allValues) && itemData.allValues.map((item, index) => {
                let displayValues = [];
                
                if (item && typeof item === 'object') {
                  if ((i18n.language === "ar" && itemData.region === "Arab") ||
                      (i18n.language === "ch" && itemData.region === "Chinese")) {
                    // For Arabic/Chinese regions, use the values array
                    displayValues = item.values || [];
                  } else {
                    // For other languages/regions, use en_values array
                    displayValues = item.en_values || [];
                  }
                }

                // Convert displayValues to array if it's not already
                if (!Array.isArray(displayValues)) {
                  displayValues = [displayValues];
                }

                return displayValues.map((value, valueIndex) => (
                  <li key={`${index}-${valueIndex}`} 
                      className="value-item"
                      dir={i18n.language === "ar" ? "rtl" : "ltr"}>
                    {value}
                  </li>
                ));
              })}
            </ul>
          </div>

          <div className="add-input">
            <label className="label">
              {t("addPage.form.labels.newValue")} ({t("addPage.form.labels.english")})
            </label>
            <input
              type="text"
              id="newvalue"
              name="newvalue"
              value={itemData.newvalue}
              onChange={handleInputChange}
              placeholder={itemData.showPlaceholderError && !itemData.newvalue 
                ? t("addPage.form.placeholders.newValueError")
                : t("addPage.form.placeholders.newValue")}
              className={itemData.showPlaceholderError && !itemData.newvalue ? "error-placeholder" : ""}
            />
          </div>

          {(itemData.region === "Arab" || itemData.region === "Chinese") && (
            <div className="add-input">
              <label className="label">
                {t("addPage.form.labels.newValue")} ({itemData.region === "Arab" 
                  ? t("addPage.form.labels.arabic") 
                  : t("addPage.form.labels.chinese")})
              </label>
              <input
                type="text"
                id="nativevalue"
                name="nativevalue"
                value={itemData.nativevalue}
                onChange={handleInputChange}
                placeholder={itemData.showNativePlaceholderError && !itemData.nativevalue
                  ? t("addPage.form.placeholders.newValueError")
                  : t(`addPage.form.placeholders.newValue${itemData.region === "Arab" ? "Arabic" : "Chinese"}`)}
                className={itemData.showNativePlaceholderError && !itemData.nativevalue ? "error-placeholder" : ""}
                dir={itemData.region === "Arab" ? "rtl" : "ltr"}
              />
            </div>
          )}

          <div className="add-input">
            <label className="label">{t("addPage.form.labels.reason")}</label>
            <select
              id="reason"
              name="reason"
              value={itemData.reason}
              onChange={handleInputChange}
              className={itemData.showPlaceholderError && !itemData.reason ? "reason-error-placeholder" : ""}
            >
              <option value="" disabled>
                {itemData.showPlaceholderError && !itemData.reason 
                  ? t("addPage.form.placeholders.reasonError")
                  : t("addPage.form.placeholders.reason")}
              </option>
              <option value="Variation">{t("addPage.form.reasonOptions.variation")}</option>
              <option value="subculture">{t("addPage.form.reasonOptions.subculture")}</option>
            </select>
          </div>

          <div className="add-input">
            <label className="label">{t("addPage.form.labels.region")}</label>
            <input
              type="text"
              id="region"
              name="region"
              value={getDisplayRegion()}
              readOnly
            />
          </div>
        </div>

        <div className="addsubmit-container">
          <div className="add-submit">
            <button onClick={handleAddClick} disabled={!userId}>
              {userId ? t("addPage.buttons.add") : t("addPage.buttons.loading")}
            </button>
          </div>
        </div>

        {showSuccess && (
          <div className="success-popup">
            <FontAwesomeIcon icon={faCheckCircle} className="success-icon" />
            <p className="success-message">{t("addPage.successPopup.message")}</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AddCultureValue;