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
     
   const handleAddToDB = async (index) => {
    if (!chatData || !chatData.conversations || !auth.currentUser) return;
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

      const newEntry = {
        region_name: userRegion,
        en_question: question,
        topic: selectedTopic,
        annotations: [
          {
            en_values: [answerContent],
            reason: reasonValues[index] ?? "user_submitted",
            values: [],
          },
        ],
      };

      const entryRef = ref(realtimeDb, `Model_Answer/Details/${newEntryKey}`);
      await set(entryRef, newEntry);

      handlePopup(t("✅ Entry added successfully!"));
      setDisabledButtons(prev => ({ ...prev, [index]: true }));
    } catch (error) {
      console.error("Error adding data:", error);
      handlePopup("❌ An error occurred while adding the data. Please try again.");
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
                              {editedAnswers.A ? editedAnswers.A.length : 0}/{  MAX_EDIT_LENGTH}
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
                              {editedAnswers.B ? editedAnswers.B.length : 0}/{ MAX_EDIT_LENGTH}
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
                      </option>                      ))
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
  {disabledButtons[index] ? <FaCheck className="add-icon" /> : <FaPlus className="add-icon" />}
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