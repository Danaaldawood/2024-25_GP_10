import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css';
import LOGO from '../images/Logo.png';
import Select from 'react-select';
import countryList from 'react-select-country-list';
import Flag from 'react-world-flags';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from './firebase'; 
 import { SuccessMessage, ErrorMessage } from './Message';     

const Sign = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fname, setFname] = useState("");
  const [age, setAge] = useState("");
  const [region, setRegion] = useState("");
  const [subRegion, setSubRegion] = useState("");
  const [userType, setUserType] = useState('User');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

 
  const handleRegister = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      setShowError(true);
      setTimeout(() => setShowError(false), 3000); 
      return;
    }
  
    
  
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      setShowError(true);
      return;
    }
  
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;
  
      if (user) {
        const collectionPath = userType === 'User' ? 'Users' : 'Moderators';
        let userData = userType === 'User'
          ? {
              email: user.email,
              fullName: fname,
              age: age || null,
              region: region ? region.value : null,
              subRegion: subRegion || null
            }
          : {
              email: user.email,
              fullName: fname
            };
        
        userData = Object.fromEntries(Object.entries(userData).filter(([_, v]) => v !== null && v !== ""));
        await setDoc(doc(db, collectionPath, user.uid), userData);
  
        setShowSuccess(true);  
        
        setTimeout(() => {
          navigate(userType === 'User' ? '/Home' : '/moderator');
        }, 1000);
      }
      
    } catch (error) {
      console.log(error.message);
      setErrorMessage("Something went wrong. Please try again.");
      setShowError(true); 
    }
  };
  

  const handleUserTypeChange = (type) => {
    setUserType(type);
  };

  const handleCountryChange = (selectedOption) => {
    setRegion(selectedOption);
  };

  const handleSubRegionChange = (e) => {
    setSubRegion(e.target.value);
  };

  const countryOptions = countryList().getData().map((country) => ({
    value: country.value,
    label: (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Flag code={country.value} style={{ width: 20, height: 15, marginRight: 10 }} />
        {country.label}
      </div>
    ),
  }));
 
  return (
    <div className="sign-page">
      {showSuccess && <SuccessMessage onClose={() => setShowSuccess(false)} />}
      {showError && <ErrorMessage onClose={() => setShowError(false)} errorMessage={errorMessage} />}

      {!showSuccess && !showError && (
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
          <form className="sign-form" onSubmit={handleRegister}>
            <h2 className="sign-title">Create Account</h2>

            {/* User Type Selection */}
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

            {/* Full Name */}
            <label htmlFor="name" className="sign-label">Full Name:</label>
            <input 
              type="text" 
              id="name" 
              placeholder="Enter your full name"
              className="sign-input"
              value={fname}
              onChange={(e) => setFname(e.target.value)}
              required
            />

            {/* Email */}
            <label htmlFor="email" className="sign-label">Email Address:</label>
            <input 
              type="email" 
              id="email" 
              placeholder="Enter your email address"
              className="sign-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {/* Additional Fields for User Type */}
            {userType === 'User' && (
              <>
                {/* Age */}
                <label htmlFor="age" className="sign-label">Age:</label>
                <input 
                  type="number" 
                  id="age" 
                  placeholder="Enter your age"
                  className="sign-input"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                />
                <label className="sign-label">Region:</label>

          <Select 
  options={countryOptions} 
  value={region}
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
      marginBottom: '20px', // تعديل: إضافة مسافة بين الحقلين
    }),
    valueContainer: (styles) => ({
      ...styles,
      padding: '0 0.75rem',
    }),
  }}
/>



                {/* Password */}
                <label htmlFor="password" className="sign-label" >Password:</label>
                <input 
                  type="password" 
                  id="password" 
                  placeholder="Enter your password"
                  className="sign-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                {/* Culture Domain */}
                <fieldset className="sign-culture-domain">
                  <legend>Sub Region:</legend>
                  <div className="sign-culture-options">
                    <input type="radio" id="Arab" name="cultureDomain" value="Arab" onChange={handleSubRegionChange} required />
                    <label htmlFor="Arab">Arab</label>
                  </div>
                  <div className="sign-culture-options">
                    <input type="radio" id="Western" name="cultureDomain" value="Western" onChange={handleSubRegionChange} required />
                    <label htmlFor="Western">Western</label>
                  </div>
                  <div className="sign-culture-options">
                    <input type="radio" id="Chinese" name="cultureDomain" value="Chinese" onChange={handleSubRegionChange} required />
                    <label htmlFor="Chinese">Chinese</label>
                  </div>
                  <div className="sign-culture-options">
                    <input type="radio" id="Other" name="cultureDomain" value="Other" onChange={handleSubRegionChange} required />
                    <label htmlFor="Other">Other</label>
                  </div>
                </fieldset>
              </>
            )}

            {/* Password for Moderator */}
            {userType === 'Moderator' && (
              <div>
                <label htmlFor="password" className="sign-label">Password:</label>
                <input 
                  type="password" 
                  id="password" 
                  placeholder="Enter your password"
                  className="sign-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Submit Button */}
 
            <button type="submit" className="sign-btn" style={{ marginTop: '1rem', fontSize: '15px' }}>
              Create Account
            </button>
            <div className="sign-login">
              <p style={{ fontSize: '15px' }}>
                Already have an account? <Link to="/Login" className="sign-link">Login</Link>
              </p>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Sign;
