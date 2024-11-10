// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import logo from '../images/Logo.png'; 
// import { signOut } from 'firebase/auth'; 
// import { auth } from '../Register/firebase';
// import SignOutConfirmation from '../Modorater/SignOutConfirmation'; 
// import './Header.css';
// import {useTranslation } from 'react-i18next';

// import i18n from '../i18next/i18n';
// import Switcher from '../Switcher';


// export const Header = () => {
 
//   const { t } = useTranslation('headerpage'); 

//   const [menuOpen, setMenuOpen] = useState(false);
//   const [showSignOutModal, setShowSignOutModal] = useState(false); 
//   const navigate = useNavigate();

//   const handleMenuToggle = () => {
//     setMenuOpen(!menuOpen);
//   };

//   const handleProfileClick = () => {
//     navigate('/userprofile'); 
//   };

//   const handleSignOut = () => {
//     setShowSignOutModal(true);
//   };

//   const confirmSignOut = () => {
//     signOut(auth)
//       .then(() => {
//         navigate('/'); 
//       })
//       .catch((error) => {
//         console.error('Error during sign-out:', error);
//       });
//     setShowSignOutModal(false); 
//   };

//   const cancelSignOut = () => {
//     setShowSignOutModal(false); 
//   };

//   return (
   
//     <header className="header">
//       <div className="header-left">
//         <img src={logo} alt="Logo" className="logo-img" /> 
//         <h1 className="logo-title">CultureLens</h1>
//       </div>

//       <nav className="nav-menu">
//         <a href="/home">Home</a>
//         <a href="/culturevalues">Cultural Values</a>
//         <a href="/compare">Compare</a>
//         <a href="/evaluation">Evaluation</a>
//       </nav>

//       <button className="menu-btn" onClick={handleMenuToggle}>
//         <span className="menu-icon">&#9776;</span>
//       </button>

//       {menuOpen && (
//         <div className="menu-dropdown">
//           <p onClick={handleProfileClick}>Profile</p>
//           <p onClick={handleSignOut} className="sign-out">Log out</p>
//         </div>
//       )}

//       {/* sign-out confirmation modal */}
//       {showSignOutModal && (
//         <SignOutConfirmation onConfirm={confirmSignOut} onCancel={cancelSignOut} />
//       )}
//     </header>
//   );
 
// };
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logo from '../images/Logo.png'; 
import { signOut } from 'firebase/auth'; 
import { auth } from '../Register/firebase';
import SignOutConfirmation from '../Modorater/SignOutConfirmation'; 
import './Header.css';
import Switcher from '../Switcher';

export const Header = () => {
  const { t } = useTranslation('headerpage'); 
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false); 
  const navigate = useNavigate();

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  const handleProfileClick = () => {
    navigate('/userprofile'); 
  };

  const handleSignOut = () => {
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

  return (
    <header className="header">
      <div className="header-left">
        <img src={logo} alt="Logo" className="logo-img" /> 
        <h1 className="logo-title">CultureLens</h1>
      </div>

      <nav className="nav-menu">
        <a href="/home">{t('home')}</a>
        <a href="/culturevalues">{t('culturalValues')}</a>
        <a href="/compare">{t('compare')}</a>
        <a href="/evaluation">{t('evaluation')}</a>
      </nav>

      <button className="menu-btn" onClick={handleMenuToggle}>
        <span className="menu-icon">&#9776;</span>
      </button>

      {menuOpen && (
        <div className="menu-dropdown">
          <p onClick={handleProfileClick}>{t('profile')}</p>
          <p onClick={handleSignOut} className="sign-out">{t('signOut')}</p>
        </div>
      )}

      {showSignOutModal && (
        <SignOutConfirmation onConfirm={confirmSignOut} onCancel={cancelSignOut} />
      )}
    </header>
  );
};
