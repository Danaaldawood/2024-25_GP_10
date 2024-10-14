import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Evaluation.css';
import logo from '../images/Logo.png';

export const Evaluation = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [evalDimension, setEvalDimension] = useState('');
  const [evalLLM, setEvalLLM] = useState('');
  const [evalMethod, setEvalMethod] = useState('');
  const [dimensionPlaceholder, setDimensionPlaceholder] = useState('Select a dimension');
  const [llmPlaceholder, setLLMPlaceholder] = useState('Select a model');
  const [evalMethodPlaceholder, setEvalMethodPlaceholder] = useState('Select evaluation method');
  const [hasError, setHasError] = useState(false);

  const navigate = useNavigate();

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  const handleProfileClick = () => {
    console.log("عرض الصفحة الشخصية");
  };

  const handleSignOut = () => {
    console.log("تسجيل الخروج");
  };

  const handleEvaluateClick = (e) => {
    e.preventDefault();
    let error = false;

    if (!evalDimension) {
      setDimensionPlaceholder('Please select a topic');
      error = true;
    } else {
      setDimensionPlaceholder('Select a topic');
    }

    if (!evalLLM) {
      setLLMPlaceholder('Please select a model');
      error = true;
    } else {
      setLLMPlaceholder('Select a model');
    }

    if (!evalMethod) {
      setEvalMethodPlaceholder('Please select evaluation method');
      error = true;
    } else {
      setEvalMethodPlaceholder('Select evaluation method');
    }

    setHasError(error);

    if (error) return;

    navigate('/plot');
  };

  return (
    <div className='Evaluationpage'>
      <header className="header">
        <div className="header-left">
          <img src={logo} alt="CultureLens Logo" className="logo-img" />
          <h1 className="logo-title">CultureLens</h1>
        </div>
        <nav className="nav-menu">
          <a href="/home">Home</a>
          <a href="/dataset">Dataset</a>
          <a href="/edit">Edit</a>
          <a href="/compare">Compare</a>
          <a href="/evaluation">Evaluation</a>
        </nav>
        <button className="menu-btn" onClick={handleMenuToggle}>
          <span className="menu-icon">&#9776;</span>
        </button>
        {menuOpen && (
          <div className="menu-dropdown">
            <p onClick={handleProfileClick}>Profile</p>
            <p onClick={handleSignOut} className="sign-out">Sign out</p>
          </div>
        )}
      </header>

      <div className='evalcontainer'>
        <h3 className="eval-title">Evaluation</h3>
        <div className="evalinputs">
          <div className="evalinput">
            <label className="evallabel">Topic:</label>
            <select
              name="evaldimension"
              id="evaldimension"
              className={`evaldimension ${hasError && !evalDimension ? 'error' : ''}`}
              value={evalDimension}
              onChange={(e) => setEvalDimension(e.target.value)}
            >
              <option value="" disabled>{dimensionPlaceholder}</option>
              <option value="food">Food</option>
              <option value="sport">Sport</option>
              <option value="family">Family</option>
              <option value="education">Education</option>
              <option value="holidays">Holidays</option>
              <option value="work-life">Work-life</option>
            </select>
          </div>

          <div className="evalinput">
            <label className="evallabel">Language Model:</label>
            <select
              name="evalLLM"
              id="evalLLM"
              className={`llm ${hasError && !evalLLM ? 'error' : ''}`}
              value={evalLLM}
              onChange={(e) => setEvalLLM(e.target.value)}
            >
              <option value="" disabled>{llmPlaceholder}</option>
              <option value="baseline">Baseline model</option>
              <option value="fine-tuned">Fine-tuned model</option>
            </select>
          </div>

          <div className="evalinput">
            <label className="evallabel">Evaluation Method:</label>
            <select
              name="evalmethod"
              id="evalmethod"
              className={`evalmethod ${hasError && !evalMethod ? 'error' : ''}`}
              value={evalMethod}
              onChange={(e) => setEvalMethod(e.target.value)}
            >
              <option value="" disabled>{evalMethodPlaceholder}</option>
              <option value="car">CAR score</option>
              <option value="consensus">Consensus score</option>
            </select>
          </div>
        </div>

        <div className="submit-container">
          <div className="evalsubmit">
            <button onClick={handleEvaluateClick}>Evaluate</button>
          </div>
        </div>
      </div>

      <footer className="footer">
        <p>© 2024 CultureLens. All rights reserved.</p>
      </footer>
    </div>
  );
};
