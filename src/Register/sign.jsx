// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import './Signin.css';
// import LOGO from '../images/Logo.png';
// import Select from 'react-select';
// import countryList from 'react-select-country-list';
// import Flag from 'react-world-flags';
// import { createUserWithEmailAndPassword } from 'firebase/auth';
// import { setDoc, doc } from "firebase/firestore";
// import { auth, db } from './firebase'; 
// import './Pop-Message.css'
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faEye, faEyeSlash, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
// import { Helmet } from 'react-helmet';

// const Sign = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [fname, setFname] = useState("");
//   const [region, setRegion] = useState("");
//   const [regionM, setRegionM] = useState("");
//   const [country, setCountry] = useState("");
//   const [userType, setUserType] = useState('User');
//   const [showSuccess, setShowSuccess] = useState(false);
//   const [errorMessage, setErrorMessage] = useState("");
//   const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
//   const navigate = useNavigate();
//   const [showPassword, setShowPassword] = useState(false); 
  
//   const isMinCharacters = password.length >= 8;
//   const hasUppercase = /[A-Z]/.test(password);
//   const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
//   const isPasswordValid = isMinCharacters && hasUppercase && hasSpecialChar;

//   const togglePasswordVisibility = () => {
//     setShowPassword(!showPassword);
//   };

//   const handleRegister = async (e) => {
//     e.preventDefault();

//     if (!isPasswordValid) {
//       let errorMessages = [];
//       if (!isMinCharacters) errorMessages.push("Password must be at least 8 characters.");
//       if (!hasUppercase) errorMessages.push("Password must contain at least one uppercase letter.");
//       if (!hasSpecialChar) errorMessages.push("Password must contain at least one special character.");
//       setPasswordErrorMessage(errorMessages.join(" "));
//       return;
//     }

//     // Email validate  
//     const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailPattern.test(email)) {
//       setErrorMessage("Please enter a valid email address.");
//       return;
//     }

//     // Check if moderator selected "Other" region
//     if (userType === 'Moderator' && regionM === 'Other') {
//       setErrorMessage("We currently only accept moderators from Arab, Western, or Chinese regions.");
//       return;
//     }
  
//     try {
//       await createUserWithEmailAndPassword(auth, email, password);
//       const user = auth.currentUser;
//       if (user) {
//         const collectionPath = userType === 'User' ? 'Users' : 'Moderators';
//         let userData = userType === 'User'
//         ? {
//             User_Id: user.uid,
//             email: user.email,
//             fullName: fname,
//             region: region,  
//             country: country && country.label && country.label.props ? country.label.props.children[1] : null
//           }
//         : {
//             Moderator_Id: user.uid,
//             email: user.email,
//             fullName: fname,
//             regionM: regionM
//           };
//           await setDoc(doc(db, collectionPath, user.uid), userData);
//           setShowSuccess(true);
//           setTimeout(() => {
//             navigate(userType === 'User' ? '/Home' : '/moderator');
//           }, 1000);
//         }
//       } catch (error) {
//         if (error.code === 'auth/email-already-in-use') {
//           setErrorMessage("This email address is already registered.");
//         } else {
//           setErrorMessage("Something went wrong. Please try again.");
//         }
//       }
//     };

//   const handleUserTypeChange = (type) => {
//     setUserType(type);
//   };

//   const handleCountryChange = (selectedOption) => {
//     setCountry(selectedOption);  
//   };

//   const countryOptions = countryList().getData().map((country) => ({
//     value: country.value,
//     label: (
//       <div style={{ display: 'flex', alignItems: 'center' }}>
//         <Flag code={country.value} style={{ width: 20, height: 15, marginRight: 10 }} />
//         {country.label}
//       </div>
//     ),
//   }));
 
//   return (
//     <div className="sign-page">
//       <Helmet>
//         <title>Create Account Page</title>
//         <meta name="description" content="This is the Create Account of My website" />
//       </Helmet>      
   
//       {errorMessage && (
//         <div className="error-popup">
//           <h3 className="error-title">Warning!</h3>
//           <p className="error-message">{errorMessage}</p>
//           <div className="error-actions">
//             <button className="confirm-btn" onClick={() => setErrorMessage("")}>Try again</button>
//           </div>
//         </div>
//       )}
        
//       {showSuccess && (
//         <div className="success-popup">
//           <FontAwesomeIcon icon={faCheckCircle} className="success-icon" />
//           <p className="success-message">Your account has been created successfully.</p>
//         </div>
//       )}

//       <div className="sign-container">
//         {/* Left Section */}
//         <div className="Left-section">
//           <div className="logo-welcome-container">
//             <img src={LOGO} alt="Logo" width="100" height="100" />
//             <h2>Welcome</h2>
//           </div>
//           <p className="Welcome-txt">To CultureLens! Let's explore cultural diversity together.</p>
//         </div>

//         {/* Form Section */}
//         <form className="sign-form" onSubmit={handleRegister}>
//           <h2 className="sign-title">Create Account</h2>

//           {/* User Type Selection */}
//           <div className="sign-user-type-container">
//             <button 
//               type="button" 
//               className={`sign-user-type-btn ${userType === 'User' ? 'sign-active' : ''}`} 
//               onClick={() => handleUserTypeChange('User')}
//             >
//               User
//             </button>
//             <button 
//               type="button" 
//               className={`sign-user-type-btn ${userType === 'Moderator' ? 'sign-active' : ''}`} 
//               onClick={() => handleUserTypeChange('Moderator')}
//             >
//               Moderator
//             </button>
//           </div>

//           {/* Full Name */}
//           <label htmlFor="name" className="sign-label">Full Name:</label>
//           <input 
//             type="text" 
//             id="name" 
//             placeholder="Enter your full name"
//             className="sign-input"
//             value={fname}
//             onChange={(e) => setFname(e.target.value)}
//             required
//           />

//           {/* Email */}
//           <label htmlFor="email" className="sign-label">Email Address:</label>
//           <input 
//             type="email" 
//             id="email" 
//             placeholder="Enter your email address"
//             className="sign-input"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />

//           {/* Additional Fields for User Type */}
//           {userType === 'User' && (
//             <>
//               <label className="sign-label">Country:</label>
//               <Select 
//                 options={countryOptions} 
//                 value={country}   
//                 onChange={handleCountryChange}
//                 placeholder="Select your country"
//                 styles={{
//                   control: (styles, { isFocused }) => ({
//                     ...styles,
//                     width: '100%',
//                     height: '50px',
//                     borderRadius: '5px',
//                     fontSize: '13px',
//                     padding: '0',
//                     boxShadow: 'none',
//                     borderColor: isFocused ? '#004D60' : '#ddd',
//                     '&:hover': { borderColor: '#004D60' },
//                     marginBottom: '10px',
//                   }),
//                   valueContainer: (styles) => ({
//                     ...styles,
//                     padding: '10px',
//                   }),
//                   placeholder: (styles) => ({
//                     ...styles,
//                     fontSize: '13px',
//                   }),
//                   dropdownIndicator: (styles) => ({
//                     ...styles,
//                     padding: '0 8px',
//                   })
//                 }}
//               />

//               {/* Password */}
//               <div>
//                 <label className="Login-label" htmlFor="password">Password:</label>
//                 <div className="password-container">
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     id="password"
//                     placeholder="Enter your password"
//                     className="Login-input"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     required
//                   />
//                   <span onClick={togglePasswordVisibility} className="password-icon">
//                     <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
//                   </span>
//                 </div>

//                 <ul className="password-requirements">
//                   <li className={isMinCharacters ? 'valid' : 'invalid'}>
//                     ✔ Password should be at least 8 characters.
//                   </li>
//                   <li className={hasUppercase ? 'valid' : 'invalid'}>
//                     ✔ Contain at least one uppercase letter.
//                   </li>
//                   <li className={hasSpecialChar ? 'valid' : 'invalid'}>
//                     ✔ Contain at least one special character.
//                   </li>
//                 </ul>
//               </div>

//               <fieldset className="sign-culture-domain">
//                 <legend>Region:</legend>
//                 <div className="sign-culture-options">
//                   <input type="radio" id="Arab" name="cultureDomain" value="Arab" onChange={(e) => setRegion(e.target.value)} required />
//                   <label htmlFor="Arab">Arab</label>
//                 </div>
//                 <div className="sign-culture-options">
//                   <input type="radio" id="Western" name="cultureDomain" value="Western" onChange={(e) => setRegion(e.target.value)} required />
//                   <label htmlFor="Western">Western</label>
//                 </div>
//                 <div className="sign-culture-options">
//                   <input type="radio" id="Chinese" name="cultureDomain" value="Chinese" onChange={(e) => setRegion(e.target.value)} required />
//                   <label htmlFor="Chinese">Chinese</label>
//                 </div>
//                 <div className="sign-culture-options">
//                   <input type="radio" id="Other" name="cultureDomain" value="Other" onChange={(e) => setRegion(e.target.value)} required />
//                   <label htmlFor="Other">Other</label>
//                 </div>
//               </fieldset>
//             </>
//           )}

//           {userType === 'Moderator' && (
//             <>
//               <div>
//                 <label className="Login-label" htmlFor="password">Password:</label>
//                 <div className="password-container">
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     id="password"
//                     placeholder="Enter your password"
//                     className="Login-input"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     required
//                   />
//                   <span onClick={togglePasswordVisibility} className="password-icon">
//                     <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
//                   </span>
//                 </div>

//                 <ul className="password-requirements">
//                   <li className={isMinCharacters ? 'valid' : 'invalid'}>
//                     ✔ Password should be at least 8 characters.
//                   </li>
//                   <li className={hasUppercase ? 'valid' : 'invalid'}>
//                     ✔ Contain at least one uppercase letter.
//                   </li>
//                   <li className={hasSpecialChar ? 'valid' : 'invalid'}>
//                     ✔ Contain at least one special character.
//                   </li>
//                 </ul>
//               </div>

//               <fieldset className="sign-culture-domain">
//                 <legend>Region:</legend>
//                 <div className="sign-culture-options">
//                   <input type="radio" id="Arab" name="cultureDomain" value="Arab" onChange={(e) => setRegionM(e.target.value)} required />
//                   <label htmlFor="Arab">Arab</label>
//                 </div>
//                 <div className="sign-culture-options">
//                   <input type="radio" id="Western" name="cultureDomain" value="Western" onChange={(e) => setRegionM(e.target.value)} required />
//                   <label htmlFor="Western">Western</label>
//                 </div>
//                 <div className="sign-culture-options">
//                   <input type="radio" id="Chinese" name="cultureDomain" value="Chinese" onChange={(e) => setRegionM(e.target.value)} required />
//                   <label htmlFor="Chinese">Chinese</label>
//                 </div>
//                 <div className="sign-culture-options">
//                   <input type="radio" id="Other" name="cultureDomain" value="Other" onChange={(e) => setRegionM(e.target.value)} required />
//                   <label htmlFor="Other">Other</label>
//                 </div>
//               </fieldset>
//             </>
//           )}

//           {/* Submit Button */}
//           <button 
//             type="submit" 
//             className="sign-btn" 
//             disabled={!isPasswordValid} 
//             style={{ marginTop: '1rem', fontSize: '15px' }}
//           >
//             Create Account
//           </button>
          
//           <div className="sign-login">
//             <p style={{ fontSize: '15px' }}>
//               Already have an account? <Link to="/Login" className="sign-link">Log-in</Link>
//             </p>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Sign;



import React, { useState ,useEffect} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Signin.css';
import LOGO from '../images/Logo.png';
import Select from 'react-select';
import countryList from 'react-select-country-list';
import Flag from 'react-world-flags';
import { createUserWithEmailAndPassword ,onAuthStateChanged} from 'firebase/auth';
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from './firebase'; 
import './Pop-Message.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

// Inside the component

const Sign = () => {
  const { t } = useTranslation('signup');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fname, setFname] = useState("");
  const [region, setRegion] = useState("");
  const [regionM, setRegionM] = useState("");
  const[reason,setReason]=useState("");
  const [country, setCountry] = useState("");
  const [userType, setUserType] = useState('User');
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [isRequestSent, setIsRequestSent] = useState(false);
  const [userId, setUserId] = useState("");  // For storing last 4 digits of user ID
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false); 
  const [isTyping, setIsTyping] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);  
  const isMinCharacters = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isPasswordValid = isMinCharacters && hasUppercase && hasSpecialChar;
   
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

    if (newPassword.length > 0) {
      setIsTyping(true);   
    } else {
      setIsTyping(false);   
    }
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
     

     return () => unsubscribe();
  }, []);
  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");  // Reset previous error message
    setPasswordErrorMessage("");

     if (!password.trim()) {
      setErrorMessage("Please complete all required fields.");
      return;
    }
    
    if (!fname.trim() || !email.trim() || !password.trim()) {
      setErrorMessage("Please complete all required fields.");
      return;
    }
  
     if (!isPasswordValid) {
      let errorMessages = [];
      if (!isMinCharacters) errorMessages.push("Password must be at least 8 characters.");
      if (!hasUppercase) errorMessages.push("Password must contain at least one uppercase letter.");
      if (!hasSpecialChar) errorMessages.push("Password must contain at least one special character.");
      setPasswordErrorMessage(errorMessages.join(" "));
      return;
    }
  
    // تحقق من الحقول التي تخص نوع المستخدم
    if (userType === 'User') {
      if (!region || !country) {
        setErrorMessage("Please complete all required fields.");
        return;
      }
    } else if (userType === 'Moderator') {
      if (!regionM || !reason.trim()) {
        setErrorMessage("Please complete all required fields.");
        return;
      }
  
      if (regionM === 'Other') {
        setErrorMessage("We currently only accept moderators from Arab, Western, or Chinese regions.");
        return;
      }
    }
    // Enhanced Email Validation
    const allowedDomains = ["gmail.com", "hotmail.com", "yahoo.com", "outlook.com", "live.com", "icloud.com", "protonmail.com"];
    const emailPattern = new RegExp(`^[^\\s@]+@(${allowedDomains.join('|').replace(/\./g, '\\.')})$`, 'i');
    if (!emailPattern.test(email)) {
      setErrorMessage("Please enter a valid email address with an allowed domain.");
      return;
    }

     
  
  
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;
  
      if (user) {
        const collectionPath = userType === 'User' ? 'Users' : 'Moderators';
        let userData = userType === 'User'
        ? {
            User_Id: user.uid,
            email: user.email,
            fullName: fname,
            region,
            country: country?.label?.props?.children[1] || null,
          }
        : {
            Moderator_Id: user.uid,
            email:email,   
            fullName: fname,
            regionM,
            reason,
            status: 'Pending', 
            RequestDate: new Date().toISOString(), // Capture current date and time
          };
      
      await setDoc(doc(db, collectionPath, user.uid), userData);
      
          setShowSuccess(true);
          setTimeout(() => {
            if (userType === 'User') {
              navigate('/Home');
            }
                      }, 1000);
        }
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          setErrorMessage("This email address is already registered.");
        } else {
          setErrorMessage("Something went wrong. Please try again.");
        }
      }
    };

  const handleUserTypeChange = (type) => {
    setUserType(type);
  };

  const handleCountryChange = (selectedOption) => {
    setCountry(selectedOption);  
  };

  const countryOptions = countryList().getData().map((country) => ({
    value: country.value,
    label: (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Flag code={country.value} style={{ width: 20, height: 15, marginRight: 10 }} />
        {country.label}
      </div>
    ),
  }));
 
  return (
    <div className="sign-page">
      <Helmet>
        <title>{t('createAccount')} - My Website</title>
        <meta name="description" content="Create an account on My website" />
      </Helmet>

      {errorMessage && (
        <div className="error-popup">
          <h3 className="error-title">{t('Warning')}!</h3>
          <p className="error-message">{errorMessage}</p>
          <div className="error-actions">
            <button className="confirm-btn" onClick={() => setErrorMessage("")}>{t('tryAgain')}</button>
          </div>
        </div>
      )}

{showSuccess && (
  <div className="success-popup">
    <FontAwesomeIcon icon={faCheckCircle} className="success-icon" />
    <p className="success-message">
      {userType === 'User' 
        ? t('Your account has been created successfully') 
        : t('Your request has been submitted successfully!')}
    </p>
  </div>
)}


      <div className="sign-container">
        <div className="Left-section">
          <div className="logo-welcome-container">
            <img src="logo.png" alt="Logo" width="100" height="100" />
            <h2>{t('welcome')}</h2>
          </div>
          <p className="Welcome-txt">{t('toCultureLens')}</p>
        </div>

        <form className="sign-form" onSubmit={handleRegister}>
          <h2 className="sign-title">{t('createAccount')}</h2>

          <div className="sign-user-type-container">
            <button 
              type="button" 
              className={`sign-user-type-btn ${userType === 'User' ? 'sign-active' : ''}`} 
              onClick={() => handleUserTypeChange('User')}
            >
              {t('userType')}
            </button>
            <button 
              type="button" 
              className={`sign-user-type-btn ${userType === 'Moderator' ? 'sign-active' : ''}`} 
              onClick={() => handleUserTypeChange('Moderator')}
            >
              {t('moderatorType')}
            </button>
          </div>

          {userType === 'User' && (
            <>
              <label htmlFor="name" className="sign-label">{t('fullName')}</label>
              <input
                type="text"
                id="name"
                placeholder={t('Enter Your Full Name')}
                className="sign-input"
                value={fname}
                onChange={(e) => setFname(e.target.value)}
               
              />
              <label htmlFor="email" className="sign-label">{t('email')}</label>
              <input 
                type="email" 
                id="email" 
                placeholder={t('enterEmail')}
                className="sign-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              
              />
              <label className="sign-label">{t('country')}</label>
              <Select 
                options={countryOptions} 
                value={country}   
                onChange={setCountry}
                placeholder={t('selectCountry')}
                styles={{
                  control: (styles, { isFocused }) => ({
                    ...styles,
                    width: '100%',
                    height: '50px',
                    borderRadius: '5px',
                    fontSize: '13px',
                    padding: '0',
                    boxShadow: 'none',
                    borderColor: isFocused ? '#004D60' : '#ddd',
                    '&:hover': { borderColor: '#004D60' },
                    marginBottom: '10px',
                  }),
                  valueContainer: (styles) => ({
                    ...styles,
                    padding: '10px',
                  }),
                  placeholder: (styles) => ({
                    ...styles,
                    fontSize: '13px',
                  }),
                  dropdownIndicator: (styles) => ({
                    ...styles,
                    padding: '0 8px',
                  })
                }}
                
              />
               <div>
                <label className="Login-label" htmlFor="password">{t('password')}</label>
                <div className="password-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder={t('enterPassword')}
                    className="Login-input"
                    value={password}
                    onFocus={() => setIsPasswordFocused(true)}   
                    onBlur={() => setIsPasswordFocused(false)}
                    onChange={handlePasswordChange}  // use handlePasswordChange
                  
                  />
                  <span onClick={togglePasswordVisibility} className="password-icon">
                    <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                  </span>
                </div>

                 {/*Password */}
                 {isTyping && (
                  <ul className="password-requirements">
                    <li className={isMinCharacters ? 'valid' : 'invalid'}>
                      {t('passwordRequirements.minChars')}
                    </li>
                    <li className={hasUppercase ? 'valid' : 'invalid'}>
                      {t('passwordRequirements.uppercase')}
                    </li>
                    <li className={hasSpecialChar ? 'valid' : 'invalid'}>
                      {t('passwordRequirements.specialChar')}
                    </li>
                  </ul>
                )}
              </div>

              <fieldset className="sign-culture-domain">
                <legend>{t('region')}</legend>
                <div className="sign-culture-options">
                  <input type="radio" id="Arab" name="cultureDomain" value="Arab" onChange={(e) => setRegion(e.target.value)}   />
                  <label htmlFor="Arab">{t('arab')}</label>
                </div>
                <div className="sign-culture-options">
                  <input type="radio" id="Western" name="cultureDomain" value="Western" onChange={(e) => setRegion(e.target.value)}   />
                  <label htmlFor="Western">{t('western')}</label>
                </div>
                <div className="sign-culture-options">
                  <input type="radio" id="Chinese" name="cultureDomain" value="Chinese" onChange={(e) => setRegion(e.target.value)}   />
                  <label htmlFor="Chinese">{t('chinese')}</label>
                </div>
                <div className="sign-culture-options">
                  <input type="radio" id="Other" name="cultureDomain" value="Other" onChange={(e) => setRegion(e.target.value)}   />
                  <label htmlFor="Other">{t('other')}</label>
                </div>
              </fieldset>

              <button type="submit" className="sign-btn">{t('createAccount')}</button>
            </>
          )}

          {userType === 'Moderator' && (
            <>
              <label htmlFor="name" className="sign-label">{t('fullName')}</label>
              <input 
                type="text" 
                id="name" 
                placeholder={t('enterFullName')}
                className="sign-input"
                value={fname}
                onChange={(e) => setFname(e.target.value)}
            
              />
              <label htmlFor="email" className="sign-label">{t('email')}</label>
              <input 
                type="email" 
                id="email" 
                placeholder={t('enterEmail')}
                className="sign-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                
              />
              <label htmlFor="reason" className="sign-label">{t('Reason')}</label>
              <textarea 
                id="reason" 
                placeholder={t('ُEnter your reason')}
                className="sign-input" 
                value={reason} 
                onChange={(e) => setReason(e.target.value)} 
               
              />
              <div>
                <label className="Login-label" htmlFor="password">{t('password')}</label>
                <div className="password-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder={t('enterPassword')}
                    className="Login-input"
                    value={password}
                    onFocus={() => setIsPasswordFocused(true)}   
                    onBlur={() => setIsPasswordFocused(false)}
                    onChange={handlePasswordChange}  // use handlePasswordChange
                  
                  />
                  <span onClick={togglePasswordVisibility} className="password-icon">
                    <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                  </span>
                </div>

                 {/*Password */}
                 {isTyping && (
                  <ul className="password-requirements">
                    <li className={isMinCharacters ? 'valid' : 'invalid'}>
                      {t('passwordRequirements.minChars')}
                    </li>
                    <li className={hasUppercase ? 'valid' : 'invalid'}>
                      {t('passwordRequirements.uppercase')}
                    </li>
                    <li className={hasSpecialChar ? 'valid' : 'invalid'}>
                      {t('passwordRequirements.specialChar')}
                    </li>
                  </ul>
                )}
              </div>

              <fieldset className="sign-culture-domain">
                <legend>{t('region')}</legend>
                <div className="sign-culture-options">
                  <input type="radio" id="Arab" name="cultureDomain" value="Arab" onChange={(e) => setRegionM(e.target.value)}   />
                  <label htmlFor="Arab">{t('arab')}</label>
                </div>
                <div className="sign-culture-options">
                  <input type="radio" id="Western" name="cultureDomain" value="Western" onChange={(e) => setRegionM(e.target.value)}   />
                  <label htmlFor="Western">{t('western')}</label>
                </div>
                <div className="sign-culture-options">
                  <input type="radio" id="Chinese" name="cultureDomain" value="Chinese" onChange={(e) => setRegionM(e.target.value)}   />
                  <label htmlFor="Chinese">{t('chinese')}</label>
                </div>
                <div className="sign-culture-options">
                  <input type="radio" id="Other" name="cultureDomain" value="Other" onChange={(e) => setRegionM(e.target.value)}   />
                  <label htmlFor="Other">{t('other')}</label>
                </div>
              </fieldset>

              <button type="submit" className="sign-btn">{t('Send Request')}</button>
            </>
          )}
          
          <div className="sign-login" style={{ marginTop: "1rem" }}>
          <p>{t('alreadyHaveAccount')} <Link to="/Login" className="sign-link">{t('login')}</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Sign;