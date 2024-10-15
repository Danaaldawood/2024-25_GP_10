import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LOGO from '../images/Logo.png';
import { auth, db } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import './Login.css';//import desgine page
import './Pop-Message.css'

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState('User');
  const [errorMessage, setErrorMessage] = useState(""); 
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleUserTypeChange = (type) => {
    setUserType(type);
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(""); 
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const collectionPath = userType === 'User' ? 'Users' : 'Moderators';
      const userDoc = await getDoc(doc(db, collectionPath, user.uid));

      if (userDoc.exists()) {
        navigate(userType === 'User' ? '/HomePage' : '/moderator');
      } else {
        setErrorMessage("User type not recognized. Please contact support.");
        setIsLoading(false);

      }
      
    } catch (error) {
      setErrorMessage("An error occurred. Incorrect Email/Password.");
      console.log(error.message);
      setIsLoading(false);
    }
    
  };
  const handleInvalidInput = (event) => {
    event.target.setCustomValidity('Please fill in this field.');
  };
  
  const resetCustomValidity = (event) => {
    event.target.setCustomValidity('');
  };

  return (
    <>
      {errorMessage && (
        <div className="error-popup">
          <h3 className="error-title">Warning!</h3>
          <p className="error-message">{errorMessage}</p>
          <div className="error-actions">
            <button className="confirm-btn" onClick={() => setErrorMessage("")}>Try again</button>
          </div>
        </div>
      )}
      
      <div className="Login-page">
        <div className="Login-container">
          {/* left Section */}
          <div className="left-section">
            <div className="logo-welcome-container">
              <img src={LOGO} alt="Logo" width="100" height="100" />
              <h2>Welcome Back!</h2>
            </div>
            <p className="Welcome-txt">To CultureLens! We’re glad to have you with us again to explore more cultural diversity.</p>
          </div>
  
          {/* Form Section */}
          <form className="Login-form" onSubmit={handleCreateAccount}>
            <h2 className="Login-title">Log-in</h2>
            
            <div className="Login-user-type-container">
              <button 
                type="button" 
                className={`Login-user-type-btn ${userType === 'User' ? 'Login-active' : ''}`} 
                onClick={() => handleUserTypeChange('User')}
              >
                User
              </button>
              <button 
                type="button" 
                className={`Login-user-type-btn ${userType === 'Moderator' ? 'Login-active' : ''}`} 
                onClick={() => handleUserTypeChange('Moderator')}
              >
                Moderator
              </button>
            </div>
  
            <label htmlFor="email" className="Login-label">Email Address:</label>
<div className="input-container">
  <input 
    type="email" 
    id="email" 
    autoComplete="off" 
    placeholder="Enter your Email Address"
    className="Login-input"
    required
    onChange={(e) => setEmail(e.target.value)}   
     
  />
 </div>

<label htmlFor="password" className="Login-label">Password:</label>
<div className="input-container">
  <input 
    type="password" 
    id="password" 
    autoComplete="off" 
    placeholder="Enter your Password"
    className="Login-input"
    required
    onChange={(e) => setPassword(e.target.value)}   
    
  />
 </div>

 
            <p className="forget-password" >
              <Link to="/ResetPassword" className="Login-link">
                Forget Password?
              </Link>
            </p>
  
            <button type="submit" className="Login-btn"  disabled={isLoading}>
              {isLoading ? "Logging in.." : "Login"}
            </button>
            <div className='Login-login'>
              <p style={{ fontSize: '15px' }}>Don't have an account? <Link to="/Sign" className="Login-link">Create account</Link></p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};  
export default Login;
