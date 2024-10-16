//Import Page ,Package//
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Signin.css';
import LOGO from '../images/Logo.png';
import Select from 'react-select';
import countryList from 'react-select-country-list';
import Flag from 'react-world-flags';
import { createUserWithEmailAndPassword, validatePassword } from 'firebase/auth';
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from './firebase'; 
import './Pop-Message.css'
import { Password } from '@mui/icons-material';

 const Sign = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fname, setFname] = useState("");
  const [age, setAge] = useState("");
  const [region, setRegion] = useState("");
  const [subRegion, setSubRegion] = useState("");
  const [userType, setUserType] = useState('User');
 const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Age validate
     if (age < 0) {
      setErrorMessage("Invalied age,age cannot be negative.");
      return;
    }
  // Password validate
     if (password.length < 8) {
      setErrorMessage("Password should be at least 8 characters.");
      return;
    }
    // Email validate
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
  
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;
      if (user) {
        const collectionPath = userType === 'User' ? 'Users' : 'Moderators';
        let userData = userType === 'User'
  ? {
      User_Id: user.uid,  // UserId    
      email: user.email,
      fullName: fname,
      age: age || null,
      region: region ? region.label.props.children[1] : null,
      subRegion: subRegion || null
    }
  : {
      Moderator_Id: user.uid,  // ModeratorId  
      email: user.email,
      fullName: fname
    };

        await setDoc(doc(db, collectionPath, user.uid), userData);
  
        setShowSuccess(true);
        
        setTimeout(() => {
          navigate(userType === 'User' ? '/Home' : '/moderator');
        }, 3000);
      }
    } catch (error) {
      console.log(error.message);
      setErrorMessage("Something went wrong. Please try again.");
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
        {errorMessage && (
          <div className="error-popup">
            <h3 className="error-title">Warning!</h3>
            <p className="error-message">{errorMessage}</p>
            <div className="error-actions">
              <button className="confirm-btn" onClick={() => setErrorMessage("")}>Try again</button>
            </div>
          </div>
        )}
        
        {showSuccess && (
  <div className="success-popup">
    <h3 className="success-title">Success!</h3>
    <p className="success-message">Your account has been created successfully.</p>
    <div className="success-actions">
      <button className="Continue-btn" onClick={() => {
        setShowSuccess(false);
        navigate(userType === 'User' ? '/Home' : '/moderator');
      }}>
        Continue
      </button>
    </div>
  </div>
)}

        <div className="sign-container">
          {/* Left Section */}
          <div className="Left-section">
            <div className="logo-welcome-container">
              <img src={LOGO} alt="Logo" width="100" height="100" />
              <h2>Welcome</h2>
            </div>
            <p className="Welcome-txt">To CultureLens! Let's explore cultural diversity together.</p>
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
      height: '50px',   
      borderRadius: '5px',
      fontSize: '13px',
      padding: '0',   
      boxShadow: 'none',
      borderColor: isFocused ? '#004D60' : '#ddd',              
      '&:hover': { borderColor: '#004D60' },           
      marginBottom: '20px',
    }),
    valueContainer: (styles) => ({
      ...styles,
      padding: '10px', 
    }),
    placeholder: (styles) => ({
      ...styles,
      fontSize: '13px',
    }),
    dropdownIndicator: (styles) => ({
      ...styles,
      padding: '0 8px',   
    })
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
      
    </div>
  );
};

export default Sign;
