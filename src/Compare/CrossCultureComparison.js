import React, { useState } from 'react';
import './CrossCultureComparison.css';  
import CLogo from './Clogo.png';


import { useNavigate } from 'react-router-dom';

const CrossCultureComparison = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cultureDomain, setCultureDomain] = useState('');
  const [dimension, setDimension] = useState('');
  const [cultureDomainPlaceholder, setCultureDomainPlaceholder] = useState('Select a Domain');
  const [dimensionPlaceholder, setDimensionPlaceholder] = useState('Select a Dimension');
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

    // Check if fields are empty and update the placeholder with an error message
    if (!cultureDomain) {
      setCultureDomainPlaceholder('Please select a Domain');
      error = true;
    } else {
      setCultureDomainPlaceholder('Select a Domain');
    }

    if (!dimension) {
      setDimensionPlaceholder('Please select a Dimension');
      error = true;
    } else {
      setDimensionPlaceholder('Select a Dimension');
    }

    setHasError(error);

    // If there's an error, prevent navigation
    if (error) return;

    // If no validation errors, proceed with navigation
    navigate('/compare-result', {
      state: { cultureDomain: cultureDomain, dimension: dimension },
    });
  };

  return (
    <div className='comparison-container'>
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <img src={CLogo} alt="CultureLens Logo" className="logo-img" />
          <h1 className="logo-title">CultureLens</h1>
        </div>

        <nav className="nav-menu">
          <a href="/">Home</a>
          <a href="/dataset">Dataset</a>
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

          {/* Culture Domain Field */}
          <div className="Compare-input">
            <label className="Compare-label">Culture Domain:</label>
            <select
              name="cultureDomain"
              id="cultureDomain"
              className={`Compare-cultureDomain ${hasError && !cultureDomain ? 'error' : ''}`}
              value={cultureDomain}
              onChange={(e) => setCultureDomain(e.target.value)}
              required
            >
              <option value="" disabled>{cultureDomainPlaceholder}</option>
              <option value="Arab">Arab</option>
              <option value="Western">Western</option>
              <option value="Chinese">Chinese</option>
            </select>
          </div>

          {/* Dimension Field */}
          <div className="Compare-input">
            <label className="Compare-label">Dimension:</label>
            <select
              name="dimension"
              id="dimension"
              className={`Compare-dimension ${hasError && !dimension ? 'error' : ''}`}
              value={dimension}
              onChange={(e) => setDimension(e.target.value)}
              required
            >
              <option value="" disabled>{dimensionPlaceholder}</option>
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

        {/* Submit Button */}
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


