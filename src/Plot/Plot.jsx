import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as d3 from "d3";
import { feature } from "topojson-client";
import "./Plot.css";
import { FaArrowLeft, FaInfoCircle } from "react-icons/fa";
import { Footer } from "../Footer/Footer";
import { Helmet } from "react-helmet";
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import { useTranslation } from 'react-i18next';

export const Plot = () => {
  const { t, i18n } = useTranslation('plotpage');
  const { state } = useLocation();
  const navigate = useNavigate();
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [selectedDimension, setSelectedDimension] = useState("");
  const [dimensionPlaceholder, setDimensionPlaceholder] = useState(t('selectATopicPlaceholder'));
  const [hasError, setHasError] = useState(false);
  const [isTooltipVisible, setTooltipVisible] = useState(false);

  const evalLLM = state?.evalLLM || "";
  const evalType = state?.evalType || "";
  
  // Use keys instead of translated text
  const [selectedTopicKey, setSelectedTopicKey] = useState('allTopics');
  const [results, setResults] = useState(null);
  const [showMap, setShowMap] = useState(true);

  // Define topic keys for dropdown
  const topicKeys = ['allTopics', 'food', 'sport', 'family', 'holidays', 'worklife', 'greeting'];
  
  // Mapping from topic keys to API values (English identifiers expected by the API)
  const topicKeyToApiValue = {
    'allTopics': 'All Topics',
    'food': 'Food',
    'sport': 'Sport',
    'family': 'Family',
    'holidays': 'Holidays',
    'worklife': 'Work life',
    'greeting': 'Greeting'
  };
  
  const regionToIds = {
    Western: [840, 124, 826, 250, 276, 380, 724, 620, 528, 56, 756, 40, 372, 752, 578, 208, 246],
    Arab: [12, 48, 818, 368, 400, 414, 422, 434, 504, 512, 275, 634, 682, 729, 760, 788, 784, 887],
    Chinese: [156, 344, 446, 158, 702],
  };

  // Update placeholder when language changes
  useEffect(() => {
    setDimensionPlaceholder(t('selectATopicPlaceholder'));
    // No need to reset selectedTopicKey since it's language-independent
  }, [i18n.language, t]);

  const handleDimensionChange = (event) => {
    setSelectedDimension(event.target.value);
    setHasError(false);
  };

  const handleNext = () => {
    if (!selectedDimension) {
      setDimensionPlaceholder(t('pleaseSelectATopic'));
      setHasError(true);
      return;
    }
    setPopupOpen(false);
    navigate("/Freestyle");
  };

  useEffect(() => {
    if (showMap && results) {
      d3.select("#map").selectAll("*").remove();
      renderMap();
    }
  }, [showMap, results, i18n.language]);

  const fetchResults = async () => {
    if (evalLLM === "Fine-Tuned") {
      setResults(null);
      return;
    }
    
    try {
      // Convert topic key to API value
      const apiTopicValue = topicKeyToApiValue[selectedTopicKey];
      
      console.log(`Fetching results for topic: ${apiTopicValue}, model: ${evalLLM}, evalType: ${evalType}`);
      const response = await fetch("http://127.0.0.1:5000/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          topic: apiTopicValue, 
          model: evalLLM, 
          evalType: evalType 
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API returned status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("API response:", data);
      setResults(data);
    } catch (error) {
      console.error("Error fetching results:", error);
    }
  };

  useEffect(() => {
    if (evalLLM !== "Select a model") {
      fetchResults();
    }
  }, [selectedTopicKey, evalLLM, evalType]);

  // Helper function to get translated model name
  const getModelName = () => {
    if (evalType === "Hofstede Questions-Cohere Model") 
      return t('modelNames.hofstedeCohere');
    else if (evalType === "Hofstede Questions-LLAMA2 Model") 
      return t('modelNames.hofstedeLlama');
    else if (evalType === "Cohere Baseline") 
      return t('modelNames.cohereBaseline');
    else 
      return t('modelNames.llamaBaseline');
  };

  const renderMap = () => {
    const width = 960;
    const height = 500;
    const svg = d3.select("#map").append("svg").attr("width", width).attr("height", height);
    const projection = d3.geoMercator().scale(140).center([0, 30]).translate([width / 2, height / 2]);

    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then((geoData) => {
      const countries = feature(geoData, geoData.objects.countries);

      // Define the color scale for 0 to 2 (standard deviation range) or 0 to 100 (coverage score)
      const colorScale = d3.scaleLinear()
        .domain([0, 2]) // Range from 0 to 2 for standard deviation
        .range(["#f9d1a8", "#f28d27"]); // Light orange to dark orange

      // Render the map
      svg.append("g")
        .selectAll("path")
        .data(countries.features)
        .enter()
        .append("path")
        .attr("d", d3.geoPath().projection(projection))
        .attr("fill", (d) => {
          const region = Object.keys(regionToIds).find((key) => regionToIds[key].includes(parseInt(d.id)));
          if (!region) return "#d3d3d3";
          if (evalType === "Hofstede Questions-Cohere Model") {
            const stdDev = results?.[region]?.standard_deviation || 0;
            return colorScale(stdDev); // Use the standard deviation directly (0 to 2 range)
          } else if (evalType === "LLAMA2 Baseline" || evalType === "Cohere Baseline") {
            const coverage = results?.[region]?.coverage_score || 0;
            return colorScale(coverage / 100 * 2); // Scale coverage (0-100) to 0-2 for consistency
          } else if (evalType === "Hofstede Questions-LLAMA2 Model") {
            return "#d3d3d3"; // Uniform gray for LLAMA2 model (coverage score is 0)
          }
          return "#d3d3d3";
        })
        .attr("stroke", "#fff");

      // Add region labels
      const regionPositions = {
        Arab: projection([35, 25]),
        Chinese: projection([100, 35]),
        Western: projection([-110, 40]),
      };

      // Get translated region names
      const regionNames = {
        Arab: t('regions.arab'),
        Chinese: t('regions.chinese'),
        Western: t('regions.western')
      };

      Object.keys(regionPositions).forEach((region) => {
        svg.append("text")
          .attr("x", regionPositions[region][0] - 12)
          .attr("y", regionPositions[region][1] - 1)
          .attr("class", "map-label")
          .style("fill", "#722F57")
          .style("font-weight", "bold")
          .text(
            evalType === "Hofstede Questions-Cohere Model"
              ? `${results?.[region]?.standard_deviation?.toFixed(2) || "0.00"}`
              : evalType === "Hofstede Questions-LLAMA2 Model"
              ? "0.00" // Since LLAMA2 has no variation (all gray)
              : `${results?.[region]?.coverage_score?.toFixed(2) || "0.00"}%`
          );
      });

      const legendWidth = 200;
      const legendHeight = 20;
      const legendX = width / 2 - legendWidth / 2; 
      const legendY = height - 50; // Position below the map
      // Define the gradient for the legend
      const defs = svg.append("defs");
      const linearGradient = defs.append("linearGradient")
        .attr("id", "legend-gradient")
        .attr("x1", "0%")
        .attr("x2", "100%")
        .attr("y1", "0%")
        .attr("y2", "0%");

      linearGradient.append("stop")
        .attr("offset", "0%")
        .attr("style", `stop-color:${colorScale(0)}`);

      linearGradient.append("stop")
        .attr("offset", "100%")
        .attr("style", `stop-color:${colorScale(2)}`);

      // Draw the legend bar
      svg.append("rect")
        .attr("x", legendX)
        .attr("y", legendY)
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#legend-gradient)")
        .style("stroke", "#000")
        .style("stroke-width", 1);

      // Add labels for the legend
      svg.append("text")
        .attr("x", legendX)
        .attr("y", legendY + legendHeight + 15)
        .attr("text-anchor", "start")
        .style("fill", "#722F57")
        .style("font-size", "12px")
        .text("0.00");

      // Add end value label based on evaluation type
      if (evalType === "Hofstede Questions-Cohere Model" || evalType === "Hofstede Questions-LLAMA2 Model") {
        svg.append("text")
          .attr("x", legendX + legendWidth)
          .attr("y", legendY + legendHeight + 15)
          .attr("text-anchor", "end")
          .style("fill", "#722F57")
          .style("font-size", "12px")
          .text("2.00");
      } else {
        svg.append("text")
          .attr("x", legendX + legendWidth)
          .attr("y", legendY + legendHeight + 15)
          .attr("text-anchor", "end")
          .style("fill", "#722F57")
          .style("font-size", "12px")
          .text("100.00%");
      }

      // Add label for the legend based on evaluation type
      svg.append("text")
        .attr("x", legendX + legendWidth / 2)
        .attr("y", legendY - 5)
        .attr("text-anchor", "middle")
        .style("fill", "#722F57")
        .style("font-size", "14px")
        .text(evalType === "Hofstede Questions-Cohere Model" || evalType === "Hofstede Questions-LLAMA2 Model" 
              ? t('standardDeviation') 
              : t('coverageScore'));
    });
  };

  // Improved manual variable replacement function
  const manualReplaceVariables = (text, variables) => {
    if (!text) return "";
    
    let result = text;
    
    // Replace the variables using string manipulation for better reliability
    Object.entries(variables).forEach(([key, value]) => {
      // Try both %{key} format and {key} format to cover different translation setups
      result = result.split(`%{${key}}`).join(value);
      result = result.split(`{${key}}`).join(value);
    });
    
    return result;
  };

  // Helper function to get the appropriate explanation based on evaluation type
  const getExplanationText = () => {
    if (!results) return "";
    
    // Always calculate scores for use in translations
    const arabScore = results?.Arab?.coverage_score?.toFixed(2) || "0.00";
    const westernScore = results?.Western?.coverage_score?.toFixed(2) || "0.00";
    const chineseScore = results?.Chinese?.coverage_score?.toFixed(2) || "0.00";
    
    // The translated topic name
    const translatedTopic = t(selectedTopicKey);
    
    // Prepare the variables for replacement
    const variables = {
      topic: translatedTopic,
      arabScore: arabScore,
      westernScore: westernScore,
      chineseScore: chineseScore
    };
    
    // Choose template based on evaluation type
    let translationTemplate = "";
    
    if (evalType === "Hofstede Questions-Cohere Model") {
      return t('explanations.hofstedeCohere');
    } else if (evalType === "Hofstede Questions-LLAMA2 Model") {
      return t('explanations.hofstedeLlama');
    } else if (evalType === "Cohere Baseline") {
      translationTemplate = t('explanations.cohereBaseline');
    } else { // LLAMA2 Baseline
      translationTemplate = t('explanations.llamaBaseline');
    }
    
    // Manually replace variables in the template
    return manualReplaceVariables(translationTemplate, variables);
  };

  // Helper function to get tooltip text based on evaluation type
  const getTooltipText = () => {
    if (evalType === "Hofstede Questions-Cohere Model") {
      return t('tooltips.hofstedeCohere');
    } else if (evalType === "Hofstede Questions-LLAMA2 Model") {
      return t('tooltips.hofstedeLlama');
    } else if (evalType === "Cohere Baseline") {
      return t('tooltips.cohereBaseline');
    } else { // LLAMA2 Baseline
      return t('tooltips.llamaBaseline');
    }
  };

  return (
    <div className="plotpage" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <Helmet>
        <title>{t('pageTitle')}</title>
      </Helmet>

      <div className="plot-page-header">
        <button className="plot-back-btn" onClick={() => navigate("/evaluation")}>
          <FaArrowLeft className="plot-back-icon" />
        </button>
      </div>

      <div className="plotheader">
        <h1 className="header-title">{t('headerTitle')}</h1>

        <div className="selection-container">
          <h2 className="underlined">{getModelName()}</h2>
          {(evalType === "LLAMA2 Baseline" || evalType === "Cohere Baseline") ? (
            <select 
              className="plot-select" 
              value={selectedTopicKey} 
              onChange={(e) => setSelectedTopicKey(e.target.value)}
            >
              {topicKeys.map((key) => (
                <option key={key} value={key}>{t(key)}</option>
              ))}
            </select>
          ) : (
            <h2 className="underlined">{t('workLife')}</h2>
          )}
        </div>

        <div className="version-container">
          <h2 className="version-main">
            {getModelName()}
            <FaInfoCircle className="info-icon" onClick={() => setTooltipVisible(!isTooltipVisible)} />
          </h2>
          {isTooltipVisible && (
            <div className="tooltip-box">
              {getTooltipText()}
            </div>
          )}
        </div>

        <div className="toggle-container">
          <button 
            className={`toggle-button ${showMap ? "active" : ""}`} 
            onClick={() => setShowMap(true)}
          >
            {t('map')}
          </button>
          <button 
            className={`toggle-button ${!showMap ? "active" : ""}`} 
            onClick={() => setShowMap(false)}
          >
            {t('chart')}
          </button>
        </div>

        {showMap ? (
          <div id="map"></div>
        ) : (
          <Bar
            data={{
              labels: [t('regions.arab'), t('regions.chinese'), t('regions.western')],
              datasets: [
                {
                  label: evalType === "Hofstede Questions-Cohere Model" ? t('standardDeviation') : t('coverageScore'),
                  data: evalType === "Hofstede Questions-Cohere Model"
                    ? [results?.Arab?.standard_deviation || 0, results?.Chinese?.standard_deviation || 0, results?.Western?.standard_deviation || 0]
                    : evalType === "Hofstede Questions-LLAMA2 Model"
                    ? [0, 0, 0]
                    : [results?.Arab?.coverage_score || 0, results?.Chinese?.coverage_score || 0, results?.Western?.coverage_score || 0],
                  backgroundColor: ["#4BC0C0", "#9966FF", "#FF9F40"],
                },
              ],
            }}
          />
        )}
        <div className="explanation">
          <p>{getExplanationText()}</p>
        </div>

        <div className="plotsubmit-container">
          <button className="plotsubmit" onClick={() => setPopupOpen(true)}>
            {t('freeStyleChatting')}
          </button>
        </div>

        {isPopupOpen && (
          <div className="plotdialog-container">
            <dialog open className="plotpopup-dialog">
              <div className="plotpopup-content">
                <h2>{t('selectTopic')}</h2>
                <select
                  name="plotDim"
                  id="plotDim"
                  className={`plotDim ${hasError ? "error" : ""}`}
                  value={selectedDimension}
                  onChange={handleDimensionChange}
                >
                  <option value="" disabled>{dimensionPlaceholder}</option>
                  <option value="All Topics">{t('allTopics')}</option>
                  <option value="Food">{t('food')}</option>
                  <option value="Sport">{t('sport')}</option>
                  <option value="Family">{t('family')}</option>
                  <option value="Education">{t('education')}</option>
                  <option value="Holidays">{t('holidays')}</option>
                  <option value="Work life">{t('worklife')}</option>
                  <option value="Greeting">{t('greeting')}</option>
                </select>
                <div>
                  <button className="plot-button2" onClick={handleNext}>{t('next')}</button>
                </div>
              </div>
            </dialog>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};
