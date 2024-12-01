import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../Register/firebase";
import './adminforgetpass.css';
import { collection, query, getDocs } from "firebase/firestore";
 import LOGO from '../images/Logo.png';
import '../Register/Pop-Message.css'
import { Helmet } from 'react-helmet';


export function AdminForgetPass() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const checkEmailExists = async (email) => {
    const normalizedEmail = email.toLowerCase();  
    
    const adminsRef = collection(db, "Admin"); 
    
    try {
      const adminsSnapshot = await getDocs(adminsRef); 
       const adminExists = adminsSnapshot.docs.some(doc => {
        const adminEmail = doc.data().email;  
        return adminEmail && adminEmail.toLowerCase() === normalizedEmail;
      });
      
      return adminExists;  
    } catch (error) {
      console.error("Error checking email existence in Admin collection:", error);
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
    <div className="Adminforgot-password-page">
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

      <div className="Adminforgot-password-container">
        <div className="Adminforgot-password-left-section">
          <div className="Adminforgot-password-logo-welcome-container">
            <img src={LOGO} alt="Logo" width="100" height="100" />
            <h2>Verify your email</h2>
          </div>
          <p className="Adminforgot-password-welcome-txt">Enter your email to reset your password.</p>
        </div>

        <form className="Adminforgot-password-form" onSubmit={handleSubmit}>
          <h2 className="Adminforgot-password-title">Forgot Password</h2>
          <label htmlFor="email" className="Adminforgot-password-label">Email Address:</label>
          <input
            type="email"
            id="email"
            className="Adminforgot-password-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
          <button type="submit" className="Adminforgot-password-btn" disabled={loading}>
            {loading ? "Sending..." : "Send"}
          </button>
          <div className='Adminforgot-login'>
            <p style={{ fontSize: '15px' }}>Remember your password? <Link to="/adminlogin" className="Adminforgot-link">Login</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminForgetPass;