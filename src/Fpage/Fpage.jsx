import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LOGO from "../images/Logo.png";
import photo from "../images/MAP-logo.png";
import "./Fpage.css";
import "../Header/Header.css";
import { Helmet } from 'react-helmet';

const Fpage = () => {
  const { t } = useTranslation('fpage'); 

  return (
    <div>
      {/* Header */}
      <header className="header">
        <Helmet>
          <title>{t("pageTitle")}</title>
          <meta name="description" content={t("metaDescription")} />
        </Helmet>
        <div className="header-left">
          <img src={LOGO} alt={t("headerTitle")} className="logo-img" />
          <h1 className="logo-title">{t("CultureLens")}</h1>
        </div>
        <Link to="/adminlogin">
              <button className="ButtonAdmin-Login">Admin</button>
            </Link>
      </header>

      {/* About us section */}
      <div className="info-section">
        <div className="text-content">
          <p className="section-title">{t("welcomeText")}</p>
          <p className="section-description">
            {t("sectionDescription")}
          </p>
          <nav className="nav-buttons">
            <Link to="/Sign">
              <button className="Button-Register">{t("getStartedButton")}</button>
            </Link>
            <Link to="/Login">
              <button className="Button-Register">{t("loginButton")}</button>
            </Link>
             
          </nav>
        </div>
        <img src={photo} alt={t("headerTitle")} className="animated-logo" />
      </div>
    </div>
  );
};

export default Fpage;
