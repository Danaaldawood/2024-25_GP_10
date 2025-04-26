import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEdit, FaSave, FaPlus } from 'react-icons/fa';
import "./FreeStyleAdd.css";
import { ref, onValue, push, update, get, set } from "firebase/database";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { realtimeDb, auth, db } from '../Register/firebase';
import { onAuthStateChanged } from "firebase/auth";
import { FaCheck } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
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
  // New state to track which answers have been edited
  const [editedConversations, setEditedConversations] = useState({});
 
  const handlePopup = (message) => {
    setPopupMessage(message);
    setShowPopup(true);
  };
  const { t, i18n } = useTranslation('FreeStyleAdd');
  const isRTL = i18n.dir() === 'rtl';
  const MAX_EDIT_LENGTH = 50;  

  // Fetch chat data from localStorage once on component mount
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

  // Fetch topics from Firebase database
  const fetchTopics = async () => {
    try {
      const rootRef = ref(realtimeDb);
      const snapshot = await get(rootRef);
  
      if (snapshot.exists()) {
        const data = snapshot.val();
        let allTopics = new Set();
  
        Object.keys(data).forEach(cuisine => {
          if (data[cuisine].Details) {
            const detailsArray = Array.isArray(data[cuisine].Details)
              ? data[cuisine].Details
              : Object.values(data[cuisine].Details);
  
            detailsArray.forEach(item => {
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
  
  // Handle expansion of answer content (Model A / B)
  const toggleExpand = (key) => {
    setExpandedAnswers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Start editing the model answer
  const handleEdit = (model, index) => {
    // Get the current conversation
    const conversation = chatData.conversations[index];
    const answerToEdit = model === 'A' ? conversation.modelA : conversation.modelB;
    
    setEditing({ model, index });
    setEditedAnswers(prev => ({
      ...prev,
      [model]: answerToEdit
    }));
  };
  
  // Handle the change in answer while editing
  const handleChange = (e, model) => {
    const value = e.target.value;
    const originalText = chatData.conversations[editing.index][model === 'A' ? 'modelA' : 'modelB'] || '';
  
    if (value.length <= originalText.length + MAX_EDIT_LENGTH) {
      setEditedAnswers(prev => ({ ...prev, [model]: value }));
    }
  };
  
  // Save the edited answer
  const handleSave = (model, index) => {
    const updatedChatData = { ...chatData };
    const modelKey = model === 'A' ? 'modelA' : 'modelB';
    
    // Create a new conversations array with the updated answer
    updatedChatData.conversations = updatedChatData.conversations.map((convo, i) => {
      if (i === index) {
        return {
          ...convo,
          [modelKey]: editedAnswers[model]
        };
      }
      return convo;
    });
    
    setChatData(updatedChatData);
    setEditing({});
    
    localStorage.setItem("lastChatMessages", JSON.stringify(updatedChatData));
    
    // Mark this conversation as edited
    setEditedConversations(prev => ({
      ...prev,
      [index]: true
    }));
  };

  // Retrieve user region from Firestore
  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          setUserRegion(userDocSnap.data().region || "Unknown");
        } else {
          // Try alternative collection name
          const altUserDocRef = doc(db, "Users", user.uid);
          const altUserDocSnap = await getDoc(altUserDocRef);
          
          if (altUserDocSnap.exists()) {
            setUserRegion(altUserDocSnap.data().region || "Unknown");
          }
        }
      }
    });
  }, []);
  
  // Function to detect language
  const detectLanguage = (text) => {
    // Simple language detection based on character ranges
    const arabicPattern = /[\u0600-\u06FF]/;
    const chinesePattern = /[\u4e00-\u9fa5]/;
    
    if (arabicPattern.test(text)) return 'ar';
    if (chinesePattern.test(text)) return 'zh';
    return 'en'; // Default to English
  };

  // Function to translate text using OpenAI API
  const translateText = async (text, targetLanguage) => {
    try {
      const detectedLanguage = detectLanguage(text);
      // If already in target language, return original
      if (detectedLanguage === targetLanguage) return text;
      
      const languageMap = {
        'ar': 'Arabic',
        'zh': 'Chinese',
        'en': 'English'
      };
      
      // Using the official OpenAI API endpoint
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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'
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {"role": "system", "content": `You are a professional translator. Translate the following ${languageMap[detectedLanguage]} text to ${languageMap[targetLanguage]}. Provide only the translation, no explanations.`},
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
      return text; // Return original text if translation fails
    }
  };

  const handleAddToDB = async (index) => {
    if (!chatData || !chatData.conversations || !auth.currentUser) return;
    
    // Check if the conversation has been edited
    if (!editedConversations[index]) {
      handlePopup("⚠️ You must edit the answer before adding");
      return;
    }
    
    if (!userRegion || userRegion === "Unknown") {
      handlePopup("⚠️ User region unknown. Please complete your profile first.");
      return;
    }
  
    const conversation = chatData.conversations[index];
    const question = conversation.question;
    
    let answerContent;
    if (chatData.selectedModel === "Model A") {
      answerContent = editing.model === 'A' && editing.index === index ?
                      editedAnswers.A :
                      conversation.modelA;
    } else if (chatData.selectedModel === "Model B") {
      answerContent = editing.model === 'B' && editing.index === index ?
                      editedAnswers.B :
                      conversation.modelB;
    } else {
      answerContent = `${editing.model === 'A' && editing.index === index ? editedAnswers.A : conversation.modelA} | ${editing.model === 'B' && editing.index === index ? editedAnswers.B : conversation.modelB}`;
    }
  
    if (
      !answerContent || 
      (editing.model === 'A' && editing.index === index && !editedAnswers.A) ||
      (editing.model === 'B' && editing.index === index && !editedAnswers.B)
    ) {
      handlePopup("⚠️ You must provide an answer before adding it.");
      return;
    }
  
    try {
      // Get user region prefix for comparison
      const regionPrefix = userRegion.replace(/[0-9C]+$/, '');
      
      // Determine translation target based on region
      let englishQuestion, translatedQuestion;
      let englishAnswer, translatedAnswer;
      
      if (regionPrefix === "Arab") {
        // For Arab users, we need English and Arabic versions
        const questionLang = detectLanguage(question);
        if (questionLang === 'ar') {
          // Question is in Arabic, translate to English
          englishQuestion = await translateText(question, 'en');
          translatedQuestion = question;
        } else {
          // Question is in English, translate to Arabic
          englishQuestion = question;
          translatedQuestion = await translateText(question, 'ar');
        }
        
        const answerLang = detectLanguage(answerContent);
        if (answerLang === 'ar') {
          // Answer is in Arabic, translate to English
          englishAnswer = await translateText(answerContent, 'en');
          translatedAnswer = answerContent;
        } else {
          // Answer is in English, translate to Arabic
          englishAnswer = answerContent;
          translatedAnswer = await translateText(answerContent, 'ar');
        }
      } else if (regionPrefix === "Chinese") {
        // For Chinese users, we need English and Chinese versions
        const questionLang = detectLanguage(question);
        if (questionLang === 'zh') {
          // Question is in Chinese, translate to English
          englishQuestion = await translateText(question, 'en');
          translatedQuestion = question;
        } else {
          // Question is in English, translate to Chinese
          englishQuestion = question;
          translatedQuestion = await translateText(question, 'zh');
        }
        
        const answerLang = detectLanguage(answerContent);
        if (answerLang === 'zh') {
          // Answer is in Chinese, translate to English
          englishAnswer = await translateText(answerContent, 'en');
          translatedAnswer = answerContent;
        } else {
          // Answer is in English, translate to Chinese
          englishAnswer = answerContent;
          translatedAnswer = await translateText(answerContent, 'zh');
        }
      } else {
        // For other regions, default to English
        englishQuestion = question;
        translatedQuestion = question;
        englishAnswer = answerContent;
        translatedAnswer = answerContent;
      }
      
      // Determine the correct database path based on region
      let databasePath;
      if (regionPrefix === "Arab") {
        databasePath = "ArabC/Details";
      } else if (regionPrefix === "Chinese") {
        databasePath = "ChineseC/Details";
      } else if (regionPrefix === "Western") {
        databasePath = "WesternC/Details";
      } else {
        // Default to WesternC for any other region
        databasePath = "WesternC/Details";
      }
      
      // Check for duplicates
      const detailsRef = ref(realtimeDb, databasePath);
      const detailsSnapshot = await get(detailsRef);
      
      let isDuplicate = false;
      
      if (detailsSnapshot.exists()) {
        const details = detailsSnapshot.val();
        
        for (const key in details) {
          const entry = details[key];
          
          if (
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
        handlePopup("⚠️ This question and answer already exist in the database for your region.");
        return;
      }
      
      // Continue with adding the new entry if not a duplicate
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
      
      const evaluationRef = ref(realtimeDb, "model_evaluation");
      await push(evaluationRef, evaluationEntry);
      
      const newEntryKey = Date.now().toString();
      
      // Static translations for reason
      const reasonTranslations = {
        "ar": {
          "variation": "اختلاف",
          "subculture": "ثقافة فرعية"
        },
        "zh": {
          "variation": "变异",
          "subculture": "亚文化"
        }
      };
      
      // Map region for language
      const regionLan = regionPrefix === "Arab" ? "العرب" : 
                       regionPrefix === "Chinese" ? "中国" : regionPrefix;
      
      // Static topic translations
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
          "Holidays/Celebration/Leisure": "假期",
          "Family": "家庭",
          "greeting": "问候"
        }
      };
      
      const reason = reasonValues[index] || "variation";
      const reasonLang = regionPrefix === "Arab" ? reasonTranslations.ar[reason] :
                        regionPrefix === "Chinese" ? reasonTranslations.zh[reason] : reason;
      const topicLang = regionPrefix === "Arab" ? topicTranslations.ar[selectedTopic] :
                       regionPrefix === "Chinese" ? topicTranslations.zh[selectedTopic] : selectedTopic;
      
      const newEntry = {
        region_name: userRegion,
        region_lan: regionLan,
        region_id: `${regionPrefix}_0`,
        cultur_val_ID: `${regionPrefix}-en-${newEntryKey.slice(-2)}`,
        en_question: englishQuestion,
        question: translatedQuestion,
        topic: selectedTopic,
        topic_lan: topicLang || selectedTopic,
        annotations: [
          {
            en_values: [englishAnswer],
            values: [translatedAnswer],
            reason: reason,
            reason_lan: reasonLang || reason,
            user_id: `user_${auth.currentUser.uid.slice(-4)}`,
          },
        ],
      };
      
      console.log("Saving entry with translations:", {
        path: databasePath,
        en_question: englishQuestion,
        question: translatedQuestion,
        en_values: [englishAnswer],
        values: [translatedAnswer]
      });
      
      const entryRef = ref(realtimeDb, `${databasePath}/${newEntryKey}`);
      await set(entryRef, newEntry);
      
      handlePopup("✅ Entry added successfully!");
      setDisabledButtons(prev => ({ ...prev, [index]: true }));
    } catch (error) {
      console.error("Error checking or adding data:", error);
      handlePopup("❌ An error occurred. Please try again.");
    }
  };
  
  // If there's no data to display
  if (!chatData || !chatData.conversations) {
    return (
      <div className="freestyle-add-page">
<div className="freestyle-page-header">
          <button className="freestyle-back-btn" onClick={() => navigate(-1)}>
            <FaArrowLeft className="freestyle-back-icon" />
          </button>
        </div>
        <h2 className="freestyle-title">Add Comparison Results</h2>
        <div className="no-data">
          <p>No chat data found. Please compare models first.</p>
          <button 
            className="back-to-chat-btn"
            onClick={() => navigate("/freestyle")}
          >
            Go to Chat Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="freestyle-add-page">
      <div className="freestyle-page-header">
        <button className="freestyle-back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft className="freestyle-back-icon" />
        </button>
      </div>
      <h1 className="add-conversation-title">{t("Add Conversation Page")}</h1>
      <h2 className="freestyle-title">
      {t("Your Voting:")} {t(chatData.selectedModel === 'Model A' ? 'modelA' : 'modelB') || t("Not Selected")}
      </h2>
      <h3 className="model-info">
      {t("Model A: Mistral-7B ")}<br /><p>-</p>
      {t( "Model B: Llama-2-7B")}
      </h3>
      <div className="column-table-container">
        <table className="column-table">
          <thead>
            <tr>
              <th className="question-col">{t("Question")}</th>
              <th className="answer-col">{t("Answer")}</th>
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
                  {(chatData.selectedModel === "Model A" || chatData.selectedModel === "Both") && (
                    <>
                      <div className="model-label">{t("Model A (Mistral-7B)")}</div>
                      <div className="content-wrapper">
                        {editing.model === 'A' && editing.index === index ? (
                          <div className="edit-container">
                            <textarea 
                              value={editedAnswers.A}
                              onChange={(e) => handleChange(e, 'A')}
                              className="edit-textarea"
                              maxLength={MAX_EDIT_LENGTH}                            />
                            <div className="character-counter">
                              {editedAnswers.A ? editedAnswers.A.length : 0}/{MAX_EDIT_LENGTH}
                            </div>
                            <button 
                              className="icon-btn save-btn"
                              onClick={() => handleSave('A', index)}
                            >
                              <FaSave />
                            </button>
                          </div>
                        ) : (
                          <div className="answer-container">
                            <div className="answer-text">
                              {expandedAnswers[`A-${index}`] 
                                ? (conversation.modelA || "No answer") 
                                : `${conversation.modelA ? (conversation.modelA.length > 150 ? conversation.modelA.substring(0, 150) + '...' : conversation.modelA) : 'No answer'}`}
                            </div>
                            <div className="answer-controls">
                              {conversation.modelA && conversation.modelA.length > 150 && (
                                <button 
                                  className="see-more-btn"
                                  onClick={() => toggleExpand(`A-${index}`)}
                                >
                                  {expandedAnswers[`A-${index}`] ? "Show Less" : "Show More"}
                                </button>
                              )}
                              <button 
                                className="icon-btn edit-btn"
                                onClick={() => handleEdit('A', index)}
                              >
                                <FaEdit />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {(chatData.selectedModel === "Model B" || chatData.selectedModel === "Both") && (
                    <>
                      <div className="model-label">{t("Model B (Llama-2-7B)")}</div>
                      <div className="content-wrapper">
                        {editing.model === 'B' && editing.index === index ? (
                          <div className="edit-container">
                            <textarea 
                              value={editedAnswers.B}
                              onChange={(e) => handleChange(e, 'B')}
                              className="edit-textarea"
                              maxLength={MAX_EDIT_LENGTH}                            />
                            <div className="character-counter">
                              {editedAnswers.B ? editedAnswers.B.length : 0}/{MAX_EDIT_LENGTH}
                            </div>
                            <button 
                              className="icon-btn save-btn"
                              onClick={() => handleSave('B', index)}
                            >
                              <FaSave />
                            </button>
                          </div>
                        ) : (
                          <div className="answer-container">
                            <div className="answer-text">
                              {expandedAnswers[`B-${index}`] 
                                ? (conversation.modelB || "No answer") 
                                : `${conversation.modelB ? (conversation.modelB.length > 150 ? conversation.modelB.substring(0, 150) + '...' : conversation.modelB) : 'No answer'}`}
                            </div>
                            <div className="answer-controls">
                              {conversation.modelB && conversation.modelB.length > 150 && (
                                <button 
                                  className="see-more-btn"
                                  onClick={() => toggleExpand(`B-${index}`)}
                                >
                                  {expandedAnswers[`B-${index}`] ? t("Show Less") : t("Show More")}
                                </button>
                              )}
                              <button 
                                className="icon-btn edit-btn"
                                onClick={() => handleEdit('B', index)}
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
                    <option value="" disabled>{t("Select Overall Evaluation")}</option>
                    <option value="Fully Correct">{t("Fully Correct")}</option>
                    <option value="Partially Correct">{t("Partially Correct")}</option>
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
                    <option value="" disabled>{t("Select Reason")}</option>
                    <option value="variation">{t("Variation")}</option>
                    <option value="subculture">{t("Subculture")}</option>
                  </select>
                </td>

                <td className="add-cell">
                  <button
                    className={`add-btn ${disabledButtons[index] ? 'disabled-btn' : ''}`}
                    onClick={() => handleAddToDB(index)}
                    disabled={disabledButtons[index]}
                  >
                    {disabledButtons[index] ? (
                      <FaCheck className="add-icon" />
                    ) : (
                      <FaPlus className="add-icon" />
                    )}
                    {t("Add")}
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
            <button onClick={() => setShowPopup(false)}>OK</button>
          </div>
          
         </div>
      )}
      
    </div>
    
  );
 
};

export default FreeStyleAdd;