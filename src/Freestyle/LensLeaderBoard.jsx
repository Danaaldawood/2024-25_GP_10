import React, { useEffect, useState } from "react";
import "./LensLeaderBoard.css";
import { ref, onValue } from "firebase/database";
import { realtimeDb } from "../Register/firebase";
import { Header } from "../Header/Header";
import { Helmet } from "react-helmet";
import { Footer } from "../Footer/Footer";
import { useTranslation } from 'react-i18next';
import { AlertCircle } from "lucide-react";

const LensLeaderBoard = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [regionFilter, setRegionFilter] = useState("Arab");
  const validRegions = ["Arab", "Chinese", "Western"];
  const { t, i18n } = useTranslation('lensScore');
  const [showInfo, setShowInfo] = useState(false);
  const isRTL = i18n.dir() === 'rtl';

   const toggleTooltip = () => {
    setShowTooltip((prev) => !prev);
  };

  useEffect(() => {
    const evaluationRef = ref(realtimeDb, "model_evaluation");

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

   //Calculate LensScore:
   const uniqueCombos = [
    ...new Set(filteredData.map((entry) => `${entry.model}||${entry.topic}`)),
  ];
  const averageScores = uniqueCombos.map((combo) => {
    const [model, topic] = combo.split("||");
    const relevantEntries = filteredData.filter(
      (entry) => entry.model === model && entry.topic === topic
    );
  
    const totalVotes = relevantEntries.length;
    const totalScore = relevantEntries.reduce((acc, entry) => {
      return acc + (parseFloat(entry.lensScore) || 0);
    }, 0);
  
    const avg = totalVotes ? totalScore / totalVotes : null;
    return { combo, avg };
  });
  const validAverages = averageScores
    .map((item) => item.avg)
    .filter((val) => val !== null);
  
  const minScore = Math.min(...validAverages);
  const maxScore = Math.max(...validAverages);
  
  //  Normalize function
  const calculateLensScore = (model, topic) => {
    const combo = `${model}||${topic}`;
    const modelTopicScore = averageScores.find((item) => item.combo === combo);
  
    if (!modelTopicScore || modelTopicScore.avg === null) return "No score";
  
    if (maxScore === minScore) return "100%";  
  
    const normalized =
      ((modelTopicScore.avg - minScore) / (maxScore - minScore)) * 100;
  
    return normalized.toFixed(2) + "%";
  };
  
  

  return (
    <div className="LensLeaderbord-container">
      <Header />
      <Helmet>
        <title>{t("LeaderBoard")}</title>
        <meta name="description" />
      </Helmet>

      <div className="leaderboard-header">
  <div className="leaderboard-container-inline">
    <h2 className="leaderboard-title">
      {t("CultureLens - LeaderBoard")}
    </h2>     <div
          className="info-button"
          onMouseEnter={() => setShowInfo(true)}
          onMouseLeave={() => setShowInfo(false)}
        >
          <AlertCircle className="h-5 w-5" />
        </div>
    
    
    <div className="leaderboard-popup">
      <div className={t("leaderboard-content")}>
      <p>{t("leaderboard-content")}</p>

      </div>
    </div>
  </div>
</div>



      <div className="Filterdropdown-region">
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
      <div class="tableLeaderBoard-container">
      <table className="LeaderBoardTable">
        <thead>
          <tr>
            <th>{t("Model")}</th>
            <th>{t("Topic")}</th>
            <th>{t("LensLeaderBoard-Score")}</th>
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
      </div>
      <Footer />

     </div>
    
  );
};

export default LensLeaderBoard;