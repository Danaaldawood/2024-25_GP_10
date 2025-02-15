import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { Footer } from "../Footer/Footer";
import { Helmet } from 'react-helmet';
import "./Freestyle.css";

export const ConversationLayout = () => {
  const navigate = useNavigate();

  const [inputMessage, setInputMessage] = useState("");
   

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
  };  const [messagesA, setMessagesA] = useState([//will be deleted, i think
    { type: "ai", content: "Hello, this is Model A. How can I assist you?" },
  ]);
  const [messagesB, setMessagesB] = useState([
    { type: "ai", content: "Hello, this is Model B. How can I assist you?" },
  ]);
  const sendLimit = 7;
  const [sendCount, setSendCount] = useState(0);
  const [canGiveFeedback, setCanGiveFeedback] = useState(false); // Added state definition

  const progressWidth = `${(sendCount / sendLimit) * 100}%`;

  const handleSendMessage = () => {// will be deleted
    if (inputMessage.trim() !== "" && sendCount < sendLimit) {
      setMessagesA([...messagesA, { type: "user", content: inputMessage }]);
      setMessagesB([...messagesB, { type: "user", content: inputMessage }]);
      setInputMessage("");
      setSendCount(sendCount + 1);

      setTimeout(() => setMessagesA((prev) => [...prev, { type: "ai", content: "Model A received your message." }]), 1000);
      setTimeout(() => setMessagesB((prev) => [...prev, { type: "ai", content: "Model B received your message." }]), 1000);
      setCanGiveFeedback(true);
    }
  };

  const handleFeedback = (model) => {
    if (canGiveFeedback) {
      alert(`${model} 🌟Thank you for voting !`);//will be deleted, i think
      setCanGiveFeedback(false);
    }
  };

  return (
    <div className="freestylepage">
      <Helmet>
        <title>Free style chatting</title>
        <meta name="description" content="Free style chatting page" />
      </Helmet>

      <div className="freestyle-page-header">
        <button className="freestyle-back-btn" onClick={() => navigate("/plot")}>
          <FaArrowLeft className="freestyle-back-icon" />

        </button>
        <div className="feedback-container mt-4">

        <button 
  className="AddToDataset" 
  style={{ marginLeft: 'auto', display: 'block' }}
  disabled={!canGiveFeedback} 
  onClick={() => handleFeedback('AddDataset')}
>
  Add To Dataset
</button>
</div>
      </div>
       
      <h2 className="freestyle-title"> Free Style Chatting 🤖</h2>

      <div className="send-limit-bar">
        <div className="progress" style={{ width: progressWidth }}></div>
        <p>{`${sendCount} / ${sendLimit} Sends`}</p>
      </div>

      <div className="dual-chat-container">
        <div className="chat-model">
          <h2 className="conversation-title">Model A</h2>
          <div className="freestyle-message-list">
            {messagesA.map((message, index) => (
              <div key={index} className={`message ${message.type}-message`}>
                <div className="freestyle-message-content">{message.content}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="chat-model">
          <h2 className="conversation-title">Model B</h2>
          <div className="freestyle-message-list">
            {messagesB.map((message, index) => (
              <div key={index} className={`message ${message.type}-message`}>
                <div className="freestyle-message-content">{message.content}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="feedback-container mt-4">
        <button disabled={!canGiveFeedback} onClick={() => handleFeedback('Model A')}>  👍 Model A is better </button>
        <button disabled={!canGiveFeedback} onClick={() => handleFeedback('Model B')}>👍 Model B is better </button>
        <button disabled={!canGiveFeedback} onClick={() => handleFeedback('Model B')}>👎Both Bad </button>
       </div>

      <div className="freestyle-input-container">
        <input
          type="text"
          className="freestyle-message-input"
          placeholder="Enter your message..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}//will be deleted, i think
          disabled={sendCount >= sendLimit}
        />
        <button className="freestyle-send-button" onClick={handleSendMessage} disabled={sendCount >= sendLimit}>Send</button>
      </div>

      <Footer />
    </div>
  );
};