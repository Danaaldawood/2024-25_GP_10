import React, { useState } from 'react';
import { getAuth, confirmPasswordReset } from 'firebase/auth';
import { useLocation, useNavigate } from 'react-router-dom';
import LOGO from '../images/Logo.png';
import '../Register/Pop-Message.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash ,faCheckCircle} from '@fortawesome/free-solid-svg-icons';
import { Helmet } from 'react-helmet';
import './adminrestpass.css';

export const AdminRestPass = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const oobCode = query.get('oobCode');

  const isMinCharacters = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const isPasswordValid = isMinCharacters && hasUppercase && hasSpecialChar;
  const doPasswordsMatch = newPassword === confirmPassword;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!isPasswordValid) {
      let errorMessages = [];
      if (!isMinCharacters) errorMessages.push("Password must be at least 8 characters.");
      if (!hasUppercase) errorMessages.push("Password must contain at least one uppercase letter.");
      if (!hasSpecialChar) errorMessages.push("Password must contain at least one special character.");
      setError(errorMessages.join(" "));
      setLoading(false);
      return;
    }

    if (!doPasswordsMatch) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    const auth = getAuth();
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      setError('Error updating password. Please try again.');
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="Adminreset-password-page">
      <Helmet>
      <title>Rest Password</title>
      <meta name="description" content="Rest Password page" />
    </Helmet>
      {error && (
        <div className="error-popup">
          <h3 className="error-title">Warning!</h3>
          <p className="error-message">{error}</p>
          <div className="error-actions">
            <button className="confirm-btn" onClick={() => setError('')}>Try again</button>
          </div>
        </div>
      )}
      
      {showSuccess && (
        <div className="success-popup">
          <FontAwesomeIcon icon={faCheckCircle} className="success-icon" />
          <p className="success-message">Password updated successfully!</p>
          <div className="success-actions">
            
          </div>
        </div>
      )}

      <div className="Adminreset-password-container">
        <div className="Adminreset-password-left-section">
          <div className="Adminreset-password-logo-welcome-container">
            <img src={LOGO} alt="Logo" width="100" height="100" />
            <h2>Reset Password</h2>
          </div>
          <p className="Adminreset-password-welcome-txt">Enter your new password to regain access to your account.</p>
        </div>

        <form className="Adminreset-password-form" onSubmit={handleSubmit}>
          <h2 className="Adminreset-password-title">Change Password</h2>
          
          <label className="Adminreset-password-label" htmlFor="newPassword">New Password:</label>
          <div className="Adminreset-password-input-container">
            <input
              type={showPassword ? "text" : "password"}
              id="newPassword"
              className="Adminreset-password-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
            <span onClick={togglePasswordVisibility} className="Adminreset-password-icon">
              <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
            </span>
          </div>

          <ul className="Adminpassword-requirements">
            <li className={isMinCharacters ? 'valid' : 'invalid'}>
              ✔ Password should be at least 8 characters.
            </li>
            <li className={hasUppercase ? 'valid' : 'invalid'}>
              ✔ Contain at least one uppercase letter.
            </li>
            <li className={hasSpecialChar ? 'valid' : 'invalid'}>
              ✔ Contain at least one special character.
            </li>
          </ul>
          
          <label className="Adminreset-password-label" htmlFor="confirmPassword">Confirm Password:</label>
          <div className="Adminreset-password-input-container">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              className="reset-password-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
            />
            <span onClick={toggleConfirmPasswordVisibility} className="Adminreset-password-icon">
              <FontAwesomeIcon icon={showConfirmPassword ? faEye : faEyeSlash} />
            </span>
          </div>
          
          {confirmPassword && (
            <ul className="Adminpassword-requirements">
              <li className={doPasswordsMatch ? 'valid' : 'invalid'}>
                ✔ Passwords match
              </li>
            </ul>
          )}

          <button 
            type="submit" 
            className="Adminreset-password-btn" 
            disabled={loading || !isPasswordValid || !doPasswordsMatch}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminRestPass;