import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../Register/firebase";
import { collection, query, getDocs } from "firebase/firestore";
import './ForgotPassword.css';
import LOGO from '../images/Logo.png';
import '../Register/Pop-Message.css'
import { Helmet } from 'react-helmet';


export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const checkEmailExists = async (email) => {
    const normalizedEmail = email.toLowerCase();
    
    const usersRef = collection(db, "Users");
    const moderatorsRef = collection(db, "Moderators");

    try {
      const [usersSnapshot, moderatorsSnapshot] = await Promise.all([
        getDocs(usersRef),
        getDocs(moderatorsRef)
      ]);

      const userExists = usersSnapshot.docs.some(doc => {
        const userEmail = doc.data().email;
        return userEmail && userEmail.toLowerCase() === normalizedEmail;
      });

      const moderatorExists = moderatorsSnapshot.docs.some(doc => {
        const moderatorEmail = doc.data().email;
        return moderatorEmail && moderatorEmail.toLowerCase() === normalizedEmail;
      });

      return userExists || moderatorExists;
    } catch (error) {
      console.error("Error checking email existence:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const emailExists = await checkEmailExists(email);

      if (!emailExists) {
        setError("There is no account registered with this email address.");
        setLoading(false);
        return;
      }

      await sendPasswordResetEmail(auth, email);
      setShowSuccess(true);
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <Helmet>
      <title>Forgot Password</title>
      <meta name="description" content="Forgot Password page" />
    </Helmet>
      {error && (
        <div className="error-popup">
          <h3 className="error-title">Warning!</h3>
          <p className="error-message">{error}</p>
          <div className="error-actions">
            <button className="confirm-btn" onClick={() => setError("")}>Try again</button>
          </div>
        </div>
      )}
      
      {showSuccess && (
        <div className="success-popup">
          <h3 className="success-title">Success!</h3>
          <p className="success-message">Password reset email sent! Please check your inbox.</p>
          <div className="success-actions">
           
          </div>
        </div>
      )}

      <div className="forgot-password-container">
        <div className="forgot-password-left-section">
          <div className="forgot-password-logo-welcome-container">
            <img src={LOGO} alt="Logo" width="100" height="100" />
            <h2>Verify your email</h2>
          </div>
          <p className="forgot-password-welcome-txt">Enter your email to reset your password.</p>
        </div>

        <form className="forgot-password-form" onSubmit={handleSubmit}>
          <h2 className="forgot-password-title">Forgot Password</h2>
          <label htmlFor="email" className="forgot-password-label">Email Address:</label>
          <input
            type="email"
            id="email"
            className="forgot-password-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
          <button type="submit" className="forgot-password-btn" disabled={loading}>
            {loading ? "Sending..." : "Send"}
          </button>
          <div className='forgot-login'>
            <p style={{ fontSize: '15px' }}>Remember your password? <Link to="/login" className="forgot-link">Login</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;