import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { Footer } from "../Footer/Footer";
import { Helmet } from 'react-helmet';
import "./Freestyle.css";

export const ConversationLayout = () => {
  const navigate = useNavigate();
  const [inputMessage, setInputMessage] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [messagesA, setMessagesA] = useState([
    { type: "ai", content: "Hello, this is Mistral-7B-Instruct. How can I assist you?" },
  ]);
  const [messagesB, setMessagesB] = useState([
    { type: "ai", content: "Hello, this is Llama-2 (7B). How can I assist you?" },
  ]);
  const sendLimit = 7;
  const [sendCount, setSendCount] = useState(0);
  const [canGiveFeedback, setCanGiveFeedback] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingA, setIsLoadingA] = useState(false);
  const [isLoadingB, setIsLoadingB] = useState(false);

  const progressWidth = `${(sendCount / sendLimit) * 100}%`;

  // Fetch suggestions when component mounts
  useEffect(() => {
    fetch('http://localhost:5000/api/suggestions')
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
        const responseA = fetch('http://localhost:5000/api/chat', {
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
              setMessagesA(prev => [...prev, { type: "ai", content: "Sorry, I couldn't process your request." }]);
            }
            setIsLoadingA(false);
          })
          .catch(error => {
            console.error('Error with Model A:', error);
            setMessagesA(prev => [...prev, { type: "ai", content: "Sorry, there was an error processing your request." }]);
            setIsLoadingA(false);
          });

        // Send message to Llama model (Model B)
        const responseB = fetch('http://localhost:5000/api/chat', {
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
              setMessagesB(prev => [...prev, { type: "ai", content: "Sorry, I couldn't process your request." }]);
            }
            setIsLoadingB(false);
          })
          .catch(error => {
            console.error('Error with Model B:', error);
            setMessagesB(prev => [...prev, { type: "ai", content: "Sorry, there was an error processing your request." }]);
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
    if (canGiveFeedback) {
      alert(`${model} 🌟Thank you for voting !`);
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
       
      <h2 className="freestyle-title">Free Style Chatting 🤖</h2>

      <div className="send-limit-bar">
        <div className="progress" style={{ width: progressWidth }}></div>
        <p>{`${sendCount} / ${sendLimit} Sends`}</p>
      </div>

      <div className="dual-chat-container">
        <div className="chat-model">
          <h2 className="conversation-title">Model A (Mistral-7B)</h2>
          <div className="freestyle-message-list">
            {messagesA.map((message, index) => (
              <div key={index} className={`message ${message.type}-message`}>
                <div className="freestyle-message-content">{message.content}</div>
              </div>
            ))}
            {isLoadingA && <div className="message ai-message">Typing...</div>}
          </div>
        </div>

        <div className="chat-model">
          <h2 className="conversation-title">Model B (Llama-2-7B)</h2>
          <div className="freestyle-message-list">
            {messagesB.map((message, index) => (
              <div key={index} className={`message ${message.type}-message`}>
                <div className="freestyle-message-content">{message.content}</div>
              </div>
            ))}
            {isLoadingB && <div className="message ai-message">Typing...</div>}
          </div>
        </div>
      </div>

      <div className="feedback-container mt-4">
        <button disabled={!canGiveFeedback} onClick={() => handleFeedback('Model A')}>👍 Model A is better</button>
        <button disabled={!canGiveFeedback} onClick={() => handleFeedback('Model B')}>👍 Model B is better</button>
        <button disabled={!canGiveFeedback} onClick={() => handleFeedback('Both')}>👎 Both Bad</button>
      </div>

      <div className="freestyle-input-container">
        <input
          type="text"
          className="freestyle-message-input"
          placeholder="Enter your message..."
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
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>

      <Footer />
    </div>
  );
};