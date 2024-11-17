import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import resultImage from "../images/result.png";
import "./CompareResult.css";
import { FaArrowLeft } from "react-icons/fa";
import { Footer } from "../Footer/Footer";

const CompareResult = () => {
  const location = useLocation();
  const { cultureRegion, topics } = location.state || {}; // Update to handle multiple topics
  const navigate = useNavigate();

  // State to store the message from Flask
  const [backendMessage, setBackendMessage] = useState("");

  useEffect(() => {
    // Fetch message from Flask API
    fetch("http://127.0.0.1:5000/api/hello")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => setBackendMessage(data.message))
      .catch((error) => console.error("Error fetching Flask data:", error));
  }, []);

  const handleRecompare = () => {
    navigate("/compare");
  };

  const handleDone = () => {
    navigate("/HomePage");
  };

  return (
    <div className="result-container">
      <header className="result-title-container">
        <button className="result-back-btn" onClick={() => navigate("/compare")}>
          <FaArrowLeft className="result-back-icon" />
        </button>
      </header>

      <h1 className="result-title">Cross-Cultural Comparison Result</h1>

      {/* Display Flask message */}
      <p>{backendMessage ? backendMessage : "Loading data from Flask..."}</p>

      {/* Display Regions and Topics */}
      {cultureRegion && topics ? (
        <div className="comparison-info">
          <p>
            <strong>Regions:</strong> {cultureRegion.join(", ")}
          </p>
          <p>
            <strong>Topics:</strong> {topics.join(", ")}
          </p>
          <img src={resultImage} alt="Comparison Result" className="result-image" />
        </div>
      ) : (
        <p>
          No comparison data available. Please go back and select options for
          comparison.
        </p>
      )}

      {/* Buttons */}
      <div className="result-btn-container">
        <button className="result-btn result-done-btn" onClick={handleDone}>
          Done
        </button>
        <button className="result-btn result-recompare-btn" onClick={handleRecompare}>
          Recompare
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default CompareResult;
