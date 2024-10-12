import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css';
import LOGO from '../images/Logo.png';


const Sign = () => {
  const [userType, setUserType] = useState('User');
  const navigate = useNavigate();

  const handleUserTypeChange = (type) => {
    setUserType(type);
  };

  const handleCreateAccount = (e) => {
    e.preventDefault();
    navigate('/HomePage');
  };

  return (
  <div className="sign-page">
  <div className="sign-container">
    {/* Right Section */}
    <div className="right-section">
      <div className="logo-welcome-container">
        <img src={LOGO} alt="Logo" width="100" height="100" />
        <h2>Welcome</h2>
      </div>
      <p className="Wtxt">To CultureLens! Let's explore cultural diversity together.</p>
    </div>
  
 
 


        
        {/* Form Section */}
        <form className="sign-form" onSubmit={handleCreateAccount}>
          <h2 className="sign-title">Create account</h2>
          
          <div className="sign-user-type-container">
            <button 
              type="button" 
              className={`sign-user-type-btn ${userType === 'User' ? 'sign-active' : ''}`} 
              onClick={() => handleUserTypeChange('User')}
            >
              User
            </button>
            <button 
              type="button" 
              className={`sign-user-type-btn ${userType === 'Moderator' ? 'sign-active' : ''}`} 
              onClick={() => handleUserTypeChange('Moderator')}
            >
              Moderator
            </button>
          </div>

          <label htmlFor="name" className="sign-label">Full name:</label>
          <input 
            type='name' 
            id="name" 
            autoComplete='off' 
            placeholder="Enter your full name"
            className="sign-input"
            required
          />

          <label htmlFor="email" className="sign-label">Email Address:</label>
          <input 
            type='email' 
            id="email" 
            autoComplete='off' 
            placeholder="Enter your Email Address"
            className="sign-input"
            required
          />

          {userType === 'User' && (
            <>
              <label htmlFor="age" className="sign-label">Age:</label>
              <input 
                type='number' 
                id="age" 
                autoComplete='off' 
                placeholder="Enter your Age"
                className="sign-input"
                required
              />

              <label htmlFor="region" className="sign-label">Region:</label>
              <select id="region" className="sign-select" required>
                <option value="" disabled>Select your region</option>
                <option value="North America">North America</option>
                <option value="South America">South America</option>
                <option value="Europe">Europe</option>
                <option value="Asia">Asia</option>
                <option value="Africa">Africa</option>
                <option value="Australia">Australia</option>
                <option value="Antarctica">Antarctica</option>
              </select>

              <label htmlFor="password" className="sign-label">Password</label>
              <input 
                type='password' 
                id="password" 
                autoComplete='off' 
                placeholder="Enter your Password"
                className="sign-input"
                required
              />

<div className="sign-culture-and-button">
  <fieldset className="sign-culture-domain">
    <legend>Culture Domain:</legend>
    <div className="sign-culture-options">
      <input type="radio" id="Arab" name="cultureDomain" value="Arab" required />
      <label htmlFor="Arab">Arab</label>
    </div>
    <div className="sign-culture-options">
      <input type="radio" id="Western" name="cultureDomain" value="Western" required />
      <label htmlFor="Western">Western</label>
    </div>
    <div className="sign-culture-options">
      <input type="radio" id="Chinese" name="cultureDomain" value="Chinese" required />
      <label htmlFor="Chinese">Chinese</label>
    </div>
  </fieldset>
 </div>

            </>
          )}

          {userType === 'Moderator' && (
            <>
              <label htmlFor="password" className="sign-label">Password</label>
              <input 
                type='password' 
                id="password" 
                autoComplete='off' 
                placeholder="Enter your Password"
                className="sign-input"
                required
              />
            </>
          )}

          <button type="submit" className="sign-btn" style={{ marginTop: '1rem' ,fontSize: '15px'}}>Create Account</button>
          <div className='sign-login'>
          <p style={{ fontSize: '15px' }}>Already have an account? <Link to="/Login" className="sign-link">Login</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Sign;
