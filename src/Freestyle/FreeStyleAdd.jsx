import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaEdit, FaSave, FaPlus, FaCheck } from "react-icons/fa";
import "./FreeStyleAdd.css";
import { ref, onValue, push, update, get, set } from "firebase/database";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { realtimeDb, auth, db } from "../Register/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import { Footer } from "../Footer/Footer";

const FreeStyleAdd = () => {
  const navigate = useNavigate();
  const [chatData, setChatData] = useState(null);
  const [topics, setTopics] = useState([]);
  const [expandedAnswers, setExpandedAnswers] = useState({});
  const [editing, setEditing] = useState({});
  const [editedAnswers, setEditedAnswers] = useState({});
  const [selectedEvaluation, setSelectedEvaluation] = useState("Fully Correct");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [userRegion, setUserRegion] = useState("");
  const [reasonValues, setReasonValues] = useState({});
  const [disabledButtons, setDisabledButtons] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [editedConversations, setEditedConversations] = useState({});
  const [showTranslationPopup, setShowTranslationPopup] = useState(false);
  const [translationData, setTranslationData] = useState(null);
  
  // Changed to match second file - using single editable fields
  const [editableQuestion, setEditableQuestion] = useState("");
  const [editableAnswer, setEditableAnswer] = useState("");

  const { t, i18n } = useTranslation("FreeStyleAdd");
  const isRTL = i18n.dir() === "rtl";
  const MAX_EDIT_LENGTH = 50;

  function handlePopupError(message) {
    const popupBackground = document.createElement("div");
    popupBackground.style.position = "fixed";
    popupBackground.style.top = "0";
    popupBackground.style.left = "0";
    popupBackground.style.width = "100%";
    popupBackground.style.height = "100%";
    popupBackground.style.backgroundColor = "rgba(0,0,0,0.3)";
    popupBackground.style.display = "flex";
    popupBackground.style.alignItems = "center";
    popupBackground.style.justifyContent = "center";
    popupBackground.style.zIndex = "1000";

    const popup = document.createElement("div");
    popup.style.backgroundColor = "#fff";
    popup.style.padding = "30px";
    popup.style.borderRadius = "8px";
    popup.style.textAlign = "center";
    popup.style.color = "red";
    popup.style.fontFamily = "Arial, sans-serif";

    const title = document.createElement("h2");
    title.innerText = t("Warning!");
    title.style.marginBottom = "20px";
    title.style.color = "crimson";

    const messageText = document.createElement("p");
    messageText.innerText = message;
    messageText.style.marginBottom = "20px";
    messageText.style.fontSize = "18px";
    messageText.style.color = "crimson";

    const okButton = document.createElement("button");
    okButton.innerText = t("OK");
    okButton.style.backgroundColor = "crimson";
    okButton.style.color = "white";
    okButton.style.border = "none";
    okButton.style.padding = "10px 20px";
    okButton.style.fontSize = "16px";
    okButton.style.borderRadius = "6px";
    okButton.style.cursor = "pointer";

    okButton.onclick = () => {
      document.body.removeChild(popupBackground);
    };

    popup.appendChild(title);
    popup.appendChild(messageText);
    popup.appendChild(okButton);
    popupBackground.appendChild(popup);
    document.body.appendChild(popupBackground);
  }

  const handlePopup = (message) => {
    const popupBackground = document.createElement("div");
    popupBackground.style.position = "fixed";
    popupBackground.style.top = "0";
    popupBackground.style.left = "0";
    popupBackground.style.width = "100%";
    popupBackground.style.height = "100%";
    popupBackground.style.backgroundColor = "rgba(0,0,0,0.3)";
    popupBackground.style.display = "flex";
    popupBackground.style.alignItems = "center";
    popupBackground.style.justifyContent = "center";
    popupBackground.style.zIndex = "1000";

    const popup = document.createElement("div");
    popup.style.backgroundColor = "#fff";
    popup.style.color = "#28a745";
    popup.style.padding = "20px";
    popup.style.borderRadius = "10px";
    popup.style.width = "300px";
    popup.style.textAlign = "center";
    popup.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
    popup.style.position = "fixed";
    popup.style.top = "50%";
    popup.style.left = "50%";
    popup.style.transform = "translate(-50%, -50%)";
    popup.style.zIndex = "1000";

    const icon = document.createElement("div");
    icon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="#28a745">
        <circle cx="12" cy="12" r="10" fill="#28a745"/>
        <path d="M16 9l-5.5 5.5L8 12" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    icon.style.marginBottom = "15px";

    const title = document.createElement("h2");
    title.innerText = "Success";
    title.style.marginBottom = "15px";
    title.style.color = "#28a745";

    const messageText = document.createElement("p");
    messageText.innerText = message;
    messageText.style.marginBottom = "20px";
    messageText.style.fontSize = "18px";
    messageText.style.color = "#28a745";

    popup.appendChild(icon);
    popup.appendChild(title);
    popup.appendChild(messageText);

    popupBackground.appendChild(popup);

    document.body.appendChild(popupBackground);

    setTimeout(() => {
      document.body.removeChild(popupBackground);
    }, 3000);
  };

  const detectLanguage = (text) => {
    if (!text || text.trim().length === 0) return "en";
    const arabicPattern = /[\u0600-\u06FF]/;
    const chinesePattern = /[\u4e00-\u9fa5]/;

    if (arabicPattern.test(text)) return "ar";
    if (chinesePattern.test(text)) return "zh";
    return "en";
  };

  const translateText = async (text, targetLanguage) => {
    try {
      if (!text || text.trim().length === 0) {
        console.log("Skipping translation for empty text:", text);
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
      return text; // Return original text if translation fails
    }
  };
  
  // Modified to store native language based on user region
  // Modified to ensure en_question is always in English
const handleTranslationConfirm = async () => {
  if (!translationData) return;

  try {
    const {
      index, regionPrefix, originalQuestion, originalAnswer, englishQuestion, englishAnswer,
      translatedQuestion, translatedAnswer, databasePath, evaluationEntry, newEntryKey, 
      reason, topicLang, reasonLang, regionLan
    } = translationData;
  
    // Determine the appropriate native language for question and answer based on region
    let finalQuestion, finalAnswer;
    
    if (regionPrefix === "Arab") {
      // For Arab region: use Arabic as the native language
      finalQuestion = detectLanguage(originalQuestion) === "ar" 
        ? originalQuestion 
        : translatedQuestion || "";
        
      // Same for answer
      finalAnswer = detectLanguage(originalAnswer) === "ar" 
        ? originalAnswer 
        : translatedAnswer || "";
    } else if (regionPrefix === "Chinese") {
      // For Chinese region: use Chinese as the native language
      finalQuestion = detectLanguage(originalQuestion) === "zh" 
        ? originalQuestion 
        : translatedQuestion || "";
        
      finalAnswer = detectLanguage(originalAnswer) === "zh" 
        ? originalAnswer 
        : translatedAnswer || "";
    } else {
      // For Western region: use English as the native language
      finalQuestion = detectLanguage(originalQuestion) === "en" 
        ? originalQuestion 
        : englishQuestion || "";
        
      finalAnswer = detectLanguage(originalAnswer) === "en" 
        ? originalAnswer 
        : englishAnswer || "";
    }
    
    // IMPORTANT: en_question should ALWAYS be the English version, regardless of the edited value
    // Using the automatically translated englishQuestion instead of editableQuestion
    const finalEnQuestion = englishQuestion || "";
    const finalEnAnswer = editableAnswer || "";
  
    const newEntry = {
      region_name: userRegion,
      region_lan: regionLan,
      region_id: `${regionPrefix}_0`,
      cultur_val_ID: `${regionPrefix}-en-${Date.now().toString().slice(-2)}`,
      en_question: finalEnQuestion, // Always English version
      question: finalQuestion, // Native language based on region
      topic: selectedTopic,
      topic_lan: topicLang || selectedTopic,
      annotations: [
        {
          en_values: [englishAnswer], // Always English version
          values: [finalAnswer], // Native language based on region
          reason: reason,
          reason_lan: reasonLang || reason,
          user_id: `user_${auth.currentUser.uid.slice(-4)}`,
        },
      ],
    };
  
    console.log("Saving entry with translations:", {
      path: databasePath,
      index: newEntryKey,
      en_question: finalEnQuestion, // Always English
      question: finalQuestion, // Native language
      en_values: [englishAnswer], // Always English
      values: [finalAnswer] // Native language
    });
  
    const evaluationRef = ref(realtimeDb, "model_evaluation");
    await push(evaluationRef, evaluationEntry);
  
    const entryRef = ref(realtimeDb, `${databasePath}/${newEntryKey}`);
    await set(entryRef, newEntry);
  
    handlePopup(t("Entry added successfully!"));
    setDisabledButtons(prev => ({ ...prev, [index]: true }));
  } catch (error) {
    console.error("Error saving data:", error);
    handlePopupError(t("An error occurred. Please try again."));
  } finally {
    setShowTranslationPopup(false);
    setTranslationData(null);
    setEditableQuestion("");
    setEditableAnswer("");
  }
};

  const handleTranslationCancel = () => {
    setShowTranslationPopup(false);
    setTranslationData(null);
    setEditableQuestion("");
    setEditableAnswer("");
  };

  useEffect(() => {
    const storedData = localStorage.getItem("lastChatMessages");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log("📌 Stored Data:", parsedData);
        setChatData(parsedData);
      } catch (error) {
        console.error("Error parsing chat data:", error);
      }
    }

    fetchTopics();
  }, []);

  const handleReasonChange = (rowIndex, value) => {
    setReasonValues((prev) => ({ ...prev, [rowIndex]: value }));
  };

  const fetchTopics = async () => {
    try {
      const rootRef = ref(realtimeDb);
      const snapshot = await get(rootRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        let allTopics = new Set();

        Object.keys(data).forEach((cuisine) => {
          if (data[cuisine].Details) {
            const detailsArray = Array.isArray(data[cuisine].Details)
              ? data[cuisine].Details
              : Object.values(data[cuisine].Details);

            detailsArray.forEach((item) => {
              if (item?.topic) {
                allTopics.add(item.topic);
              }
            });
          }
        });

        if (!allTopics.has("greeting")) {
          allTopics.add("greeting");
        }

        const topicsArray = Array.from(allTopics);
        setTopics(topicsArray);
        if (topicsArray.length > 0) {
          setSelectedTopic(topicsArray[0]);
        }
      } else {
        setTopics(["greeting"]);
      }
    } catch (error) {
      console.error("Error retrieving topics:", error);
    }
  };

  const toggleExpand = (key) => {
    setExpandedAnswers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleEdit = (model, index) => {
    const conversation = chatData.conversations[index];
    const answerToEdit =
      model === "A" ? conversation.modelA : conversation.modelB;

    setEditing({ model, index });
    setEditedAnswers((prev) => ({
      ...prev,
      [model]: answerToEdit,
    }));
  };

  const handleChange = (e, model) => {
    const value = e.target.value;
    const originalText =
      chatData.conversations[editing.index][
        model === "A" ? "modelA" : "modelB"
      ] || "";

    if (value.length <= originalText.length + MAX_EDIT_LENGTH) {
      setEditedAnswers((prev) => ({ ...prev, [model]: value }));
    }
  };

  const handleSave = (model, index) => {
    const updatedChatData = { ...chatData };
    const modelKey = model === "A" ? "modelA" : "modelB";

    updatedChatData.conversations = updatedChatData.conversations.map(
      (convo, i) => {
        if (i === index) {
          return {
            ...convo,
            [modelKey]: editedAnswers[model],
          };
        }
        return convo;
      }
    );

    setChatData(updatedChatData);
    setEditing({});

    localStorage.setItem("lastChatMessages", JSON.stringify(updatedChatData));

    setEditedConversations((prev) => ({
      ...prev,
      [index]: true,
    }));
  };

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          setUserRegion(userDocSnap.data().region || "Unknown");
        } else {
          const altUserDocRef = doc(db, "Users", user.uid);
          const altUserDocSnap = await getDoc(altUserDocRef);

          if (altUserDocSnap.exists()) {
            setUserRegion(altUserDocSnap.data().region || "Unknown");
          }
        }
      }
    });
  }, []);
  
  // Modified to show translations based on region language
  const handleAddToDB = async (index) => {
    if (!chatData || !chatData.conversations || !auth.currentUser) return;

    const conversation = chatData.conversations[index];
    if (!conversation || !conversation.question) {
      console.error("Invalid conversation data at index", index, conversation);
      handlePopupError(t("Invalid conversation data. Please try again."));
      return;
    }

    let originalAnswer;

    if (chatData.selectedModel === "Model A") {
      originalAnswer =
        editing.model === "A" && editing.index === index
          ? editedAnswers.A
          : conversation.modelA;
    } else if (chatData.selectedModel === "Model B") {
      originalAnswer =
        editing.model === "B" && editing.index === index
          ? editedAnswers.B
          : conversation.modelB;
    } else {
      originalAnswer = `${
        editing.model === "A" && editing.index === index
          ? editedAnswers.A
          : conversation.modelA
      } | ${
        editing.model === "B" && editing.index === index
          ? editedAnswers.B
          : conversation.modelB
      }`;
    }

    if (originalAnswer && originalAnswer.length > 50) {
      if (!editedConversations[index]) {
        handlePopupError(t("You must edit the answer before adding"));
        return;
      }
    } else {
      setEditedConversations((prev) => ({
        ...prev,
        [index]: true,
      }));
    }

    if (!userRegion || userRegion === "Unknown") {
      handlePopupError(
        t("User region unknown. Please complete your profile first.")
      );
      return;
    }

    if (!selectedTopic || selectedTopic === "") {
      handlePopupError(t("Please select a topic before adding."));
      return;
    }

    if (!selectedEvaluation || selectedEvaluation === "") {
      handlePopupError(
        t("Please select an overall LLM evaluation before adding.")
      );
      return;
    }

    if (!reasonValues[index] || reasonValues[index] === "") {
      handlePopupError(t("Please select a reason before adding."));
      return;
    }

    if (
      !originalAnswer ||
      (editing.model === "A" && editing.index === index && !editedAnswers.A) ||
      (editing.model === "B" && editing.index === index && !editedAnswers.B)
    ) {
      handlePopupError(t("You must provide an answer before adding."));
      return;
    }

    try {
      const regionPrefix = userRegion.replace(/[0-9C]+$/, "");

      // Detect languages of input text
      const questionLang = detectLanguage(conversation.question);
      const answerLang = detectLanguage(originalAnswer);
      
      // Initialize variables for translations
      let englishQuestion, translatedQuestion, questionTargetLang;
      let englishAnswer, translatedAnswer, answerTargetLang;

      // Determine translation target languages based on region
      if (regionPrefix === "Arab") {
        questionTargetLang = questionLang === "ar" ? "en" : "ar";
        answerTargetLang = answerLang === "ar" ? "en" : "ar";
      } else if (regionPrefix === "Chinese") {
        questionTargetLang = questionLang === "zh" ? "en" : "zh";
        answerTargetLang = answerLang === "zh" ? "en" : "zh";
      } else {
        questionTargetLang = "en";
        answerTargetLang = "en";
      }

      console.log("Translation targets:", {
        questionLang,
        questionTargetLang,
        answerLang,
        answerTargetLang
      });

      // Perform translations
      try {
        // Question translation
        if (questionLang === "en") {
          englishQuestion = conversation.question;
          if (regionPrefix !== "Western") {
            translatedQuestion = await translateText(conversation.question, questionTargetLang);
          } else {
            translatedQuestion = conversation.question;
          }
        } else {
          translatedQuestion = conversation.question; // Keep original non-English
          englishQuestion = await translateText(conversation.question, "en");
        }

        // Answer translation
        if (answerLang === "en") {
          englishAnswer = originalAnswer;
          if (regionPrefix !== "Western") {
            translatedAnswer = await translateText(originalAnswer, answerTargetLang);
          } else {
            translatedAnswer = originalAnswer;
          }
        } else {
          translatedAnswer = originalAnswer; // Keep original non-English
          englishAnswer = await translateText(originalAnswer, "en");
        }

        console.log("Translation results:", {
          originalQuestion: conversation.question,
          englishQuestion,
          translatedQuestion,
          originalAnswer,
          englishAnswer,
          translatedAnswer
        });
      } catch (translationError) {
        console.error("Translation error:", translationError);
        handlePopupError(t("Translation service is unavailable. Translations can be edited in the next step."));
        
        // Handle translation failures gracefully
        if (!englishQuestion) englishQuestion = conversation.question;
        if (!translatedQuestion) translatedQuestion = conversation.question;
        if (!englishAnswer) englishAnswer = originalAnswer;
        if (!translatedAnswer) translatedAnswer = originalAnswer;
      }
      
      // Determine database path based on region
      let databasePath;
      if (regionPrefix === "Arab") {
        databasePath = "ArabC/Details";
      } else if (regionPrefix === "Chinese") {
        databasePath = "ChineseC/Details";
      } else {
        databasePath = "WesternC/Details";
      }
      
      // Check for duplicates in database
      const detailsRef = ref(realtimeDb, databasePath);
      const detailsSnapshot = await get(detailsRef);
      
      let isDuplicate = false;
      let existingData = [];
      let nextIndex = 0;
      
      if (detailsSnapshot.exists()) {
        const details = detailsSnapshot.val();
        
        if (Array.isArray(details)) {
          existingData = details;
          nextIndex = details.length;
        } else {
          existingData = Object.values(details);
          
          const numericKeys = Object.keys(details)
            .filter(key => !isNaN(parseInt(key)))
            .map(key => parseInt(key));
          
          nextIndex = numericKeys.length > 0 ? Math.max(...numericKeys) + 1 : 0;
        }
        
        for (const entry of existingData) {
          if (
            entry && 
            entry.region_name && 
            entry.region_name.startsWith(regionPrefix) &&
            entry.en_question === englishQuestion
          ) {
            if (entry.annotations && entry.annotations.length > 0) {
              for (const annotation of entry.annotations) {
                if (
                  annotation.en_values && 
                  annotation.en_values.some(val => val === englishAnswer)
                ) {
                  isDuplicate = true;
                  break;
                }
              }
            }
            
            if (isDuplicate) break;
          }
        }
      }
      
      if (isDuplicate) {
        handlePopupError(t("This question and answer already exist in the database for your region."));
        return;
      }
      
      // Prepare evaluation entry
      const evaluationEntry = {
        model_id: chatData.selectedModel || "Both",
        user_id: auth.currentUser.uid,
        vote_label:
          selectedEvaluation === "Fully Correct"
            ? 1
            : selectedEvaluation === "Partially Correct"
            ? 2
            : selectedEvaluation === "Poor"
            ? 3
            : 4,
        topic: selectedTopic,
        user_region: userRegion,
        reason: reasonValues[index] ?? "not_specified",
        timestamp: new Date().toISOString(),
      };
      
      // Get translations for reason and region
      const reasonTranslations = {
        "ar": {
          "variation": "اختلاف",
          "subculture": "ثقافة فرعية"
        },
        "zh": {
          "variation": "变化",
          "subculture": "亚文化"
        }
      };
      
      const regionLan = regionPrefix === "Arab" ? "العرب" : 
                       regionPrefix === "Chinese" ? "中国" : regionPrefix;
      
      const topicTranslations = {
        "ar": {
          "Food": "الطعام",
          "Education": "تعليم",
          "Work life": "حياة العمل",
          "Sport": "رياضة",
          "Holidays/Celebration/Leisure": "عطلة",
          "Family": "عائلة",
          "greeting": "تحية"
        },
        "zh": {
          "Food": "食物",
          "Education": "教育",
          "Work life": "工作生活",
          "Sport": "运动",
          "Holidays/Celebration/Leisure": "节日/庆祝/休闲",
          "Family": "家庭",
          "greeting": "问候"
        }
      };
      
      const reason = reasonValues[index] || "variation";
      const reasonLang = regionPrefix === "Arab" ? reasonTranslations.ar[reason] :
                        regionPrefix === "Chinese" ? reasonTranslations.zh[reason] : reason;
      const topicLang = regionPrefix === "Arab" ? topicTranslations.ar[selectedTopic] :
                       regionPrefix === "Chinese" ? topicTranslations.zh[selectedTopic] : selectedTopic;
      
      // Set up data for translation popup
      setTranslationData({
        index,
        regionPrefix,
        originalQuestion: conversation.question,
        originalAnswer,
        englishQuestion,
        englishAnswer,
        translatedQuestion,
        translatedAnswer,
        questionTargetLang,
        answerTargetLang,
        databasePath,
        evaluationEntry,
        newEntryKey: nextIndex.toString(),
        reason,
        topicLang,
        reasonLang,
        regionLan
      });
      
      // Set initial values for editable fields in the popup
      // Modified to show translations based on region
      if (regionPrefix === "Arab") {
        // For Arab region: if question is in English, show the Arabic translation in editable field
        setEditableQuestion(questionLang === "en" ? translatedQuestion || "" : englishQuestion || "");
        
        // For answer: if original is in English, show Arabic translation; otherwise show English translation
        setEditableAnswer(answerLang === "en" ? translatedAnswer || "" : englishAnswer || "");
      } else if (regionPrefix === "Chinese") {
        // For Chinese region: if question is in English, show the Chinese translation in editable field
        setEditableQuestion(questionLang === "en" ? translatedQuestion || "" : englishQuestion || "");
        
        // For answer: if original is in English, show Chinese translation; otherwise show English translation
        setEditableAnswer(answerLang === "en" ? translatedAnswer || "" : englishAnswer || "");
      } else {
        // For Western region, everything is in English
        setEditableQuestion(questionLang === "en" ? translatedQuestion || "" : englishQuestion || "");
        setEditableAnswer(answerLang === "en" ? translatedAnswer || "" : englishAnswer || "");
      }
      
      // Show the translation popup
      setShowTranslationPopup(true);

    } catch (error) {
      console.error("Error checking or adding data:", error);
      handlePopupError(t("An error occurred. Please try again."));
    }
  };
  
  if (!chatData || !chatData.conversations) {
    return (
      <div className="freestyle-add-page" dir={isRTL ? "rtl" : "ltr"}>
        <Helmet>
          <title>{t("FreeStyleAdd")}</title>
          <meta
            name="description"
            content="Add comparison results for model conversations"
          />
        </Helmet>
        <div className="freestyle-page-header">
          <button className="freestyle-back-btn" onClick={() => navigate(-1)}>
            <FaArrowLeft className="freestyle-back-icon" />
          </button>
        </div>
        <h1 className="header-title">{t("Add Conversation")}</h1>
        <div className="no-data">
          <p>{t("No chat data found. Please compare models first.")}</p>
          <button
            className="back-to-chat-btn"
            onClick={() => navigate("/freestyle")}
          >
            {t("Go to Chat Page")}
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="freestyle-add-page" dir={isRTL ? "rtl" : "ltr"}>
      <Helmet>
        <title>{t("FreeStyleAdd")}</title>
        <meta
          name="description"
          content="Add comparison results for model conversations"
        />
      </Helmet>

      <div className="freestyle-page-header">
        <button
          className="Done-button"
          onClick={() => navigate("/LensLeaderBoard")}
        >
          Done
        </button>
        <button className="freestyle-back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft className="freestyle-back-icon" />
        </button>
      </div>
      <div className="freestyle-header">
        <h1 className="header-title">{t("Add Conversation")}</h1>
        <h2 className="freestyle-title">
          {t("YourVoting")}{" "}
          {t(chatData.selectedModel === "Model A" ? "modelA" : "modelB") ||
            t("Not Selected")}
        </h2>
        <div className="model-info">
          <h5>{t("Model A: Mistral-7B")}</h5>
          <h5>{t("Model B: Llama-2-7B")}</h5>
        </div>
      </div>
      <div className="column-table-container">
        <table className="column-table">
          <thead>
            <tr>
              <th className="question-col">{t("Attribute")}</th>
              <th className="answer-col">{t("Value")}</th>
              <th className="topic-col">{t("Topic")}</th>
              <th className="eval-col">{t("Overall LLM Evaluation")}</th>
              <th className="reason-col">{t("Reason")}</th>
              <th className="add-col">{t("Add")}</th> 
            </tr>
          </thead>
          <tbody>
            {chatData.conversations.map((conversation, index) => (
              <tr key={index}>
                <td className="question-cell">
                  <div className="content-wrapper">{conversation.question}</div>
                </td>
                <td className="answer-cell">
                  {(chatData.selectedModel === "Model A" ||
                    chatData.selectedModel === "Both") && (
                    <>
                      <div className="model-label">
                        {t("Model A (Mistral-7B)")}
                      </div>
                      <div className="content-wrapper">
                        {editing.model === "A" && editing.index === index ? (
                          <div className="edit-container">
                            <textarea
                              value={editedAnswers.A}
                              onChange={(e) => handleChange(e, "A")}
                              className="edit-textarea"
                              maxLength={MAX_EDIT_LENGTH}
                            />
                            <div className="character-counter">
                              {editedAnswers.A ? editedAnswers.A.length : 0}/
                              {MAX_EDIT_LENGTH}
                            </div>
                            <button
                              className="icon-btn save-btn"
                              onClick={() => handleSave("A", index)}
                            >
                              <FaSave />
                            </button>
                          </div>
                        ) : (
                          <div className="answer-container">
                            <div className="answer-text">
                              {expandedAnswers[`A-${index}`]
                                ? conversation.modelA || "No answer"
                                : `${
                                    conversation.modelA
                                      ? conversation.modelA.length > 150
                                        ? conversation.modelA.substring(
                                            0,
                                            150
                                          ) + "..."
                                        : conversation.modelA
                                      : "No answer"
                                  }`}
                            </div>
                            <div className="answer-controls">
                              {conversation.modelA &&
                                conversation.modelA.length > 150 && (
                                  <button
                                    className="see-more-btn"
                                    onClick={() => toggleExpand(`A-${index}`)}
                                  >
                                    {expandedAnswers[`A-${index}`]
                                      ? t("Show Less")
                                      : t("Show More")}
                                  </button>
                                )}
                              <button
                                className="icon-btn edit-btn"
                                onClick={() => handleEdit("A", index)}
                              >
                                <FaEdit />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  {(chatData.selectedModel === "Model B" ||
                    chatData.selectedModel === "Both") && (
                    <>
                      <div className="model-label">
                        {t("Model B (Llama-2-7B)")}
                      </div>
                      <div className="content-wrapper">
                        {editing.model === "B" && editing.index === index ? (
                          <div className="edit-container">
                            <textarea
                              value={editedAnswers.B}
                              onChange={(e) => handleChange(e, "B")}
                              className="edit-textarea"
                              maxLength={MAX_EDIT_LENGTH}
                            />
                            <div className="character-counter">
                              {editedAnswers.B ? editedAnswers.B.length : 0}/
                              {MAX_EDIT_LENGTH}
                            </div>
                            <button
                              className="icon-btn save-btn"
                              onClick={() => handleSave("B", index)}
                            >
                              <FaSave />
                            </button>
                          </div>
                        ) : (
                          <div className="answer-container">
                            <div className="answer-text">
                              {expandedAnswers[`B-${index}`]
                                ? conversation.modelB || "No answer"
                                : `${
                                    conversation.modelB
                                      ? conversation.modelB.length > 150
                                        ? conversation.modelB.substring(
                                            0,
                                            150
                                          ) + "..."
                                        : conversation.modelB
                                      : "No answer"
                                  }`}
                            </div>
                            <div className="answer-controls">
                              {conversation.modelB &&
                                conversation.modelB.length > 150 && (
                                  <button
                                    className="see-more-btn"
                                    onClick={() => toggleExpand(`B-${index}`)}
                                  >
                                    {expandedAnswers[`B-${index}`]
                                      ? t("Show Less")
                                      : t("Show More")}
                                  </button>
                                )}
                              <button
                                className="icon-btn edit-btn"
                                onClick={() => handleEdit("B", index)}
                              >
                                <FaEdit />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </td>
                <td className="topic-cell">
                  <select
                    className="table-select topic-select"
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                  >
                    <option value="" disabled>
                      {t("Select Topic")}
                    </option>
                    {topics.length > 0 ? (
                      topics.map((topic, idx) => (
                        <option key={idx} value={topic}>
                          {t(`topics.${topic}`)}
                        </option>
                      ))
                    ) : (
                      <option value="">{t("No topics available")}</option>
                    )}
                  </select>
                </td>
                <td className="eval-cell">
                  <select
                    className="table-select evaluation-select"
                    value={selectedEvaluation}
                    onChange={(e) => setSelectedEvaluation(e.target.value)}
                  >
                    <option value="" disabled>
                      {t("Select Overall Evaluation")}
                    </option>
                    <option value="Fully Correct">{t("Fully Correct")}</option>
                    <option value="Partially Correct">
                      {t("Partially Correct")}
                    </option>
                    <option value="Poor">{t("Poor")}</option>
                    <option value="None">{t("None")}</option>
                  </select>
                </td>
                <td className="reason-cell">
                  <select
                    className="table-select reason-select"
                    value={reasonValues[index] || ""}
                    onChange={(e) => handleReasonChange(index, e.target.value)}
                  >
                    <option value="" disabled>
                      {t("Select Reason")}
                    </option>
                    <option value="variation">{t("Variation")}</option>
                    <option value="subculture">{t("Subculture")}</option>
                  </select>
                </td>
                <td className="add-cell">
                  <button
                    className={`add-btn ${
                      disabledButtons[index] ? "disabled-btn" : ""
                    }`}
                    onClick={() => handleAddToDB(index)}
                    disabled={disabledButtons[index]}
                  >
                    {disabledButtons[index] ? (
                      <FaCheck className="add-icon" />
                    ) : (
                      <FaPlus className="add-icon" />
                    )}
                    <span>{t("Add")}</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <p>{popupMessage}</p>
            <button onClick={() => setShowPopup(false)}>{t("OK")}</button>
          </div>
        </div>
      )}
      
      {/* Translation popup - Modified to work with native language storage */}
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
              direction: i18n.language === "ar" ? "rtl" : "ltr",
              textAlign: i18n.language === "ar" ? "right" : "left"
            }}
          >
            <h2
              style={{
                color: "#333",
                marginBottom: "20px"
              }}
            >
              {t("Review Translations")}
            </h2>

            {/* Original Question Section */}
            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold"
                }}
              >
                {t("Original Question")}
              </label>
              <div
                style={{
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  backgroundColor: "#f9f9f9",
                  direction:
                    detectLanguage(translationData.originalQuestion) === "ar"
                      ? "rtl"
                      : "ltr",
                  textAlign:
                    detectLanguage(translationData.originalQuestion) === "ar"
                      ? "right"
                      : "left"
                }}
              >
                {translationData.originalQuestion || "No question available"}
              </div>
            </div>

            {/* Translated Question Section */}
            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold"
                }}
              >
                {t("Translated Question")}
              </label>
              <textarea
                value={editableQuestion}
                onChange={(e) => setEditableQuestion(e.target.value)}
                style={{
                  width: "100%",
                  minHeight: "80px",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  resize: "vertical",
                  direction:
                    translationData.questionTargetLang === "ar"
                      ? "rtl"
                      : "ltr",
                  textAlign:
                    translationData.questionTargetLang === "ar"
                      ? "right"
                      : "left"
                }}
              />
            </div>

            {/* Original Answer Section */}
            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold"
                }}
              >
                {t("Original Answer")}
              </label>
              <div
                style={{
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  backgroundColor: "#f9f9f9",
                  direction:
                    detectLanguage(translationData.originalAnswer) === "ar"
                      ? "rtl"
                      : "ltr",
                  textAlign:
                    detectLanguage(translationData.originalAnswer) === "ar"
                      ? "right"
                      : "left"
                }}
              >
                {translationData.originalAnswer || "No answer available"}
              </div>
            </div>

            {/* Translated Answer Section */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold"
                }}
              >
                {t("Translated Answer")}
              </label>
              <textarea
                value={editableAnswer}
                onChange={(e) => setEditableAnswer(e.target.value)}
                style={{
                  width: "100%",
                  minHeight: "80px",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  resize: "vertical",
                  direction:
                    translationData.answerTargetLang === "ar"
                      ? "rtl"
                      : "ltr",
                  textAlign:
                    translationData.answerTargetLang === "ar"
                      ? "right"
                      : "left"
                }}
              />
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "20px",
                marginTop: "25px",
                flexDirection: i18n.language === "ar" ? "row-reverse" : "row"
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
                  fontWeight: "bold"
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
                  fontWeight: "bold"
                }}
              >
                {t("Cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default FreeStyleAdd;