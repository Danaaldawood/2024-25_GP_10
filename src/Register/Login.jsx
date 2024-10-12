import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
 import LOGO from '../images/Logo.png';
 
 import './Register.css';
const Login = () => {
 




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
            <h2>Welcome Back!</h2>
          </div>
          <p className="Wtxt">"To CultureLens! We’re glad to have you with us again to explore more cultural diversity.

</p>
        </div>

        {/* Form Section */}
        <form className="sign-form" onSubmit={handleCreateAccount}>
          <h2 className="sign-title">Log-in</h2>
          
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

          <label htmlFor="email" className="sign-label">Email Address</label>
          <input 
            type='email' 
            id="email" 
            autoComplete='off' 
            placeholder="Enter your Email Address"
            className="sign-input"
            required
          />

          <label htmlFor="password" className="sign-label">Password</label>
          <input 
            type='password' 
            id="password" 
            autoComplete='off' 
            placeholder="Enter your Password"
            className="sign-input"
            required
          />

          <button type="submit" className="sign-btn" style={{ marginTop: '1rem', fontSize: '15px' }}>Login</button>
          <div className='sign-login'>
            <p style={{ fontSize: '15px' }}>Don't have an account? <Link to="/Sign" className="sign-link">Create account</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

 

export default Login;

