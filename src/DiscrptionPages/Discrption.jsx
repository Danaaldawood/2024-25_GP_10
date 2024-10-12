


import React, { useState } from 'react'; // Import React and useState only once
import { Link, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import './Discrption.css';

import './Discrption.css';
import logo from '../images/Culturelogo.png';


import Cardtopic from './Cardtopic.jsx';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import WavingHandIcon from '@mui/icons-material/WavingHand';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TodayIcon from '@mui/icons-material/Today';

import logo from '../images/Group6.png';


import logo from '../images/aboutdata.png';



function Header() {
    const [isMenuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!isMenuOpen);
    };

    return (
    
        <header className="app-header">
            <img src={logo} className="app-logo" alt="logo" />

            <nav className="header-right">
                <a className="nav-link active" href="#home">Home</a>
                <a className="nav-link" href="#compare">Compare</a>
                <a className="nav-link" href="#evaluation">Evaluation</a>
                <a className="nav-link" href="#Edit">Edit</a>



            </nav>
            

            {/* Menu icon for toggling */}
            <MenuIcon className="menu-icon" onClick={toggleMenu} />
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
                    <h2>About Dataset:</h2>
        
                    
                     
                    <div className="discrptionbox">

                        <div>
                        
                            <p>
                                Our dataset was created  by mixing more than datset  in 200k and more to cover the dtata attribute or 
                                Topic and give a more knowldge and diversity  to know about three main region in world  which is Arab ,Chines, Westiren regions .
                                Our dataset was created  by mixing more than datset  in 200k and more to cover the dtata attribute or 
                                Topic and give a more knowldge and diversity  to know about three main region in world  which is Arab ,Chines, Westiren regions .
                            </p>
                            
                        </div>
                        <button type="button" className="normal-button">View</button>
                        
                    </div>
                   
                </section>
                <section id="cardsection">
                <img src={ball}  id="corner-ball" alt=",,"/>
                    <h2>Dataset Topics</h2>
                    <div className="container">
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
