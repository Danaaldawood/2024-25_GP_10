import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import "./CompareResult.css";
import { ComparisonMap } from "./ComparisonMap";

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

        console.log("Backend Response:", data); // Debug backend response
        setSimilarities(data.similarity_scores || {});
      } catch (err) {
        console.error("Error fetching similarity data:", err); // Log error
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [baseRegion, compareRegion, topics]);

  return (
    <div className="result-container">
      {/* Header Section */}
      <header className="result-title-container">
        <button
          className="result-back-btn"
          onClick={() => navigate("/compare")}
        >
          <FaArrowLeft className="result-back-icon" />
          
        </button>
      </header>
      <h1 className="result-title">Cross-Cultural Comparison Result</h1>

      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="comparison-info">
            Comparing {baseRegion} and {compareRegion}
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-8">
              <p>{error}</p>
            </div>
          ) : topics.length === 0 ? (
            <p className="text-center text-red-500">
              No topics available for comparison.
            </p>
          ) : (
            <div className="space-y-8">
              {topics.length > 1 && (
                <div className="flex justify-center mb-6">
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="px-4 py-2 border rounded-lg shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    {topics.map((topic) => (
                      <option key={topic} value={topic}>
                        {topic}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedTopic && (
                <>
                 
                  {/* Pass similarity text to the map */}
                  <ComparisonMap
                    baseRegion={baseRegion}
                    compareRegion={compareRegion}
                    similarity={similarities[selectedTopic] || 0}
                    topic={selectedTopic}
                    hideSimilarityText={true} // Custom prop to disable rendering similarity in the map
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Section */}
      <div className="result-btn-container">
        <button
          className="result-btn result-done-btn"
          onClick={() => navigate("/HomePage")}
        >
          Done
        </button>
        <button
          className="result-btn result-recompare-btn"
          onClick={() => navigate("/compare")}
        >
          Recompare
        </button>
      </div>
    </div>
  );
}

export default CompareResult;
