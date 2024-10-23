import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ref, update } from 'firebase/database';
import { realtimeDb } from '../Register/firebase';
import "./Edit.css";
import { Header } from '../Header/Header';
import { Footer } from '../Footer/Footer';

export const EditCultureValue = () => {
  const { id } = useParams(); // Get the row ID from the URL
  const location = useLocation(); // Get the passed state from navigate
  const navigate = useNavigate(); 

  useEffect(() => {
    if (!location.state) {
      alert("No data available to edit");
      navigate("/");
    }
  }, [location.state, navigate]);

  const [itemData, setItemData] = useState({
    topic: location.state?.topic || "", // Get topic from passed state
    attribute: location.state?.attribute || "", // Get attribute from passed state
    value: "", 
    region: location.state?.region || localStorage.getItem('region') || "", // Get region from passed state or localStorage
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setItemData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleEditClick = async () => {
    const valueInput = document.getElementById('value');

    valueInput.classList.remove('error');

    if (!itemData.value.trim()) {
      valueInput.placeholder = 'Please enter a value';
      valueInput.classList.add('error'); 
      return;
    }

    try {
      const itemRef = ref(realtimeDb, `Items/${id}`);
      await update(itemRef, {
        value: itemData.value, 
        region: itemData.region, // Update region as well if needed
      });
      alert("Data updated successfully!");
      navigate("/"); // Navigate back to the list page after successful Edit
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  return (
    <div>
      <Header />
      <div className="editformcontainer">
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
            <input
              type="text"
              id="value"
              name="value"
              value={itemData.value}
              onChange={handleInputChange}
              placeholder="Enter value"
              required
              className={itemData.value.trim() ? '' : 'error'}
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
      </div>
      <Footer />
    </div>
  );
};

export default EditCultureValue;
