import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import "./Discrption.css";
import Cardtopic from "./Cardtopic.jsx";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import WavingHandIcon from "@mui/icons-material/WavingHand";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import TodayIcon from "@mui/icons-material/Today";
import ball from "../images/Group6.png";
import about from "../images/aboutdata.png";
import { Header } from "../Header/Header";
import { Footer } from "../Footer/Footer";
import { Helmet } from 'react-helmet';

const Discrption = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/view");
  };
  return (
    <div className="descrptionpage">
      <Header />
      <Helmet>
          <title>Cultural Values</title>
          <meta name="description" content="This is Cultural Values page" />
        </Helmet>
      <main>
      
        <section id="CoreDimintion">
        {/* <img src={about} id="aboutlogo" alt="aboutlogo"  /> */}

          <div className="discrptionbox">
             
            <div >
              <p class='discrptiontext'>
                Our cultural values dataset integrates information from multiple
                sources, encompassing a large number of entries to ensure
                comprehensive coverage across diverse attributes and topics.
                This extensive dataset offers in-depth insights into three
                primary cultural regions: Arab, Chinese, and Western. By uniting
                multiple datasets, it encapsulates a wide spectrum of
                perspectives, providing refined knowledge on cultural topics and
                regional variances. This framework improve a cultural
                understanding and supports precise analysis and comparison
                across these distinct regions.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClick}
              className="normal-button"
            >
              View
            </button>
          </div>
        </section>
        <section id="cardsection">
        
          <h2 class='datasettopic'>Dataset Topics</h2>
          {/* <img src={ball} id="corner-ball" alt=",," /> */}
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
                  text="What is the maximum number of hours one can work per week in your country?"
                />
              </div>
            </div>
            <div className="row">
              {/* Fifth Card */}
              <div className="col-md-6">
                <Cardtopic
                  Icon={WavingHandIcon}
                  title="Greeting"
                  text="What are the common greeting gestures in your culture ?"
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
      <Footer/>
    </div>
  );
};

export default Discrption;
