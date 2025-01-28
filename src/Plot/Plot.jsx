// --- Imports ---
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as d3 from "d3";
import { feature } from "topojson-client";
import "./Plot.css";
import { FaArrowLeft, FaInfoCircle } from "react-icons/fa";
import { Footer } from "../Footer/Footer";
import { Helmet } from "react-helmet";
import { Bar, Doughnut } from 'react-chartjs-2';

export const Plot = () => {
  const { state } = useLocation();
  const [results, setResults] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(state?.evalTopic || "All Topics");
  const [evalLLM, setEvalLLM] = useState(state?.evalLLM || "Select a model");
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [selectedDimension, setSelectedDimension] = useState("");
  const [dimensionPlaceholder, setDimensionPlaceholder] = useState("Select a topic");
  const [hasError, setHasError] = useState(false);
  const [showNoModelMessage, setShowNoModelMessage] = useState(false);
  const [isTooltipVisible, setTooltipVisible] = useState(false);
  //for
  const [optlLLM, setEvalLLMopt] = useState('');
  const allModels = ['Lama', 'Cohere']; 

  const navigate = useNavigate();
  const regionToIds = {
    Western: [840, 124, 826, 250, 276, 380, 724, 620, 528, 56, 756, 40, 372, 752, 578, 208, 246],
    Arab: [12, 48, 818, 368, 400, 414, 422, 434, 504, 512, 275, 634, 682, 729, 760, 788, 784, 887],
    Chinese: [156, 344, 446, 158, 702],
  };

  const fetchResults = async () => {
    try {
      if (evalLLM === "Fine-Tuned") {
        setResults(null);
        setShowNoModelMessage(true);
        return;
      }
      const response = await fetch("http://127.0.0.1:5000/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: selectedTopic, model: evalLLM }),
      });

      const data = await response.json();
      setResults(data);
      setShowNoModelMessage(false);
    } catch (error) {
      console.error("Error fetching results:", error);
    }
  };

  useEffect(() => {
    if (evalLLM !== "Select a model") {
      fetchResults();
    }
  }, [selectedTopic, evalLLM]);

  const renderMap = () => {
    const width = 960; // Restored original width
    const height = 500; // Restored original height

    const svg = d3
      .select("#map")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const projection = d3
      .geoMercator()
      .scale(140)
      .center([0, 30])
      .translate([width / 2, height / 2]);

    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(
      (geoData) => {
        const countries = feature(geoData, geoData.objects.countries);

        const colorScale = d3.scaleLinear()
          .domain([0, 100])
          .range(["#f9d1a8", "#f28d27"]); 

        const tooltip = d3
          .select("body")
          .append("div")
          .attr("class", "tooltip")
          .style("opacity", 0);

        svg
          .append("g")
          .selectAll("path")
          .data(countries.features)
          .enter()
          .append("path")
          .attr("d", d3.geoPath().projection(projection))
          .attr("fill", (d) => {
            const region = Object.keys(regionToIds).find((key) =>
              regionToIds[key].includes(parseInt(d.id))
            );
            const value = results?.[region]?.coverage_score || null;
            return value !== null ? colorScale(value) : "#d3d3d3";
          })
          .attr("stroke", "#fff")
          .on("mouseover", (event, d) => {
            const region = Object.keys(regionToIds).find((key) =>
              regionToIds[key].includes(parseInt(d.id))
            );

            if (region && ["Arab", "Chinese", "Western"].includes(region)) {
              const value = results?.[region]?.coverage_score?.toFixed(2) || "No data";
              tooltip
                .style("opacity", 1)
                .html(
                  `<strong>Region:</strong> ${region}<br><strong>Coverage:</strong> ${value}%`
                )
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 20}px`);
            }
          })
          .on("mouseout", () => {
            tooltip.style("opacity", 0);
          });

        // Gradient Legend
        const legendWidth = 300;
        const legendHeight = 10;
        const gradient = svg.append("defs").append("linearGradient").attr("id", "gradient");

       
gradient.append("stop").attr("offset", "0%").attr("stop-color","#f9d1a8"); // lite orange
        gradient.append("stop").attr("offset", "100%").attr("stop-color","#f28d27"); // orange
        svg
          .append("rect")
          .attr("x", (width - legendWidth) / 2)
          .attr("y", height - 30)
          .attr("width", legendWidth)
          .attr("height", legendHeight)
          .style("fill", "url(#gradient)");

        svg
          .append("text")
          .attr("x", (width - legendWidth) / 2)
          .attr("y", height - 40)
          .style("text-anchor", "start")
          .text("Low");

        svg
          .append("text")
          .attr("x", (width + legendWidth) / 2)
          .attr("y", height - 40)
          .style("text-anchor", "end")
          .text("High");
      }
    );
  };

  useEffect(() => {
    if (results || showNoModelMessage) {
      d3.select("#map").selectAll("*").remove();
      renderMap();
    }
  }, [results, showNoModelMessage]);

  const toggleTooltip = () => {
    setTooltipVisible(!isTooltipVisible);
  };

  const openDialog = () => setPopupOpen(true);
  const closeDialog = () => setPopupOpen(false);

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
    closeDialog();
    navigate("/Freestyle");
  };


  

  

    // --- Bar Chart Data ---
    const barData = {
      labels: ['Arab', 'Chinese', 'Western'],
      datasets: [
        {
          label: `Coverage Score for ${selectedTopic}`,
          data: [
            results?.Arab?.coverage_score,
            results?.Chinese?.coverage_score,
            results?.Western?.coverage_score,
          ],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  
    const barOptions = {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
        },
      },
    };
  
    // --- Doughnut Chart Data ---
    const createDoughnutData = (score, label) => ({
      labels: [label, 'Remaining'],
      datasets: [
        {
          data: [score, 100 - score],
          backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(229, 229, 229, 0.6)'],
          borderColor: ['rgba(75, 192, 192, 1)', 'rgba(200, 200, 200, 1)'],
          borderWidth: 1,
        },
      ],
    });
  
    const doughnutOptions = {
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
        },
      },
      cutout: '60%',
    };
  
    

  
  return (
    <div className="plotpage">
      <Helmet>
        <title>Plot</title>
        <meta name="description" content="Plot page" />
      </Helmet>

      {/* Header */}
      <div className="plot-page-header">
        <button
          className="plot-back-btn"
          onClick={() => navigate("/evaluation")}
        >
          <FaArrowLeft className="plot-back-icon" />
        </button>
      </div>
 
      {/* Main Content Section */}
      <div className="plotheader">
        <h3>The overall evaluation</h3>
        <pre>Topic: {selectedTopic} | Model: {evalLLM}</pre>
   

        {/* Coverage Score Header */}
        <div className="coverage-score-header">
          <div className="header-container">
            <h2 className="header-title">
              Version-1{" "}
              <FaInfoCircle
                className="info-icon"
                onClick={toggleTooltip}
                title="Click for more information"
              />
            </h2>
          </div>


      


          {isTooltipVisible && (
            <div className="tooltip-container">
              <div className="tooltip-content">
                <h3>About Version-1</h3>
                <p>
                  This evaluation uses the Llama-2-7B model. The coverage score
                  indicates how accurately the model answers questions based on the
                  selected topics and datasets.
                </p>
                <p>
                  <strong>Details:</strong>
                </p>
                <ul>
                  <li>Model: Llama-2-7B</li>
                  <li>Number of Samples: 100 per region</li>
                  <li>Evaluation Metric: Correct predictions vs total questions</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div id="map" style={{ width: "100%", height: "500px", margin: "0 auto" }}></div>
        {showNoModelMessage && (
          <p style={{ textAlign: "center", color: "red" }}>
            There is no Fine-Tuned model available.
          </p>
        )}

        {/* Coverage Scores */}
        {/* <div className="coverage-scores">
  <div className="coverage-score-item">
    Arab Coverage Score for {selectedTopic}: {results?.Arab?.coverage_score?.toFixed(2)}%
  </div>
  <div className="coverage-score-item">
    Chinese Coverage Score for {selectedTopic}: {results?.Chinese?.coverage_score?.toFixed(2)}%
  </div>
  <div className="coverage-score-item">
    Western Coverage Score for {selectedTopic}: {results?.Western?.coverage_score?.toFixed(2)}%
  </div>
</div> */}


   {/* Chart Representation
   <div style={{ width: '600px', margin: 'auto' }}>
        <h2>Coverage Score Chart for {selectedTopic}</h2>
        <Bar data={data} options={options} />
      </div> */}

     


      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>
        Dashboard for Coverage Score 
      </h1>

    
      {/* --- Doughnut Charts for Each Region --- */}
      <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '40px', gap: '30px' }}>
        {/* Arab Region */}
        <div style={{ width: '250px', textAlign: 'center' ,marginTop:'33px'}}>
          <h3>Arab Region</h3>
          <Doughnut
            data={createDoughnutData(
              results?.Arab?.coverage_score,
              'Arab Coverage'
            )}
            options={doughnutOptions}
          />
        </div>

        {/* Chinese Region */}
        <div style={{ width: '250px', textAlign: 'center' }}>
          <h3>Chinese Region</h3>
          <Doughnut
            data={createDoughnutData(
              results?.Chinese?.coverage_score,
              'Chinese Coverage'
            )}
            options={doughnutOptions}
          />
        </div>

        {/* Western Region */}
        <div style={{ width: '250px', textAlign: 'center' }}>
          <h3>Western Region</h3>
          <Doughnut
            data={createDoughnutData(
              results?.Western?.coverage_score,
              'Western Coverage'
            )}
            options={doughnutOptions}
          />
        </div>

      </div>
        {/* --- Bar Chart --- */}
        <div style={{ width: '600px', margin: '20px auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>
          Coverage Score Comparison
        </h2>
        <Bar data={barData} options={barOptions} />
      </div>

    </div>

     


        {/* Freestyle Chatting Button */}
        <div className="plotsubmit-container">
          <button className="plotsubmit" onClick={openDialog}>
            Free style chatting
          </button>
        </div>
      </div>

      {/* Topic Selection Dialog */}
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
                <option value="" disabled>
                  {dimensionPlaceholder}
                </option>
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
                <button className="plot-button2" onClick={handleNext}>
                  Next
                </button>
              </div>
            </div>
          </dialog>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};
