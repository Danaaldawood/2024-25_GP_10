import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import resultImage from '../images/result.png';  
import './CompareResult.css'; 
import { FaArrowLeft } from 'react-icons/fa'; 

const CompareResult = () => {
  const location = useLocation();
  const { cultureDomain, dimension } = location.state || {};  
  const navigate = useNavigate();

 
  const handleRecompare = () => {
    navigate('/compare');
  };


  const handleDone = () => {
    navigate('/');
  };

  return (
    <div className='result-container'>

      <div className="title-container">
        <button className='back-btn' onClick={() => navigate('/compare')}>
          <FaArrowLeft className='back-icon' /> Back
        </button>
        <h1>Cross-Cultural Comparison Result</h1>
      </div>

   
      {cultureDomain && dimension ? (
        <>
          <p>Comparing Domain: <strong>{cultureDomain}</strong></p>
          <p>Topic: <strong>{dimension}</strong></p>
          <img src={resultImage} alt="Comparison Result" className="result-image" />
        </>
      ) : (
        <p>No comparison data available. Please go back and select options for comparison.</p>
      )}


      <div className='result-btn-container'>
        <button className='result-btn done-btn' onClick={handleDone}>Done</button>
        <button className='result-btn recompare-btn' onClick={handleRecompare}>Recompare</button>
      </div>
    </div>
  );
};

export default CompareResult;


