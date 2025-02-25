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

export const Plot = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [selectedDimension, setSelectedDimension] = useState("");
  const [dimensionPlaceholder, setDimensionPlaceholder] = useState("Select a topic");
  const [hasError, setHasError] = useState(false);
  const [isTooltipVisible, setTooltipVisible] = useState(false);

  const evalLLM = state?.evalLLM || "";
  const evalType = state?.evalType || "";
  const [selectedTopic, setSelectedTopic] = useState("All Topics");
  const [results, setResults] = useState(null);
  const [showMap, setShowMap] = useState(true);

  const topics = ["All Topics", "Food", "Sport", "Family", "Holidays/Celebration/Leisure", "Work Life", "Greeting"];
  const regionToIds = {
    Western: [840, 124, 826, 250, 276, 380, 724, 620, 528, 56, 756, 40, 372, 752, 578, 208, 246],
    Arab: [12, 48, 818, 368, 400, 414, 422, 434, 504, 512, 275, 634, 682, 729, 760, 788, 784, 887],
    Chinese: [156, 344, 446, 158, 702],
  };

  const handleDimensionChange = (event) => {
    setSelectedDimension(event.target.value);
    setHasError(false);
  };

  const handleNext = () => {
    if (!selectedDimension) {
      setDimensionPlaceholder("Please select a topic");
      setHasError(true);
      return;
    }
    setPopupOpen(false);
    navigate("/Freestyle");
  };

  useEffect(() => {
    if (showMap) {
      d3.select("#map").selectAll("*").remove();
      renderMap();
    }
  }, [showMap, results]);

  const fetchResults = async () => {
    if (evalLLM === "Fine-Tuned") {
      setResults(null);
      return;
    }
    try {
      const response = await fetch("http://127.0.0.1:5000/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: selectedTopic, model: evalLLM, evalType: evalType }),
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Error fetching results:", error);
    }
  };

  useEffect(() => {
    if (evalLLM !== "Select a model") {
      fetchResults();
    }
  }, [selectedTopic, evalLLM, evalType]);

  const renderMap = () => {
    const width = 960;
    const height = 500;
    const svg = d3.select("#map").append("svg").attr("width", width).attr("height", height);
    const projection = d3.geoMercator().scale(140).center([0, 30]).translate([width / 2, height / 2]);

    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then((geoData) => {
      const countries = feature(geoData, geoData.objects.countries);

      // Define the color scale for 0 to 2 (standard deviation range)
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

      Object.keys(regionPositions).forEach((region) => {
        svg.append("text")
          .attr("x", regionPositions[region][0] - 12)
          .attr("y", regionPositions[region][1] - 1)
          .attr("class", "map-label")
          .style("fill", "#722F57")
          .style("font-weight", "bold")
          .text(
            evalType === "Hofstede Questions-Cohere Model"
              ? `${results?.[region]?.standard_deviation.toFixed(2) || "0.00"}`
              : evalType === "Hofstede Questions-LLAMA2 Model"
              ? "0.00" // Since LLAMA2 has no variation (all gray)
              : `${results?.[region]?.coverage_score.toFixed(2) || "0.00"}%`
          );
      });

      // Add color gradient bar (legend) only for Hofstede Questions-Cohere Model and Hofstede Questions-LLAMA2 Model
      if (evalType === "Hofstede Questions-Cohere Model" || evalType === "Hofstede Questions-LLAMA2 Model") {
        const legendWidth = 200;
        const legendHeight = 20;
        const legendX = width - legendWidth - 20; // Position on the right
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

        // Add labels for the legend (0 to 2)
        svg.append("text")
          .attr("x", legendX)
          .attr("y", legendY + legendHeight + 15)
          .attr("text-anchor", "start")
          .style("fill", "#722F57")
          .style("font-size", "12px")
          .text("0.00");

        svg.append("text")
          .attr("x", legendX + legendWidth)
          .attr("y", legendY + legendHeight + 15)
          .attr("text-anchor", "end")
          .style("fill", "#722F57")
          .style("font-size", "12px")
          .text("2.00");

        // Add label for the legend
        svg.append("text")
          .attr("x", legendX + legendWidth / 2)
          .attr("y", legendY - 5)
          .attr("text-anchor", "middle")
          .style("fill", "#722F57")
          .style("font-size", "14px")
          .text("Standard Deviation");
      }
    });
  };

  return (
    <div className="plotpage">
      <Helmet>
        <title>Plot</title>
      </Helmet>

      <div className="plot-page-header">
        <button className="plot-back-btn" onClick={() => navigate("/evaluation")}>
          <FaArrowLeft className="plot-back-icon" />
        </button>
      </div>

      <div className="plotheader">
        <h1 className="header-title">THE OVERALL EVALUATION</h1>

        <div className="selection-container">
          <h2 className="underlined">{evalType}</h2>
          {(evalType === "LLAMA2 Baseline" || evalType === "Cohere Baseline") ? (
            <select className="plot-select" value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)}>
              {topics.map((topic) => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          ) : (
            <h2 className="underlined">Work Life</h2>
          )}
        </div>

        <div className="version-container">
          <h2 className="version-main">
            {evalType === "Hofstede Questions-Cohere Model" ? "Hofstede Questions-Cohere Model" 
             : evalType === "Hofstede Questions-LLAMA2 Model" ? "Hofstede Questions" 
             : evalType === "Cohere Baseline" ? "Cohere Baseline"
             : "LLAMA2 Baseline"}
            <FaInfoCircle className="info-icon" onClick={() => setTooltipVisible(!isTooltipVisible)} />
          </h2>
          {isTooltipVisible && (
            <div className="tooltip-box">
              {evalType === "Hofstede Questions-Cohere Model"
                ? "This evaluation uses the Cohere model to answer 24 Hofstede Work Life questions for each region (Arab, Western, and Chinese) in Arabic, English, and Chinese. The standard deviation is calculated to measure the variability in responses across these questions and regions, reflecting the diversity of cultural perspectives on work life."
                : evalType === "Hofstede Questions-LLAMA2 Model"
                ? "This evaluation uses the Llama-2-7B model to answer 24 Hofstede Work Life questions for each region (Arab, Western, and Chinese) in Arabic, English, and Chinese. The standard deviation is calculated to measure the variability in responses across these questions and regions, reflecting the diversity of cultural perspectives on work life."
                : evalType === "Cohere Baseline"
                ? "This evaluation uses the Cohere model to answer multiple-choice questions based on selected topics and datasets. The evaluation includes 100 samples per region, and accuracy is determined by the ratio of correct predictions to total questions."
                : "This evaluation uses the Llama-2-7B model to answer multiple-choice questions based on selected topics and datasets in multiple languages, including Arabic, English, and Chinese. The evaluation includes 100 samples per region, and accuracy is determined by the coverage score, which measures how accurately the model answers questions within each region: Arab, Western, and Chinese."}
            </div>
          )}
        </div>

        <div className="toggle-container">
          <button className={`toggle-button ${showMap ? "active" : ""}`} onClick={() => setShowMap(true)}>Map</button>
          <button className={`toggle-button ${!showMap ? "active" : ""}`} onClick={() => setShowMap(false)}>Chart</button>
        </div>

        {showMap ? (
          <div id="map"></div>
        ) : (
          <Bar
            data={{
              labels: ["Arab", "Chinese", "Western"],
              datasets: [
                {
                  label: evalType === "Hofstede Questions-Cohere Model" ? "Standard Deviation" : "Coverage Score",
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
          <p>
            {evalType === "Hofstede Questions-Cohere Model"
              ? "This evaluation uses Cohere to answer 24 Hofstede Work Life questions across three regions (Arab, Chinese, Western). The standard deviation reflects the variability in responses within each region."
              : evalType === "Hofstede Questions-LLAMA2 Model"
              ? "Llama-2-7B needs fine-tuning. It does not work well with multiple-choice questions. All three regions predominantly answered 'A' when given options A, B, C, D, E."
              : evalType === "Cohere Baseline"
              ? `Cohere evaluated answers for the "${selectedTopic}" topic. Coverage Scores: Arab - ${results?.Arab?.coverage_score.toFixed(2) || "0.00"}%, Western - ${results?.Western?.coverage_score.toFixed(2) || "0.00"}%, Chinese - ${results?.Chinese?.coverage_score.toFixed(2) || "0.00"}%.`
              : `Llama-2-7B evaluated answers for the "${selectedTopic}" topic. Coverage Scores: Arab - ${results?.Arab?.coverage_score.toFixed(2) || "0.00"}%, Western - ${results?.Western?.coverage_score.toFixed(2) || "0.00"}%, Chinese - ${results?.Chinese?.coverage_score.toFixed(2) || "0.00"}%.`}
          </p>
        </div>

        <div className="plotsubmit-container">
          <button className="plotsubmit" onClick={() => setPopupOpen(true)}>
            Free style chatting
          </button>
        </div>

        {isPopupOpen && (
          <div className="plotdialog-container">
            <dialog open className="plotpopup-dialog">
              <div className="plotpopup-content">
                <h2>Select Topic</h2>
                <select
                  name="plotDim"
                  id="plotDim"
                  className={`plotDim ${hasError ? "error" : ""}`}
                  value={selectedDimension}
                  onChange={handleDimensionChange}
                >
                  <option value="" disabled>{dimensionPlaceholder}</option>
                  <option value="All Topics">All Topics</option>
                  <option value="Food">Food</option>
                  <option value="Sport">Sport</option>
                  <option value="Family">Family</option>
                  <option value="Education">Education</option>
                  <option value="Holidays">Holidays</option>
                  <option value="Work life">Work life</option>
                  <option value="Greeting">Greeting</option>
                </select>
                <div>
                  <button className="plot-button2" onClick={handleNext}>Next</button>
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