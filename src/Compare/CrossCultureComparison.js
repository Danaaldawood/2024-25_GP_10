import React, { useState } from "react";
import "./CrossCultureComparison.css";
import { useNavigate } from "react-router-dom";
import { Header } from "../Header/Header";
import { Footer } from "../Footer/Footer";
import { Helmet } from 'react-helmet';

const CrossCultureComparison = () => {
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [hasError, setHasError] = useState(false);

  const navigate = useNavigate();

  const handleCompareClick = (e) => {
    e.preventDefault();

    let error = false;

    if (selectedRegions.length === 0 || selectedTopics.length === 0) {
      error = true;
      setHasError(true);
    } else {
      setHasError(false);
    }

    if (error) return;

    navigate("/compare-result", {
      state: { cultureRegion: selectedRegions, topic: selectedTopics },
    });
  };

  const handleRegionChange = (e) => {
    const { value } = e.target;
    setSelectedRegions((prevRegions) =>
      prevRegions.includes(value)
        ? prevRegions.filter((region) => region !== value)
        : [...prevRegions, value]
    );
  };

  const handleTopicChange = (e) => {
    const { value } = e.target;
    setSelectedTopics((prevTopics) =>
      prevTopics.includes(value)
        ? prevTopics.filter((topic) => topic !== value)
        : [...prevTopics, value]
    );
  };

  return (
    <div className="comparison-container">
      <Helmet>
        <title>Compare Page</title>
        <meta name="description" content="This is the Cross Culture Comparison" />
      </Helmet>  

      <Header />

      <div className="Compare-form-container">
        <header className="Compare-form-header">
          <div className="Compare-underline"></div>
        </header>
        <div className="Compare-inputs">
          <div className="Compare-text">Cross-Cultural Comparison</div>

          {/* Region Selection with Checkboxes */}
          <div className="Compare-input">
            <label className="Compare-label">Regions:</label>
            <div className={`Compare-cultureRegion ${hasError && selectedRegions.length === 0 ? "error" : ""}`}>
              <label>
                <input
                  type="checkbox"
                  value="Arab"
                  checked={selectedRegions.includes("Arab")}
                  onChange={handleRegionChange}
                />
                Arab
              </label>
              <label>
                <input
                  type="checkbox"
                  value="Western"
                  checked={selectedRegions.includes("Western")}
                  onChange={handleRegionChange}
                />
                Western
              </label>
              <label>
                <input
                  type="checkbox"
                  value="Chinese"
                  checked={selectedRegions.includes("Chinese")}
                  onChange={handleRegionChange}
                />
                Chinese
              </label>
            </div>
          </div>

          {/* Topic Selection with Checkboxes */}
          <div className="Compare-input">
            <label className="Compare-label">Topics:</label>
            <div className={`Compare-topicRegion ${hasError && selectedTopics.length === 0 ? "error" : ""}`}>
              <label>
                <input
                  type="checkbox"
                  value="Food"
                  checked={selectedTopics.includes("Food")}
                  onChange={handleTopicChange}
                />
                Food
              </label>
              <label>
                <input
                  type="checkbox"
                  value="Sport"
                  checked={selectedTopics.includes("Sport")}
                  onChange={handleTopicChange}
                />
                Sport
              </label>
              <label>
                <input
                  type="checkbox"
                  value="Family"
                  checked={selectedTopics.includes("Family")}
                  onChange={handleTopicChange}
                />
                Family
              </label>
              <label>
                <input
                  type="checkbox"
                  value="Holiday"
                  checked={selectedTopics.includes("Holiday")}
                  onChange={handleTopicChange}
                />
                Holiday
              </label>
              <label>
                <input
                  type="checkbox"
                  value="Work-life"
                  checked={selectedTopics.includes("Work-life")}
                  onChange={handleTopicChange}
                />
                Work-life
              </label>
              <label>
                <input
                  type="checkbox"
                  value="Education"
                  checked={selectedTopics.includes("Education")}
                  onChange={handleTopicChange}
                />
                Education
              </label>
              <label>
                <input
                  type="checkbox"
                  value="Greeting"
                  checked={selectedTopics.includes("Greeting")}
                  onChange={handleTopicChange}
                />
                Greeting
              </label>
            </div>
          </div>
        </div>

        <div className="Compare-submit-container">
          <div className="Compare-submit">
            <button onClick={handleCompareClick}>Compare</button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CrossCultureComparison;
