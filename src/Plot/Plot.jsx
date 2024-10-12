import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  
import './Plot.css';
import plotImage from '../images/plot1.png';
import logo from '../images/logo.png';


export const Plot = () => {
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
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [selectedDimension, setSelectedDimension] = useState('');
  const navigate = useNavigate();  // Define navigate

  const openDialog = () => {
    setPopupOpen(true);
  };

  const closeDialog = () => {
    setPopupOpen(false);
  };

  const handleDimensionChange = (event) => {
    setSelectedDimension(event.target.value);
  };

  const handleNext = () => {
    console.log('Selected Dimension:', selectedDimension);
    closeDialog();
    navigate('/Freestyle');  
  };

  return (
    <div className="plotpage">

<header className="header">
        <div className="header-left">
          <img src={logo} alt="CultureLens Logo" className="logo-img " />
          {/* <h1 className="logo-title ">CultureLens</h1> */}
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



    <div className='plotheader'>
      <h3>The overall evaluation</h3>
      <pre>Dimension: Food  |  Baseline LLM |  Evaluation method: CAR score </pre>

      <img src={plotImage} alt="Evaluation Plot" />
      <div className="plotsubmit-container">
        <button className="plotsubmit" onClick={openDialog}>
          Free style chatting
        </button>
      </div>

      {isPopupOpen && (
        <div className="plotdialog-container">
          <dialog open className="plotpopup-dialog">
            <div className="plotpopup-content">
              <h2>Select Dimension</h2>
              <select 
                name="plotDim" 
                id="plotDim" 
                className="plotDim" 
                value={selectedDimension} 
                onChange={handleDimensionChange}
              >
                <option value="" disabled>Select a dimension</option>
                <option value="food">Food</option>
                <option value="sport">Sport</option>
                <option value="family">Family</option>
                <option value="education">Education</option>
                <option value="holidays">Holidays</option>
                <option value="work-life">Work-life</option>
              </select>
              <div >
                <button className="plot-button2" onClick={handleNext}>Next</button>
              </div>
            </div>
          </dialog>
        </div>
      )}
    </div>
    <footer className="footer ">
        <p className="footer">© 2024 CultureLens. All rights reserved.</p>
      </footer>
    </div>
  );
};
