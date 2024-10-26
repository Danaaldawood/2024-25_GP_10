import React, { useEffect, useState } from "react";
import "./homepage.css";
import LOGO from "../images/Logo.png";
import { Doughnut, Bar } from "react-chartjs-2";
import photo from "../images/MAP-logo.png";
import "chart.js/auto";
import MAPPhoto from "../images/result.png";
import { Header } from "../Header/Header";
import { Footer } from "../Footer/Footer";
import { Helmet } from 'react-helmet';
const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState("");

  const handleDomainChange = (domain) => {
    setSelectedDomain(domain);
    console.log("Selected Domain:", domain);
  };
  
  
  const doughnutOptions = {
    plugins: {
      legend: {
        display: true,
        position: "left",
        labels: {
          boxWidth: 10,
          padding: 15,
        },
        
      },
    },
    cutout: "60%", 
  };
  
  const categoryData = {
    labels: ["Food", "Family", "Sport", "Greeting", "Education", "Work Life", "Holiday"],
    datasets: [
      {
        data: [10, 20, 15, 8, 12, 18, 17],
        backgroundColor: ["#003f5c", "#2f4b7c", "#43618b", "#5a7091", "#6f87a1", "#8baac4", "#9cc3de"],       
         borderWidth: 0,
      },
    ],
  };
  
  const barData = {
    labels: ["Arab", "Chinese", "Western"],
    datasets: [
      {
        label: "Culture Comparison",
        data: [600, 550, 350],
        backgroundColor: ["#003f5c", "#2f4b7c", "#43618b"],      },
    ],
  };
  
  const barOptions = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };
  
  const totalAttributeData = {
    labels: ["Arab", "Chinese", "Western"],
    datasets: [
      {
        data: [50, 60, 40],
        backgroundColor: ["#003f5c", "#2f4b7c", "#43618b"],
                borderWidth: 1,
      },
    ],
  };
  

  return (
    <div className="homepage">
      <Header />
      <Helmet>
      <title>HomePage</title>
      <meta name="description" content="This is the Home Page  of may website" />
    </Helmet>
      <div className="content container">
        <div className="text-content">
          <p className="welcome-text">About Us</p>
          <p className="description-text">
            CultureLens, an innovative platform that assesses the compatibility of multilingual models with different
            cultural standards and values.
            {showMore && (
              <span>
                {" "}
                It helps researchers and developers understand cultural diversity in the Arab, Western, and Chinese contexts.
              </span>
            )}
          </p>
          <button onClick={() => setShowMore(!showMore)} className="learn-more-btn">
            {showMore ? "Show Less" : "Learn More"}
          </button>
        </div>
        <img src={photo} alt="Map Logo" className="map-logo" />
      </div>

      <h2 className="text-center">Region Descriptions</h2>
      <div className="domains-container">
        <div className="domain-card" onClick={() => handleDomainChange("Arab")}>
          <div className="card-body">
            <h3>Arab</h3>
        <p>The Arab world, also known as the Arab nation, includes countries in West Asia and North Africa, characterized by rich cultural diversity and various Arabic dialects.

            </p>
          </div>
        </div>
        <div className="domain-card" onClick={() => handleDomainChange("Western")}>
          <div className="card-body">
            <h3>Western</h3>
            <p>
  A broad term used to describe the social norms, belief systems, traditions, customs, values, and so forth that have their origin in Europe or are based on European culture.
</p>

          </div>
        </div>
        <div className="domain-card" onClick={() => handleDomainChange("Chinese")}>
          <div className="card-body">
          <div class="text-container">
  <h3>Chinese</h3>
     <p>
    The culture prevails across a large geographical region in East Asia with sinosphere in whole and is extremely diverse, with customs and traditions varying greatly between counties, provinces, cities, and towns.  
    </p>
  </div>
</div>
          </div>
        </div>
 
   

      <div className="dashboard">
      <div className="charts">
        <div className="chart">
          <h3>Topic</h3> 
          <Doughnut data={categoryData} options={doughnutOptions} />
        </div>

        <div className="chart">
           <h3>Region Comparison</h3>
          <Bar data={barData} options={barOptions} />
        </div>

        <div className="chart">
         <h3>Total Attribute</h3>
          <div className="doughnut-container">
            <Doughnut data={totalAttributeData} options={doughnutOptions} />
            <div className="total-value"></div>
          </div>
        </div>
      

 
 
        </div>
      </div>
      <img src={MAPPhoto} alt="MapPhoto" className="map-photo" />

      <Footer />
    </div>
  );
};

export default HomePage;
