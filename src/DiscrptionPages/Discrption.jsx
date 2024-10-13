

import React, { useState } from 'react'; // Import React and useState only once
import { Link, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import './Discrption.css';

// import logo from '../images/Culturelogo.png';

import Cardtopic from './Cardtopic.jsx';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import WavingHandIcon from '@mui/icons-material/WavingHand';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TodayIcon from '@mui/icons-material/Today';

import ball from '../images/Group6.png';


import about from '../images/aboutdata.png';

import CLogo from '../Compare/Clogo.png';




function Header() {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState(''); // إضافة حالة لحفظ المجال المختار

  const userName = "Haya";

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

const Discrption = () => {
    return (
        <div>
          <Header/>
            <main>
                <section id="CoreDimintion">
                  
                <img src={about} id="aboutlogo" alt="aboutlogo" />
                   
        
                    
                     
                    <div className="discrptionbox">

                        <div>
                        
                            <p>
                            Our cultural values integrates information from multiple sources, encompassing over 200,000 entries to ensure thorough coverage across diverse attributes and topics. This extensive dataset provides in-depth insights into three primary cultural regions: Arab, Chinese, and Western. By integrating multiple datasets, it encapsulates a broad spectrum of perspectives, delivering refined knowledge on cultural topics and regional variances. This framework not only enriches cultural understanding but also supports precise
                             analysis and comparison across these distinct regions.
                            </p>
                            
                        </div>
                        <button type="button" className="normal-button">View</button>
                        
                    </div>
                   
                </section>
                <section id="cardsection">
                <img src={ball}  id="corner-ball" alt=",,"/>
                    <h2>Dataset Topics</h2>
                    <div className="containerrows">
                        <div className="row">
                            {/* First Card */}
                            <div className="col-md-6">
                                <Cardtopic
                                    Icon={RestaurantIcon}
                                    title="Food"
                                    text="What is a common snack for preschool kids in your country?"
                                />
                            </div>
                            {/* Second Card */}
                            <div className="col-md-6">
                                <Cardtopic
                                    Icon={FamilyRestroomIcon}
                                    title="Family"
                                    text="What is a popular outdoor place for families to have fun with little kids in your country?"
                                />
                            </div>
                        </div>
                        <div className="row">
                            {/* Third Card */}
                            <div className="col-md-6">
                                <Cardtopic
                                    Icon={FitnessCenterIcon}
                                    title="Sport"
                                    text="What is the most popular sport team in your country?"
                                />
                            </div>
                            {/* Fourth Card */}
                            <div className="col-md-6">
                                <Cardtopic
                                    Icon={WorkHistoryIcon}
                                    title="Work-life"
                                    text="Professional  hi holife and work culture."
                                />
                            </div>
                        </div>
                        <div className="row">
                            {/* Fifth Card */}
                            <div className="col-md-6">
                                <Cardtopic
                                    Icon={WavingHandIcon}
                                    title="Greeting"
                                    text="Greetings and customs in wister is using a thmp"
                                />
                            </div>
                            {/* Sixth Card */}
                            <div className="col-md-6">
                                <Cardtopic
                                    Icon={MenuBookIcon}
                                    title="Education"
                                    text="What is a popular second language for high school students in your country?"
                                />
                            </div>
                        </div>
                        <div className="row">
                            {/* Seventh Card */}
                            <div className="col-md-6">
                                <Cardtopic
                                    Icon={TodayIcon}
                                    title="Holidays"
                                    text="What do people do to celebrate New Year's Day in your country?"
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </main>
                 {/* Footer */}
      <footer className="footer">
        <p>© 2024 CultureLens. All rights reserved.</p>
      </footer>
      
        </div>
    );
}

export default Discrption;
