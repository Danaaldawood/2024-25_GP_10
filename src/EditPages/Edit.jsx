import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ref, update } from 'firebase/database';
import { realtimeDb } from '../Register/firebase';
import "./Edit.css";
import { Header } from '../Header/Header';
import { Footer } from '../Footer/Footer';
import {Helmet} from 'react-helmet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'; 

export const EditCultureValue = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!location.state) {
      alert("No data available to edit");
      navigate("/View");
    }
  }, [location.state, navigate]);

  const [itemData, setItemData] = useState({
    topic: location.state?.topic || "",
    attribute: location.state?.attribute || "",
    value: location.state?.selectedValue || "",
    region: location.state?.region || localStorage.getItem('region') || "",
    allValues: location.state?.allValues || [],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setItemData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleEditClick = async () => {
    const valueSelect = document.getElementById('value');
    valueSelect.classList.remove('error');

    if (!itemData.value) {
      valueSelect.classList.add('error');
      return;
    }

    try {
      const itemRef = ref(realtimeDb, `${id}`);
      await update(itemRef, {
        value: itemData.value,
        region: itemData.region,
      });
      
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
    <div>
      <Header />
      <div className="editformcontainer">
        <Helmet>
          <title>Edit Page</title>
          <meta name="description" content="This is Edit page" />
        </Helmet>
          
        <div className="editheader">
          <div className="edit-title">Edit Culture Value</div>
          <div className="underline"></div>
        </div>
        <div className="edit-inputs">
                    {/* Display attribute */}

          <div className="edit-input attribute-container">
            <div className="attribute-display">{itemData.attribute}</div>
          </div>

          {/* Topic field */}

          <div className="edit-input">
            <label className="label">Topic:</label>
            <input
              type="text"
              id="topic"
              name="topic"
              value={itemData.topic}
              readOnly 
            />
          </div>

          {/* Value field */}
          <div className="edit-input">
            <label className="label">Value:</label>
            <select
              id="value"
              name="value"
              value={itemData.value}
              onChange={handleInputChange}
              required
              className={itemData.value ? '' : 'error'}
            >
              <option value="">Select a value</option>
              {itemData.allValues.map((value, index) => (
                <option key={index} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          {/* New value field */}
          <div className="edit-input">
            <label className="label">New value:</label>
            <input
              type="text"
              id="newvalue"
              name="newvalue"
              placeholder="Enter value"
            
            />
          </div>

          {/* Region field */}
          <div className="edit-input">
            <label className="label">Region:</label>
            <input
              type="text"
              id="region"
              name="region"
              value={itemData.region}
              readOnly 
            />
          </div>
        </div>
        <div className="edisubmit-container">
          <div className="edit-submit">
            <button onClick={handleEditClick}>Edit</button>
          </div>
        </div>

        {/* Success popup message */}
        {showSuccess && (
          <div className="success-popup">
            <FontAwesomeIcon icon={faCheckCircle} className="success-icon" />
            <p className="success-message">Value edited successfully.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default EditCultureValue;