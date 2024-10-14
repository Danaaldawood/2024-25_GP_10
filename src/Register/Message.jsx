import React from 'react';
import './Message.css'; // تأكدي من تنسيق CSS هنا للرسالة

export const SuccessMessage = ({ onClose }) => (
  <div className="message-box success">
    <div className="message-icon">✔️</div>
    <h2>Success!</h2>
    <p>Succssefly Register.</p>
    <button onClick={onClose} className="message-button">Done</button>
  </div>
);

export const ErrorMessage = ({ onClose }) => (
  <div className="message-box error">
    <div className="message-icon">⚠️</div>
    <h2>Oh No...</h2>
    <p>Password at least 8 characters</p>
    <button onClick={onClose} className="message-button">Try Again</button>
  </div>
);
