
import React, { useEffect, useState } from "react";
import "./LensLeaderBoard.css";
import { ref, onValue } from "firebase/database";
import { realtimeDb } from "../Register/firebase";
import { Header } from "../Header/Header";
import { Helmet } from "react-helmet";
import { Footer } from "../Footer/Footer";
import { useTranslation } from 'react-i18next';
const LensLeaderBoard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [regionFilter, setRegionFilter] = useState("Arab"); // default region
  const validRegions = ["Arab", "Chinese", "Western"];
  const { t, i18n } = useTranslation('lensScore');
  const isRTL = i18n.dir() === 'rtl';
  useEffect(() => {
    const evaluationRef = ref(realtimeDb, "model_evaluation");
  
  const MAX_EDIT_LENGTH = 50;  

    onValue(evaluationRef, (snapshot) => {
      const data = snapshot.val();
      const formattedData = [];

      if (data) {
        for (let key in data) {
          const evaluation = data[key];

          let modelName = evaluation.model_id ? evaluation.model_id.trim() : "Unknown";
          if (modelName.toLowerCase().includes("both")) {
            modelName = "Mistral(7B) & Llama-2 (7B)";
          } else if (modelName === "ModelA" || modelName === "Model A") {
            modelName = "Mistral(7B)";
          } else if (modelName === "ModelB" || modelName === "Model B") {
            modelName = "Llama-2 (7B)";
          }

          formattedData.push({
            model: modelName || "Unknown",
            topic: evaluation.topic || "Unknown",
            userRegion: evaluation.user_region || "Unknown",
            lensScore: evaluation.vote_label || 0,
          });
        }
      }

      setLeaderboardData(formattedData);
    });
  }, []);

   const filteredData = leaderboardData.filter(
    (entry) => entry.userRegion === regionFilter
  );

  const calculateLensScore = (model, topic) => {
    const relevantEntries = filteredData.filter(
      (entry) => entry.model === model && entry.topic === topic
    );

    const totalVotes = relevantEntries.length;

    const totalScore = relevantEntries.reduce((acc, entry) => {
      return acc + (parseFloat(entry.lensScore) || 0);
    }, 0);

    return totalVotes ? (totalScore / totalVotes).toFixed(2) : "No score";
  };

  const uniqueCombos = [
    ...new Set(filteredData.map((entry) => `${entry.model}||${entry.topic}`)),
  ];

  return (
    <div className="LensLeaderbord-container">
      <Header />
      <Helmet>
        <title>{t("CultureLens - LeaderBoard")}</title>
        <meta name="description" />
      </Helmet>
  
      <div className="title-wrapper">
        <p className="leaderboard-title">{t("CultureLens - LeaderBoard")}</p>
      </div>
  
      <div className="dropdown-region">
        <label htmlFor="regionSelect">{t("Region")}:</label>
        <select
          id="regionSelect"
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
        >
          {validRegions.map((region, index) => (
            <option key={index} value={region}>
              {t(`regions.${region}`)}
            </option>
          ))}
        </select>
      </div>
  
      <table>
        <thead>
          <tr>
            <th>{t("Model")}</th>
            <th>{t("Topic")}</th>
            <th>{t("Lens Score")}</th>
          </tr>
        </thead>
        <tbody>
          {uniqueCombos.length > 0 ? (
            uniqueCombos.map((combo, index) => {
              const [model, topic] = combo.split("||");
              const averageScore = calculateLensScore(model, topic);
              return (
                <tr key={index}>
                  <td>{t(`${model}`)}</td>
                  <td>{t(`topics.${topic}`)}</td>
                  <td>{averageScore}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="3">{t("No data available for this region")}</td>
            </tr>
          )}
        </tbody>
      </table>
    

      <Footer />  
    </div>
  );
};

export default LensLeaderBoard;
