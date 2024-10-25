import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Freestyle.css";
import { FaArrowLeft } from "react-icons/fa";
import { Footer } from "../Footer/Footer";
import { Helmet } from 'react-helmet';


export const ConversationLayout = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState([
    { type: "ai", content: "Hello, how can I assist you today?" },
    {
      type: "user",
      content: "What is the most popular fruit in the Arab region?",
    },
    { type: "ai", content: "Kiwi" },
    {
      type: "user",
      content: "Apple is the most popular fruit in the Arab",
    },
    
  ]);
  const [dimensionPlaceholder, setDimensionPlaceholder] =
    useState("Select a question");
  const [hasError, setHasError] = useState(false);

  const handleEditClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setHasError(false);
    setDimensionPlaceholder("Select a question");
  };

  const handleQuestionSelect = (e) => {
    if (!selectedQuestion) {
      setSelectedQuestion(e.target.value);
      setHasError(false);
      setDimensionPlaceholder("Select a question");
    }
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() !== "") {
      setMessages([...messages, { type: "user", content: inputMessage }]);
      setInputMessage("");

      setTimeout(() => {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            type: "ai",
            content: "I received your message. How can I help you further?",
          },
        ]);
      }, 1000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleAddToDataset = () => {
    if (!selectedQuestion) {
      setDimensionPlaceholder("Please select a question");
      setHasError(true);
      return;
    }

    setIsModalOpen(false);
    setIsConfirmationModalOpen(true);
  };

  const handleConfirmAddToDataset = () => {
    console.log(`Question added to dataset: ${selectedQuestion}`);
    setIsConfirmationModalOpen(false);
  };

  const handleEndConversation = () => {
    navigate("/home");
  };

  const getQuestionText = (value) => {
    const questions = {
      q1: "What is a common snack for preschool kids in the Arab region?",
      q2: "What is the most popular fruit in the Arab region?",
      q3: "What is the traditional meal during holidays in the Arab region?",
      q4: "What are the traditional breakfast foods in the Arab region?",
      q5: "What is the most popular dish served at weddings in the Arab region?",
      q6: "What is the typical food served during Ramadan in the Arab region?",
      q7: "What are the staple foods in the daily diet of people in the Arab region?",
    };
    return questions[value] || "";
  };

  return (
    <div className="freestylepage">
       <Helmet>
      <title>Free style chatting</title>
      <meta name="description" content="Free style chatting page" />
    </Helmet>
      <div className="freestyle-page-header">
        <button
          className="freestyle-back-btn"
          onClick={() => navigate("/plot")}
        >
          <FaArrowLeft className="freestyle-back-icon" />
        </button>
      </div>

      <div className="conversation-container">
        <div className="conversation-header">
          <h2 className="conversation-title">Baseline Model</h2>
          <div className="freestyle-title-underline"></div>
        </div>

        <div className="freestyle-message-list">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.type}-message`}>
              <div className="freestyle-message-content">{message.content}</div>
            </div>
          ))}
        </div>

        <div className="freestyle-input-container">
          <input
            type="text"
            className="freestyle-message-input"
            placeholder="Type your message here..."
            value={inputMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
          />
          <button className="freestyle-send-button" onClick={handleSendMessage}>
            Send
          </button>
        </div>

        <div className="freestyle-button-container">
          <button
            className="freestyle-edit-dataset-button"
            onClick={handleEditClick}
          >
            Edit Dataset
          </button>

          <button
            className="freestyle-end-conversation-button"
            onClick={handleEndConversation}
          >
            End Conversation
          </button>
        </div>

        {isModalOpen && (
          <div className="freestyle-modal-overlay">
            <div className="freestyle-modal-content">
              <h3 className="freestyle-modal-title">
                What question do you want to add to the dataset?
              </h3>
              <div className="freestyle-select-container">
                <select
                  value={selectedQuestion || ""}
                  onChange={handleQuestionSelect}
                  className={`freestyle-question-select ${
                    hasError ? "error" : ""
                  }`}
                >
                  <option value="" disabled>
                    {dimensionPlaceholder}
                  </option>
                  <option value="q1">
                    Q1: What is a common snack for preschool kids in the Arab
                    region?
                  </option>
                  <option value="q2">
                    Q2: What is the most popular fruit in the Arab region?
                  </option>
                  <option value="q3">
                    Q3: What is the traditional meal during holidays in the Arab
                    region?
                  </option>
                  <option value="q4">
                    Q4: What are the traditional breakfast foods in the Arab
                    region?
                  </option>
                  <option value="q5">
                    Q5: What is the most popular dish served at weddings in the
                    Arab region?
                  </option>
                  <option value="q6">
                    Q6: What is the typical food served during Ramadan in the
                    Arab region?
                  </option>
                  <option value="q7">
                    Q7: What are the staple foods in the daily diet of people in
                    the Arab region?
                  </option>
                </select>
              </div>
              <div className="freestyle-modal-buttons">
                <button
                  className="freestyle-add-dataset-button"
                  onClick={handleAddToDataset}
                >
                  Add to Dataset
                </button>
                <button
                  className="freestyle-cancel-button"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {isConfirmationModalOpen && (
          <div className="freestyle-modal-overlay">
            <div className="freestyle-modal-content">
              <h3 className="freestyle-modal-title">
                Confirm Adding to Dataset
              </h3>
              <p>
                Are you sure you want to add the following question to the
                dataset?
              </p>
              <p className="freestyle-selected-question">
                {getQuestionText(selectedQuestion)} and the value is Apple
              </p>
              <div className="freestyle-modal-buttons">
                <button
                  className="freestyle-confirm-button"
                  onClick={handleConfirmAddToDataset}
                >
                  Confirm
                </button>
                <button
                  className="freestyle-cancel-button"
                  onClick={() => setIsConfirmationModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};
