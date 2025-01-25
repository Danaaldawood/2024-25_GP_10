import React, { useState } from "react";
import { getAuth, confirmPasswordReset } from "firebase/auth";
import { useLocation, useNavigate } from "react-router-dom";
import "./ResetPassword.css";
import LOGO from "../images/Logo.png";
import "../Register/Pop-Message.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import {
  faEye,
  faEyeSlash,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { Helmet } from "react-helmet";

export const ResetPassword = () => {
  const { t ,i18n} = useTranslation("RestPass");   

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // Retrieve query parameters from URL

  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const oobCode = query.get("oobCode");
  // Password validation

  const isMinCharacters = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const isPasswordValid = isMinCharacters && hasUppercase && hasSpecialChar;
  const doPasswordsMatch = newPassword === confirmPassword;
  // Toggle visibility of password

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  // Handle form submission for resetting passwor
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!isPasswordValid) {
      let errorMessages = [];
      if (!isMinCharacters)
        errorMessages.push("Password must be at least 8 characters.");
      if (!hasUppercase)
        errorMessages.push(
          "Password must contain at least one uppercase letter."
        );
      if (!hasSpecialChar)
        errorMessages.push(
          "Password must contain at least one special character."
        );
      setError(errorMessages.join(" "));
      setLoading(false);
      return;
    }

    if (!doPasswordsMatch) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }
    // Perform password reset using Firebase API

    const auth = getAuth();
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setShowSuccess(true);
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (err) {
      setError("Error updating password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-page">
      <Helmet>
        <title>Rest Password</title>
        <meta name="description" content="Rest Password page" />
      </Helmet>
      {/* Display error messages */}

       {/* Error popup */}
       {error && (
        <div className="error-popup">
          <h3 className="error-title">{t("warning")}</h3>
          <p className="error-message">{error}</p>
          <div className="error-actions">
            <button className="confirm-btn" onClick={() => setError("")}>
              {t("tryAgain")}
            </button>
          </div>
        </div>
      )}

      {/* Success popup */}
      {showSuccess && (
        <div className="success-popup">
          <FontAwesomeIcon icon={faCheckCircle} className="success-icon" />
          <p className="success-message">{t("passwordUpdated")}</p>
        </div>
      )}

      {/* Password reset form */}
      <div className="reset-password-container">
        <div className="reset-password-left-section">
          <div className="reset-password-logo-welcome-container">
            <img src={LOGO} alt="Logo" width="100" height="100" />
            <h2>{t("resetPassword")}</h2>
          </div>
          <p className="reset-password-welcome-txt">{t("enterNewPassword")}</p>
        </div>

        <form className="reset-password-form" onSubmit={handleSubmit}>
          <h2 className="reset-password-title">{t("changePassword")}</h2>

          <label className="reset-password-label" htmlFor="newPassword">
            {t("newPassword")}
          </label>
          <div className="reset-password-input-container">
            <input
              type={showPassword ? "text" : "password"}
              id="newPassword"
              className="reset-password-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t("newPassword")}
              required
            />
            <span onClick={togglePasswordVisibility} className="reset-password-icon">
              <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
            </span>
          </div>

          <ul className="password-requirements">
            <li className={isPasswordValid ? "valid" : "invalid"}>{t("minCharacters")}</li>
            <li className={hasUppercase ? "valid" : "invalid"}>{t("uppercaseLetter")}</li>
            <li className={hasSpecialChar ? "valid" : "invalid"}>{t("specialCharacter")}</li>
          </ul>

          <label className="reset-password-label" htmlFor="confirmPassword">
            {t("confirmPassword")}
          </label>
          <div className="reset-password-input-container">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              className="reset-password-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t("confirmPassword")}
              required
            />
            <span onClick={toggleConfirmPasswordVisibility} className="reset-password-icon">
              <FontAwesomeIcon icon={showConfirmPassword ? faEye : faEyeSlash} />
            </span>
          </div>

          {confirmPassword && (
            <ul className="password-requirements">
              <li className={doPasswordsMatch ? "valid" : "invalid"}>{t("passwordMatch")}</li>
            </ul>
          )}

          <button
            type="submit"
            className="reset-password-btn"
            disabled={loading || !isPasswordValid || !doPasswordsMatch}
          >
            {loading ? t("updating") : t("updatePassword")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
