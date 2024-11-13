import React, { useState ,useEffect} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AdminRegister.css';
import LOGO from '../images/Logo.png';
import { createUserWithEmailAndPassword,onAuthStateChanged } from 'firebase/auth';
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from './firebase'; 
import './Pop-Message.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { Helmet } from 'react-helmet';

const AdminRegister = () => {
        const [email, setEmail] = useState("");
        const [password, setPassword] = useState("");
        const [fullName, setFullName] = useState("");
        const [showSuccess, setShowSuccess] = useState(false);
        const [errorMessage, setErrorMessage] = useState("");
        const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
        const [userId, setUserId] = useState(null);  // Added userId state
        const navigate = useNavigate();
        const [showPassword, setShowPassword] = useState(false);  

  const isMinCharacters = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isPasswordValid = isMinCharacters && hasUppercase && hasSpecialChar;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Get the last four characters of the user ID
        const lastFourUID = user.uid.slice(-4); 
        setUserId(`user_${lastFourUID}`);
      } else {
        console.error("User is not authenticated");
      }
    });

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, []);
  const handleRegister = async (e) => {
    e.preventDefault();
     
    if (!isPasswordValid) {
      let errorMessages = [];
      if (!isMinCharacters) errorMessages.push("Password must be at least 8 characters.");
      if (!hasUppercase) errorMessages.push("Password must contain at least one uppercase letter.");
      if (!hasSpecialChar) errorMessages.push("Password must contain at least one special character.");
      setPasswordErrorMessage(errorMessages.join(" "));
      return;
    }
  
    // Email validation  
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
  
    try {
      const AdminCredential = await createUserWithEmailAndPassword(auth, email, password);
      const Admin = AdminCredential.user;  // Corrected here
  
      // Construct user data
      const AdminData = {
        Admin_Id: Admin.uid,
        email: Admin.email,
        fullName: fullName,
      };
  
      // Save user data to Firestore
      await setDoc(doc(db, 'Admin', Admin.uid), AdminData);  // Corrected here
  
      // Show success message and navigate after delay
      setShowSuccess(true);
      setTimeout(() => navigate('/admin'), 1000);
  
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('This email address is already registered.');
      } else if (error.code === 'auth/invalid-email') {
        setErrorMessage('Invalid email address format.');
      } else if (error.code === 'auth/weak-password') {
        setErrorMessage('Password should be at least 6 characters.');
      } else {
        setErrorMessage('Something went wrong. Please try again.');
      }
    }
  };
  
  return (
    <div className="sign-page">
      <Helmet>
        <title>Create Account Page</title>
        <meta name="description" content="This is the Create Account of My website" />
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
      {showSuccess && (
        <div className="success-popup">
          <FontAwesomeIcon icon={faCheckCircle} className="success-icon" />
          <p className="success-message">Your account has been created successfully.</p>
        </div>
      )}

      <div className="sign-container">
        {/* Left Section */}
        <div className="AdminLeft-section">
          <div className="logo-welcome-container">
            <img src={LOGO} alt="Logo" width="100" height="100" />
            <h2>Welcome Admin!</h2>
          </div>
 
        </div>

        {/* Form Section */}
        <form className="sign-form" onSubmit={handleRegister}>
          <h2 className="sign-title">Create Account</h2>
          
          {/* Full Name */}
          <label htmlFor="name" className="sign-label">Full Name:</label>
          <input 
            type="text" 
            id="name" 
            placeholder="Enter your full name"
            className="sign-input"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
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
               
          {/* Password */}
          <div>
            <label className="Login-label" htmlFor="password">Password:</label>
            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Enter your password"
                className="Login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span onClick={togglePasswordVisibility} className="password-icon">
                <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
              </span>
            </div>

            <ul className="password-requirements">
              <li className={isMinCharacters ? 'valid' : 'invalid'}>
                ✔ Password should be at least 8 characters.
              </li>
              <li className={hasUppercase ? 'valid' : 'invalid'}>
                ✔ Contain at least one uppercase letter.
              </li>
              <li className={hasSpecialChar ? 'valid' : 'invalid'}>
                ✔ Contain at least one special character.
              </li>
            </ul>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="Adminsign-btn" 
            disabled={!isPasswordValid} 
            style={{ marginTop: '1rem', fontSize: '15px' }}
          >
            Create Account
          </button>
          
          <div className="Adminsign-login">
            <p style={{ fontSize: '15px' }}>
              Already have an account? <Link to="/adminlogin" className="Adminsign-link">Log-in</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminRegister;
