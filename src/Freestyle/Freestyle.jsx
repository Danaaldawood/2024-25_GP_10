import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft, FaPaperPlane } from "react-icons/fa";
import { Footer } from "../Footer/Footer";
import { Helmet } from 'react-helmet';
import "./Freestyle.css";
import { useTranslation } from 'react-i18next';

export const ConversationLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { evalType } = location.state || {};
  const { t, i18n } = useTranslation('FreeStyle');

  console.log("In Freestyle.jsx, received evalType:", evalType);

  const isRTL = i18n.dir() === 'rtl';
  const formatNumber = (number) => new Intl.NumberFormat(i18n.language).format(number);

  const [inputMessage, setInputMessage] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [messagesA, setMessagesA] = useState([{ type: "ai", content: t("modelAA") }]);
  const [messagesB, setMessagesB] = useState([{ type: "ai", content: t("modelBB") }]);
  const sendLimit = 7; // Updated to match first Freestyle.jsx
  const [sendCount, setSendCount] = useState(0);
  const [canGiveFeedback, setCanGiveFeedback] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingA, setIsLoadingA] = useState(false);
  const [isLoadingB, setIsLoadingB] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedModel, setSelectedModel] = useState("");
  const progressWidth = `${(sendCount / sendLimit) * 100}%`;

  // Backend URL (configurable for local or deployed environments)
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL ||'https://gp-culturelens.onrender.com/api/chat';
  // For production, set REACT_APP_BACKEND_URL=https://gp-culturelens.onrender.com in .env --'http://localhost:5000'

  useEffect(() => {
    fetch(`https://gp-culturelens.onrender.com/api/suggestions`)
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          setSuggestions(data.suggestions);
        }
      })
      .catch(error => console.error('Error fetching suggestions:', error));
  }, []);

  const determineModelTypes = () => {
    console.log("Determining model types for evalType:", evalType);

    if (!evalType) {
      console.warn("evalType is undefined, defaulting to baseline models A and B");
      return ['A', 'B'];
    }

    switch (evalType) {
      // Baseline Models
      case "Mistral Baseline":
      case "LLAMA2 Baseline":
      case "Hofstede Questions-Mistral Model":
      case "Hofstede Questions-LLAMA2 Model":
        return ['A', 'B']; // Model A: Baseline Mistral, Model B: Baseline LLaMA (Ollama)

      // Fine-Tuned Models
      case "Mistral Fine-tuned Model":
      case "Llama2 Fine-tuned Model":
      case "Hofstede Questions-Mistral Fine-tuned Model":
      case "Hofstede Questions-Llama2 Fine-tuned Model":
        return ['FA', 'FB']; // Model A: Fine-tuned Mistral, Model B: Fine-tuned LLaMA

      default:
        console.warn(`Unrecognized evalType: ${evalType}, defaulting to baseline models A and B`);
        return ['A', 'B'];
    }
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() !== "" && sendCount < sendLimit) {
      const userMessage = { type: "user", content: inputMessage };
      setMessagesA(prev => [...prev, userMessage]);
      setMessagesB(prev => [...prev, userMessage]);

      setIsLoading(true);
      setIsLoadingA(true);
      setIsLoadingB(true);
      setInputMessage("");
      setSendCount(prev => prev + 1);

      const [modelTypeA, modelTypeB] = determineModelTypes();
      console.log("Model types selected:", { modelTypeA, modelTypeB });

      try {
        const responseA = fetch(`https://gp-culturelens.onrender.com/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: inputMessage, model_type: modelTypeA }),
        }).then(res => res.json())
          .then(data => {
            setMessagesA(prev => [...prev, { 
              type: "ai", 
              content: data.status === 'success' ? data.response : t("error-processing-request") 
            }]);
            setIsLoadingA(false);
          }).catch(error => {
            console.error('Error with Model A:', error);
            setMessagesA(prev => [...prev, { type: "ai", content: t("processing-request") }]);
            setIsLoadingA(false);
          });

        const responseB = fetch(`https://gp-culturelens.onrender.com/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: inputMessage, model_type: modelTypeB }),
        }).then(res => res.json())
          .then(data => {
            setMessagesB(prev => [...prev, { 
              type: "ai", 
              content: data.status === 'success' ? data.response : t("error-processing-request") 
            }]);
            setIsLoadingB(false);
          }).catch(error => {
            console.error('Error with Model B:', error);
            setMessagesB(prev => [...prev, { type: "ai", content: t("processing-request") }]);
            setIsLoadingB(false);
          });

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

  const handlePopupAction = (action) => {
    if (action === "yes") {
      const userMessages = messagesA.filter(msg => msg.type === "user");
      const modelAMessages = messagesA.filter(msg => msg.type === "ai" && messagesA.indexOf(msg) > 0);
      const modelBMessages = messagesB.filter(msg => msg.type === "ai" && messagesB.indexOf(msg) > 0);
      const conversations = userMessages.map((msg, i) => ({
        question: msg.content,
        modelA: modelAMessages[i]?.content || "",
        modelB: modelBMessages[i]?.content || "",
      }));
      // Format data for FreeStyleAdd
      const formattedData = {
        conversations: conversations,
        selectedModel: selectedModel
      };
      localStorage.setItem("lastChatMessages", JSON.stringify({
        conversations,
        selectedModel
      }));
      navigate("/FreeStyleAdd");
    } else {
      navigate("/home");
    }
  };

  return (
    <div className="freestylepage">
      <div className="main-content">
        <Helmet>
          <title className="titleFree">Free style chatting</title>
          <meta name="description" content="Free style chatting page" />
        </Helmet>

        <div className="freestyle-page-header">
          <button className="freestylechat-back-btn" onClick={() => navigate(-1)}>
            <FaArrowLeft className="freestyle-back-icon" />
          </button>
        </div>

        <h2 className="titleFree">{t('titleFree')}</h2>

        <div className="send-limit-container">
          <div className="send-limit-bar">
            <div className="progress" style={{ width: progressWidth }}></div>
            <p>{`${formatNumber(sendCount)} / ${formatNumber(sendLimit)} ${t("Sends")}`}</p>
          </div>
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
              {isLoadingA && <div className="message ai-message loading-message">{t("message ai-message")}</div>}
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
              {isLoadingB && <div className="message ai-message loading-message">{t("message ai-message")}</div>}
            </div>
          </div>
        </div>

        {sendCount === sendLimit && !isLoading && (
          <div className="feedback-container">
            <button 
              className="feedback-button model-a" 
              disabled={!canGiveFeedback} 
              onClick={() => handleFeedback('Model A')}
            >
              {t("👍 Model A is better")}
            </button>
            <button 
              className="feedback-button model-b" 
              disabled={!canGiveFeedback} 
              onClick={() => handleFeedback('Model B')}
            >
              {t("👍 Model B is better")}
            </button>
            <button 
              className="feedback-button model-none" 
              disabled={!canGiveFeedback} 
              onClick={() => handleFeedback('none')}
            >
              {t("none")}
            </button>
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
  className={`freestyle-send-button ${isRTL ? 'rtl' : 'ltr'}`}
  dir={isRTL ? "rtl" : "ltr"}
  onClick={handleSendMessage}
  disabled={sendCount >= sendLimit || isLoading}
>
  {isLoading ? t('sending') : (
    <span className="send-content">
      {isRTL ? <FaPaperPlane className="send-icon" /> : null}
      {t('send')}
      {!isRTL ? <FaPaperPlane className="send-icon" /> : null}
    </span>
  )}
</button>

        </div>
      </div>

      <Footer />

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3 className="popup-title">
              {t(selectedModel === 'Model A' ? 'modelA' : selectedModel === 'Model B' ? 'modelB' : 'none')}
              {t("thank-you-voting")}🌟
            </h3>
            <p className="popup-message">{t("add-chat-question")}</p>
            <div className="popup-buttons">
              <button className="popup-button confirm" onClick={() => handlePopupAction("yes")}>{t("yes")}</button>
              <button className="popup-button cancel" onClick={() => handlePopupAction("cancel")}>{t("cancel")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};