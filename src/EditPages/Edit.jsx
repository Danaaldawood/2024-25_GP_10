
// import React from 'react';

// const Edit = () => {
//     return (
//         <div>
//             <h1>Edit Page</h1>
//         </div>
//     );
// };



import React, { useState } from 'react';
import './Edit.css';
import { useNavigate } from 'react-router-dom';

import CLogo from '../Compare/Clogo.png';



function Header() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
const [showMore, setShowMore] = useState(false);
const [menuOpen, setMenuOpen] = useState(false);


const handleSearch = (e) => {
  e.preventDefault();
  console.log("بحث عن:", searchQuery);
};

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


  return (
  
     
      <header className="header">
          <div className="header-left">
            <img src={CLogo} alt="CultureLens Logo" className="logo-img " />
            {/* <h1 className="logo-title ">CultureLens</h1> */}
          </div>
  
          <nav className="nav-menu ">
            <a href="HomePage" >Home</a>
            <a href="/culturevalues" >Cultural Values</a>
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

  );

}


export const Edit = () => {
const navigate = useNavigate();

 const handleEditClick = () => {
    navigate('/culturevalues');
 };
 
  return (
   <div>
     <Header/>
  
   
    <div className='formcontainer'>
      
      
     
      <div className='header'>
        
        <div className='text'>Edit</div>
        <div className='underline'></div>
      </div>
      <div className="inputs">
      <div className="input">
          <label className="label">Email:</label>
          <input type="text" id="email" name="email" placeholder="Enter your email"  required/>                    
        </div>
         

        <div className="input">
          <label className="label">Dimension:</label>
          <select name="dimension" id="dimension" className="dimension">
            <option value="" disabled selected>Select a dimension</option>
            <option value="Food">Food</option>
            <option value="Sport">Sport</option>
            <option value="Family">Family</option>
            <option value="Education">Education</option>
            <option value="Holidays">Holidays</option>
            <option value="Work-life">Work-life</option>
          </select>
        </div>

        <div className="input">
          <label className="label">Value:</label>
          <input type="text" id="value"  placeholder="Enter value"  name="value"  required/>                    
        </div>

        
        <div className="input">
          <label className="label">Region:</label>
          <select name="domain" id="domain" className="domain">
            <option value="" disabled selected>Select a reigon</option>
            <option value="Arab">Arab</option>
            <option value="Western"> Western</option>
            <option value="Chinese">Chinese</option>
           
          </select>
        </div>
      
        <div className="input">
          <label className="label">Edit Reason:</label>
          <input type="radio" class="reason" name="reason" value="Subculture"/> 
          Subculture

          <input type="radio" name="reason" class="reason" value="variance value"/> 
          variance value

        
        </div>
      </div>
      <div className="submit-container">
        <div className="submit">
          <button onClick={handleEditClick}>Edit</button>
        </div>
      </div>
    </div>
    </div>
  );

};
export default Edit;