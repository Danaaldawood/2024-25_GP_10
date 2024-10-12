import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import resultImage from './result.png';  // Import your result image
import './CompareResult.css';  // Ensure the CSS file is correctly imported
import { FaArrowLeft } from 'react-icons/fa'; // Import arrow icon

const CompareResult = () => {
  const location = useLocation();  // Get the data passed from the form
  const { cultureDomain, dimension } = location.state;  // Corrected variable name
  const navigate = useNavigate();

  // Function to navigate back to the form
  const handleRecompare = () => {
    navigate('/compare');
  };

  // Function to navigate back to home
  const handleDone = () => {
    navigate('/');
  };

  return (
    <div className='result-container'>
      {/* Title Container */}
      <div className="title-container">
        <button className='back-btn' onClick={() => navigate('/compare')}>
          <FaArrowLeft className='back-icon' /> Back
        </button>
        <h1>Cross-Cultural Comparison Result</h1>
      </div>

      <p>Comparing Domain: <strong>{cultureDomain}</strong></p> {/* Corrected variable */}
      <p>Dimension: <strong>{dimension}</strong></p>
      <img src={resultImage} alt="Comparison Result" className="result-image" />

      {/* Buttons */}
      <div className='result-btn-container'>
        <button className='result-btn done-btn' onClick={handleDone}>Done</button>
        <button className='result-btn recompare-btn' onClick={handleRecompare}>Recompare</button>
      </div>

      
    </div>
  );
};

export default CompareResult;

