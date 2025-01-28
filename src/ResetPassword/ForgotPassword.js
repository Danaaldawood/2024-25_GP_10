import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../Register/firebase";
import { collection, query, getDocs } from "firebase/firestore";
import './ForgotPassword.css';
import LOGO from '../images/Logo.png';
import '../Register/Pop-Message.css'
import { Helmet } from 'react-helmet';
import { useTranslation } from "react-i18next";

export function ForgotPassword() {
  const { t ,i18n} = useTranslation("ForgetPass");   

  // State variables
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Function to check if email exists in Firestore
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
      console.error(t("Errorcheckingemail:"), error);
      throw error;
    }
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const emailExists = await checkEmailExists(email);

      if (!emailExists) {
        setError(t("Thereisnoaccountregistered"));
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
      {/* Helmet for page title and meta description */}
      <Helmet>
        <title>Forgot Password</title>
        <meta name="description" content="Forgot Password page" />
      </Helmet>
      
       {/* Error popup */}
{error && (
  <div className="error-popup">
    <h3 className="error-title">{t("errorTitle")}</h3>
    <p className="error-message">{error}</p>
    <div className="error-actions">
      <button className="confirm-btn" onClick={() => setError("")}>{t("tryAgain")}</button>
    </div>
  </div>
)}

{/* Success popup */}
{showSuccess && (
  <div className="success-popup">
    <h3 className="success-title">{t("successTitle")}</h3>
    <p className="success-message">{t("successMessage")}</p>
    <div className="success-actions">
     
    </div>
  </div>
)}

{/* Forgot password container */}
<div className="forgot-password-container">
  {/* Left section */}
  <div className="forgot-password-left-section">
    <div className="forgot-password-logo-welcome-container">
      <img src={LOGO} alt="Logo" width="100" height="100" />
      <h2>{t("verifyEmail")}</h2>
    </div>
    <p className="forgot-password-welcome-txt">{t("enterEmailMessage")}</p>
  </div>

  {/* Forgot password form */}
  <form className="forgot-password-form" onSubmit={handleSubmit}>
    <h2 className="forgot-password-title">{t("forgotPassword")}</h2>
    <label htmlFor="email" className="forgot-password-label">{t("emailAddress")}</label>
    <input
      type="email"
      id="email"
      className="forgot-password-input"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      placeholder={t("enterEmailPlaceholder")}
      required
    />
    <button type="submit" className="forgot-password-btn" disabled={loading}>
      {loading ? t("sendingBtn") : t("sendBtn")}
    </button>

    <div className="forgot-login">
      <p style={{ fontSize: "15px" }}>
        {t("rememberPassword")}?{" "}
        <Link to="/login" className="forgot-link">{t("loginLink")}</Link>
      </p>
    </div>
  </form>
</div>
    </div>
  );
}

export default ForgotPassword;