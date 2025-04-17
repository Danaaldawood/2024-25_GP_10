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
  const { t, i18n } = useTranslation('comparepage');

  // --- State Management ---
  const [showInfo, setShowInfo] = useState(false);
  const [baseRegion, setBaseRegion] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [similarities, setSimilarities] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- Constants ---
  const allRegions = ["Arab", "Western", "Chinese"];
  
  // Define topics with their API values and translation keys
  const topics = [
    { api: "Food", translation: "food" },
    { api: "Sport", translation: "sport" },
    { api: "Family", translation: "family" },
    { api: "Holidays/Celebration/Leisure", translation: "holidays" },
    { api: "Work life", translation: "workLife" },
    { api: "Education", translation: "education" },
    { api: "Greeting", translation: "greeting" }
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
        const promises = comparisonRegions.map(async (compareRegion) => {
          
          // "http://127.0.0.1:5000/api/compare"
          const response = await fetch("https://gp-culturelens.onrender.com/api/compare", {
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
    <div className="compare-result-page" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Meta Tags */}
      <Helmet>
        <title>{t('comparepage.meta.title')}</title>
        <meta name="description" content={t('comparepage.meta.description')} />
      </Helmet>

      {/* Header */}
      <Header />

      {/* Main Title */}
      <h1 className="compare-result-title">{t('comparepage.title')}</h1>

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
                <option value="">{t('comparepage.selectors.baseRegion')}</option>
                {allRegions.map((region) => (
                  <option key={region} value={region}>
                    {t(`comparepage.regions.${region.toLowerCase()}`)}
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
                <option value="">{t('comparepage.selectors.topic')}</option>
                {topics.map((topic) => (
                  <option key={topic.api} value={topic.api}>
                    {t(`comparepage.topics.${topic.translation}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Similarity Information Header */}
          <div className="similarity-header">
            <h2 className="similarity-title">{t('comparepage.similarity.title')}</h2>
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
                    <h3>{t('comparepage.similarity.info.title')}</h3>
                    <p>{t('comparepage.similarity.info.description')}</p>
                    <div className="gradient-legend">
                      <div className="gradient-bar"></div>
                      <span>{t('comparepage.similarity.info.legend')}</span>
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
              <p className="compare-result-loading-text">{t('comparepage.loading')}</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="compare-result-error">
              <p>{error}</p>
            </div>
          )}

          {/* Similarity Results Display with RTL Support */}
          {baseRegion && selectedTopic && !loading && !error && (
  <div className="compare-result-similarity-container">
    {getComparisonRegions().map((region) => (
      <div key={region} className="compare-result-comparison-info">
        {/* In RTL mode, put similarity score at the beginning (left side) */}
        {i18n.language === 'ar' ? (
          <>
            <span className="compare-result-similarity-score rtl-score">
              {`: ${(similarities[region] || 0).toFixed(2)}%`}
            </span>
            <span className="compare-result-region-name">
              {t(`comparepage.regions.${region.toLowerCase()}`)}
            </span>
            <span>{t('comparepage.comparison.and')}</span>
            <span className="compare-result-region-name">
              {t(`comparepage.regions.${baseRegion.toLowerCase()}`)}
            </span>
          </>
        ) : (
          <>
            <span className="compare-result-region-name">
              {t(`comparepage.regions.${baseRegion.toLowerCase()}`)}
            </span>
            <span>{t('comparepage.comparison.and')}</span>
            <span className="compare-result-region-name">
              {t(`comparepage.regions.${region.toLowerCase()}`)}
            </span>
            <span className="compare-result-similarity-score">
              {`: ${(similarities[region] || 0).toFixed(2)}%`}
            </span>
          </>
        )}
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
          {t('comparepage.buttons.done')}
        </button>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default CompareResult;