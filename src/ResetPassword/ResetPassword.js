import React, { useState } from 'react';
import { getAuth, confirmPasswordReset } from 'firebase/auth';
import { useLocation, useNavigate } from 'react-router-dom';
import './ResetPassword.css';
import LOGO from '../images/Logo.png';
import '../Register/Pop-Message.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

export const ResetPassword = () => {
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

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      setLoading(false);
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setError('Password should contain at least one uppercase letter.');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
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
    <div className="reset-password-page">
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
          <h3 className="success-title">Success!</h3>
          <p className="success-message">Password updated successfully!</p>
          <div className="success-actions">
            <button className="Continue-btn" onClick={() => {
              setShowSuccess(false);
              navigate('/');
            }}>
              Continue
            </button>
          </div>
        </div>
      )}

      <div className="reset-password-container">
        <div className="reset-password-left-section">
          <div className="reset-password-logo-welcome-container">
            <img src={LOGO} alt="Logo" width="100" height="100" />
            <h2>Reset Password</h2>
          </div>
          <p className="reset-password-welcome-txt">Enter your new password to regain access to your account.</p>
        </div>

        <form className="reset-password-form" onSubmit={handleSubmit}>
          <h2 className="reset-password-title">Change Password</h2>
          
          <label className="reset-password-label" htmlFor="newPassword">New Password:</label>
          <div className="reset-password-input-container">
            <input
              type={showPassword ? "text" : "password"}
              id="newPassword"
              className="reset-password-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
            <span onClick={togglePasswordVisibility} className="reset-password-icon">
              <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash } />
            </span>
          </div>
          
          <label className="reset-password-label" htmlFor="confirmPassword">Confirm Password:</label>
          <div className="reset-password-input-container">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              className="reset-password-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
            />
            <span onClick={toggleConfirmPasswordVisibility} className="reset-password-icon">
              <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
            </span>
          </div>
          
          <ul className="reset-password-requirements">
            <li>Password should be at least 8 characters.</li>
            <li>Contain at least one uppercase letter.</li>
          </ul>

          <button type="submit" className="reset-password-btn" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;