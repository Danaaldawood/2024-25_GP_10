// Import
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AdminLogin.css';
import LOGO from '../images/Logo.png';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase'; 
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';   
import './Pop-Message.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { Helmet } from 'react-helmet';

const AdminLogin = () => {
  // State variables 
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); 
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 
  const [nonAdminMessage, setNonAdminMessage] = useState(""); 
  const navigate = useNavigate(); 

  // Function to toggle the visibility of the password field
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Function to handle login logic when the form is submitted
  const handleLogin = async (e) => {
    e.preventDefault(); 
    setIsLoading(true); 
    setErrorMessage(""); 
    setNonAdminMessage(""); 

    // Validate input fields
    if (!email.trim() || !password.trim()) {
      setErrorMessage(('Please complete all required fields.'));
      return;
    }

    try {
      // Sign in using Firebase authentication
      const adminCredential = await signInWithEmailAndPassword(auth, email, password);
      const admin = adminCredential.user;

      // Check if the user is registered as an admin in Firestore
      const adminDocRef = doc(db, 'Admin', admin.uid);  
      const adminDocSnap = await getDoc(adminDocRef);

      if (adminDocSnap.exists()) {
        navigate('/admin');
      } else {
        // Display a message if the user does not have admin privileges
        setNonAdminMessage('Sorry, you don’t have the privilege to be an admin.');
      }
    } catch (error) {
      // Handle specific Firebase authentication errors
      if (error.code === 'auth/wrong-password') {
        setErrorMessage('Incorrect password.');
      } else if (error.code === 'auth/user-not-found') {
        setErrorMessage('No account found with this email.');
      } else {
        setErrorMessage('An error occurred. Incorrect Email/Password.');
      }
      setIsLoading(false); 
    }
  };

  return (
    <div className="login-page">
      <Helmet>
        <title>Admin Login Page</title>
        <meta name="description" content="Admin Login page of My website" />
      </Helmet>

      {/* Error message popup */}
      {errorMessage && (
        <div className="error-popup">
          <h3 className="error-title">Warning!</h3>
          <p className="error-message">{errorMessage}</p>
          <div className="error-actions">
            <button className="confirm-btn" onClick={() => setErrorMessage("")}>Try again</button>
          </div>
        </div>
      )}

      {/* Non-admin access message popup */}
      {nonAdminMessage && (
        <div className="error-popup">
          <h3 className="error-title">Access Denied</h3>
          <p className="error-message">{nonAdminMessage}</p>
          <div className="error-actions">
            <button className="confirm-btn" onClick={() => setNonAdminMessage("")}>Try again</button>
          </div>
        </div>
      )}

      <div className="login-container">
        {/* Left section of the login page */}
        <div className="Adminleft-section">
          <div className="logo-welcome-container">
            <img src={LOGO} alt="Logo" width="100" height="100" /> {/* Company or app logo */}
            <h2>Welcome Admin!</h2>
          </div>
        </div>

        {/* Login form section */}
        <form className="login-form" onSubmit={handleLogin}>
          <h2 className="login-title">Log-in</h2>

          {/* Email input field */}
          <label htmlFor="email" className="login-label">Email Address:</label>
          <input 
            type="email" 
            id="email" 
            placeholder="Enter your email address"
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Password input field with visibility toggle */}
          <label className="login-label" htmlFor="password">Password:</label>
          <div className="password-container">
            <input 
              type={showPassword ? "text" : "password"} 
              id="password" 
              placeholder="Enter your password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span onClick={togglePasswordVisibility} className="password-icon">
              <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
            </span>
          </div>

          {/* Forgot password link */}
          <p className="Adminforgot-password">
            <Link to="/adminforgetpass" className="Adminlogin-link">Forgot Password?</Link>
          </p>

          {/* Submit button */}
          <button type="submit" className="Adminlogin-btn">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
