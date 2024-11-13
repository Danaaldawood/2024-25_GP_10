// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import LOGO from '../images/Logo.png';
// import { auth, db } from "./firebase";
// import { signInWithEmailAndPassword } from "firebase/auth";
// import { doc, getDoc } from "firebase/firestore";
// import './Login.css';
// import './Pop-Message.css';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
// import { Helmet } from 'react-helmet';
// const Login = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [userType, setUserType] = useState('User');
//   const [errorMessage, setErrorMessage] = useState(""); 
//   const [isLoading, setIsLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false); 
//   const navigate = useNavigate();

//   const togglePasswordVisibility = () => {
//     setShowPassword(!showPassword);
//   };

//   const handleUserTypeChange = (type) => {
//     setUserType(type);
//   };

//   const handleCreateAccount = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setErrorMessage(""); 
    
//     try {
//       const userCredential = await signInWithEmailAndPassword(auth, email, password);
//       const user = userCredential.user;
      
//       const collectionPath = userType === 'User' ? 'Users' : 'Moderators';
//       const userDoc = await getDoc(doc(db, collectionPath, user.uid));
      
//       if (userDoc.exists()) {
//         console.log("User found in Firestore.");
//         navigate(userType === 'User' ? '/HomePage' : '/moderator');
//       } else {
//         console.log("User not found in Firestore. Collection Path:", collectionPath, "User ID:", user.uid);
//         setErrorMessage("Access denied. Please check your account type.");
//         setIsLoading(false);
//       }
//     } catch (error) {
//       setErrorMessage("An error occurred. Incorrect Email/Password.");
//       console.log(error.message);
//       setIsLoading(false);
//       console.log("Email:", email);
//       console.log("Password:", password);
//     }
//   };

//   const handleInvalidInput = (event) => {
//     event.target.setCustomValidity('Please fill in this field.');
//   };

//   const resetCustomValidity = (event) => {
//     event.target.setCustomValidity('');
//   };

//   return (
//     <>
//     <Helmet>
//       <title>Login Page</title>
//       <meta name="description" content="This is theLog-in page of My website" />
//     </Helmet>      
//        {errorMessage && (
//         <div className="error-popup">
//           <h3 className="error-title">Warning!</h3>
//           <p className="error-message">{errorMessage}</p>
//           <div className="error-actions">
//             <button className="confirm-btn" onClick={() => setErrorMessage("")}>Try again</button>
//           </div>
//         </div>
//       )}

//       <div className="Login-page">
//         <div className="Login-container">
//           {/* Left Section */}
//           <div className="left-section">
//             <div className="logo-welcome-container">
//               <img src={LOGO} alt="Logo" width="100" height="100" />
//               <h2>Welcome Back!</h2>
//             </div>
//             <p className="Welcome-txt">To CultureLens! We’re glad to have you with us again to explore more cultural diversity.</p>
//           </div>
//           {/* Form Section */}
//           <form className="Login-form" onSubmit={handleCreateAccount}>
//             <h2 className="Login-title">Log-in</h2>

//             <div className="Login-user-type-container">
//               <button 
//                 type="button" 
//                 className={`Login-user-type-btn ${userType === 'User' ? 'Login-active' : ''}`} 
//                 onClick={() => handleUserTypeChange('User')}
//               >
//                 User
//               </button>
//               <button 
//                 type="button" 
//                 className={`Login-user-type-btn ${userType === 'Moderator' ? 'Login-active' : ''}`} 
//                 onClick={() => handleUserTypeChange('Moderator')}
//               >
//                 Moderator
//               </button>
//             </div>

//             <label htmlFor="email" className="Login-label">Email Address:</label>
//             <div className="input-container">
//               <input 
//                 type="email" 
//                 id="email" 
//                 autoComplete="off" 
//                 placeholder="Enter your Email Address"
//                 className="Login-input"
//                 required
//                 onChange={(e) => setEmail(e.target.value)}   
//               />
//             </div>

//             <label className="Login-label" htmlFor="password">Password:</label>
//             <div className="password-container">
//               <input 
//                 type={showPassword ? "text" : "password"} 
//                 id="password" 
//                 placeholder="Enter your password"
//                 className="Login-input"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//               />
//               <span onClick={togglePasswordVisibility} className="password-icon">
//                 <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
//               </span>
//             </div>

//             <p className="forget-password">
//               <Link to="/forgot" className="Login-link">
//                 Forget Password?
//               </Link>
//             </p>

//             <button type="submit" className="Login-btn" disabled={isLoading}>
//               {isLoading ? "Logging in.." : "Login"}
//             </button>
//             <div className='Login-login'>
//               <p style={{ fontSize: '15px' }}>Don't have an account? <Link to="/Sign" className="Login-link">Create account</Link></p>
//             </div>
//           </form>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Login;



import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LOGO from '../images/Logo.png';
import { auth, db } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import './Login.css';
import './Pop-Message.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const { t } = useTranslation('login');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState('User');
  const [errorMessage, setErrorMessage] = useState(""); 
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleUserTypeChange = (type) => {
    setUserType(type);
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(""); 
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const collectionPath = userType === 'User' ? 'Users' : 'Moderators';
      const userDoc = await getDoc(doc(db, collectionPath, user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        if (userType === 'Moderator') {
          if (userData.status === 'Pending') {
            setErrorMessage(t('Sorry, your request is pending until approval. '));
            setIsLoading(false);
          } else if (userData.status === 'Denied') {
            setErrorMessage(t('Sory your request is denied'));
            setIsLoading(false);
          } else if (userData.status === 'Approved') {
            navigate('/moderator');
          } else {
            setErrorMessage(t('loginPage.accessDenied'));
            setIsLoading(false);
          }
        } else {
          // For regular users
          navigate('/HomePage');
        }
      } else {
        // If the document does not exist, display an access denied message
        setErrorMessage(t('loginPage.accessDenied'));
        setIsLoading(false);
      }
    } catch (error) {
      // If an error occurs during sign-in, display an error message
      setErrorMessage(t('loginPage.errorIncorrectCredentials'));
      setIsLoading(false);
    }
  };
  return (
    <>
      <Helmet>
        <title>{t('loginPage.helmetTitle')}</title>
        <meta name="description" content={t('loginPage.helmetDescription')} />
      </Helmet>      

      {errorMessage && (
        <div className="error-popup">
          <h3 className="error-title">{t('loginPage.errorTitle')}</h3>
          <p className="error-message">{errorMessage}</p>
          <div className="error-actions">
            <button className="confirm-btn" onClick={() => setErrorMessage("")}>
              {t('loginPage.tryAgain')}
            </button>
          </div>
        </div>
      )}

      <div className="Login-page">
        <div className="Login-container">
          <div className="left-section">
            <div className="logo-welcome-container">
              <img src={LOGO} alt="Logo" width="100" height="100" />
              <h2>{t('loginPage.welcomeBack')}</h2>
            </div>
            <p className="Welcome-txt">{t('loginPage.welcomeText')}</p>
          </div>
          <form className="Login-form" onSubmit={handleCreateAccount}>
            <h2 className="Login-title">{t('loginPage.loginTitle')}</h2>

            <div className="Login-user-type-container">
              <button 
                type="button" 
                className={`Login-user-type-btn ${userType === 'User' ? 'Login-active' : ''}`} 
                onClick={() => handleUserTypeChange('User')}
              >
                {t('loginPage.userTypeUser')}
              </button>
              <button 
                type="button" 
                className={`Login-user-type-btn ${userType === 'Moderator' ? 'Login-active' : ''}`} 
                onClick={() => handleUserTypeChange('Moderator')}
              >
                {t('loginPage.userTypeModerator')}
              </button>
            </div>

            <label htmlFor="email" className="Login-label">{t('loginPage.emailLabel')}</label>
            <div className="input-container">
              <input 
                type="email" 
                id="email" 
                autoComplete="off" 
                placeholder={t('loginPage.emailPlaceholder')}
                className="Login-input"
                required
                onChange={(e) => setEmail(e.target.value)}   
              />
            </div>

            <label className="Login-label" htmlFor="password">{t('loginPage.passwordLabel')}</label>
            <div className="password-container">
              <input 
                type={showPassword ? "text" : "password"} 
                id="password" 
                placeholder={t('loginPage.passwordPlaceholder')}
                className="Login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span onClick={togglePasswordVisibility} className="password-icon">
                <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
              </span>
            </div>

            <p className="forget-password">
              <Link to="/forgot" className="Login-link">
                {t('loginPage.forgetPassword')}
              </Link>
            </p>

            <button type="submit" className="Login-btn" disabled={isLoading}>
              {isLoading ? t('loginPage.loggingIn') : t('loginPage.loginButton')}
            </button>
            <div className='Login-login'>
              <p style={{ fontSize: '15px' }}>{t('loginPage.noAccount')} <Link to="/Sign" className="Login-link">{t('loginPage.createAccountLink')}</Link></p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;




