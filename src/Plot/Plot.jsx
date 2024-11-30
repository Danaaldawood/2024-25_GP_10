// --- Imports ---
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Plot.css";
import plotImage from "../images/plot1.JPG";
import { FaArrowLeft } from "react-icons/fa";
import { Footer } from "../Footer/Footer";
import { Helmet } from "react-helmet";

export const Plot = () => {
  // --- State Management ---
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [selectedDimension, setSelectedDimension] = useState("");
  const [dimensionPlaceholder, setDimensionPlaceholder] =
    useState("Select a topic");
  const [hasError, setHasError] = useState(false);

  const navigate = useNavigate();

  // --- Dialog Handlers ---
  const openDialog = () => {
    setPopupOpen(true);
  };

  const closeDialog = () => {
    setPopupOpen(false);
  };

  // --- Form Handlers ---
  const handleDimensionChange = (event) => {
    setSelectedDimension(event.target.value);
    setHasError(false);
  };

  const handleNext = () => {
    if (!selectedDimension) {
      setDimensionPlaceholder("Please select a topic");
      setHasError(true);
      return;
    }
    closeDialog();
    navigate("/Freestyle");
  };

  return (
    <div className="plotpage">
      {/* Meta Tags */}
      <Helmet>
        <title>Plot</title>
        <meta name="description" content="Plot page" />
      </Helmet>

      {/* Header */}
      <div className="plot-page-header">
        <button
          className="plot-back-btn"
          onClick={() => navigate("/evaluation")}
        >
          <FaArrowLeft className="plot-back-icon" />
        </button>
      </div>

      {/* Main Content Section */}
      <div className="plotheader">
        {/* Title and Description */}
        <h3>The overall evaluation</h3>
        <pre>Topic: Food | Baseline LLM | Evaluation method: CAR score </pre>

        {/* Plot Image */}
        <img src={plotImage} alt="Evaluation Plot" />

        {/* Action Button */}
        <div className="plotsubmit-container">
          <button className="plotsubmit" onClick={openDialog}>
            Free style chatting
          </button>
        </div>

        {/* Topic Selection Dialog */}
        {isPopupOpen && (
          <div className="plotdialog-container">
            <dialog open className="plotpopup-dialog">
              <div className="plotpopup-content">
                <h2>Select Topic</h2>
                <select
                  name="plotDim"
                  id="plotDim"
                  className={`plotDim ${hasError ? "error" : ""}`}
                  value={selectedDimension}
                  onChange={handleDimensionChange}
                >
                  <option value="" disabled>
                    {dimensionPlaceholder}
                  </option>
                  <option value="food">Food</option>
                  <option value="sport">Sport</option>
                  <option value="family">Family</option>
                  <option value="education">Education</option>
                  <option value="holidays">Holidays</option>
                  <option value="work-life">Work-life</option>
                </select>
                <div>
                  <button className="plot-button2" onClick={handleNext}>
                    Next
                  </button>
                </div>
              </div>
            </dialog>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};
