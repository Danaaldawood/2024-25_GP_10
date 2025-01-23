import React from 'react';
import './TermsModal.css';

const TermsModal = ({ isOpen, onClose, userType }) => {
  if (!isOpen) return null;

  const userTerms = [
    "You cannot register as a moderator if you are already registered as a user.",
    "Your data will be accessible to administrators for monitoring and compliance purposes.",
    "All activities you perform on the site will be monitored to ensure compliance with the platform's procedures."
  ];

  const moderatorTerms = [
    "You cannot register as a user if you are a moderator.",
    "If accepted as a moderator, you will manage requests only within your designated region.",
    "You must remain active in handling user requests; inactivity may lead to actions from administrators.",
    "Your data and activities will be accessible to administrators for monitoring purposes.",
    "You must have a good understanding of the English language to respond to edits effectively."
  ];

  const terms = userType === 'User' ? userTerms : moderatorTerms;

  return (
    <div className="terms-modal__overlay" onClick={() => onClose()}>
      <div className="terms-modal__container" onClick={e => e.stopPropagation()}>
        <div className="terms-modal__header">
          <h2 className="terms-modal__title">Terms and Condition</h2>
          <button onClick={onClose} className="terms-modal__close-btn">×</button>
        </div>
        
        <div className="terms-modal__body">
          <ul className="terms-modal__list">
            {terms.map((term, index) => (
              <li key={index} className="terms-modal__item">{term}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;