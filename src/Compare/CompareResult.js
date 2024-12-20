// --- Imports ---
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import "./CompareResult.css";
import { useTranslation } from "react-i18next";
import { ComparisonMap } from "./ComparisonMap";
import { Footer } from "../Footer/Footer";
import { Header } from "../Header/Header";
import { Helmet } from "react-helmet";

function CompareResult() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // --- State Management ---
  const [showInfo, setShowInfo] = useState(false);
  const [baseRegion, setBaseRegion] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [similarities, setSimilarities] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- Constants ---
  const allRegions = ["Arab", "Western", "Chinese"];
  const topics = [
    "Food",
    "Sport",
    "Family",
    "Holidays/Celebration/Leisure",
    "Work life",
    "Education",
    "Greeting",
  ];

  const getComparisonRegions = () => {
    return allRegions.filter((region) => region !== baseRegion);
  };

  // --- Data Fetching Effect ---
  useEffect(() => {
    const fetchComparisonData = async () => {
      if (!baseRegion || !selectedTopic) return;

      setLoading(true);
      setError(null);

      const comparisonRegions = getComparisonRegions();
      try {
        // Fetch similarity data for each comparison region
        const promises = comparisonRegions.map(async (compareRegion) => {
          const response = await fetch("http://127.0.0.1:5000/api/compare", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              regions: [baseRegion, compareRegion],
              topics: [selectedTopic],
            }),
          });

          if (!response.ok) throw new Error(`Server error: ${response.status}`);
          const data = await response.json();
          return { region: compareRegion, data };
        });

        // Process and update similarity scores
        const results = await Promise.all(promises);
        const newSimilarities = {};
        results.forEach(({ region, data }) => {
          newSimilarities[region] = data.similarity_scores[selectedTopic];
        });

        setSimilarities(newSimilarities);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComparisonData();
  }, [baseRegion, selectedTopic]);

  return (
    <div className="compare-result-page">
      {/* Meta Tags */}
      <Helmet>
        <title>{t("compare-result")}</title>
        <meta name="description" content={t("compare-result")} />
      </Helmet>

      {/*Header */}
      <Header />

      {/* Main Title */}
      <h1 className="compare-result-title">Cross-Cultural Comparison</h1>

      <div className="compare-result-content">
        <div className="compare-result-container">
          {/* Region and Topic Selection Controls */}
          <div className="compare-result-selectors">
            <div className="compare-result-input">
              <select
                className="compare-result-select"
                value={baseRegion}
                onChange={(e) => setBaseRegion(e.target.value)}
              >
                <option value="">Select Base Region</option>
                {allRegions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            <div className="compare-result-input">
              <select
                className="compare-result-select"
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                disabled={!baseRegion}
              >
                <option value="">Select Topic</option>
                {topics.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Similarity Information Header */}
          <div className="similarity-header">
            <h2 className="similarity-title">Similarity Index</h2>
            <div className="info-container-inline">
              <button
                className="info-button"
                onClick={() => setShowInfo(!showInfo)}
              >
                <AlertCircle className="h-5 w-5" />
              </button>
              {/* Info Popup */}
              {showInfo && (
                <div className="info-popup">
                  <div className="info-content">
                    <h3>About Similarity Index</h3>
                    <p>
                      This cross-culture index shows the similarity between
                      cultural values using Jaccard similarity calculation
                    </p>
                    <div className="gradient-legend">
                      <div className="gradient-bar"></div>
                      <span>
                        Higher values indicate stronger cultural similarities
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Comparison Map Component */}
          <div className="compare-result-content-wrapper">
            <ComparisonMap
              baseRegion={baseRegion}
              similarities={similarities}
              topic={selectedTopic}
            />
          </div>

          {/* Loading State */}
          {loading && (
            <div className="compare-result-loading">
              <div className="compare-result-spinner"></div>
              <p className="compare-result-loading-text">Loading...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="compare-result-error">
              <p>{error}</p>
            </div>
          )}

          {/* Similarity Results Display */}
          {baseRegion && selectedTopic && !loading && !error && (
            <div className="compare-result-similarity-container">
              {getComparisonRegions().map((region) => (
                <div key={region} className="compare-result-comparison-info">
                  <span className="compare-result-region-name">
                    {baseRegion}
                  </span>
                  <span>and</span>
                  <span className="compare-result-region-name">{region}</span>
                  <span className="compare-result-similarity-score">
                    : {(similarities[region] || 0).toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Done Button */}
      <div className="compare-result-button-container">
        <button
          className="compare-result-recompare-btn"
          onClick={() => navigate("/HomePage")}
        >
          Done
        </button>
      </div>

      {/*Footer */}
      <Footer />
    </div>
  );
}

export default CompareResult;
