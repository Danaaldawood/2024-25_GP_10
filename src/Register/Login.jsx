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

const Login = () => {
  const { t } = useTranslation("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("User");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Change the selected user type (either 'User' or 'Moderator')

  const handleUserTypeChange = (type) => {
    setUserType(type);
  };
  //handel a submission for login
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    // Ensure both email and password are filled

    if (!email.trim() || !password.trim()) {
      setErrorMessage(t("Please complete all required fields."));
      return;
    }

    try {
      // sign in with the provided email and password

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      // Choose the appropriate collection based on user type User or Moderator

      const collectionPath = userType === "User" ? "Users" : "Moderators";
      const userDoc = await getDoc(doc(db, collectionPath, user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();

        if (userType === "Moderator") {
          // Handle moderator specific status checks

          if (userData.status === "Pending") {
            setErrorMessage(
              t("Sorry, your request is pending until approval. ")
            );
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
      // If an error occurs during sign-in, display an error message
      setErrorMessage(t("loginPage.errorIncorrectCredentials"));
      setIsLoading(false);
    }
  };
  return (
    <>
      <Helmet>
        <title>{t("loginPage.helmetTitle")}</title>
        <meta name="description" content={t("loginPage.helmetDescription")} />
      </Helmet>

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
      {/* Login page container */}

      <div className="Login-page">
        <div className="Login-container">
          {/* Left section with logo and welcome message */}

          <div className="left-section">
            <div className="logo-welcome-container">
              <img src={LOGO} alt="Logo" width="100" height="100" />
              <h2>{t("loginPage.welcomeBack")}</h2>
            </div>
            <p className="Welcome-txt">{t("loginPage.welcomeText")}</p>
          </div>

          {/* Login form */}

          <form className="Login-form" onSubmit={handleCreateAccount}>
            <h2 className="Login-title">{t("loginPage.loginTitle")}</h2>

            {/* User type selection  */}

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
            {/* Password input field with toggle visibility using icon  */}

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
              <span
                onClick={togglePasswordVisibility}
                className="password-icon"
              >
                <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
              </span>
            </div>
            {/* Forgot password link */}

            <p className="forget-password">
              <Link to="/forgot" className="Login-link">
                {t("loginPage.forgetPassword")}
              </Link>
            </p>

            <button type="submit" className="Login-btn" disabled={isLoading}>
              {isLoading
                ? t("loginPage.loggingIn")
                : t("loginPage.loginButton")}
            </button>
            {/* Link to create a new account */}

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
