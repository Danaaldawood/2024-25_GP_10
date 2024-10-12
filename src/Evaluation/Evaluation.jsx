import React, { useEffect, useState } from 'react';
import './Evaluation.css';
import logo from '../images/logo.png';

import { useNavigate } from 'react-router-dom';

export const Evaluation = () => {  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

 
  const toggleProfileMenu = () => {
    setIsProfileOpen(!isProfileOpen);
  };


  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  const handleProfileClick = () => {
    console.log("عرض الصفحة الشخصية");
  };

  const handleSignOut = () => {
    console.log("تسجيل الخروج");
  };


  const navigate = useNavigate();

  const handleEvaluateClick = () => {
    navigate('/plot');
  };

  return (
<div className='Evaluationpage'>
      {/* Header */}
      <div className='evalcontainer'>

      <header className="header">
        <div className="header-left">
          <img src={logo} alt="CultureLens Logo" className="logo-img " />
          <h1 className="logo-title ">CultureLens</h1>
        </div>

        <nav className="nav-menu ">
          <a href="HomePage" >Home</a>
          <a href="/dataset" >Dataset</a>
          <a href="/edit" >Edit</a>
          <a href="/compare" >Compare</a>
          <a href="/evaluation">Evaluation</a>
        </nav>

        <button className="menu-btn" onClick={handleMenuToggle}>
          <span className="menu-icon">&#9776;</span>
        </button>
        {menuOpen && (
          <div className="menu-dropdown ">
            <p onClick={handleProfileClick}>Profile</p>
            <p onClick={handleSignOut} className="sign-out ">Sign out</p>
          </div>
        )}
      </header>





      <div className='evalheader'>
        {/* Your header content can go here */}
      </div>
      {/* <h3> moved outside evalheader */}
      <h3 className="eval-title">Evaluation</h3>
      <div className="evalinputs">
        <div className="evalinput">
          <label className="evallabel">Dimension:</label>
          <select name="evaldimension" id="evaldimension" className="evaldimension">
            <option value="" disabled selected>Select a dimension</option>
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
          <select name="llm" id="llm" className="llm">
            <option value="" disabled selected>Select a model</option>
            <option value="baseline">Baseline model</option>
            <option value="fine-tuned">Fine-tuned model</option>
          </select>
        </div>
        <div className="evalinput">
          <label className="evallabel">Evaluation Method:</label>
          <select name="evalmethod" id="evalmethod" className="evalmethod">
            <option value="" disabled selected>Select evaluation method</option>
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

      <footer className="footer ">
        <p className="footer">© 2024 CultureLens. All rights reserved.</p>
      </footer>

    </div>
    </div>
  );
};
