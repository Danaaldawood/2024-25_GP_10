/* ==============================================
   1. IMPORT 
   ============================================== */
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
   import { setDoc, doc, collection, query, where, getDocs } from "firebase/firestore";
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
   import TermsModal from "./TermsModal";
   
   /* ==============================================
      2. COMPONENT DEFINITION AND STATE
      ============================================== */
   const Sign = () => {
     const { t } = useTranslation("signup");
     const navigate = useNavigate();
   
     // Form states
     const [email, setEmail] = useState("");
     const [password, setPassword] = useState("");
     const [fname, setFname] = useState("");
     const [region, setRegion] = useState("");
     const [regionM, setRegionM] = useState("");
     const [reason, setReason] = useState("");
     const [country, setCountry] = useState("");
     const [userType, setUserType] = useState("User");
     const [Linkedin, setLinkedin] = useState("");
   
     // UI states
     const [showSuccess, setShowSuccess] = useState(false);
     const [errorMessage, setErrorMessage] = useState("");
     const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
     const [showPassword, setShowPassword] = useState(false);
     const [isTyping, setIsTyping] = useState(false);
     const [isPasswordFocused, setIsPasswordFocused] = useState(false);
   
     // Terms modal states
     const [showTermsModal, setShowTermsModal] = useState(false);
     const [termsAccepted, setTermsAccepted] = useState(false);
   
     // Password validation states
     const isMinCharacters = password.length >= 8;
     const hasUppercase = /[A-Z]/.test(password);
     const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
     const isPasswordValid = isMinCharacters && hasUppercase && hasSpecialChar;
   
     /* ==============================================
        3. EFFECTS AND HANDLERS
        ============================================== */
     // Success message timeout handler
     useEffect(() => {
       if (showSuccess) {
         const timer = setTimeout(() => {
           setShowSuccess(false);
         }, 2000);
         return () => clearTimeout(timer);
       }
     }, [showSuccess]);
   
     const togglePasswordVisibility = () => {
       setShowPassword(!showPassword);
     };
   
     const handlePasswordChange = (e) => {
       const newPassword = e.target.value;
       setPassword(newPassword);
       setIsTyping(newPassword.length > 0);
     };
   
     const handleUserTypeChange = (type) => {
       setUserType(type);
     };
   
     const handleCountryChange = (selectedOption) => {
       setCountry(selectedOption);
     };
   
     /* ==============================================
        4. REGISTRATION HANDLER
        ============================================== */
     const handleRegister = async (e) => {
       e.preventDefault();
   
       // Terms validation
       if (!termsAccepted) {
        setErrorMessage(t("Please accept the terms and conditions to continue."));
        return;
       }
   
       // Basic fields validation
       if (!password.trim() || !fname.trim() || !email.trim()) {
         setErrorMessage (t("Please complete all required fields."));
         return;
       }
   
       // Password validation
       if (!isPasswordValid) {
         let errorMessages = [];
         if (!isMinCharacters) errorMessages.push(t("Password must be at least 8 characters."));
         if (!hasUppercase) errorMessages.push(t("Password must contain at least one uppercase letter."));
         if (!hasSpecialChar) errorMessages.push(t("Password must contain at least one special character."));       
         setPasswordErrorMessage(errorMessages.join(" "));
         return;
       }
   
       // User type specific validation
       if (userType === "User" && (!region || !country)) {
         setErrorMessage(t("Please complete all required fields."));
         return;
       }
       if (userType === "Moderator") {
        if (!regionM || !reason.trim() || !Linkedin.trim()) {
          setErrorMessage(t("Please complete all required fields."));
          return;
        }
      
        if (regionM === "Other") {
          setErrorMessage(t( "We currently only accept moderators from Arab, Western, or Chinese regions."));
          return;
        }
      }
      
       try {
         // Check if email is blocked in Users collection
         const usersRef = collection(db, "Users");
         const userQuery = query(usersRef, where("email", "==", email));
         const userSnapshot = await getDocs(userQuery);
   
         if (!userSnapshot.empty) {
           const userData = userSnapshot.docs[0].data();
           if (userData.status === "blocked") {
             setErrorMessage  (t("EmailBlocked"));
             return;
           }
         }
   
         // Check if email is blocked in Moderators collection
         const moderatorsRef = collection(db, "Moderators");
         const modQuery = query(moderatorsRef, where("email", "==", email));
         const modSnapshot = await getDocs(modQuery);
   
         if (!modSnapshot.empty) {
           const modData = modSnapshot.docs[0].data();
           if (modData.status === "blocked") {
             setErrorMessage (t("EmailBlocked"));
             return;
           }
         }
   
         // Email domain validation
         const allowedDomains = [
           "gmail.com",
           "hotmail.com",
           "yahoo.com",
           "outlook.com",
           "live.com",
           "icloud.com",
           "protonmail.com",
           "student.ksu.edu.sa",
           "KSU.EDU.SA",
         ];
         const emailPattern = new RegExp(
           `^[^\\s@]+@(${allowedDomains.join("|").replace(/\./g, "\\.")})$`,
           "i"
         );
         if (!emailPattern.test(email)) {
          setErrorMessage(t("allowedEmail"));
           return;
         }
   
         // Create user
         const userCredential = await createUserWithEmailAndPassword(auth, email, password);
         const user = userCredential.user;
   
         if (user) {
           const collectionPath = userType === "User" ? "Users" : "Moderators";
           let userData = userType === "User"
             ? {
                 User_Id: user.uid,
                 email: user.email,
                 fullName: fname,
                 region,
                 country: country?.label?.props?.children[1] || null,
                 status: 'active'
               }
             : {
                 Moderator_Id: user.uid,
                 email: email,
                 fullName: fname,
                 regionM,
                 reason,
                 Linkedin,
                 status: "Pending",
                 RequestDate: new Date().toISOString(),
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
          setErrorMessage(t("emailAlreadyInUse"));
        } else {
           setErrorMessage(t("genericError"));
         }
       }
     };
   
     /* ==============================================
        5. COUNTRY OPTIONS SETUP
        ============================================== */
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
   
     /* ==============================================
        6. COMPONENT RENDER
        ============================================== */
     return (
       <div className="sign-page">
         {/* Meta tags */}
         <Helmet>
           <title>{t("createAccount")} - CultureLens</title>
           <meta name="description" content="Create an account on CultureLens" />
         </Helmet>
   
         {/* Error Message Popup */}
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
   
         {/* Success Message Popup */}
         {showSuccess && (
           <div className="success-popup">
             <FontAwesomeIcon icon={faCheckCircle} className="success-icon" />
             <p className="success-message">
               {userType === "User"
                 ? t("Your account created")
                 : t("Your request submitted")}
             </p>
           </div>
         )}
   
         <div className="sign-container">
           {/* Left Section */}
           <div className="Left-section">
             <div className="logo-welcome-container">
               <img src={LOGO} alt="Logo" width="100" height="100" />
               <h2>{t("welcome")}</h2>
             </div>
             <p className="Welcome-txt">{t("toCultureLens")}</p>
           </div>
   
           {/* Registration Form */}
           <form className="sign-form" onSubmit={handleRegister}>
             {/* Form Title */}
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
   
             {/* User Form */}
             {userType === "User" && (
               <>
                 {/* Name Input */}
                 <label htmlFor="name" className="sign-label">
                   {t("fullName")}
                 </label>
                 <input
                   type="text"
                   id="name"
                   placeholder={t("EnterYourFullName")}
                   className="sign-input"
                   value={fname}
                   onChange={(e) => setFname(e.target.value)}
                 />
   
                 {/* Email Input */}
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
   
                 {/* Country Selection */}
                 <label className="sign-label">{t("country")}</label>
                 <Select
                   options={countryOptions}
                   value={country}
                   onChange={handleCountryChange}
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
   
                 {/* Password Input */}
                 <div>
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
                       onChange={handlePasswordChange}
                     />
                     <span
                       onClick={togglePasswordVisibility}
                       className="password-icon"
                     >
                       <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                     </span>
                   </div>
   
                   {/* Password Requirements */}
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
   
                 {/* Region Selection */}
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
                 </>
               )}
     
               {/* Moderator Form */}
               {userType === "Moderator" && (
                 <>
                   <label htmlFor="name" className="sign-label">
                     {t("fullName")}
                   </label>
                   <input
                     type="text"
                     id="name"
                     placeholder={t("EnterYourFullName")}
                     className="sign-input"
                     value={fname}
                     onChange={(e) => setFname(e.target.value)}
                   />
     
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
     
                   <label htmlFor="Linkedin" className="sign-label">
                     {t("Linkedin")}
                   </label>
                   <input
                     type="url"
                     id="Linkedin"
                     placeholder={t("Enter your LinkedIn URL")}
                     className="sign-input"
                     value={Linkedin}
                     onChange={(e) => setLinkedin(e.target.value)}
                   />
     
                   <label htmlFor="reason" className="sign-label">
                     {t("Reason")}
                   </label>
                   <textarea
                     id="reason"
                     placeholder={t("Enterareason")}
                     className="sign-input"
                     value={reason}
                     onChange={(e) => setReason(e.target.value)}
                   />
     
                   <div>
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
                         onChange={handlePasswordChange}
                       />
                       <span
                         onClick={togglePasswordVisibility}
                         className="password-icon"
                       >
                         <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                       </span>
                     </div>
     
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
     
                   {/* Region Selection for Moderator */}
                   <fieldset className="sign-culture-domain">
                     <legend>{t("region")}</legend>
                     <div className="sign-culture-options">
                       <input
                         type="radio"
                         id="ArabM"
                         name="cultureDomainM"
                         value="Arab"
                         onChange={(e) => setRegionM(e.target.value)}
                       />
                       <label htmlFor="ArabM">{t("arab")}</label>
                     </div>
                     <div className="sign-culture-options">
                       <input
                         type="radio"
                         id="WesternM"
                         name="cultureDomainM"
                         value="Western"
                         onChange={(e) => setRegionM(e.target.value)}
                       />
                       <label htmlFor="WesternM">{t("western")}</label>
                     </div>
                     <div className="sign-culture-options">
                       <input
                         type="radio"
                         id="ChineseM"
                         name="cultureDomainM"
                         value="Chinese"
                         onChange={(e) => setRegionM(e.target.value)}
                       />
                       <label htmlFor="ChineseM">{t("chinese")}</label>
                     </div>
                     <div className="sign-culture-options">
                       <input
                         type="radio"
                         id="OtherM"
                         name="cultureDomainM"
                         value="Other"
                         onChange={(e) => setRegionM(e.target.value)}
                       />
                       <label htmlFor="OtherM">{t("other")}</label>
                     </div>
                   </fieldset>
                 </>
               )}
     
               {/* Terms and Conditions Checkbox */}
               <div className="terms-checkbox">
                 <label className="checkbox-container">
                   <input
                     type="checkbox"
                     checked={termsAccepted}
                     onChange={(e) => setTermsAccepted(e.target.checked)}
                   />
                  <span className="term-line">{t("I have read and accept the")} </span>
<a
  href="#"
  onClick={(e) => {
    e.preventDefault();
    setShowTermsModal(true);
  }}
  className="terms-link"
>
  {t("Terms and Conditions")}
</a>

                 </label>
               </div>
     
               {/* Submit Button */}
               <button type="submit" className="sign-btn">
                 {userType === "User" ? t("createAccount") : t("Send Request")}
               </button>
     
               {/* Login Link */}
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
     
           {/* Terms Modal */}
           <TermsModal
             isOpen={showTermsModal}
             onClose={() => setShowTermsModal(false)}
             userType={userType}
           />
         </div>
       );
     };
     
     export default Sign;