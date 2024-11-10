import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ref, update } from 'firebase/database';
import { realtimeDb, auth } from '../Register/firebase';
import { onAuthStateChanged } from "firebase/auth";
import "./Add.css";
import { Header } from '../Header/Header';
import { Footer } from '../Footer/Footer';
import { Helmet } from 'react-helmet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

export const AddCultureValue = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false); // State to control error popup visibility
  const [errorMessage, setErrorMessage] = useState(""); // State for error message
  const [userId, setUserId] = useState("");

  useEffect(() => {
    if (!location.state) {
      alert("No data available to add");
      navigate("/View");
    }
  }, [location.state, navigate]);

  const [itemData, setItemData] = useState({
    topic: location.state?.topic || "",
    attribute: location.state?.attribute || "",
    value: location.state?.selectedValue || "",
    region: location.state?.region || localStorage.getItem('region') || "",
    allValues: location.state?.allValues || [],
    newvalue: "",
    reason: ""
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const lastFourUID = user.uid.slice(-4); 
        setUserId(`user_${lastFourUID}`);
      } else {
        console.error("User is not authenticated");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setItemData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    if (name === 'newvalue' && value.length > 0) {
      setShowErrorPopup(false); // Hide error popup on new input
    }
  };

  const handleAddClick = async () => {
    if (!itemData.newvalue) {
      setShowErrorPopup(true);
      setErrorMessage("Please enter a new value.");
      return;
    }

    const newValueLower = itemData.newvalue.toLowerCase();
    const allValuesLower = itemData.allValues.map(value => value.toLowerCase());

    if (allValuesLower.includes(newValueLower)) {
      setErrorMessage(`The value "${itemData.newvalue}" is already present in the dataset.`);
      setShowErrorPopup(true);
      return;
    }

    try {
      const newAnnotation = {
        en_values: [itemData.newvalue],
        reason: itemData.reason,
        user_id: userId || "user_undefined",
        values: [itemData.newvalue]
      };

      const itemRef = ref(realtimeDb, `${id}/annotations`);
      await update(itemRef, {
        [itemData.allValues.length]: newAnnotation
      });

      setItemData((prevState) => ({
        ...prevState,
        allValues: [...prevState.allValues, itemData.newvalue],
        newvalue: ""
      }));

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
      <div className="addformcontainer">
        <Helmet>
          <title>Add Page</title>
          <meta name="description" content="This is Add page" />
        </Helmet>

        <div className="addheader">
          <div className="add-title">Add Culture Value</div>
          <div className="underline"></div>
        </div>

        <div className="add-inputs">
          <div className="add-input attribute-container">
            <div className="attribute-display">{itemData.attribute}</div>
          </div>

          <div className="add-input">
            <label className="label">Topic:</label>
            <input
              type="text"
              id="topic"
              name="topic"
              value={itemData.topic}
              readOnly
            />
          </div>

          <div className="add-input">
            <label className="label">All Values:</label>
            <ul className="all-values-list">
              {itemData.allValues.map((value, index) => (
                <li key={index} className="value-item">
                  {value}
                </li>
              ))}
            </ul>
          </div>

          <div className="add-input">
            <label className="label">New Value:</label>
            <input
              type="text"
              id="newvalue"
              name="newvalue"
              value={itemData.newvalue}
              onChange={handleInputChange}
              placeholder={showErrorPopup ? "Please enter a new value" : "Enter a new value"}
              className={showErrorPopup ? "newvalue-error-placeholder" : ""}
            />
          </div>

          <div className="add-input">
            <label className="label">Reason:</label>
            <select
              id="reason"
              name="reason"
              value={itemData.reason}
              onChange={handleInputChange}
              className={showErrorPopup ? "reason-error-placeholder" : ""}
            >
              <option value="" disabled>
                {showErrorPopup ? "Please enter a reason" : "Select your reason"}
              </option>
              <option value="variance">variation</option>
              <option value="subculture">Subculture</option>
            </select>
          </div>

          <div className="add-input">
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

        <div className="addsubmit-container">
          <div className="add-submit">
            <button onClick={handleAddClick} disabled={!userId}>
              {userId ? "Add" : "Loading..."}
            </button>
          </div>
        </div>

        {showSuccess && (
          <div className="success-popup">
            <FontAwesomeIcon icon={faCheckCircle} className="success-icon" />
            <p className="success-message">Value added successfully.</p>
          </div>
        )}

        {showErrorPopup && (
          <div className="error-popup">
            <div className="error-title">Error</div>
            <div className="error-message">{errorMessage}</div>
            <div className="error-actions">
              <button className="confirm-btn" onClick={() => setShowErrorPopup(false)}>
                OK
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AddCultureValue;
