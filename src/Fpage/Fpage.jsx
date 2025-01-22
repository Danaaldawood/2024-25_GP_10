import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from 'react-helmet';
import LOGO from "../images/Logo.png";
import photo from "../images/MAP-logo.png";
import Switcher from "../Switcher";
import "./Fpage.css";

const Fpage = () => {
  const { t, i18n } = useTranslation('fpage');
  const isRTL = i18n.dir() === 'rtl';

  return (
    <div className="Fpage-container" dir={isRTL ? 'rtl' : 'ltr'}>
      <Helmet>
        <title>{t("pageTitle")}</title>
        <meta name="description" content={t("metaDescription")} />
      </Helmet>

      {/* Header */}
      <header className="Fpage-header">
        <div className="header-content">
          {/* Logo and Title */}
          <Link to="/" className="Fpagelogo">
            <img src={LOGO} alt={t("headerTitle")} className="Fpage-logo" />
            <h1 className="Fpage-title">CultureLens</h1>
          </Link>
          
          {/* Language Switcher and Admin Button */}
          <div className="header-right">
            <Switcher />
            <Link to="/adminlogin">
              <button className="admin-button">{t("admin")}</button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="Fpage-section">
        <div className="Fpage-content">
          {/* Text Content */}
          <div className="Fpage-text">
            <h2 className="Fpage-Welcome">{t("welcomeText")}</h2>
            <p className="Fpage-description">{t("sectionDescription")}</p>
            
            {/* Action Buttons */}
            <div className="Fpage-buttons">
              <Link to="/Sign">
                <button className="Fpage-button primary">
                  {t("getStartedButton")}
                </button>
              </Link>
              <Link to="/Login">
                <button className="Fpage-button secondary">
                  {t("loginButton")}
                </button>
              </Link>
            </div>
          </div>

          {/* Image Section */}
          <div className="Fpage-image">
            <img 
              src={photo} 
              alt={t("headerTitle")} 
              className="Fpage-img" 
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Fpage;