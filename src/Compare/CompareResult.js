import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import resultImage from '../images/result.png';  
import './CompareResult.css'; 
import { FaArrowLeft } from 'react-icons/fa'; // Import arrow icon

const CompareResult = () => {
  const location = useLocation();
  const { cultureDomain, dimension } = location.state || {};  // Add fallback for state
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

      {/* Handle case when state is missing */}
      {cultureDomain && dimension ? (
        <>
          <p>Comparing Domain: <strong>{cultureDomain}</strong></p>
          <p>Dimension: <strong>{dimension}</strong></p>
          <img src={resultImage} alt="Comparison Result" className="result-image" />
        </>
      ) : (
        <p>No comparison data available. Please go back and select options for comparison.</p>
      )}

      {/* Buttons */}
      <div className='result-btn-container'>
        <button className='result-btn done-btn' onClick={handleDone}>Done</button>
        <button className='result-btn recompare-btn' onClick={handleRecompare}>Recompare</button>
      </div>
    </div>
  );
};

export default CompareResult;


