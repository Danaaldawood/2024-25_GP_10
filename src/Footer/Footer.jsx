import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faTwitter, faInstagram } from "@fortawesome/free-brands-svg-icons";
import "./Footer.css";
import { useTranslation } from 'react-i18next';

import { RiTwitterXLine } from "react-icons/ri";
import { IoLogoInstagram } from "react-icons/io5";
import { MdEmail } from "react-icons/md";

export const Footer = () => {
  const { t, i18n } = useTranslation('headerpage');
  
  return (
    <footer className="footer">
            <p>{t('copyright')}</p>

      <div className="footer-icons">
        <a
          href="mailto:Culturelens@outlook.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <MdEmail className="footer-icon" />
        </a>
        <a
          href="https://x.com/CultureLens43"
          target="_blank"
          rel="noopener noreferrer"
        >
          <RiTwitterXLine className="footer-icon" />
        </a>
        <a
          href="https://www.instagram.com/culturelens43/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <IoLogoInstagram className="footer-icon" />
        </a>
      </div>
    </footer>
  );
};
