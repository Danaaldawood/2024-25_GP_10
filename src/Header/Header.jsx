import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../images/Logo.png'; 
import { signOut } from 'firebase/auth'; 
import { auth } from '../Register/firebase';
import SignOutConfirmation from '../Modorater/SignOutConfirmation'; 
import './Header.css';

export const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false); // State for sign-out modal
  const navigate = useNavigate();

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  const handleProfileClick = () => {
    navigate('/userprofile'); // Correct route for user profile page
  };

  const handleSignOut = () => {
    // Show the sign-out confirmation modal
    setShowSignOutModal(true);
  };

  const confirmSignOut = () => {
    // Perform sign-out using Firebase Auth
    signOut(auth)
      .then(() => {
        navigate('/Login'); 
      })
      .catch((error) => {
        console.error('Error during sign-out:', error);
      });
    setShowSignOutModal(false); 
  };

  const cancelSignOut = () => {
    setShowSignOutModal(false); 
  };

  return (
    <header className="header">
      <div className="header-left">
        <img src={logo} alt="Logo" className="logo-img" /> 
        <h1 className="logo-title">CultureLens</h1>
      </div>

      <nav className="nav-menu">
        <a href="/home">Home</a>
        <a href="/culturevalues">Cultural Value</a>
        <a href="/compare">Compare</a>
        <a href="/evaluation">Evaluation</a>
      </nav>

      <button className="menu-btn" onClick={handleMenuToggle}>
        <span className="menu-icon">&#9776;</span>
      </button>

      {menuOpen && (
        <div className="menu-dropdown">
          <p onClick={handleProfileClick}>Profile</p>
          <p onClick={handleSignOut} className="sign-out">Sign out</p>
        </div>
      )}

      {/* Show sign-out confirmation modal */}
      {showSignOutModal && (
        <SignOutConfirmation onConfirm={confirmSignOut} onCancel={cancelSignOut} />
      )}
    </header>
  );
};