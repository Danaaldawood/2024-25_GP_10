// import React, { useState } from "react";
// import "./CrossCultureComparison.css";
// import { useNavigate } from "react-router-dom";
// import { Header } from "../Header/Header";
// import { Footer } from "../Footer/Footer";
// import { Helmet } from "react-helmet";

// const CrossCultureComparison = () => {
//   const [selectedRegions, setSelectedRegions] = useState([]);
//   const [selectedTopic, setSelectedTopic] = useState(""); // Single topic selection
//   const [hasError, setHasError] = useState(false);

//   const navigate = useNavigate();

//   const handleCompareClick = (e) => {
//     e.preventDefault();

//     let error = false;

//     if (selectedRegions.length === 0 || selectedTopic === "") {
//       error = true;
//       setHasError(true);
//     } else {
//       setHasError(false);
//     }

//     if (error) return;

//     navigate("/compare-result", {
//       state: { cultureRegion: selectedRegions, topic: selectedTopic },
//     });
//   };

//   const handleRegionChange = (e) => {
//     const { value } = e.target;
//     setSelectedRegions((prevRegions) =>
//       prevRegions.includes(value)
//         ? prevRegions.filter((region) => region !== value)
//         : [...prevRegions, value]
//     );
//   };

//   const handleTopicChange = (e) => {
//     setSelectedTopic(e.target.value); // Set single topic
//   };

//   return (
//     <div className="comparison-container">
//       <Helmet>
//         <title>Compare Page</title>
//         <meta name="description" content="This is the Cross Culture Comparison" />
//       </Helmet>  

//       <Header />

//       <div className="Compare-form-container">
//         <header className="Compare-form-header">
//           <div className="Compare-underline"></div>
//         </header>
//         <div className="Compare-inputs">
//           <div className="Compare-text">Cross-Cultural Comparison</div>

//           {/* Region Selection with Checkboxes */}
//           <div className="Compare-input">
//             <label className="Compare-label">Regions:</label>
//             <div className={`Compare-cultureRegion ${hasError && selectedRegions.length === 0 ? "error" : ""}`}>
//               <label>
//                 <input
//                   type="checkbox"
//                   value="Arab"
//                   checked={selectedRegions.includes("Arab")}
//                   onChange={handleRegionChange}
//                 />
//                 Arab
//               </label>
//               <label>
//                 <input
//                   type="checkbox"
//                   value="Western"
//                   checked={selectedRegions.includes("Western")}
//                   onChange={handleRegionChange}
//                 />
//                 Western
//               </label>
//               <label>
//                 <input
//                   type="checkbox"
//                   value="Chinese"
//                   checked={selectedRegions.includes("Chinese")}
//                   onChange={handleRegionChange}
//                 />
//                 Chinese
//               </label>
//             </div>
//           </div>

//           {/* Topic Selection with Single-Choice Dropdown */}
//           <div className="Compare-input">
//             <label className="Compare-label">Topics:</label>
//             <select
//               value={selectedTopic}
//               onChange={handleTopicChange}
//               className={`Compare-topicRegion ${hasError && selectedTopic === "" ? "error" : ""}`}
//             >
//               <option value="" disabled>Select a topic</option>
//               <option value="Food">Food</option>
//               <option value="Sport">Sport</option>
//               <option value="Family">Family</option>
//               <option value="Holiday">Holiday</option>
//               <option value="Work-life">Work-life</option>
//               <option value="Education">Education</option>
//               <option value="Greeting">Greeting</option>
//             </select>
//           </div>
//         </div>

//         <div className="Compare-submit-container">
//           <div className="Compare-submit">
//             <button onClick={handleCompareClick}>Compare</button>
//           </div>
//         </div>
//       </div>

//       <Footer />
//     </div>
//   );
// };

// export default CrossCultureComparison;




import React, { useState } from "react";
import "./CrossCultureComparison.css";
import { useNavigate } from "react-router-dom";
import { Header } from "../Header/Header";
import { Footer } from "../Footer/Footer";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";

const CrossCultureComparison = () => {
  const { t } = useTranslation('comparepage'); // Hook for translations
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [hasError, setHasError] = useState(false);

  const navigate = useNavigate();

  const handleCompareClick = (e) => {
    e.preventDefault();

    if (selectedRegions.length === 0 || selectedTopics.length === 0) {
      setHasError(true);
      return;
    }
    setHasError(false);

    navigate("/compare-result", {
      state: { cultureRegion: selectedRegions, topics: selectedTopics },
    });
  };

  const handleRegionChange = (e) => {
    const { value } = e.target;
    setSelectedRegions((prevRegions) =>
      prevRegions.includes(value)
        ? prevRegions.filter((region) => region !== value)
        : [...prevRegions, value]
    );
  };

  const handleTopicChange = (e) => {
    const { value } = e.target;
    const allTopics = [
      "Food",
      "Sport",
      "Family",
      "Holiday",
      "Work-life",
      "Education",
      "Greeting",
    ];

    if (value === "All") {
      setSelectedTopics((prevTopics) =>
        prevTopics.length === allTopics.length ? [] : allTopics
      );
    } else {
      setSelectedTopics((prevTopics) =>
        prevTopics.includes(value)
          ? prevTopics.filter((topic) => topic !== value)
          : [...prevTopics, value]
      );
    }
  };

  return (
    <div className="comparison-container">
      <Helmet>
        <title>{t("pageTitle")}</title>
        <meta name="description" content={t("description")} />
      </Helmet>

      <Header />

      <div className="Compare-form-container">
        <header className="Compare-form-header">
          <div className="Compare-underline"></div>
        </header>
        <div className="Compare-inputs">
          <div className="Compare-text">{t("header")}</div>

          {/* Region Selection with Checkboxes */}
          <div className="Compare-input">
            <label className="Compare-label">{t("regions")}</label>
            <div
              className={`Compare-cultureRegion ${
                hasError && selectedRegions.length === 0 ? "error" : ""
              }`}
            >
              <label>
                <input
                  type="checkbox"
                  value="Arab"
                  checked={selectedRegions.includes("Arab")}
                  onChange={handleRegionChange}
                />
                {t("arab")}
              </label>
              <label>
                <input
                  type="checkbox"
                  value="Western"
                  checked={selectedRegions.includes("Western")}
                  onChange={handleRegionChange}
                />
                {t("western")}
              </label>
              <label>
                <input
                  type="checkbox"
                  value="Chinese"
                  checked={selectedRegions.includes("Chinese")}
                  onChange={handleRegionChange}
                />
                {t("chinese")}
              </label>
            </div>
          </div>

          {/* Topic Selection with Checkboxes */}
          <div className="Compare-input">
            <label className="Compare-label">{t("topics")}</label>
            <div
              className={`Compare-cultureRegion ${
                hasError && selectedTopics.length === 0 ? "error" : ""
              }`}
            >
              <label>
                <input
                  type="checkbox"
                  value="All"
                  checked={selectedTopics.length === 7} // Automatically check if all are selected
                  onChange={handleTopicChange}
                />
                {t("selectAll")}
              </label>
              {[
                "Food",
                "Sport",
                "Family",
                "Holiday",
                "Work-life",
                "Education",
                "Greeting",
              ].map((topic) => (
                <label key={topic}>
                  <input
                    type="checkbox"
                    value={topic}
                    checked={selectedTopics.includes(topic)}
                    onChange={handleTopicChange}
                  />
                  {t(topic.toLowerCase())}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="Compare-submit-container">
          <div className="Compare-submit">
            <button onClick={handleCompareClick}>{t("compareButton")}</button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CrossCultureComparison;

