import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";  
import './Modal.css';  
import { Helmet } from "react-helmet";
import LOGO from "../images/Logo.png";
const Modal = () => {
 
 
   

   

  return (
    <>
    <Helmet>
  <title>Terms and Conditions Moderator</title>
  <meta name="description" content="Terms and Conditions for moderators, including roles and responsibilities." />
</Helmet>
<header className="headerPage">
        <div className="HEADER">
          <img src={LOGO} alt="CultureLens Logo" className="logo-img" />
          <h1 className="LOGO-title" >CultureLens</h1>
        </div>
      </header>
    <div className="terms-page">
      <h1>Terms and Conditions</h1>
      <ul>
        <li>You cannot register as a user if you are a moderator.</li>
        <li>If accepted as a moderator, you will manage requests only within your designated region.</li>
        <li>You must remain active in handling user requests; inactivity may lead to actions from administrators.</li>
        <li>Your data and activities will be accessible to administrators for monitoring purposes.</li>
        <li>You must have a good understanding of the English language to respond to edits effectively.</li>
      </ul>
      
      </div>
     
      
         
       
 
      </>

    
  );
};

export default Modal;