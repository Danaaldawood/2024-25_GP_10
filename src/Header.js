// Header.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './images/Logo.png'; // Correct import path for Logo.png inside src/images


const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleSignOut = () => {
    alert("Signed out!");
  };

  return (
    <header className="header">
      <div className="header-left">
      <img src={logo} alt="Logo" className="logo-img" /> {/* Use 'logo' instead of 'LOGOC' */}
        <h1 className="logo-title">CultureLens</h1>
      </div>

      <nav className="nav-menu">
        <a href="/">Home</a>
        <a href="/dataset">Dataset</a>
        <a href="/edit">Edit</a>
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
    </header>
  );
};

export default Header;
