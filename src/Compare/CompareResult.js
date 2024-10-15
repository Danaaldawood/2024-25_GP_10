import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import resultImage from '../images/result.png';  
import './CompareResult.css'; 
import { FaArrowLeft } from 'react-icons/fa'; 
import {Footer} from '../Footer/Footer'


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

      {/* Region and Topic display */}
      {cultureRegion && topic ? (
        <div className="comparison-info">
          <p>Domain: <strong>{cultureRegion}</strong> | Topic: <strong>{topic}</strong></p>
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
      {/* Footer */}
      <Footer/>
    </div>
  );
};

export default CompareResult;


