import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ref, update, push, get } from "firebase/database";
import { realtimeDb, auth } from "../Register/firebase";
import { onAuthStateChanged } from "firebase/auth";
import "./Add.css";
import { Header } from "../Header/Header";
import { Footer } from "../Footer/Footer";
import { Helmet } from "react-helmet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

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
    shortId: "",
  });
  const [showTranslationPopup, setShowTranslationPopup] = useState(false);
  const [translationData, setTranslationData] = useState(null);
  const [editableTranslation, setEditableTranslation] = useState("");

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
    region: location.state?.region || localStorage.getItem("region") || "",
    region_lan: location.state?.region_lan || "",
    allValues: location.state?.allValues || [],
    newvalue: "",
    reason: "",
    showPlaceholderError: false,
  });

  // Function to detect language
  const detectLanguage = (text) => {
    if (!text || text.trim().length < 2) return "en";
    const arabicPattern = /[\u0600-\u06FF]/;
    const chinesePattern = /[\u4e00-\u9fa5]/;

    if (arabicPattern.test(text)) return "ar";
    if (chinesePattern.test(text)) return "zh";
    return "en";
  };

  // Function to validate the input language based on region
  const validateLanguageInput = (text, region) => {
    if (!text || text.trim().length < 2) return true;
    
    const detectedLang = detectLanguage(text);
    
    // Check if the language matches the region's native language or English
    if (region === "Arab") {
      return detectedLang === "ar" || detectedLang === "en";
    } else if (region === "Chinese") {
      return detectedLang === "zh" || detectedLang === "en";
    } else if (region === "Western") {
      return detectedLang === "en";
    }
    
    return true;
  };

  // Function to translate text using LibreTranslate
  const translateText = async (text, targetLanguage) => {
    try {
      if (!text || text.trim().length < 2) {
        console.log("Skipping translation for short text:", text);
        return text;
      }

      const detectedLanguage = detectLanguage(text);
      if (detectedLanguage === targetLanguage) {
        console.log("No translation needed, same language:", detectedLanguage);
        return text;
      }

      if (text.length > 500) {
        console.log("Text too long for translation, returning original");
        return text;
      }

      console.log("Translating:", {
        text,
        source: detectedLanguage,
        target: targetLanguage,
      });

      const API_KEY =
        process.env.REACT_APP_LIBRETRANSLATE_API_KEY ||
        "cde32ed0-56f2-499b-9f62-5a520be921f3";
      const response = await fetch("https://libretranslate.com/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          q: text,
          source: detectedLanguage === "zh" ? "zh" : detectedLanguage,
          target: targetLanguage === "zh" ? "zh" : targetLanguage,
          format: "text",
          api_key: API_KEY,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("LibreTranslate API error response:", errorData);
        throw new Error(`LibreTranslate API error: ${response.status}`);
      }

      const data = await response.json();
      if (!data.translatedText) {
        console.log("No translation returned, using original text");
        return text;
      }

      console.log("Translation result:", data);
      return data.translatedText.trim();
    } catch (error) {
      console.error("Translation error:", error);
      return text;
    }
  };

  // Helper function to get the correct display attribute based on region and language
  const getDisplayAttribute = () => {
    if (itemData.region === "Western") return itemData.en_question;

    if (itemData.region === "Arab") {
      return i18n.language === "ar" && itemData.question
        ? itemData.question
        : itemData.en_question;
    }

    if (itemData.region === "Chinese") {
      return i18n.language === "ch" && itemData.question
        ? itemData.question
        : itemData.en_question;
    }

    return itemData.en_question;
  };

  // Helper function to get the correct display region based on language
  const getDisplayRegion = () => {
    const currentLang = i18n.language;
    if (
      currentLang === "ar" &&
      itemData.region === "Arab" &&
      itemData.region_lan
    ) {
      return itemData.region_lan;
    } else if (
      currentLang === "ch" &&
      itemData.region === "Chinese" &&
      itemData.region_lan
    ) {
      return itemData.region_lan;
    }
    return itemData.region;
  };

  // Helper function to get the correct display topic based on language
  const getDisplayTopic = () => {
    const currentLang = i18n.language;
    if (
      currentLang === "ar" &&
      itemData.region === "Arab" &&
      itemData.topic_lan
    ) {
      return itemData.topic_lan;
    } else if (
      currentLang === "ch" &&
      itemData.region === "Chinese" &&
      itemData.topic_lan
    ) {
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
          shortId: `user_${user.uid.slice(-4)}`,
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
    
    // Basic change handling for all inputs
    setItemData((prevState) => ({
      ...prevState,
      [name]: value,
      showPlaceholderError: false,
    }));
  };

  // Functions for the translation popup
  const handleTranslationConfirm = () => {
    if (!translationData) return;

    // Use the edited translation if provided
    const finalTranslation = editableTranslation || translationData.translation;

    // Continue with the form submission process using finalTranslation
    completeAddProcess(translationData.originalValue, finalTranslation);

    // Clear translation data and close popup
    setShowTranslationPopup(false);
    setTranslationData(null);
    setEditableTranslation("");
  };

  const handleTranslationCancel = () => {
    setShowTranslationPopup(false);
    setTranslationData(null);
    setEditableTranslation("");
  };

  // Handle form submission
  const handleAddClick = async () => {
    // Validate required fields
    if (!itemData.newvalue || !itemData.reason) {
      setItemData((prev) => ({
        ...prev,
        showPlaceholderError: !itemData.newvalue || !itemData.reason,
      }));
      return;
    }
    
    // Validate the language input
    const isValidLanguage = validateLanguageInput(itemData.newvalue, itemData.region);
    if (!isValidLanguage) {
      // Set error message for language validation
      let errorMsg = "";
      if (itemData.region === "Arab") {
        errorMsg = t("errorPopup.invalidLanguage", { language: t("Arabic") }) || 
                  "Please enter text in Arabic or English only.";
      } else if (itemData.region === "Chinese") {
        errorMsg = t("errorPopup.invalidLanguage", { language: t("Chinese") }) || 
                  "Please enter text in Chinese or English only.";
      } else {
        errorMsg = t("errorPopup.englishOnly");
      }
      
      setErrorMessage(errorMsg);
      setShowErrorPopup(true);
      return;
    }

    // Detect input language
    const inputLanguage = detectLanguage(itemData.newvalue);
    let targetLanguage = "en";
    let isTranslationNeeded = false;

    // Determine if translation is needed and the target language
    if (itemData.region === "Arab") {
      targetLanguage = inputLanguage === "ar" ? "en" : "ar";
      isTranslationNeeded = true;
    } else if (itemData.region === "Chinese") {
      targetLanguage = inputLanguage === "zh" ? "en" : "zh";
      isTranslationNeeded = true;
    } else {
      // Western region doesn't need translation
      isTranslationNeeded = false;
    }

    try {
      // Check for duplicates first
      const questionRef = ref(
        realtimeDb,
        `${regionCode}/Details/${detailId}/annotations`
      );
      const snapshot = await get(questionRef);
      let currentQuestionValues = [];

      if (snapshot.exists()) {
        currentQuestionValues = snapshot.val();
      }

      // Check for duplicate values
      let translatedToEnglish = itemData.newvalue;
      try {
        if (inputLanguage !== "en") {
          translatedToEnglish = await translateText(itemData.newvalue, "en");
        }
      } catch (translationError) {
        console.error("Translation error for duplication check:", translationError);
         
      }

      const newValueLower = translatedToEnglish.toLowerCase();

      const existingEnglishValues = currentQuestionValues
        .map((value) => {
          if (value && value.en_values && value.en_values[0]) {
            return value.en_values[0].toLowerCase();
          }
          return "";
        })
        .filter((val) => val !== "");

      if (existingEnglishValues.includes(newValueLower)) {
        setErrorMessage(
          t("errorPopup.duplicateValue", { value: itemData.newvalue })
        );
        setShowErrorPopup(true);
        return;
      }

      // If translation is needed, show the translation popup
      if (isTranslationNeeded) {
        try {
          const translatedText = await translateText(
            itemData.newvalue,
            targetLanguage
          );

          // Determine which is the English value and which is the native value
          let englishValue, nativeValue;
          if (inputLanguage === "en") {
            englishValue = itemData.newvalue;
            nativeValue = translatedText;
          } else {
            englishValue = translatedText;
            nativeValue = itemData.newvalue;
          }

          // Set up translation popup data
          setTranslationData({
            originalValue: itemData.newvalue,
            translation: translatedText,
            inputLanguage,
            targetLanguage,
            englishValue,
            nativeValue,
            reason: itemData.reason,
          });

          setEditableTranslation(translatedText);
          setShowTranslationPopup(true);
        } catch (error) {
          console.error("Translation error:", error);
          setErrorMessage(t("errorPopup.translationFailed"));
          setShowErrorPopup(true);
        }
      } else {
        // No translation needed, proceed with adding the value
        completeAddProcess(itemData.newvalue, itemData.newvalue);
      }
    } catch (error) {
      console.error("Error checking data:", error);
      setErrorMessage(t("errorPopup.updateFailed"));
      setShowErrorPopup(true);
    }
  };

  // Function to complete the add process after translation
  const completeAddProcess = async (englishValue, nativeValue) => {
    try {
      // Get reason translation
      let reasonTranslation = null;
      if (itemData.region === "Arab" || itemData.region === "Chinese") {
        if (itemData.reason === "Variation") {
          reasonTranslation = itemData.region === "Arab" ? "تنوع" : "变化";
        } else if (itemData.reason === "subculture") {
          reasonTranslation =
            itemData.region === "Arab" ? "ثقافة فرعية" : "亚文化";
        }
      }

      // Determine which value is English and which is native
      let finalEnglishValue, finalNativeValue;

      if (itemData.region === "Western") {
        finalEnglishValue = englishValue;
        finalNativeValue = englishValue;
      } else {
        // For Arab or Chinese regions
        const inputLang = detectLanguage(englishValue);
        if (inputLang === "en") {
          finalEnglishValue = englishValue;
          finalNativeValue = nativeValue;
        } else {
          finalEnglishValue = nativeValue;
          finalNativeValue = englishValue;
        }
      }

      // Get the current question's values directly from the database
      const questionRef = ref(
        realtimeDb,
        `${regionCode}/Details/${detailId}/annotations`
      );
      const snapshot = await get(questionRef);
      let currentQuestionValues = [];

      if (snapshot.exists()) {
        currentQuestionValues = snapshot.val();
      }

      // Update annotations in database
      const newAnnotationIndex = currentQuestionValues.length;
      const itemRef = ref(
        realtimeDb,
        `${regionCode}/Details/${detailId}/annotations/${newAnnotationIndex}`
      );
      const newAnnotation = {
        en_values: [finalEnglishValue],
        reason: itemData.reason,
        reason_lan: reasonTranslation,
        user_id: userId.shortId || "user_undefined",
        userId: userId.fullId || "undefined",
        modAction: "noaction",
        values: [finalNativeValue],
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
        value: finalEnglishValue,
        native_value:
          itemData.region === "Arab" || itemData.region === "Chinese"
            ? finalNativeValue
            : null,
        reason: itemData.reason,
        reason_lan: reasonTranslation,
        modAction: "noaction",
      };

      // Remove undefined/null values
      Object.keys(newEntry).forEach(
        (key) =>
          (newEntry[key] === undefined || newEntry[key] === null) &&
          delete newEntry[key]
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
              {Array.isArray(itemData.allValues) &&
                itemData.allValues.map((item, index) => {
                  let displayValues = [];

                  if (item && typeof item === "object") {
                    if (
                      (i18n.language === "ar" && itemData.region === "Arab") ||
                      (i18n.language === "ch" && itemData.region === "Chinese")
                    ) {
                      displayValues = [item.values?.[0] || ""];
                    } else {
                      displayValues = [item.en_values?.[0] || ""];
                    }
                  }

                  return displayValues.map((value, valueIndex) => (
                    <li
                      key={`${index}-${valueIndex}`}
                      className="value-item"
                      dir={i18n.language === "ar" ? "rtl" : "ltr"}
                    >
                      {value}
                    </li>
                  ));
                })}
            </ul>
          </div>

          {/* New Value Input */}
          <div className="add-input">
            <label className="label">{t("form.labels.newValue")}</label>
            <input
              type="text"
              id="newvalue"
              name="newvalue"
              value={itemData.newvalue}
              onChange={handleInputChange}
              placeholder={
                itemData.showPlaceholderError && !itemData.newvalue
                  ? t("form.placeholders.newValueError")
                  : getInputPlaceholder()
              }
              className={
                itemData.showPlaceholderError && !itemData.newvalue
                  ? "error-placeholder"
                  : ""
              }
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
              className={
                itemData.showPlaceholderError && !itemData.reason
                  ? "reason-error-placeholder"
                  : ""
              }
            >
              <option value="" disabled>
                {itemData.showPlaceholderError && !itemData.reason
                  ? t("form.placeholders.reasonError")
                  : t("form.placeholders.reason")}
              </option>
              <option value="Variation">
                {t("form.reasonOptions.variation")}
              </option>
              <option value="subculture">
                {t("form.reasonOptions.subculture")}
              </option>
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

        {/* Translation Popup */}
        {showTranslationPopup && translationData && (
          <div
            className="popup-overlay"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <div
              className="popup-content"
              style={{
                backgroundColor: "#fff",
                padding: "20px",
                borderRadius: "10px",
                width: "600px",
                maxWidth: "90%",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                direction:
                  translationData.targetLanguage === "ar" ? "rtl" : "ltr",
              }}
            >
              <h2
                style={{
                  color: "#333",
                  marginBottom: "20px",
                  textAlign:
                    translationData.targetLanguage === "ar" ? "right" : "left",
                }}
              >
                {t("Review Translations")}
              </h2>

              <div style={{ marginBottom: "15px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontWeight: "bold",
                    textAlign:
                      translationData.targetLanguage === "ar"
                        ? "right"
                        : "left",
                  }}
                >
                  {t("Original Value")}
                </label>
                <div
                  style={{
                    padding: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    backgroundColor: "#f9f9f9",
                    direction:
                      detectLanguage(translationData.originalValue) === "ar"
                        ? "rtl"
                        : "ltr",
                    textAlign:
                      detectLanguage(translationData.originalValue) === "ar"
                        ? "right"
                        : "left",
                  }}
                >
                  {translationData.originalValue}
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontWeight: "bold",
                    textAlign:
                      translationData.targetLanguage === "ar"
                        ? "right"
                        : "left",
                  }}
                >
                  {t("Translated Value")}
                </label>
                <textarea
                  value={editableTranslation}
                  onChange={(e) => setEditableTranslation(e.target.value)}
                  style={{
                    width: "100%",
                    minHeight: "80px",
                    padding: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    resize: "vertical",
                    direction:
                      translationData.targetLanguage === "ar"
                        ? "rtl"
                        : translationData.targetLanguage === "zh"
                        ? "ltr"
                        : "ltr",
                    textAlign:
                      translationData.targetLanguage === "ar"
                        ? "right"
                        : translationData.targetLanguage === "zh"
                        ? "left"
                        : "left",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "20px",
                  marginTop: "25px",
                  flexDirection:
                    translationData.targetLanguage === "ar"
                      ? "row-reverse"
                      : "row",
                }}
              >
                <button
                  onClick={handleTranslationConfirm}
                  style={{
                    padding: "10px 25px",
                    border: "none",
                    borderRadius: "4px",
                    backgroundColor: "#28a745",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "bold",
                  }}
                >
                  {t("Confirm")}
                </button>
                <button
                  onClick={handleTranslationCancel}
                  style={{
                    padding: "10px 25px",
                    border: "none",
                    borderRadius: "4px",
                    backgroundColor: "#dc3545",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "bold",
                  }}
                >
                  {t("Cancel")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
  
  // Helper function to get appropriate input placeholder based on region
  function getInputPlaceholder() {
    if (itemData.region === "Arab") {
      return t("form.placeholders.enterArabicOrEnglish") || "Enter value in Arabic or English";
    } else if (itemData.region === "Chinese") {
      return t("form.placeholders.enterChineseOrEnglish") || "Enter value in Chinese or English";
    } else {
      return t("form.placeholders.newValue");
    }
  }
};

export default AddCultureValue;