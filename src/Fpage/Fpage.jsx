/* // NEW */

// Fpage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from 'react-helmet';
import LOGO from "../images/Logo.png";
import photo from "../images/MAP-logo.png";
import "./Fpage.css";

const Fpage = () => {
  const { t } = useTranslation('fpage');

  return (
    <div className="Fpage-container">
      <Helmet>
        <title>{t("pageTitle")}</title>
        <meta name="description" content={t("metaDescription")} />
      </Helmet>

      {/* Modern Header */}
      <header className="Fpage-header">
        <div className="header-content">
          <div className="Fpagelogo">
            <img src={LOGO} alt={t("headerTitle")} className="Fpage-logo" />
            <h1 className="Fpage-title">{t("CultureLens")}</h1>
          </div>
          <Link to="/adminlogin" className="admin-link">
            <button className="admin-button">Admin</button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="Fpage-section">
        <div className="Fpage-content">
          <div className="Fpage-text">
            <h2 className="Fpage-Welcome">{t("welcomeText")}</h2>
            <p className="Fpage-description">{t("sectionDescription")}</p>
            <div className="Fpage-buttons">
              <Link to="/Sign">
                <button className="Fpage-button primary">{t("getStartedButton")}</button>
              </Link>
              <Link to="/Login">
                <button className="Fpage-button secondary">{t("loginButton")}</button>
              </Link>
            </div>
          </div>
          <div className="Fpage-image">
            <img src={photo} alt={t("headerTitle")} className="Fpage-img" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Fpage;