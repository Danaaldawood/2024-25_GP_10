import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const TranslateIcon = () => (
  <svg 
    viewBox="0 0 24 24" 
    width="24" 
    height="24" 
    fill="currentColor"
    style={{ color: '#722F57' }}
  >
    <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
  </svg>
);

function Switcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ch', name: '中文' },
    { code: 'ar', name: 'العربية' }
  ];

  useEffect(() => {
    document.body.dir = i18n.dir();
  }, [i18n.language]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  const styles = {
    container: {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      marginRight: '20px' // Added margin
    },
    button: {
      background: 'none',
      border: 'none',
      padding: '8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    dropdown: {
      position: 'absolute',
      top: '100%',
      [i18n.dir() === 'rtl' ? 'right' : 'left']: '0',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      minWidth: '120px',
      zIndex: 1000,
      marginTop: '8px',
      overflow: 'hidden',
      animation: 'slideDown 0.2s ease'
    },
    option: (isActive) => ({
      padding: '10px 16px',
      cursor: 'pointer',
      color: isActive ? '#1976d2' : '#333',
      backgroundColor: isActive ? '#f0f7ff' : 'white',
      textAlign: i18n.dir() === 'rtl' ? 'right' : 'left'
    })
  };

  useEffect(() => {
    if (!document.querySelector('#lang-switcher-keyframes')) {
      const style = document.createElement('style');
      style.id = 'lang-switcher-keyframes';
      style.innerHTML = `
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div 
      className="language-switcher" 
      ref={dropdownRef}
      style={styles.container}
    >
      <button 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Change language"
        style={styles.button}
      >
        <TranslateIcon />
      </button>

      {isOpen && (
        <div style={styles.dropdown}>
          {languages.map((lang) => (
            <div
              key={lang.code}
              style={styles.option(i18n.language === lang.code)}
              onClick={() => changeLanguage(lang.code)}
            >
              {lang.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Switcher;