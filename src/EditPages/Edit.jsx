import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ref, update, push } from 'firebase/database';
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
  const [showErrorPopup, setShowErrorPopup] = useState(false); 
  const [errorMessage, setErrorMessage] = useState(""); 
  const [userId, setUserId] = useState("");

  // Parse the composite ID to get region code and detail ID
  const [regionCode, detailId] = (id || "").split("-");

  useEffect(() => {
    if (!location.state) {
      alert("No data available to add");
      navigate("/view");
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
  };

  const handleAddClick = async () => {
    // التحقق من القيمة المدخلة وما إذا كانت تحتوي على أحرف غير إنجليزية
    const nonEnglishPattern = /[^\x00-\x7F]+/;
    if (nonEnglishPattern.test(itemData.newvalue)) {
      setErrorMessage("Please enter the value in English only.");
      setShowErrorPopup(true);
      return;
    }

    if (!itemData.newvalue || !itemData.reason) {
      setErrorMessage(!itemData.newvalue ? "Please enter a new value." : "Please select a reason.");
      setShowErrorPopup(true);
      return;
    }

    const newValueLower = itemData.newvalue.toLowerCase();
    const allValuesLower = itemData.allValues.map(value => value.toLowerCase());

    if (allValuesLower.includes(newValueLower)) {
      setErrorMessage(`The value "${itemData.newvalue}" already exists in the dataset.`);
      setShowErrorPopup(true);
      return;
    }

    try {
      const itemRef = ref(realtimeDb, `${regionCode}/Details/${detailId}/annotations/${itemData.allValues.length}`);
      const newAnnotation = {
        en_values: [itemData.newvalue],
        reason: itemData.reason,
        user_id: userId || "user_undefined",
        values: [itemData.newvalue]
      };

      await update(itemRef, newAnnotation);

      const viewEditRef = ref(realtimeDb, `Viewedit/${itemData.region}`);
      const newEntry = {
        attribute: itemData.attribute,
        userId: userId,
        region: itemData.region,
        topic: itemData.topic,
        value: itemData.newvalue,
        reason: itemData.reason
      };
      await push(viewEditRef, newEntry);

      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        navigate("/view");
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

        {/* بوب أب عند إدخال نص غير إنجليزي */}
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
              placeholder="Enter a new value"
            />
          </div>

          <div className="add-input">
            <label className="label">Reason:</label>
            <select
              id="reason"
              name="reason"
              value={itemData.reason}
              onChange={handleInputChange}
            >
              <option value="" disabled>Select your reason</option>
              <option value="Variation">Variation</option>
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
      </div>
      <Footer />
    </div>
  );
};

export default AddCultureValue;
