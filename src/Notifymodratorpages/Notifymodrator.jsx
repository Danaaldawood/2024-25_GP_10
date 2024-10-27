
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Notifymodrator.css";
import logo from "../images/Logo.png";
import { Footer } from "../Footer/Footer";
import { Header } from "../Header/Header";
import { Helmet } from 'react-helmet';

export const Notifymodrator = () => {


return (

    <div className="Notifypage">
      {/* Header */}
      <Header />
      <Helmet>
      <title>Notify</title>
      <meta name="description" content="Notify page" />
    </Helmet>
      <div className="evalcontainer">
        {/* Evaluation form */}
        <h3 className="notifyform-title">Notify request</h3>
        <div className="notifyforminputs">
          <div className="notifyinput">
            <label className="notifylabel">reigon:</label>
            <select
              name="notyfyreigon"
              id="notyfyreigon"
             
            >
              <option value="" disabled>
              
              </option>
            
              <option value="Arab">Arab</option>
              <option value="Chines">Chines</option>
              <option value="Westren">Western</option>
            </select>
          </div>

          <div className="notifyinput">
            <label className="notifylabel">Topic:</label>
            <select
              name="notifytopic"
              id="notifytopic"
             
            >
              <option value="" disabled>
                {/* {dimensionPlaceholder} */}
              </option>
              <option value="food">Food</option>
              <option value="sport">Sport</option>
              <option value="family">Family</option>
              <option value="education">Education</option>
              <option value="holidays">Holidays</option>
              <option value="work-life">Work-life</option>
            </select>
           
          </div>
        </div>
          <div className="notifyinput">
            <label className="notifylabel">Attribute:</label>
           <input type='text' class='notifyattribute'/>
         
          </div>

          <div className="notifyinput">
            <label className="notifylabel">Value:</label>
            <input type='text' class='notifyvalue'/>
           
          </div>

          <div className="notifyinput">
            <label className="notifylabel">Discrption:</label>
            <input type='text' class='notifydiscrption'/>
           
          </div>
        </div>

        <div className="submit-container">
          <div className="notifysubmit">
            {/* <button onClick={handleEvaluateClick}>Evaluate</button> */}
          </div>
        </div>
    
  
      <Footer />
    </div>

  );

};
export default Notifymodrator;