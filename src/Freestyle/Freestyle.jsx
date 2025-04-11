import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { Footer } from "../Footer/Footer";
import { Helmet } from 'react-helmet';
import "./Freestyle.css";
import { useTranslation } from 'react-i18next';

export const ConversationLayout = () => {
  const navigate = useNavigate();
    const { t, i18n } = useTranslation('FreeStyle');
      const isRTL = i18n.dir() === 'rtl';
      const formatNumber = (number) => {
        return new Intl.NumberFormat(i18n.language).format(number);
      };
      
  const [inputMessage, setInputMessage] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [messagesA, setMessagesA] = useState([
    { type: "ai", content: t("modelAA") },
  ]);
  
  const [messagesB, setMessagesB] = useState([
    { type: "ai", content: t("modelBB") },
  ]);  
  const sendLimit = 1;
  const [sendCount, setSendCount] = useState(0);
  const [canGiveFeedback, setCanGiveFeedback] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingA, setIsLoadingA] = useState(false);
  const [isLoadingB, setIsLoadingB] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedModel, setSelectedModel] = useState("");
  const progressWidth = `${(sendCount / sendLimit) * 100}%`;   
  
  // Fetch suggestions when component mounts
  useEffect(() => {
    fetch('http://localhost:5001/api/suggestions')
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          setSuggestions(data.suggestions);
        }
      })
      .catch(error => console.error('Error fetching suggestions:', error));
  }, []);

  const handleSendMessage = async () => {
    if (inputMessage.trim() !== "" && sendCount < sendLimit) {
      // Add user message to both chats
      const userMessage = { type: "user", content: inputMessage };
      setMessagesA(prev => [...prev, userMessage]);
      setMessagesB(prev => [...prev, userMessage]);
      
      setIsLoading(true);
      setIsLoadingA(true);
      setIsLoadingB(true);
      setInputMessage("");
      setSendCount(prev => prev + 1);

      try {
        // Send message to Mistral model (Model A)
        const responseA = fetch('http://localhost:5001/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: inputMessage, model_type: 'A' }),
        }).then(res => res.json())
          .then(data => {
            if (data.status === 'success') {
              // Add AI response to Model A chat
              setMessagesA(prev => [...prev, { type: "ai", content: data.response }]);
            } else {
              setMessagesA(prev => [...prev, { type: "ai", content:  t("error-processing-request") }]);
            }
            setIsLoadingA(false);
          })
          .catch(error => {
            console.error('Error with Model A:', error);
            setMessagesA(prev => [...prev, { type: "ai", content: t("processing-request") }]);
            setIsLoadingA(false);
          });

        // Send message to Llama model (Model B)
        const responseB = fetch('http://localhost:5001/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: inputMessage, model_type: 'B' }),
        }).then(res => res.json())
          .then(data => {
            if (data.status === 'success') {
              // Add AI response to Model B chat
              setMessagesB(prev => [...prev, { type: "ai", content: data.response }]);
            } else {
              setMessagesB(prev => [...prev, { type: "ai", content:t("error-processing-request") }]);
            }
            setIsLoadingB(false);
          })
          .catch(error => {
            console.error('Error with Model B:', error);
            setMessagesB(prev => [...prev, { type: "ai", content: t("processing-request")}]);
            setIsLoadingB(false);
          });

        // Wait for both requests to complete
        await Promise.all([responseA, responseB]);
        setCanGiveFeedback(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Error sending message:', error);
        setIsLoading(false);
        setIsLoadingA(false);
        setIsLoadingB(false);
      }
    }
  };

  const handleFeedback = (model) => {
    setSelectedModel(model);
    setShowPopup(true);  
  };
  
  const closePopup = () => {
    setShowPopup(false);  
  };
   
   // Update the handlePopupAction function in ConversationLayout.js
const handlePopupAction = (action) => {
  if (action === "yes") {
    // Get all user messages (questions) - Skip initial greeting
    const userMessages = messagesA.filter(msg => msg.type === "user");
    
    // Get all model responses (excluding the initial greeting)
    const modelAMessages = messagesA.filter(msg => msg.type === "ai" && messagesA.indexOf(msg) > 0);
    const modelBMessages = messagesB.filter(msg => msg.type === "ai" && messagesB.indexOf(msg) > 0);
    
    // Create structured conversation data with proper question-answer pairing
    const conversations = [];
    for (let i = 0; i < userMessages.length; i++) {
      conversations.push({
        question: userMessages[i].content,
        modelA: modelAMessages[i]?.content || "",
        modelB: modelBMessages[i]?.content || "",
      });
    }
    
    // Format data for FreeStyleAdd
    const formattedData = {
      conversations: conversations,
      selectedModel: selectedModel
    };
    
    // Save the formatted data
    localStorage.setItem("lastChatMessages", JSON.stringify(formattedData));
    
    navigate("/FreeStyleAdd");
  } else {
    navigate("/home");
  }
};

  return (
    <div className="freestylepage">
      <Helmet>
      <title class="titleFree">Free style chatting</title>
      <meta name="description" content="Free style chatting page" />
      </Helmet>
       <div className="freestyle-page-header">
       <button className="freestyle-back-btn" onClick={() => navigate(-1)}>
  

          <FaArrowLeft className="freestyle-back-icon" />
        </button>
        <div className="feedback-container mt-4">
           
        </div>
      </div>
       
       <h2 class="titleFree">{t('titleFree')}</h2>

      <div className="send-limit-bar">
        <div className="progress" style={{ width: progressWidth }}></div>
        <p>{`${formatNumber(sendCount)} / ${formatNumber(sendLimit)} ${t("Sends")}`}</p>
        </div>

      <div className="dual-chat-container">
        <div className="chat-model">
          <h2 className="conversation-title">{t("conversation-titleA")}</h2>
          <div className="freestyle-message-list">
            {messagesA.map((message, index) => (
              <div key={index} className={`message ${message.type}-message`}>
                <div className="freestyle-message-content">{message.content}</div>
              </div>
            ))}
            {isLoadingA && <div className="message ai-message">{t("message ai-message")}</div>}
          </div>
        </div>

        <div className="chat-model">
          <h2 className="conversation-title">{t("conversation-titleB")}</h2>
          <div className="freestyle-message-list">
            {messagesB.map((message, index) => (
              <div key={index} className={`message ${message.type}-message`}>
                <div className="freestyle-message-content">{message.content}</div>
              </div>
            ))}
            {isLoadingB && <div className="message ai-message">{t("message ai-message")}</div>}
          </div>
        </div>
      </div>

      {sendCount === sendLimit && !isLoading && (
  <div className="feedback-container mt-4">
    <button disabled={!canGiveFeedback} onClick={() => handleFeedback('Model A')}>{t("👍 Model A is better")}</button>
    <button disabled={!canGiveFeedback} onClick={() => handleFeedback('Model B')}>{t("👍 Model B is better")}</button>
    <button disabled={!canGiveFeedback} onClick={() => handleFeedback('none')}> {("none")}</button>
  </div>
)}

      <div className="freestyle-input-container">
        <input
          type="text"
          className="freestyle-message-input"
          placeholder={t("enter-message")} 
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          disabled={sendCount >= sendLimit || isLoading}
        />
        <button 
          className="freestyle-send-button" 
          onClick={handleSendMessage} 
          disabled={sendCount >= sendLimit || isLoading}
        >
 {isLoading ? t('sending') : t('send')}
         </button>
      </div>

      <Footer />

      {showPopup && (
     <div className="popup-overlay">
     <div className="popup-content">
       <h3>{t(selectedModel === 'Model A' ? 'modelA' : 'modelB')}{t("thank-you-voting")}🌟</h3>
       <p>{t("add-chat-question")}</p>
       <div className="popup-buttons">
         {/* "Yes" button will navigate to FreeStyleAdd */}
         <button onClick={() => handlePopupAction("yes")}>{t("yes")}</button>
         {/* "Cancel" button will navigate to HomePage */}
         <button onClick={() => handlePopupAction("cancel")}>{t("cancel")}</button>
          </div>
        </div>
      </div>
    )}
  </div>
);
};