import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ref, update, push, get } from 'firebase/database';
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
  // Initialize translation hook
  const { t, i18n } = useTranslation("addpage");
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // State management
  const [showSuccess, setShowSuccess] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [userId, setUserId] = useState({
    fullId: "",
    shortId: ""
  });

  // Split the ID parameter into region code and detail ID
  const [regionCode, detailId] = (id || "").split("-");

  // Initialize form data state
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
    newvalue: "",
    reason: "",
    showPlaceholderError: false
  });

  // Function to translate text using OpenAI API
  const translateText = async (text, targetLanguage) => {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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'
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              "role": "system", 
              "content": `You are a professional translator. Translate the following text to ${targetLanguage}. Provide only the translation, no explanations.`
            },
            {"role": "user", "content": text}
          ],
          temperature: 0.3
        })
      });
      
      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error("Translation error:", error);
      throw error;
    }
  };

  // Helper function to get the correct display attribute based on region and language
  const getDisplayAttribute = () => {
    if (itemData.region === "Western") return itemData.en_question;
    
    if (itemData.region === "Arab") {
      return i18n.language === "ar" && itemData.question ? itemData.question : itemData.en_question;
    }
    
    if (itemData.region === "Chinese") {
      return i18n.language === "ch" && itemData.question ? itemData.question : itemData.en_question;
    }

    return itemData.en_question;
  };

  // Helper function to get the correct display region based on language
  const getDisplayRegion = () => {
    const currentLang = i18n.language;
    if (currentLang === "ar" && itemData.region === "Arab" && itemData.region_lan) {
      return itemData.region_lan;
    } else if (currentLang === "ch" && itemData.region === "Chinese" && itemData.region_lan) {
      return itemData.region_lan;
    }
    return itemData.region;
  };

  // Helper function to get the correct display topic based on language
  const getDisplayTopic = () => {
    const currentLang = i18n.language;
    if (currentLang === "ar" && itemData.region === "Arab" && itemData.topic_lan) {
      return itemData.topic_lan;
    } else if (currentLang === "ch" && itemData.region === "Chinese" && itemData.topic_lan) {
      return itemData.topic_lan;
    }
    return itemData.topic;
  };

  // Check for valid location state on component mount
  useEffect(() => {
    if (!location.state) {
      alert(t("alerts.noData"));
      navigate("/view");
    }
  }, [location.state, navigate, t]);

  // Set up authentication listener
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

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setItemData(prevState => ({
      ...prevState,
      [name]: value,
      showPlaceholderError: false
    }));
  };

  // Function to detect language
  const detectLanguage = (text) => {
    const arabicPattern = /[\u0600-\u06FF]/;
    const chinesePattern = /[\u4e00-\u9fa5]/;
    
    if (arabicPattern.test(text)) return 'ar';
    if (chinesePattern.test(text)) return 'zh';
    return 'en';
  };

  // Handle form submission
  const handleAddClick = async () => {
    // Validate required fields
    if (!itemData.newvalue || !itemData.reason) {
      setItemData(prev => ({
        ...prev,
        showPlaceholderError: !itemData.newvalue || !itemData.reason
      }));
      return;
    }

    // Detect input language
    const inputLanguage = detectLanguage(itemData.newvalue);
    let englishValue = itemData.newvalue;
    let nativeValue = itemData.newvalue;

    try {
      // Handle translation based on input language and region
      if (itemData.region === "Arab") {
        if (inputLanguage === 'ar') {
          // Input is Arabic, translate to English
          englishValue = await translateText(itemData.newvalue, "English");
          nativeValue = itemData.newvalue;
        } else {
          // Input is English, translate to Arabic
          englishValue = itemData.newvalue;
          nativeValue = await translateText(itemData.newvalue, "Arabic");
        }
      } else if (itemData.region === "Chinese") {
        if (inputLanguage === 'zh') {
          // Input is Chinese, translate to English
          englishValue = await translateText(itemData.newvalue, "English");
          nativeValue = itemData.newvalue;
        } else {
          // Input is English, translate to Chinese
          englishValue = itemData.newvalue;
          nativeValue = await translateText(itemData.newvalue, "Chinese");
        }
      } else {
        // Western region - keep as is
        englishValue = itemData.newvalue;
        nativeValue = itemData.newvalue;
      }

      // Get the current question's values directly from the database
      const questionRef = ref(realtimeDb, `${regionCode}/Details/${detailId}/annotations`);
      const snapshot = await get(questionRef);
      let currentQuestionValues = [];
      
      if (snapshot.exists()) {
        currentQuestionValues = snapshot.val();
      }

      // Check for duplicate values in English for this specific question
      const newValueLower = englishValue.toLowerCase();
      const existingEnglishValues = currentQuestionValues.map(value => {
        if (value && value.en_values && value.en_values[0]) {
          return value.en_values[0].toLowerCase();
        }
        return '';
      }).filter(val => val !== '');

      if (existingEnglishValues.includes(newValueLower)) {
        console.log("New English value causing duplicate:", englishValue);
        setErrorMessage(
          t("errorPopup.duplicateValue", { value: itemData.newvalue }) // Use the original input value
        );
        setShowErrorPopup(true);
        return;
      }

      // Check for duplicate values in native language for this specific question
      if (itemData.region === "Arab" || itemData.region === "Chinese") {
        const newNativeValueLower = nativeValue.toLowerCase();
        const existingNativeValues = currentQuestionValues.map(value => {
          if (value && value.values && value.values[0]) {
            return value.values[0].toLowerCase();
          }
          return '';
        }).filter(val => val !== '');

        if (existingNativeValues.includes(newNativeValueLower)) {
          console.log("New native value causing duplicate:", nativeValue);
          setErrorMessage(
            t("errorPopup.duplicateValue", { value: itemData.newvalue }) // Use the original input value
          );
          setShowErrorPopup(true);
          return;
        }
      }

      // Get translated reason
      let reasonTranslation = null;
      if (itemData.region === "Arab" || itemData.region === "Chinese") {
        if (itemData.reason === "Variation") {
          reasonTranslation = itemData.region === "Arab" ? "تنوع" : "变化";
        } else if (itemData.reason === "subculture") {
          reasonTranslation = itemData.region === "Arab" ? "ثقافة فرعية" : "亚文化";
        }
      }

      // Update annotations in database
      const newAnnotationIndex = currentQuestionValues.length;
      const itemRef = ref(realtimeDb, `${regionCode}/Details/${detailId}/annotations/${newAnnotationIndex}`);
      const newAnnotation = {
        en_values: [englishValue],
        reason: itemData.reason,
        reason_lan: reasonTranslation,
        user_id: userId.shortId || "user_undefined",
        userId: userId.fullId || "undefined",
        modAction: "noaction",
        values: [nativeValue]
      };
      await update(itemRef, newAnnotation);

      // Create view edit entry
      const viewEditRef = ref(realtimeDb, `Viewedit/${itemData.region}`);
      const newEntry = {
        en_question: itemData.en_question || itemData.attribute,
        question: itemData.question || null,
        userId: userId.shortId,
        fullUserId: userId.fullId,
        region: itemData.region,
        region_lan: itemData.region_lan || null,
        topic: itemData.topic,
        topic_lan: itemData.topic_lan || null,
        value: englishValue,
        native_value: (itemData.region === "Arab" || itemData.region === "Chinese") ? nativeValue : null,
        reason: itemData.reason,
        reason_lan: reasonTranslation,
        modAction: "noaction"
      };

      // Remove undefined/null values
      Object.keys(newEntry).forEach(key => 
        (newEntry[key] === undefined || newEntry[key] === null) && delete newEntry[key]
      );

      await push(viewEditRef, newEntry);

      // Show success message and navigate
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate("/view");
      }, 1000);
    } catch (error) {
      console.error("Error updating data:", error);
      setErrorMessage(t("errorPopup.updateFailed"));
      setShowErrorPopup(true);
    }
  };

  return (
    <div className={`addpage ${i18n.language === "ar" ? "rtl" : "ltr"}`}>
      <Header />
      <div className="addformcontainer">
        <Helmet>
          <title>{t("helmetTitle")}</title>
          <meta name="description" content={t("helmetDescription")} />
        </Helmet>

        {/* Error Popup */}
        {showErrorPopup && (
          <div className="error-popup">
            <div className="error-title">{t("errorPopup.title")}</div>
            <div className="error-message">{errorMessage}</div>
            <div className="error-actions">
              <button 
                className="confirm-btn" 
                onClick={() => setShowErrorPopup(false)}
              >
                {t("errorPopup.okButton")}
              </button>
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="addheader">
          <div className="add-title">{t("header.title")}</div>
          <div className="underline"></div>
        </div>

        {/* Form Inputs */}
        <div className="add-inputs">
          {/* Attribute Display */}
          <div className="add-input attribute-container">
            <div className="attribute-display">{getDisplayAttribute()}</div>
          </div>

          {/* Topic Input */}
          <div className="add-input">
            <label className="label">{t("form.labels.topic")}</label>
            <input
              type="text"
              id="topic"
              name="topic"
              value={getDisplayTopic()}
              readOnly
            />
          </div>

          {/* All Values List */}
          <div className="add-input">
            <label className="label">{t("form.labels.allValues")}</label>
            <ul className="all-values-list">
              {Array.isArray(itemData.allValues) && itemData.allValues.map((item, index) => {
                let displayValues = [];
                
                if (item && typeof item === 'object') {
                  if ((i18n.language === "ar" && itemData.region === "Arab") ||
                      (i18n.language === "ch" && itemData.region === "Chinese")) {
                    displayValues = [item.values?.[0] || ''];
                  } else {
                    displayValues = [item.en_values?.[0] || ''];
                  }
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

          {/* New Value Input */}
          <div className="add-input">
            <label className="label">
              {t("form.labels.newValue")}
            </label>
            <input
              type="text"
              id="newvalue"
              name="newvalue"
              value={itemData.newvalue}
              onChange={handleInputChange}
              placeholder={itemData.showPlaceholderError && !itemData.newvalue 
                ? t("form.placeholders.newValueError")
                : t("form.placeholders.newValue")}
              className={itemData.showPlaceholderError && !itemData.newvalue ? "error-placeholder" : ""}
              dir={i18n.language === "ar" ? "rtl" : "ltr"}
            />
          </div>

          {/* Reason Select */}
          <div className="add-input">
            <label className="label">{t("form.labels.reason")}</label>
            <select
              id="reason"
              name="reason"
              value={itemData.reason}
              onChange={handleInputChange}
              className={itemData.showPlaceholderError && !itemData.reason ? "reason-error-placeholder" : ""}
            >
              <option value="" disabled>
                {itemData.showPlaceholderError && !itemData.reason 
                  ? t("form.placeholders.reasonError")
                  : t("form.placeholders.reason")}
              </option>
              <option value="Variation">{t("form.reasonOptions.variation")}</option>
              <option value="subculture">{t("form.reasonOptions.subculture")}</option>
            </select>
          </div>

          {/* Region Input */}
          <div className="add-input">
            <label className="label">{t("form.labels.region")}</label>
            <input
              type="text"
              id="region"
              name="region"
              value={getDisplayRegion()}
              readOnly
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="addsubmit-container">
          <div className="add-submit">
            <button onClick={handleAddClick} disabled={!userId.shortId}>
              {userId.shortId ? t("buttons.add") : t("buttons.loading")}
            </button>
          </div>
        </div>

        {/* Success Popup */}
        {showSuccess && (
          <div className="success-popup">
            <FontAwesomeIcon icon={faCheckCircle} className="success-icon" />
            <p className="success-message">{t("successPopup.message")}</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AddCultureValue;