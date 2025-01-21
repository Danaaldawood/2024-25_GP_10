import React from "react";
import { useNavigate } from "react-router-dom";  
import { Helmet } from "react-helmet";
import LOGO from "../images/Logo.png";

// Example logo import (replace this with your actual logo file path)
 
const TermsConditionUser = () => {
  const navigate = useNavigate(); // To navigate back or to another page

  const goBack = () => {
    navigate('/sign'); // Goes back to the previous page
  };

  return (
    <>
      <Helmet>
        <title>Terms and Conditions User</title>
        <meta name="description" content="Terms and Conditions User" />
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
        <li>You cannot register as a moderator if you are already registered as a user.</li>
<li>Your data will be accessible to administrators for monitoring and compliance purposes.</li>
<li>All activities you perform on the site will be monitored to ensure compliance with the platform's procedures.</li>

        </ul>
        <button onClick={goBack}>Agree</button> {/* Optional back button */}
      </div>
    </>
  );
};

export default TermsConditionUser;
