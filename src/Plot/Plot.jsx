import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as d3 from "d3";
import { feature } from "topojson-client";
import "./Plot.css";
import { FaArrowLeft, FaInfoCircle } from "react-icons/fa";
import { Footer } from "../Footer/Footer";
import { Helmet } from "react-helmet";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { useTranslation } from "react-i18next";

export const Plot = () => {
  const { t, i18n } = useTranslation("plotpage");
  const { state } = useLocation();
  const navigate = useNavigate();
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [selectedDimension, setSelectedDimension] = useState("");
  const [dimensionPlaceholder, setDimensionPlaceholder] = useState(t("selectATopicPlaceholder"));
  const [hasError, setHasError] = useState(false);
  const [isTooltipVisible, setTooltipVisible] = useState(false);

  const evalLLM = state?.evalLLM || "";
  const evalType = state?.evalType || "";
  const [selectedTopicKey, setSelectedTopicKey] = useState("allTopics");
  const [results, setResults] = useState(null);
  const [showMap, setShowMap] = useState(true);

  const topicKeys = ["allTopics", "food", "sport", "family", "holidays", "worklife", "greeting"];
  const topicKeyToApiValue = {
    allTopics: "All Topics",
    food: "Food",
    sport: "Sport",
    family: "Family",
    holidays: "Holidays/Celebration/Leisure",
    worklife: "Work life",
    greeting: "Greeting",
  };

  const regionToIds = {
    Western: [840, 124, 826, 250, 276, 380, 724, 620, 528, 56, 756, 40, 372, 752, 578, 208, 246],
    Arab: [12, 48, 818, 368, 400, 414, 422, 434, 504, 512, 275, 634, 682, 729, 760, 788, 784, 887],
    Chinese: [156, 344, 446, 158, 702],
  };

  useEffect(() => {
    setDimensionPlaceholder(t("selectATopicPlaceholder"));
  }, [i18n.language, t]);

  const handleDimensionChange = (event) => {
    setSelectedDimension(event.target.value);
    setHasError(false);
  };

  const handleNext = () => {
    if (!selectedDimension) {
      setDimensionPlaceholder(t("pleaseSelectATopic"));
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
  }, [showMap, results, i18n.language]);

  const fetchResults = async () => {
    try {
      const apiTopicValue = topicKeyToApiValue[selectedTopicKey];
      const response = await fetch("http://127.0.0.1:5000/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: apiTopicValue, model: evalLLM, evalType: evalType }),
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
  }, [selectedTopicKey, evalLLM, evalType]);

  const renderMap = () => {
    const width = 960;
    const height = 500;
    const svg = d3.select("#map").append("svg").attr("width", width).attr("height", height);
    const projection = d3.geoMercator().scale(140).center([0, 30]).translate([width / 2, height / 2]);

    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then((geoData) => {
      const countries = feature(geoData, geoData.objects.countries);

      const colorScale = d3.scaleLinear()
        .domain([0, 2])
        .range(["#f9d1a8", "#f28d27"]);

      const legendWidth = 200;
      const legendHeight = 20;
      const legendX = width / 2 - legendWidth / 2;
      const legendY = height - 50;

      const defs = svg.append("defs");
      const linearGradient = defs.append("linearGradient")
        .attr("id", "legend-gradient")
        .attr("x1", "0%").attr("x2", "100%").attr("y1", "0%").attr("y2", "0%");

      linearGradient.append("stop")
        .attr("offset", "0%")
        .style("stop-color", colorScale(0));

      linearGradient.append("stop")
        .attr("offset", "100%")
        .style("stop-color", colorScale(2));

      svg.append("rect")
        .attr("x", legendX)
        .attr("y", legendY)
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#legend-gradient)")
        .style("stroke", "#000")
        .style("stroke-width", 1);

      svg.append("text")
        .attr("x", legendX)
        .attr("y", legendY + legendHeight + 15)
        .attr("text-anchor", "start")
        .style("fill", "#722F57")
        .style("font-size", "12px")
        .text(evalType.includes("Hofstede") ? "0.00" : "0.00%");

      svg.append("text")
        .attr("x", legendX + legendWidth)
        .attr("y", legendY + legendHeight + 15)
        .attr("text-anchor", "end")
        .style("fill", "#722F57")
        .style("font-size", "12px")
        .text(evalType.includes("Hofstede") ? "2.00" : "100.00%");

      svg.append("text")
        .attr("x", legendX + legendWidth / 2)
        .attr("y", legendY - 5)
        .attr("text-anchor", "middle")
        .style("fill", "#722F57")
        .style("font-size", "14px")
        .text(evalType.includes("Hofstede") ? t("standardDeviation") : t("coverageScore"));

      svg.append("g")
        .selectAll("path")
        .data(countries.features)
        .enter()
        .append("path")
        .attr("d", d3.geoPath().projection(projection))
        .attr("fill", (d) => {
          const region = Object.keys(regionToIds).find((key) => regionToIds[key].includes(parseInt(d.id)));
          if (!region) return "#d3d3d3";
          if (evalType.includes("Hofstede")) {
            const stdDev = results?.[region]?.standard_deviation || 0;
            return colorScale(stdDev);
          } else {
            const coverage = results?.[region]?.coverage_score || 0;
            return colorScale(coverage / 100 * 2);
          }
        })
        .attr("stroke", "#fff");

      const regionPositions = {
        Arab: projection([35, 25]),
        Chinese: projection([100, 35]),
        Western: projection([-110, 40])
      };

      Object.keys(regionPositions).forEach((region) => {
        svg.append("text")
          .attr("x", regionPositions[region][0] - 12)
          .attr("y", regionPositions[region][1] - 1)
          .attr("class", "map-label")
          .style("fill", "#722F57")
          .style("font-weight", "bold")
          .text(
            evalType.includes("Hofstede")
              ? `${results?.[region]?.standard_deviation?.toFixed(2) || "0.00"}`
              : `${results?.[region]?.coverage_score?.toFixed(2) || "0.00"}%`
          );
      });
    });
  };

  const getModelExplanation = () => {
    if (evalType === "Cohere Fine-tuned Model") {
      return t("tooltips.cohereFineTuned");
    } else if (evalType === "Cohere Baseline") {
      return t("tooltips.cohereBaseline");
    } else if (evalType === "LLAMA2 Baseline") {
      return t("tooltips.llamaBaseline");
    } else if (evalType === "Hofstede Questions-Cohere Model") {
      return t("tooltips.hofstedeCohere");
    } else if (evalType === "Hofstede Questions-LLAMA2 Model") {
      return t("tooltips.hofstedeLlama");
    } else if (evalType === "Hofstede Questions-Cohere Fine-tuned Model") {
      return t("tooltips.hofstedeCohereFineTuned");
    }
    return null;
  };

  const getCoverageText = () => {
    if (!results) {
      console.log("No results available");
      return t("explanations.noResults");
    }

    console.log("Current language:", i18n.language);
    console.log("Results:", results);

    if (evalType.includes("Hofstede")) {
      const arabStd = results?.Arab?.standard_deviation?.toFixed(2) || "0.00";
      const chineseStd = results?.Chinese?.standard_deviation?.toFixed(2) || "0.00";
      const westernStd = results?.Western?.standard_deviation?.toFixed(2) || "0.00";
      console.log("Hofstede values - Arab:", arabStd, "Chinese:", chineseStd, "Western:", westernStd);

      const evalTypeKey = evalType.toLowerCase().replace(/ /g, "");
      console.log("evalTypeKey:", evalTypeKey);
      const translatedEvalType = t(`modelNames.${evalTypeKey}`, { defaultValue: evalType });
      console.log("Translated evalType:", translatedEvalType);

      const explanation = t("explanations.hofstedeText", {
        evalType: translatedEvalType,
        arab: arabStd,
        chinese: chineseStd,
        western: westernStd,
        defaultValue: "{evalType} evaluated 24 Hofstede Work Life questions. Standard Deviations: Arab - {arab}, Chinese - {chinese}, Western - {western}.",
      });
      console.log("Generated explanation:", explanation);

      // Improved fallback logic: Check if the explanation contains English text when the language is Arabic
      const containsEnglish = /[a-zA-Z]/.test(explanation) && i18n.language === "ar";
      if (containsEnglish || explanation.includes("{evalType}") || explanation.includes("{arab}")) {
        console.warn("Hofstede explanation translation failed, using fallback");
        const arabLabel = t("regions.arab", { defaultValue: "Arab" });
        const chineseLabel = t("regions.chinese", { defaultValue: "Chinese" });
        const westernLabel = t("regions.western", { defaultValue: "Western" });
        const fallbackExplanation = i18n.language === "ar"
          ? `${translatedEvalType} قيّم 24 سؤالًا من أسئلة هوفستيد حول حياة العمل. الانحرافات المعيارية: ${arabLabel} - ${arabStd}، ${chineseLabel} - ${chineseStd}، ${westernLabel} - ${westernStd}.`
          : `${translatedEvalType} evaluated 24 Hofstede Work Life questions. Standard Deviations: ${arabLabel} - ${arabStd}, ${chineseLabel} - ${chineseStd}, ${westernLabel} - ${westernStd}.`;
        return fallbackExplanation;
      }
      return explanation;
    }

    const arab = results?.Arab?.coverage_score?.toFixed(2) || "0.00";
    const western = results?.Western?.coverage_score?.toFixed(2) || "0.00";
    const chinese = results?.Chinese?.coverage_score?.toFixed(2) || "0.00";

    const translatedEvalType = t(`modelNames.${evalType.toLowerCase().replace(/ /g, "")}`, { defaultValue: evalType });
    const translatedTopic = t(selectedTopicKey, { defaultValue: selectedTopicKey });

    const coverageText = t("explanations.coverageText", {
      evalType: translatedEvalType,
      topic: translatedTopic,
      arab: arab,
      western: western,
      chinese: chinese,
      defaultValue: '{evalType} evaluated answers for the "{topic}" topic. Coverage Scores: Arab - {arab}%, Western - {western}%, Chinese - {chinese}%.',
    });

    const containsEnglish = /[a-zA-Z]/.test(coverageText) && i18n.language === "ar";
    if (containsEnglish || coverageText.includes("{evalType}") || coverageText.includes("{topic}")) {
      console.warn("Translation interpolation failed, constructing string manually");
      const evaluatedAnswers = t("explanations.evaluatedAnswers", { defaultValue: "evaluated answers for the" });
      const topicLabel = t("explanations.topicLabel", { defaultValue: "topic" });
      const coverageScores = t("explanations.coverageScores", { defaultValue: "Coverage Scores" });
      const arabLabel = t("regions.arab", { defaultValue: "Arab" });
      const westernLabel = t("regions.western", { defaultValue: "Western" });
      const chineseLabel = t("regions.chinese", { defaultValue: "Chinese" });

      return `${translatedEvalType} ${evaluatedAnswers} "${translatedTopic}" ${topicLabel}. ${coverageScores}: ${arabLabel} - ${arab}%, ${westernLabel} - ${western}%, ${chineseLabel} - ${chinese}%.`;
    }

    return coverageText;
  };

  return (
    <div className="plotpage" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
      <Helmet>
        <title>{t("pageTitle")}</title>
      </Helmet>
      <div className="plot-page-header">
        <button className="plot-back-btn" onClick={() => navigate("/evaluation")}>
          <FaArrowLeft className="plot-back-icon" />
        </button>
      </div>

      <div className="plotheader">
        <h1 className="header-title">{t("headerTitle")}</h1>
        <div className="selection-container">
          <h2 className="underlined">{t(`modelNames.${evalType.toLowerCase().replace(/ /g, "")}`, { defaultValue: evalType })}</h2>
          {(evalType.includes("Baseline") || evalType === "Cohere Fine-tuned Model") ? (
            <select
              className="plot-select"
              value={selectedTopicKey}
              onChange={(e) => setSelectedTopicKey(e.target.value)}
            >
              {topicKeys.map((key) => (
                <option key={key} value={key}>
                  {t(key)}
                </option>
              ))}
            </select>
          ) : (
            <h2 className="underlined">{t("workLife")}</h2>
          )}
        </div>

        <div className="version-container">
          <h2 className="version-main">
            {t(`modelNames.${evalType.toLowerCase().replace(/ /g, "")}`, { defaultValue: evalType })}
            <FaInfoCircle className="info-icon" onClick={() => setTooltipVisible(!isTooltipVisible)} />
          </h2>
          {isTooltipVisible && <div className="tooltip-box">{getModelExplanation()}</div>}
        </div>

        <div className="toggle-container">
          <button className={`toggle-button ${showMap ? "active" : ""}`} onClick={() => setShowMap(true)}>
            {t("map")}
          </button>
          <button className={`toggle-button ${!showMap ? "active" : ""}`} onClick={() => setShowMap(false)}>
            {t("chart")}
          </button>
        </div>

        {showMap ? (
          <div id="map"></div>
        ) : (
          <Bar
            data={{
              labels: [t("regions.arab"), t("regions.chinese"), t("regions.western")],
              datasets: [
                {
                  label: evalType.includes("Hofstede") ? t("standardDeviation") : t("coverageScore"),
                  data: evalType.includes("Hofstede")
                    ? [
                        results?.Arab?.standard_deviation || 0,
                        results?.Chinese?.standard_deviation || 0,
                        results?.Western?.standard_deviation || 0,
                      ]
                    : [
                        results?.Arab?.coverage_score || 0,
                        results?.Chinese?.coverage_score || 0,
                        results?.Western?.coverage_score || 0,
                      ],
                  backgroundColor: ["#4BC0C0", "#9966FF", "#FF9F40"],
                },
              ],
            }}
          />
        )}

        <div className="explanation">
          <p>{getCoverageText()}</p>
        </div>

        <div className="plotsubmit-container">
          <button className="plotsubmit" onClick={() => setPopupOpen(true)}>
            {t("freeStyleChatting")}
          </button>
        </div>

        {isPopupOpen && (
          <div className="plotdialog-container">
            <dialog open className="plotpopup-dialog">
              <div className="plotpopup-content">
                <h2>{t("selectTopic")}</h2>
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
                  <option value="All Topics">{t("allTopics")}</option>
                  <option value="Food">{t("food")}</option>
                  <option value="Sport">{t("sport")}</option>
                  <option value="Family">{t("family")}</option>
                  <option value="Education">{t("education")}</option>
                  <option value="Holidays">{t("holidays")}</option>
                  <option value="Work life">{t("worklife")}</option>
                  <option value="Greeting">{t("greeting")}</option>
                </select>
                <div>
                  <button className="plot-button2" onClick={handleNext}>
                    {t("next")}
                  </button>
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