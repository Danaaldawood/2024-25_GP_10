// --- Imports ---
import React, { useState, useEffect } from "react";
import "./homepage.css";
import LOGO from "../images/Logo.png";
import { Doughnut, Bar } from "react-chartjs-2";
import photo from "../images/MAP-logo.png";
import "chart.js/auto";
import MAPPhoto from "../images/result.png";
import { Header } from "../Header/Header";
import { Footer } from "../Footer/Footer";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import { ref, get } from "firebase/database";
import { realtimeDb } from "../Register/firebase";

const HomePage = () => {
  //  State ---
  const { t, i18n } = useTranslation("homepage");
  const [showMore, setShowMore] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState("");
  const [topicChartData, setTopicChartData] = useState(null);
  const [regionTopicComparisonData, setRegionTopicComparisonData] =
    useState(null);
  const [totalAttributeData, setTotalAttributeData] = useState(null);

  // --- Event Handlers ---
  const handleDomainChange = (domain) => {
    setSelectedDomain(domain);
    console.log("Selected Domain:", domain);
  };

  // --- Chart Configurations ---
  const doughnutOptions = {
    plugins: {
      legend: {
        display: true,
        position: "left",
        labels: {
          boxWidth: 10,
          padding: 15,
        },
      },
    },
    cutout: "60%",
    animation: {
      duration: 1000,
      easing: "easeInOutQuart",
    },
  };
  
  const barOptions = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        display: true,
      },
    },
    maintainAspectRatio: false,
  };
  
  // --- Data Fetching Functions ---
  const fetchTopicData = async () => {
    const dbRef = ref(realtimeDb);
    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const topicCounts = {};
  
      ["ArabC", "ChineseC", "WesternC"].forEach((region) => {
        const details = data[region]?.Details || {};
        Object.values(details).forEach((item) => {
          const topic = item.topic;
          topicCounts[topic] = (topicCounts[topic] || 0) + 1;
        });
      });
  
      return topicCounts;
    } else {
      console.error("No data available");
      return {};
    }
  };
  
  // Fetch Region Comparison Data
  const fetchRegionTopicComparisonData = async () => {
    const dbRef = ref(realtimeDb);
    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const regionTopicCounts = {
        Arab: {},
        Chinese: {},
        Western: {},
      };
  
      ["ArabC", "ChineseC", "WesternC"].forEach((regionKey, index) => {
        const regionName = ["Arab", "Chinese", "Western"][index];
        const details = data[regionKey]?.Details || {};
        Object.values(details).forEach((item) => {
          const topic = item.topic;
          regionTopicCounts[regionName][topic] =
            (regionTopicCounts[regionName][topic] || 0) + 1;
        });
      });
  
      return regionTopicCounts;
    } else {
      console.error("No data available");
      return {};
    }
  };
  
  // Fetch Total Attributes Data
  const fetchTotalAttributesData = async () => {
    const dbRef = ref(realtimeDb);
    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      return {
        Arab: Object.keys(data.ArabC?.Details || {}).length,
        Chinese: Object.keys(data.ChineseC?.Details || {}).length,
        Western: Object.keys(data.WesternC?.Details || {}).length,
      };
    } else {
      console.error("No data available");
      return { Arab: 0, Chinese: 0, Western: 0 };
    }
  };
  
  // --- Data Loading Effect ---
  useEffect(() => {
    const loadData = async () => {
      const topicData = await fetchTopicData();
      const regionTopicData = await fetchRegionTopicComparisonData();
      const totalData = await fetchTotalAttributesData();
  
      const topics = Array.from(
        new Set(
          Object.values(regionTopicData).flatMap((region) =>
            Object.keys(region)
          )
        )
      );
  
      const normalizeTopicKey = (topic) =>
        topic === "Holidays/Celebration/Leisure" ? "Holidays" : topic;
  
      const translatedTopics = topics.map((topic) =>
        t(`homepage.topics.${normalizeTopicKey(topic)}`)
      );
  
      console.log("Translated Topics: ", translatedTopics);
  
      const topicDatasets = Object.keys(regionTopicData).map((region) => ({
        label: t(`homepage.regions.${region}`),
        data: topics.map((topic) => {
          const originalTopic =
            topic === "Holidays" ? "Holidays/Celebration/Leisure" : topic;
          return regionTopicData[region][originalTopic] || 0;
        }),
        backgroundColor:
          region === "Arab"
            ? "#722F57"
            : region === "Chinese"
            ? "#722F57"
            : "#722F57", 
                }));
  
      setRegionTopicComparisonData({
        labels: translatedTopics,
        datasets: topicDatasets,
      });
  
      // Doughnut Chart
      setTopicChartData({
        labels: Object.keys(topicData).map((topic) =>
          t(`homepage.topics.${topic === "Holidays/Celebration/Leisure" ? "Holidays" : topic}`)
        ),
        datasets: [
          {
            data: Object.values(topicData),
            backgroundColor: [
              "#722F57", // Updated color
              "#722F57",
              "#722F57",
              "#722F57",
              "#722F57",
              "#722F57",
              "#722F57",
            ],
          },
        ],
      });
  
      // Total Attributes Chart
      setTotalAttributeData({
        labels: ["Arab", "Chinese", "Western"].map(region => t(`homepage.regions.${region}`)),
        datasets: [
          {
            data: Object.values(totalData),
            backgroundColor: ["#722F57", "#722F57", "#722F57"],  
          },
        ],
      });
    };
  
    loadData();
  }, [i18n.language]);
   

  return (
    <div className="homepage">
      {/* Header & Meta Tags */}
      <Header />
      <Helmet>
        <title>{t("title")}</title>
        <meta name="description" content={t("metaDescription")} />
      </Helmet>

      {/* Welcome Section */}
      <div className="content container">
        <div className="text-content">
          <p className="welcome-text">{t("welcomeText")}</p>
          <p className="description-text">
            {t("descriptionText")}
            {showMore && <span>{t("showMoreText")}</span>}
          </p>
          <button
            onClick={() => setShowMore(!showMore)}
            className="learn-more-btn"
          >
            {showMore ? t("showLess") : t("learnMore")}
          </button>
        </div>
        <img src={photo} alt="Map Logo" className="map-logo" />
      </div>

      {/* Region Descriptions */}
      <h2 className="text-center">{t("regionDescriptionsTitle")}</h2>
      <div className="domains-container">
        <div className="domain-card" onClick={() => handleDomainChange("Arab")}>
          <div className="card-body">
            <h3>{t("arabRegionTitle")}</h3>
            <p>{t("arabRegionDescription")}</p>
          </div>
        </div>
        <div
          className="domain-card"
          onClick={() => handleDomainChange("Western")}
        >
          <div className="card-body">
            <h3>{t("westernRegionTitle")}</h3>
            <p>{t("westernRegionDescription")}</p>
          </div>
        </div>
        <div
          className="domain-card"
          onClick={() => handleDomainChange("Chinese")}
        >
          <div className="card-body">
            <h3>{t("chineseRegionTitle")}</h3>
            <p>{t("chineseRegionDescription")}</p>
          </div>
        </div>
      </div>

      {/* Dashboard Charts */}
      <div className="dashboard">
        <div className="charts">
          {/* Topic Distribution Chart */}
          <div className="chart">
            <h3>{t("topicChartTitle")}</h3>
            {topicChartData && (
              <Doughnut data={topicChartData} options={doughnutOptions} />
            )}
          </div>

          {/* Regional Comparison Chart */}
          <div className="chart large-chart">
            <h3>{t("regionComparisonChartTitle")}</h3>
            {regionTopicComparisonData && (
              <Bar data={regionTopicComparisonData} options={barOptions} />
            )}
          </div>

          {/* Total Attributes Chart */}
          <div className="chart">
            <h3>{t("totalAttributeChartTitle")}</h3>
            {totalAttributeData && (
              <Doughnut data={totalAttributeData} options={doughnutOptions} />
            )}
          </div>
        </div>
      </div>

      {/* Map Image */}
 
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
