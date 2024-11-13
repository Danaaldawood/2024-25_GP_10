import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AdminLogin.css';
import LOGO from '../images/Logo.png';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase'; 
import './Pop-Message.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { Helmet } from 'react-helmet';

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false); 
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(""); 

    try {
      const adminCredential = await signInWithEmailAndPassword(auth, email, password);
      const admin = adminCredential.user;

      // After successful login, navigate to admin dashboard or desired route
      navigate('/admin'); // You can replace this with the actual path of the admin dashboard

    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        setErrorMessage('Incorrect password.');
      } else if (error.code === 'auth/user-not-found') {
        setErrorMessage('No account found with this email.');
      } else {
        setErrorMessage('An error occurred. Please try again.');
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

      {errorMessage && (
        <div className="error-popup">
          <h3 className="error-title">Warning!</h3>
          <p className="error-message">{errorMessage}</p>
          <div className="error-actions">
            <button className="confirm-btn" onClick={() => setErrorMessage("")}>Try again</button>
          </div>
        </div>
      )}

      <div className="login-container">
        {/* Left Section */}
        <div className="Adminleft-section">
          <div className="logo-welcome-container">
            <img src={LOGO} alt="Logo" width="100" height="100" />
            <h2>Welcome Admin!</h2>
          </div>
         </div>

        {/* Form Section */}
        <form className="login-form" onSubmit={handleLogin}>
          <h2 className="login-title">Log-in</h2>

          {/* Email */}
          <label htmlFor="email" className="login-label">Email Address:</label>
          <input 
            type="email" 
            id="email" 
            placeholder="Enter your email address"
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password */}
          <label className="login-label" htmlFor="password">Password:</label>
          <div className="password-container">
            <input 
              type={showPassword ? "text" : "password"} 
              id="password" 
              placeholder="Enter your password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span onClick={togglePasswordVisibility} className="password-icon">
              <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
            </span>
          </div>

          <p className="Adminforgot-password">
            <Link to="/adminforgetpass" className="Adminlogin-link">Forgot Password?</Link>
          </p>

          <button type="submit" className="Adminlogin-btn" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>

          <div className="Adminlogin-register">
            <p style={{ fontSize: '15px' }}>Don't have an account? <Link to="/adminR" className="Adminlogin-link">Create Account</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
