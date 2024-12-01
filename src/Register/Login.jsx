/* ==============================================
   1. IMPORT 
   ============================================== */
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LOGO from "../images/Logo.png";
import { auth, db } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import "./Login.css";
import "./Pop-Message.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";

/* ==============================================
   2. COMPONENT DEFINITION AND STATE
   ============================================== */
const Login = () => {
  const { t } = useTranslation("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("User");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  /* ==============================================
     3. HELPER FUNCTIONS
     ============================================== */
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle user type selection (User/Moderator)
  const handleUserTypeChange = (type) => {
    setUserType(type);
  };

  /* ==============================================
     4. FORM SUBMISSION HANDLER
     ============================================== */
  const handleCreateAccount = async (e) => {
    e.preventDefault();

    // Input validation
    if (!email.trim() || !password.trim()) {
      setErrorMessage(t("Please complete all required fields."));
      return;
    }

    try {
      // Firebase authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // User type verification and routing
      const collectionPath = userType === "User" ? "Users" : "Moderators";
      const userDoc = await getDoc(doc(db, collectionPath, user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Handle moderator specific status checks
        if (userType === "Moderator") {
          if (userData.status === "Pending") {
            setErrorMessage(t("Sorry, your request is pending until approval. "));
            setIsLoading(false);
          } else if (userData.status === "Denied") {
            setErrorMessage(t("Sory your request is denied"));
            setIsLoading(false);
          } else if (userData.status === "Approved") {
            navigate("/moderator");
          } else {
            setErrorMessage(t("loginPage.accessDenied"));
            setIsLoading(false);
          }
        } else {
          // For regular users
          navigate("/HomePage");
        }
      } else {
        // If the document does not exist, display an access denied message
        setErrorMessage(t("loginPage.accessDenied"));
        setIsLoading(false);
      }
    } catch (error) {
      // Error handling
      setErrorMessage(t("loginPage.errorIncorrectCredentials"));
      setIsLoading(false);
    }
  };

  /* ==============================================
     5. COMPONENT 
     ============================================== */
  return (
    <>
      {/* Meta tags (Helmet) */}
      <Helmet>
        <title>{t("loginPage.helmetTitle")}</title>
        <meta name="description" content={t("loginPage.helmetDescription")} />
      </Helmet>

      {/* Error popup message */}
      {errorMessage && (
        <div className="error-popup">
          <h3 className="error-title">{t("loginPage.errorTitle")}</h3>
          <p className="error-message">{errorMessage}</p>
          <div className="error-actions">
            <button className="confirm-btn" onClick={() => setErrorMessage("")}>
              {t("loginPage.tryAgain")}
            </button>
          </div>
        </div>
      )}

      {/* Main container structure */}
      <div className="Login-page">
        <div className="Login-container">
          {/* ------------------------
             5.1 Left Section
             ------------------------ */}
          <div className="left-section">
            <div className="logo-welcome-container">
              <img src={LOGO} alt="Logo" width="100" height="100" />
              <h2>{t("loginPage.welcomeBack")}</h2>
            </div>
            <p className="Welcome-txt">{t("loginPage.welcomeText")}</p>
          </div>

          {/* ------------------------
             5.2 Login Form Section
             ------------------------ */}
          <form className="Login-form" onSubmit={handleCreateAccount}>
            {/* Form title */}
            <h2 className="Login-title">{t("loginPage.loginTitle")}</h2>

            {/* User type selection buttons */}
            <div className="Login-user-type-container">
              <button
                type="button"
                className={`Login-user-type-btn ${
                  userType === "User" ? "Login-active" : ""
                }`}
                onClick={() => handleUserTypeChange("User")}
              >
                {t("loginPage.userTypeUser")}
              </button>
              <button
                type="button"
                className={`Login-user-type-btn ${
                  userType === "Moderator" ? "Login-active" : ""
                }`}
                onClick={() => handleUserTypeChange("Moderator")}
              >
                {t("loginPage.userTypeModerator")}
              </button>
            </div>

            {/* Email input field */}
            <label htmlFor="email" className="Login-label">
              {t("loginPage.emailLabel")}
            </label>
            <div className="input-container">
              <input
                type="email"
                id="email"
                autoComplete="off"
                placeholder={t("loginPage.emailPlaceholder")}
                className="Login-input"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password input field with toggle */}
            <label className="Login-label" htmlFor="password">
              {t("loginPage.passwordLabel")}
            </label>
            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder={t("loginPage.passwordPlaceholder")}
                className="Login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span onClick={togglePasswordVisibility} className="password-icon">
                <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
              </span>
            </div>

            {/* Forgot password link */}
            <p className="forget-password">
              <Link to="/forgot" className="Login-link">
                {t("loginPage.forgetPassword")}
              </Link>
            </p>

            {/* Submit button */}
            <button type="submit" className="Login-btn" disabled={isLoading}>
              {isLoading ? t("loginPage.loggingIn") : t("loginPage.loginButton")}
            </button>

            {/* Create account link */}
            <div className="Login-login">
              <p style={{ fontSize: "15px" }}>
                {t("loginPage.noAccount")}{" "}
                <Link to="/Sign" className="Login-link">
                  {t("loginPage.createAccountLink")}
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};


export default Login;