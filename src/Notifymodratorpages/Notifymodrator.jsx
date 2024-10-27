import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Notifymodrator.css";
import logo from "../images/Logo.png";
import { Footer } from "../Footer/Footer";
import { Header } from "../Header/Header";
import { Helmet } from 'react-helmet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

export const Notifymodrator = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    region: "",
    topic: "",
    attribute: "",
    value: "",
    description: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: false })); 
  };

  const handleNotify = () => {
    const newErrors = {};
    let hasError = false;

     Object.keys(formData).forEach((key) => {
      if (!formData[key]) {
        newErrors[key] = true;
        hasError = true;
      }
    });

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    try {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate("/View");
      }, 1000);
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  return (
    <div className="Notifypage">
      <Header />
      <Helmet>
        <title>Notify</title>
        <meta name="description" content="Notify page" />
      </Helmet>
      <div className="evalcontainer">
        <h3 className="notifyform-title">Notify request</h3>
        <div className="notifyforminputs">
          <div className={`notifyinput ${errors.region ? "error" : ""}`}>
            <label className="notifylabel">Region:</label>
            <select
              name="region"
              id="notyfyreigon"
              value={formData.region}
              onChange={handleInputChange}
            >
              <option value="" disabled></option>
              <option value="Arab">Arab</option>
              <option value="Chines">Chinese</option>
              <option value="Westren">Western</option>
            </select>
            {errors.region && <p className="error-message">Please select a region</p>}
          </div>

          <div className={`notifyinput ${errors.topic ? "error" : ""}`}>
            <label className="notifylabel">Topic:</label>
            <select
              name="topic"
              id="notifytopic"
              value={formData.topic}
              onChange={handleInputChange}
            >
              <option value="" disabled></option>
              <option value="food">Food</option>
              <option value="sport">Sport</option>
              <option value="family">Family</option>
              <option value="education">Education</option>
              <option value="holidays">Holidays</option>
              <option value="work-life">Work-life</option>
            </select>
            {errors.topic && <p className="error-message">Please select a topic</p>}
          </div>

          <div className={`notifyinput ${errors.attribute ? "error" : ""}`}>
            <label className="notifylabel">Attribute:</label>
            <input
              type="text"
              name="attribute"
              className="notifyattribute"
              value={formData.attribute}
              onChange={handleInputChange}
            />
            {errors.attribute && <p className="error-message">Please enter an attribute</p>}
          </div>

          <div className={`notifyinput ${errors.value ? "error" : ""}`}>
            <label className="notifylabel">Value:</label>
            <input
              type="text"
              name="value"
              className="notifyvalue"
              value={formData.value}
              onChange={handleInputChange}
            />
            {errors.value && <p className="error-message">Please enter a value</p>}
          </div>

          <div className={`notifyinput ${errors.description ? "error" : ""}`}>
            <label className="notifylabel">Description:</label>
            <input
              type="text"
              name="description"
              className="notifydiscrption"
              value={formData.description}
              onChange={handleInputChange}
            />
            {errors.description && <p className="error-message">Please enter a description</p>}
          </div>

        </div>
        
        <div className="submitM-container">
          <div className="submit-modrator">
            <button onClick={handleNotify}>Submit</button>
          </div>
        </div>

        {showSuccess && (
          <div className="success-popup">
            <FontAwesomeIcon icon={faCheckCircle} className="success-icon" />
            <p className="success-message">Send notification to moderator successfully.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Notifymodrator;
