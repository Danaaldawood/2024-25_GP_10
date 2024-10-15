import React, { useEffect, useState } from "react";
import "./homepage.css";
import LOGO from "../images/Logo.png";
import { Doughnut, Bar } from "react-chartjs-2";
import photo from "../images/MAP-logo.png";
import "chart.js/auto";
import MAPPhoto from "../images/result.png";
import { Header } from "../Header/Header";
import { Footer } from "../Footer/Footer";

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState("");

  const userName = "Haya";

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("بحث عن:", searchQuery);
  };

  const handleDomainChange = (domain) => {
    setSelectedDomain(domain);
    console.log("المجال المختار:", domain);
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
    cutout: "50%",
  };

  const categoryData = {
    labels: [
      "Food",
      "Family",
      "Sport",
      "Greeting",
      "Education",
      "Work Life",
      "Holiday",
    ],
    datasets: [
      {
        data: [10, 20, 15, 8, 12, 18, 17],
        backgroundColor: [
          "#003f5c",
          "#2f4b7c",
          "#43618b",
          "#5a7091",
          "#6f87a1",
          "#8baac4",
          "#9cc3de",
        ],
        borderWidth: 0,
      },
    ],
  };

  const barData = {
    labels: ["Arab", "Chinese", "Western"],
    datasets: [
      {
        label: "Culture Comparison",
        data: [25, 40, 55],
        backgroundColor: ["#003f5c", "#2f4b7c", "#43618b"],
      },
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
      {/* Header */}
      <Header />

      <div className="content container">
        <div className="text-content">
          <p className="welcome-text">About us</p>
          <p className="description-text">
            CultureLens, an innovative platform that aims to assess the
            compatibility of multilingual models with different social and
            cultural values and standards{" "}
            {showMore && (
              <span>
                {" "}
                CultureLens is designed to provide a comprehensive analysis that
                promotes understanding of cultural diversity and helps
                researchers and developers improve model compatibility with
                multicultures. At CultureLens, we focus on many key cultural
                areas, including Arab, Western, and Chinese cultures.
              </span>
            )}
          </p>

          <button
            onClick={() => setShowMore(!showMore)}
            className="learn-more-btn"
          >
            {showMore ? "Show Less" : "Learn More"}
          </button>
        </div>
        <img src={photo} alt="Map Logo" className="map-logo" />
      </div>

      <h2 className="text-center">Sub Culture</h2>
      <div className="domains-container">
        <div className="domain-card" onClick={() => handleDomainChange("Arab")}>
          <div className="card-body">
            <h3>Arab</h3>
            <p>
              Explore the rich cultural values and traditions of the Arab world.
            </p>
          </div>
        </div>
        <div
          className="domain-card"
          onClick={() => handleDomainChange("Western")}
        >
          <div className="card-body">
            <h3>Western</h3>
            <p>Understand Western social norms, , and cultural practices.</p>
          </div>
        </div>
        <div
          className="domain-card"
          onClick={() => handleDomainChange("Chinese")}
        >
          <div className="card-body">
            <h3>Chinese</h3>
            <p>
              Discover the ancient heritage and modern dynamics of Chinese
              culture.
            </p>
          </div>
        </div>
      </div>

      <div className="dashboard">
        <div className="charts">
          <div className="chart">
            <p>
              <span>Dimension</span>
            </p>
            <Doughnut data={categoryData} options={doughnutOptions} />
          </div>

          <div className="chart">
            <p>
              <span>Sub Region Comparison</span>
            </p>

            <Bar data={barData} options={barOptions} />
          </div>
          <div className="chart">
            <p>
              <span>Total Attribute</span>
            </p>
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
