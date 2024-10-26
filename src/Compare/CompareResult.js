import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import resultImage from '../images/result.png';  
import './CompareResult.css'; 
import { FaArrowLeft } from 'react-icons/fa'; 
import { Footer } from '../Footer/Footer';

const CompareResult = () => {
  const location = useLocation();
  const { cultureRegion, topic } = location.state || {};  
  const navigate = useNavigate();

  const handleRecompare = () => {
    navigate('/compare');
  };

  const handleDone = () => {
    navigate('/HomePage');
  };

  return (
    <div className='result-container'>
      <header className="result-title-container">
        <button className='result-back-btn' onClick={() => navigate('/compare')}>
          <FaArrowLeft className='result-back-icon' /> 
        </button>
      </header>

      <h1 className="result-title">Cross-Cultural Comparison Result</h1>

      {/* Display Regions and Topic */}
      {cultureRegion && topic ? (
        <div className="comparison-info">
          <p>Regions: <strong>{cultureRegion.join(', ')}</strong> | Topic: <strong>{topic.join(', ')}</strong></p>
          <img src={resultImage} alt="Comparison Result" className="result-image" />
        </div>
      ) : (
        <p>No comparison data available. Please go back and select options for comparison.</p>
      )}

      {/* Buttons */}
      <div className='result-btn-container'>
        <button className='result-btn result-done-btn' onClick={handleDone}>Done</button>
        <button className='result-btn result-recompare-btn' onClick={handleRecompare}>Recompare</button>
      </div>
      <Footer />
    </div>
  );
};

export default CompareResult;
