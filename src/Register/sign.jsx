import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css';
import LOGO from '../images/Logo.png';
import Select from 'react-select';
import countryList from 'react-select-country-list';
import Flag from 'react-world-flags';

const Sign = () => {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [userType, setUserType] = useState('User');
  const navigate = useNavigate();

   const countryOptions = countryList().getData().map((country) => ({
    value: country.value,
    label: (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Flag code={country.value} style={{ width: 20, height: 15, marginRight: 10 }} />
        {country.label}
      </div>
    ),
  }));

  const handleCountryChange = (selectedOption) => {
    setSelectedCountry(selectedOption);
    console.log("المجال المختار:", selectedOption.label);
  };

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
            type='text' 
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

              <div className="country-select" style={{ marginBottom: '20px' }}>
                <label className="sign-label">Region:</label>
                <Select 
                  options={countryOptions} 
                  value={selectedCountry}
                  onChange={handleCountryChange}
                  placeholder="Select Region"
                  styles={{
                    control: (styles, { isFocused }) => ({
                      ...styles,
                      width: '100%',
                      borderColor: isFocused ? '#3F7EA6' : '#ddd',
                      borderRadius: '4px',
                      backgroundColor: '#ffffff',
                      transition: 'border-color 0.3s ease',
                      fontSize: '13px',
                      height: '50px', 
                      boxShadow: 'none',
                      '&:hover': { borderColor: '#3F7EA6' },
                    }),
                    valueContainer: (styles) => ({
                      ...styles,
                      padding: '0 0.75rem',
                    }),
                  }}
                />
              </div>

              <label htmlFor="password" className="sign-label" style={{ marginTop: '0px' }}>Password:</label>
              <input 
                type='password' 
                id="password" 
                autoComplete='off' 
                placeholder="Enter your Password"
                className="sign-input"
                required
              />

              <fieldset className="sign-culture-domain">
                <legend>Sub region:</legend>
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
                <div className="sign-culture-options">
                  <input type="radio" id="Other" name="cultureDomain" value="Other" required />
                  <label htmlFor="Other">Other</label>
                </div>
              </fieldset>
            </>
          )}

          {userType === 'Moderator' && (
            <>
              <label htmlFor="password" className="sign-label">Password:</label>
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

          <button type="submit" className="sign-btn" style={{ marginTop: '1rem', fontSize: '15px' }}>Create Account</button>
          <div className='sign-login'>
            <p style={{ fontSize: '15px' }}>Already have an account? <Link to="/Login" className="sign-link">Login</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Sign;
