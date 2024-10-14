import React, { useState } from 'react';
import './CrossCultureComparison.css';  
import LOGOC from '../images/Logo.png';
import { useNavigate } from 'react-router-dom';

const CrossCultureComparison = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cultureRegion, setCultureRegion] = useState('');
  const [topic, setTopic] = useState('');
  const [cultureRegionPlaceholder, setCultureRegionPlaceholder] = useState('Select a Region');
  const [topicPlaceholder, setTopicPlaceholder] = useState('Select a Topic');
  const [hasError, setHasError] = useState(false);
  
  const navigate = useNavigate();

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleSignOut = () => {
    alert("Signed out!");
  };

  const handleCompareClick = (e) => {
    e.preventDefault();

    let error = false;

    if (!cultureRegion) {
      setCultureRegionPlaceholder('Please select a Region');
      error = true;
    } else {
      setCultureRegionPlaceholder('Select a Region');
    }

    if (!topic) {
      setTopicPlaceholder('Please select a Topic');
      error = true;
    } else {
      setTopicPlaceholder('Select a Topic');
    }

    setHasError(error);

    if (error) return;

    navigate('/compare-result', {
      state: { cultureRegion: cultureRegion, topic: topic },
    });
  };

  return (
    <div className='comparison-container'>
      {/* Header */}
      <header className="header">
        <div className="header-left">
        <img src={LOGOC} alt="CultureLens Logo" className="logo-img" /> 
        <h1 className="logo-title">CultureLens</h1>
        </div>

        <nav className="nav-menu">
          <a href="/">Home</a>
          <a href="/dataset">CultureValue</a>
          <a href="/edit">Edit</a>
          <a href="/compare">Compare</a>
          <a href="/evaluation">Evaluation</a>
        </nav>

        <button className="menu-btn" onClick={handleMenuToggle}>
          <span className="menu-icon">&#9776;</span>
        </button>
        {menuOpen && (
          <div className="menu-dropdown">
            <p onClick={handleProfileClick}>Profile</p>
            <p onClick={handleSignOut} className="sign-out">Sign out</p>
          </div>
        )}
      </header>

      {/* Form Section */}
      <div className='Compare-form-container'>
        <header className='Compare-form-header'>
          <div className='Compare-underline'></div>
        </header>
        <div className="Compare-inputs">
          <div className='Compare-text'>Cross-Cultural Comparison</div>

          <div className="Compare-input">
            <label className="Compare-label">Region:</label>
            <select
              name="cultureRegion"
              id="cultureRegion"
              className={`Compare-cultureRegion ${hasError && !cultureRegion ? 'error' : ''}`}
              value={cultureRegion}
              onChange={(e) => setCultureRegion(e.target.value)}
              required
            >
              <option value="" disabled>{cultureRegionPlaceholder}</option>
              <option value="Arab">Arab</option>
              <option value="Western">Western</option>
              <option value="Chinese">Chinese</option>
            </select>
          </div>
          <div className="Compare-input">
            <label className="Compare-label">Topic:</label>
            <select
              name="topic"
              id="topic"
              className={`Compare-topic ${hasError && !topic ? 'error' : ''}`}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
            >
              <option value="" disabled>{topicPlaceholder}</option>
              <option value="Food">Food</option>
              <option value="Sport">Sport</option>
              <option value="Family">Family</option>
              <option value="Holiday">Holiday</option>
              <option value="Work-life">Work-life</option>
              <option value="Education">Education</option>
              <option value="Greeting">Greeting</option> 
            </select>
          </div>
        </div>

        <div className="Compare-submit-container">
          <div className="Compare-submit">
            <button onClick={handleCompareClick}>Compare</button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>© 2024 CultureLens. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default CrossCultureComparison;
