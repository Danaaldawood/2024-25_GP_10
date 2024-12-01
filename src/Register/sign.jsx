import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Signin.css";
import LOGO from "../images/Logo.png";
import Select from "react-select";
import countryList from "react-select-country-list";
import Flag from "react-world-flags";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "./firebase";
import "./Pop-Message.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";

const Sign = () => {
  // States for managing form inputs and validation

  const { t } = useTranslation("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fname, setFname] = useState("");
  const [region, setRegion] = useState("");
  const [regionM, setRegionM] = useState("");
  const [reason, setReason] = useState("");
  const [country, setCountry] = useState("");
  const [userType, setUserType] = useState("User");
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [isRequestSent, setIsRequestSent] = useState(false);
  const [userId, setUserId] = useState(""); // For storing last 4 digits of user ID
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const isMinCharacters = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isPasswordValid = isMinCharacters && hasUppercase && hasSpecialChar;

  // Success popup timeout handler

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  // Toggles password visibility

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handles password input change with validation

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    if (newPassword.length > 0) {
      setIsTyping(true);
    } else {
      setIsTyping(false);
    }
  };

  // Fetches authenticated user information and sets user ID

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

    return () => unsubscribe();
  }, []);
  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Reset previous error message
    setPasswordErrorMessage("");
    // Validation checks for empty fields

    if (!password.trim()) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    if (!fname.trim() || !email.trim() || !password.trim()) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    // Password strength validation

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
      setPasswordErrorMessage(errorMessages.join(" "));
      return;
    }

    // Validation based on user type

    if (userType === "User") {
      if (!region || !country) {
        setErrorMessage("Please complete all required fields.");
        return;
      }
    } else if (userType === "Moderator") {
      if (!regionM || !reason.trim()) {
        setErrorMessage("Please complete all required fields.");
        return;
      }
      //  check moderator reigon
      if (regionM === "Other") {
        setErrorMessage(
          "We currently only accept moderators from Arab, Western, or Chinese regions."
        );
        return;
      }
    }
    // Enhanced Email Validation
    // allowed domains
    const allowedDomains = [
      "gmail.com",
      "hotmail.com",
      "yahoo.com",
      "outlook.com",
      "live.com",
      "icloud.com",
      "protonmail.com",
    ];
    const emailPattern = new RegExp(
      `^[^\\s@]+@(${allowedDomains.join("|").replace(/\./g, "\\.")})$`,
      "i"
    );
    if (!emailPattern.test(email)) {
      setErrorMessage(
        "Please enter a valid email address with an allowed domain."
      );
      return;
    }

    try {
      // Create user with Firebase

      await createUserWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;

      if (user) {
        const collectionPath = userType === "User" ? "Users" : "Moderators";
        let userData =
          userType === "User"
            ? {
                User_Id: user.uid,
                email: user.email,
                fullName: fname,
                region,
                country: country?.label?.props?.children[1] || null,
              }
            : {
                Moderator_Id: user.uid,
                email: email,
                fullName: fname,
                regionM,
                reason,
                status: "Pending",
                RequestDate: new Date().toISOString(), // Capture current date and time
              };

        await setDoc(doc(db, collectionPath, user.uid), userData);

        setShowSuccess(true);
        setTimeout(() => {
          if (userType === "User") {
            navigate("/Home");
          }
        }, 1000);
      }
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setErrorMessage("This email address is already registered.");
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    }
  };

  // Handles change in user type

  const handleUserTypeChange = (type) => {
    setUserType(type);
  };

  //  Handles country selection

  const handleCountryChange = (selectedOption) => {
    setCountry(selectedOption);
  };

  //  country options for select input

  const countryOptions = countryList()
    .getData()
    .map((country) => ({
      value: country.value,
      label: (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Flag
            code={country.value}
            style={{ width: 20, height: 15, marginRight: 10 }}
          />
          {country.label}
        </div>
      ),
    }));

  return (
    <div className="sign-page">
      <Helmet>
        <title>{t("createAccount")} - My Website</title>
        <meta name="description" content="Create an account on My website" />
      </Helmet>

      {errorMessage && (
        <div className="error-popup">
          <h3 className="error-title">{t("Warning")}!</h3>
          <p className="error-message">{errorMessage}</p>
          <div className="error-actions">
            <button className="confirm-btn" onClick={() => setErrorMessage("")}>
              {t("tryAgain")}
            </button>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="success-popup">
          <FontAwesomeIcon icon={faCheckCircle} className="success-icon" />
          <p className="success-message">
            {userType === "User"
              ? t("Your account has been created successfully")
              : t("Your request has been submitted successfully!")}
          </p>
        </div>
      )}

      <div className="sign-container">
        <div className="Left-section">
          <div className="logo-welcome-container">
<img src={LOGO} alt="Logo" width="100" height="100" />
            <h2>{t("welcome")}</h2>
          </div>
          <p className="Welcome-txt">{t("toCultureLens")}</p>
        </div>

        <form className="sign-form" onSubmit={handleRegister}>
          <h2 className="sign-title">{t("createAccount")}</h2>
          {/* User Type Selection */}

          <div className="sign-user-type-container">
            <button
              type="button"
              className={`sign-user-type-btn ${
                userType === "User" ? "sign-active" : ""
              }`}
              onClick={() => handleUserTypeChange("User")}
            >
              {t("userType")}
            </button>
            <button
              type="button"
              className={`sign-user-type-btn ${
                userType === "Moderator" ? "sign-active" : ""
              }`}
              onClick={() => handleUserTypeChange("Moderator")}
            >
              {t("moderatorType")}
            </button>
          </div>
          {/* User form */}
          {userType === "User" && (
            <>
              {/* name input*/}
              <label htmlFor="name" className="sign-label">
                {t("fullName")}
              </label>
              <input
                type="text"
                id="name"
                placeholder={t("Enter Your Full Name")}
                className="sign-input"
                value={fname}
                onChange={(e) => setFname(e.target.value)}
              />
              {/* email input */}
              <label htmlFor="email" className="sign-label">
                {t("email")}
              </label>
              <input
                type="email"
                id="email"
                placeholder={t("enterEmail")}
                className="sign-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {/* country select input */}
              <label className="sign-label">{t("country")}</label>
              <Select
                options={countryOptions}
                value={country}
                onChange={setCountry}
                placeholder={t("selectCountry")}
                styles={{
                  control: (styles, { isFocused }) => ({
                    ...styles,
                    width: "100%",
                    height: "50px",
                    borderRadius: "5px",
                    fontSize: "13px",
                    padding: "0",
                    boxShadow: "none",
                    borderColor: isFocused ? "#004D60" : "#ddd",
                    "&:hover": { borderColor: "#004D60" },
                    marginBottom: "10px",
                  }),
                  valueContainer: (styles) => ({
                    ...styles,
                    padding: "10px",
                  }),
                  placeholder: (styles) => ({
                    ...styles,
                    fontSize: "13px",
                  }),
                  dropdownIndicator: (styles) => ({
                    ...styles,
                    padding: "0 8px",
                  }),
                }}
              />
              <div>
                {/* passowrd input */}
                <label className="Login-label" htmlFor="password">
                  {t("password")}
                </label>
                <div className="password-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder={t("enterPassword")}
                    className="Login-input"
                    value={password}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    onChange={handlePasswordChange} // use handlePasswordChange
                  />
                  <span
                    onClick={togglePasswordVisibility}
                    className="password-icon"
                  >
                    <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                  </span>
                </div>

                {/*Password */}
                {isTyping && (
                  <ul className="password-requirements">
                    <li className={isMinCharacters ? "valid" : "invalid"}>
                      {t("passwordRequirements.minChars")}
                    </li>
                    <li className={hasUppercase ? "valid" : "invalid"}>
                      {t("passwordRequirements.uppercase")}
                    </li>
                    <li className={hasSpecialChar ? "valid" : "invalid"}>
                      {t("passwordRequirements.specialChar")}
                    </li>
                  </ul>
                )}
              </div>
              {/* reigon  */}
              <fieldset className="sign-culture-domain">
                <legend>{t("region")}</legend>
                <div className="sign-culture-options">
                  <input
                    type="radio"
                    id="Arab"
                    name="cultureDomain"
                    value="Arab"
                    onChange={(e) => setRegion(e.target.value)}
                  />
                  <label htmlFor="Arab">{t("arab")}</label>
                </div>
                <div className="sign-culture-options">
                  <input
                    type="radio"
                    id="Western"
                    name="cultureDomain"
                    value="Western"
                    onChange={(e) => setRegion(e.target.value)}
                  />
                  <label htmlFor="Western">{t("western")}</label>
                </div>
                <div className="sign-culture-options">
                  <input
                    type="radio"
                    id="Chinese"
                    name="cultureDomain"
                    value="Chinese"
                    onChange={(e) => setRegion(e.target.value)}
                  />
                  <label htmlFor="Chinese">{t("chinese")}</label>
                </div>
                <div className="sign-culture-options">
                  <input
                    type="radio"
                    id="Other"
                    name="cultureDomain"
                    value="Other"
                    onChange={(e) => setRegion(e.target.value)}
                  />
                  <label htmlFor="Other">{t("other")}</label>
                </div>
              </fieldset>

              <button type="submit" className="sign-btn">
                {t("createAccount")}
              </button>
            </>
          )}

          {/* moderator form */}

          {userType === "Moderator" && (
            <>
              {/* name input */}
              <label htmlFor="name" className="sign-label">
                {t("fullName")}
              </label>
              <input
                type="text"
                id="name"
                placeholder={t("enterFullName")}
                className="sign-input"
                value={fname}
                onChange={(e) => setFname(e.target.value)}
              />

              {/* email input */}

              <label htmlFor="email" className="sign-label">
                {t("email")}
              </label>
              <input
                type="email"
                id="email"
                placeholder={t("enterEmail")}
                className="sign-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {/* reason input */}

              <label htmlFor="reason" className="sign-label">
                {t("Reason")}
              </label>
              <textarea
                id="reason"
                placeholder={t("ُEnter your reason")}
                className="sign-input"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <div>
                {/* password input */}

                <label className="Login-label" htmlFor="password">
                  {t("password")}
                </label>
                <div className="password-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder={t("enterPassword")}
                    className="Login-input"
                    value={password}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    onChange={handlePasswordChange} // use handlePasswordChange
                  />
                  <span
                    onClick={togglePasswordVisibility}
                    className="password-icon"
                  >
                    <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                  </span>
                </div>

                {/*Password */}
                {isTyping && (
                  <ul className="password-requirements">
                    <li className={isMinCharacters ? "valid" : "invalid"}>
                      {t("passwordRequirements.minChars")}
                    </li>
                    <li className={hasUppercase ? "valid" : "invalid"}>
                      {t("passwordRequirements.uppercase")}
                    </li>
                    <li className={hasSpecialChar ? "valid" : "invalid"}>
                      {t("passwordRequirements.specialChar")}
                    </li>
                  </ul>
                )}
              </div>
              {/* reigon */}
              <fieldset className="sign-culture-domain">
                <legend>{t("region")}</legend>
                <div className="sign-culture-options">
                  <input
                    type="radio"
                    id="Arab"
                    name="cultureDomain"
                    value="Arab"
                    onChange={(e) => setRegionM(e.target.value)}
                  />
                  <label htmlFor="Arab">{t("arab")}</label>
                </div>
                <div className="sign-culture-options">
                  <input
                    type="radio"
                    id="Western"
                    name="cultureDomain"
                    value="Western"
                    onChange={(e) => setRegionM(e.target.value)}
                  />
                  <label htmlFor="Western">{t("western")}</label>
                </div>
                <div className="sign-culture-options">
                  <input
                    type="radio"
                    id="Chinese"
                    name="cultureDomain"
                    value="Chinese"
                    onChange={(e) => setRegionM(e.target.value)}
                  />
                  <label htmlFor="Chinese">{t("chinese")}</label>
                </div>
                <div className="sign-culture-options">
                  <input
                    type="radio"
                    id="Other"
                    name="cultureDomain"
                    value="Other"
                    onChange={(e) => setRegionM(e.target.value)}
                  />
                  <label htmlFor="Other">{t("other")}</label>
                </div>
              </fieldset>

              <button type="submit" className="sign-btn">
                {t("Send Request")}
              </button>
            </>
          )}

          <div className="sign-login" style={{ marginTop: "1rem" }}>
            <p>
              {t("alreadyHaveAccount")}{" "}
              <Link to="/Login" className="sign-link">
                {t("login")}
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Sign;
