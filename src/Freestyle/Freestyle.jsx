import React, { useState } from 'react';
import './Freestyle.css';
import logo from '../images/logo.png';


export const ConversationLayout = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

 
  const toggleProfileMenu = () => {
    setIsProfileOpen(!isProfileOpen);
  };


  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  const handleProfileClick = () => {
    console.log("عرض الصفحة الشخصية");
  };

  const handleSignOut = () => {
    console.log("تسجيل الخروج");
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    { type: 'ai', content: 'Hello, how can I assist you today?' },
    { type: 'user', content: 'What is a common snack for preschool kids in the Arab region?' },
    { type: 'ai', content: 'Fruits' },
    { type: 'user', content: 'What is the most popular fruit in the Arab region?' },
    { type: 'ai', content: 'Apple' },
  ]);

  const handleEditClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleQuestionSelect = (e) => {
    setSelectedQuestion(e.target.value);
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() !== '') {
      setMessages([...messages, { type: 'user', content: inputMessage }]);
      setInputMessage('');
      
      // Simulate AI response (you would replace this with actual AI logic)
      setTimeout(() => {
        setMessages(prevMessages => [...prevMessages, { type: 'ai', content: 'I received your message. How can I help you further?' }]);
      }, 1000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="freestylepage">

    <header className="header">
            <div className="header-left">
              <img src={logo} alt="CultureLens Logo" className="logo-img " />
              {/* <h1 className="logo-title ">CultureLens</h1> */}
            </div>
    
            <nav className="nav-menu ">
              <a href="HomePage" >Home</a>
              <a href="/dataset" >Dataset</a>
              <a href="/edit" >Edit</a>
              <a href="/compare" >Compare</a>
              <a href="/evaluation">Evaluation</a>
            </nav>
    
            <button className="menu-btn" onClick={handleMenuToggle}>
              <span className="menu-icon">&#9776;</span>
            </button>
            {menuOpen && (
              <div className="menu-dropdown ">
                <p onClick={handleProfileClick}>Profile</p>
                <p onClick={handleSignOut} className="sign-out ">Sign out</p>
              </div>
            )}
          </header>

    <div className="conversation-container">
      <div className="conversation-header">
        <h2 className="conversation-title">Baseline Model</h2>
        <div className="title-underline"></div>
      </div>
      
      <div className="message-list">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}-message`}>
            <div className="message-content">
              {message.content}
            </div>
          </div>
        ))}
      </div>
      
      <div className="input-container">
        <input 
          type="text" 
          className="message-input" 
          placeholder="Type your message here..." 
          value={inputMessage}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
        />
        <button className="send-button" onClick={handleSendMessage}>Send</button>
      </div>
      
      <div className="button-container">
        <button className="edit-dataset-button" onClick={handleEditClick}>
          Edit Dataset
        </button>
        
        <button className="end-conversation-button">
          End Conversation
        </button>
      </div>
      
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">What question do you want to add to the dataset?</h3>
            <div className="select-container">
              <select
                value={selectedQuestion}
                onChange={handleQuestionSelect}
                className="question-select"
              >
                <option value="" disabled>Select a question</option>
                <option value="q1">Q1: What is a common snack for preschool kids in the Arab region?</option>
                <option value="q2">Q2: What is the most popular fruit in the Arab region?</option>
                <option value="q3">Q3: What is the traditional meal during holidays in the Arab region?</option>
                <option value="q4">Q4: What are the traditional breakfast foods in the Arab region?</option>
                <option value="q5">Q5: What is the most popular dish served at weddings in the Arab region?</option>
                <option value="q6">Q6: What is the typical food served during Ramadan in the Arab region?</option>
                <option value="q7">Q7: What are the staple foods in the daily diet of people in the Arab region?</option>
              </select>
            </div>
            <div className="modal-buttons">
              <button
                className="add-dataset-button"
                onClick={() => {
                  // Code to add the selected question to the dataset
                  handleCloseModal();
                }}
              >
                Add to Dataset
              </button>
              <button
                className="cancel-button"
                onClick={handleCloseModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    <footer className="footer ">
        <p className="footer">© 2024 CultureLens. All rights reserved.</p>
      </footer>
    </div>
  );
};