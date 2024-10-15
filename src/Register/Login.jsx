import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LOGO from '../images/Logo.png';
import { auth, db } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import './Register.css';
 
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState('User');
  const [errorMessage, setErrorMessage] = useState(""); 
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
        navigate(userType === 'User' ? '/HomePage' : '/moderator');
      } else {
        setErrorMessage("User type not recognized. Please contact support.");
      }
      
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        setErrorMessage("No account found with this email.");
      } else if (error.code === 'auth/wrong-password') {
        setErrorMessage("Incorrect password. Please try again.");
      } else {
        setErrorMessage("An error occurred. Please check your credentials and try again.");
      }
      console.log(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="sign-page">
      <div className="sign-container">
        {/* Right Section */}
        <div className="right-section">
          <div className="logo-welcome-container">
            <img src={LOGO} alt="Logo" width="100" height="100" />
            <h2>Welcome Back!</h2>
          </div>
          <p className="Wtxt">To CultureLens! We’re glad to have you with us again to explore more cultural diversity.</p>
        </div>

        {/* Form Section */}
        <form className="sign-form" onSubmit={handleCreateAccount}>
          <h2 className="sign-title">Log-in</h2>
          
          <div className="sign-user-type-container">
            <button 
              type="button" 
              className={`sign-user-type-btn ${userType === 'User' ? 'sign-active' : ''}`} 
              onClick={() => handleUserTypeChange('User')}
            >
              User
            </button>
            <button 
              type="button" 
              className={`sign-user-type-btn ${userType === 'Moderator' ? 'sign-active' : ''}`} 
              onClick={() => handleUserTypeChange('Moderator')}
            >
              Moderator
            </button>
          </div>

          <label htmlFor="email" className="sign-label">Email Address</label>
          <input 
            type='email' 
            id="email" 
            autoComplete='off' 
            placeholder="Enter your Email Address"
            className="sign-input"
            required
            onChange={(e) => setEmail(e.target.value)}      
          />

          <label htmlFor="password" className="sign-label">Password</label>
          <input 
            type='password' 
            id="password" 
            autoComplete='off' 
            placeholder="Enter your Password"
            className="sign-input"
            required
            onChange={(e) => setPassword(e.target.value)}      
          />
<p className="forget-password" style={{ textAlign: 'right'}}>
  <Link to="/ResetPassword" className="sign-link">
    Forget Password?
  </Link>
</p>





           {errorMessage && <p className="error-message">{errorMessage}</p>}

          <button type="submit" className="sign-btn" style={{ marginTop: '1rem', fontSize: '15px' }} disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>
          <div className='sign-login'>
    

            <p style={{ fontSize: '15px' }}>Don't have an account? <Link to="/Sign" className="sign-link">Create account</Link></p>
   
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
