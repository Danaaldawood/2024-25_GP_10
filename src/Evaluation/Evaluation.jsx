// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "./Evaluation.css";
// import logo from "../images/Logo.png";
// import { Footer } from "../Footer/Footer";
// import { Header } from "../Header/Header";
// import { Helmet } from 'react-helmet';

// export const Evaluation = () => {
//   const [evalDimension, setEvalDimension] = useState("");
//   const [evalLLM, setEvalLLM] = useState("");
//   const [evalMethod, setEvalMethod] = useState("");
//   const [dimensionPlaceholder, setDimensionPlaceholder] =
//     useState("Select a topic");
//   const [llmPlaceholder, setLLMPlaceholder] = useState("Select a model");
//   const [evalMethodPlaceholder, setEvalMethodPlaceholder] = useState(
//     "Select evaluation method"
//   );
//   const [hasError, setHasError] = useState(false);

//   const navigate = useNavigate();

//   const handleEvaluateClick = (e) => {
//     e.preventDefault();
//     let error = false;

//     if (!evalDimension) {
//       setDimensionPlaceholder("Please select a topic");
//       error = true;
//     } else {
//       setDimensionPlaceholder("Select a topic");
//     }

//     if (!evalLLM) {
//       setLLMPlaceholder("Please select a model");
//       error = true;
//     } else {
//       setLLMPlaceholder("Select a model");
//     }

//     if (!evalMethod) {
//       setEvalMethodPlaceholder("Please select evaluation method");
//       error = true;
//     } else {
//       setEvalMethodPlaceholder("Select evaluation method");
//     }

//     setHasError(error);

//     if (error) return;

//     navigate("/plot");
//   };

//   return (
//     <div className="Evaluationpage">
//       {/* Header */}
//       <Header />
//       <Helmet>
//       <title>Evaluation</title>
//       <meta name="description" content="Evaluation page" />
//     </Helmet>
//       <div className="evalcontainer">
//         {/* Evaluation form */}
//         <h3 className="eval-title">Evaluation</h3>
//         <div className="evalinputs">
//           <div className="evalinput">
//             <label className="evallabel">Topic:</label>
//             <select
//               name="evaldimension"
//               id="evaldimension"
//               className={`evaldimension ${
//                 hasError && !evalDimension ? "error" : ""
//               }`}
//               value={evalDimension}
//               onChange={(e) => setEvalDimension(e.target.value)}
//             >
//               <option value="" disabled>
//                 {dimensionPlaceholder}
//               </option>
//               <option value="food">Food</option>
//               <option value="sport">Sport</option>
//               <option value="family">Family</option>
//               <option value="education">Education</option>
//               <option value="holidays">Holidays</option>
//               <option value="work-life">Work-life</option>
                //  <option value="greeting">Greeting</option>
//             </select>
//           </div>

//           <div className="evalinput">
//             <label className="evallabel">Language Model:</label>
//             <select
//               name="evalLLM"
//               id="evalLLM"
//               className={`llm ${hasError && !evalLLM ? "error" : ""}`}
//               value={evalLLM}
//               onChange={(e) => setEvalLLM(e.target.value)}
//             >
//               <option value="" disabled>
//                 {llmPlaceholder}
//               </option>
//               <option value="baseline">Baseline model</option>
//               <option value="fine-tuned">Fine-tuned model</option>
//             </select>
//           </div>

//           <div className="evalinput">
//             <label className="evallabel">Evaluation Method:</label>
//             <select
//               name="evalmethod"
//               id="evalmethod"
//               className={`evalmethod ${hasError && !evalMethod ? "error" : ""}`}
//               value={evalMethod}
//               onChange={(e) => setEvalMethod(e.target.value)}
//             >
//               <option value="" disabled>
//                 {evalMethodPlaceholder}
//               </option>
//               <option value="car">CAR score</option>
//               {/* <option value="consensus">Consensus score</option> */}
//             </select>
//           </div>
//         </div>

//         <div className="submit-container">
//           <div className="evalsubmit">
//             <button onClick={handleEvaluateClick}>Evaluate</button>
//           </div>
//         </div>
//       </div>
//       {/* Footer */}
//       <Footer />
//     </div>
//   );
// };



import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Evaluation.css";
import { Footer } from "../Footer/Footer";
import { Header } from "../Header/Header";
import { Helmet } from 'react-helmet';
import { useTranslation } from "react-i18next";

export const Evaluation = () => {
  const { t } = useTranslation('evalutionpage');  // Hook for translations
  const [evalDimension, setEvalDimension] = useState("");
  const [evalLLM, setEvalLLM] = useState("");
  const [evalMethod, setEvalMethod] = useState("");
  const [dimensionPlaceholder, setDimensionPlaceholder] = useState(t("dimensionPlaceholder"));
  const [llmPlaceholder, setLLMPlaceholder] = useState(t("llmPlaceholder"));
  const [evalMethodPlaceholder, setEvalMethodPlaceholder] = useState(t("methodPlaceholder"));
  const [hasError, setHasError] = useState(false);

  const navigate = useNavigate();

  const handleEvaluateClick = (e) => {
    e.preventDefault();
    let error = false;

    if (!evalDimension) {
      setDimensionPlaceholder(t("dimensionPlaceholderError"));
      error = true;
    } else {
      setDimensionPlaceholder(t("dimensionPlaceholder"));
    }

    if (!evalLLM) {
      setLLMPlaceholder(t("llmPlaceholderError"));
      error = true;
    } else {
      setLLMPlaceholder(t("llmPlaceholder"));
    }
    if (!evalMethod) {
      setEvalMethodPlaceholder(t("methodPlaceholderError"));
      error = true;
    } else {
      setEvalMethodPlaceholder(t("methodPlaceholder"));
    }

    setHasError(error);

    if (error) return;

    navigate("/plot");
  };

  return (
    <div className="Evaluationpage">
      {/* Header */}
      <Header />
      <Helmet>
        <title>{t("pageTitle")}</title>
        <meta name="description" content={t("description")} />
      </Helmet>
      <div className="evalcontainer">
        {/* Evaluation form */}
        <h3 className="eval-title">{t("title")}</h3>
        <div className="evalinputs">
          <div className="evalinput">
            <label className="evallabel">{t("topicLabel")}</label>
            <select
              name="evaldimension"
              id="evaldimension"
              className={`evaldimension ${hasError && !evalDimension ? "error" : ""}`}
              value={evalDimension}
              onChange={(e) => setEvalDimension(e.target.value)}
            >
              <option value="" disabled>{dimensionPlaceholder}</option>
              <option value="food">{t("food")}</option>
              <option value="sport">{t("sport")}</option>
              <option value="family">{t("family")}</option>
              <option value="education">{t("education")}</option>
              <option value="holidays">{t("holidays")}</option>
              <option value="work-life">{t("workLife")}</option>
              <option value="greeting">{t("greeting")}</option>

            </select>
          </div>

          <div className="evalinput">
            <label className="evallabel">{t("llmLabel")}</label>
            <select
              name="evalLLM"
              id="evalLLM"
              className={`llm ${hasError && !evalLLM ? "error" : ""}`}
              value={evalLLM}
              onChange={(e) => setEvalLLM(e.target.value)}
            >
              <option value="" disabled>{llmPlaceholder}</option>
              <option value="baseline">{t("baseline")}</option>
              <option value="fine-tuned">{t("fineTuned")}</option>
            </select>
          </div>

          <div className="evalinput">
            <label className="evallabel">{t("methodLabel")}</label>
            <select
              name="evalmethod"
              id="evalmethod"
              className={`evalmethod ${hasError && !evalMethod ? "error" : ""}`}
              value={evalMethod}
              onChange={(e) => setEvalMethod(e.target.value)}
            >
              <option value="" disabled>{evalMethodPlaceholder}</option>
              <option value="car">{t("carScore")}</option>
            </select>
          </div>
        </div>

        <div className="submit-container">
          <div className="evalsubmit">
            <button onClick={handleEvaluateClick}>{t("evaluateButton")}</button>
          </div>
        </div>
      </div>
      {/* Footer */}
      <Footer />
    </div>
  );
};
