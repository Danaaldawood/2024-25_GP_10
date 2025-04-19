import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { signOut } from 'firebase/auth';
import { auth } from '../Register/firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import SignOutConfirmationUser from '../Modorater/SignOutConfirmationUser';
import NotificationBell from './NotificationBell';
import logo from '../images/Logo.png';
import Switcher from "../Switcher";

import './Header.css';

export const Header = () => {
  const { t, i18n } = useTranslation('headerpage');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const isRTL = i18n.dir() === 'rtl';

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  const handleProfileClick = () => {
    setMenuOpen(false);
    navigate('/userprofile');
  };

  const handleSignOut = () => {
    setMenuOpen(false);
    setShowSignOutModal(true);
  };

  const confirmSignOut = () => {
    signOut(auth)
      .then(() => {
        navigate('/');
      })
      .catch((error) => {
        console.error('Error during sign-out:', error);
      });
    setShowSignOutModal(false);
  };

  const cancelSignOut = () => {
    setShowSignOutModal(false);
  };

  // Navigation links
  const navLinks = [
    { path: '/home', label: t('home') },
    { path: '/culturevalues', label: t('culturalValues') },
    { path: '/compare-result', label: t('Compare') },
    { path: '/evaluation', label: t('evaluation') },
    { path: '/LensLeaderBoard', label: t('LensLeaderBoard') }

  ];

  return (
    <header className="header" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="header-left">
        <img src={logo} alt="Logo" className="logo-img-header" />
        <h1 className="logo-title">CultureLens</h1>
      </div>

      <nav className="nav-menu">
        {navLinks.map((link) => (
          <a href={link.path} key={link.path}>
            {link.label}
          </a>
        ))}
      </nav>

      <div className="header-right" ref={menuRef}>
        <NotificationBell />
        <Switcher />
        <button 
          className="menu-btn" 
          onClick={handleMenuToggle}
          aria-expanded={menuOpen}
          aria-label={t('toggleMenu')}
        >
          <FontAwesomeIcon icon={faBars} />
        </button>

        {menuOpen && (
          <div className="menu-dropdown">
            <p onClick={handleProfileClick}>{t('profile')}</p>
            <p onClick={handleSignOut} className="sign-out">
              {t('signOut')}
            </p>
          </div>
        )}
      </div>

      {showSignOutModal && (
        <SignOutConfirmationUser 
          onConfirm={confirmSignOut} 
          onCancel={cancelSignOut} 
        />
      )}
    </header>
  );
};

export default Header;