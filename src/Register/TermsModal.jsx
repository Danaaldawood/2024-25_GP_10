import React from 'react';
import './TermsModal.css';
import { useTranslation } from "react-i18next";

const TermsModal = ({ isOpen, onClose, userType }) => {
  const { t } = useTranslation("TermsModal");

  if (!isOpen) return null;

   if (!t) return null;

  const userTerms = [
    t("TermsModal.TU1"),
    t("TermsModal.TU2"),
    t("TermsModal.TU3"),
    t("TermsModal.TU4")

  ];

  const moderatorTerms = [
    t("TermsModal.TM1"),
    t("TermsModal.TM2"),
    t("TermsModal.TM3"),
    t("TermsModal.TM4"),
    t("TermsModal.TM5"),
    t("TermsModal.TM6")
  ];

  const terms = userType === 'User' ? userTerms : moderatorTerms;

   console.log(terms);

  return (
    <div className="terms-modal__overlay" onClick={() => onClose()}>
      <div className="terms-modal__container" onClick={e => e.stopPropagation()}>
        <div className="terms-modal__header">
          <h2 className="terms-modal__title">{t("TermsModal.TermsandCondition")}</h2>
          <button onClick={onClose} className="terms-modal__close-btn">×</button>
        </div>

        <div className="terms-modal__body">
          <ul className="terms-modal__list">
            {Array.isArray(terms) && terms.map((term, index) => (
              <li key={index} className="terms-modal__item">{term}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
