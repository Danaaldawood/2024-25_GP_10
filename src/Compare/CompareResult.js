import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import "./CompareResult.css";
import { ComparisonMap } from "./ComparisonMap";
import {Footer} from "../Footer/Footer";

function CompareResult() {
  const location = useLocation();
  const navigate = useNavigate();

  const { baseRegion, compareRegion, topics = [] } = location.state || {};

  const [similarities, setSimilarities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(topics[0] || "");

  useEffect(() => {
    const fetchData = async () => {
      if (!baseRegion || !compareRegion || topics.length === 0) {
        setError("Regions and topics are required for comparison.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("http://127.0.0.1:5000/api/compare", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            regions: [baseRegion, compareRegion],
            topics,
          }),
        });

        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const data = await response.json();
        setSimilarities(data.similarity_scores || {});
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [baseRegion, compareRegion, topics]);

  return (
    <div className="compare-result-page">
      <header className="compare-result-header">
        <button
          className="compare-result-back-btn"
          onClick={() => navigate("/compare")}
        >
          <FaArrowLeft className="compare-result-back-icon" />
        </button>
      </header>

      <h1 className="compare-result-title">Cross-Cultural Comparison Result</h1>

      <div className="compare-result-content">
        <div className="compare-result-container">
          <h2 className="compare-result-comparison-info">
            Comparing <span className="compare-result-region-name">{baseRegion}</span> And{" "}
            <span className="compare-result-region-name">{compareRegion}</span>
          </h2>

          {loading ? (
            <div className="compare-result-loading">
              <div className="compare-result-spinner"></div>
              <p className="compare-result-loading-text">Loading...</p>
            </div>
          ) : error ? (
            <div className="compare-result-error">
              <p>{error}</p>
            </div>
          ) : topics.length === 0 ? (
            <p className="compare-result-error">
              No topics available for comparison.
            </p>
          ) : (
            <div className="compare-result-content-wrapper">
              <div className="compare-result-topic-container">
                <span>Similarity for </span>
                {topics.length > 1 ? (
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="compare-result-topic-select"
                  >
                    {topics.map((topic) => (
                      <option key={topic} value={topic}>
                        {topic}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span>{selectedTopic}</span>
                )}
                <span className="compare-result-similarity-score">
                  : {(similarities[selectedTopic] || 0).toFixed(2)}%
                </span>
              </div>

              {selectedTopic && (
                <ComparisonMap
                  baseRegion={baseRegion}
                  compareRegion={compareRegion}
                  similarity={similarities[selectedTopic] || 0}
                  topic={selectedTopic}
                  hideSimilarityText={true}
                />
              )}
            </div>
          )}
        </div>
      </div>

      <div className="compare-result-button-container">
        <button
          className="compare-result-recompare-btn"
          onClick={() => navigate("/HomePage")}
        >
          Done
        </button>
      </div>
      
      <Footer />
    </div>
  );
}

export default CompareResult;