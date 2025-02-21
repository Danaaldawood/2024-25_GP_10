import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Evaluation.css";
import { Footer } from "../Footer/Footer";
import { Header } from "../Header/Header";
import { Helmet } from "react-helmet";

export const Evaluation = () => {
  const [evalLLM, setEvalLLM] = useState(""); // Selected model
  const [evalType, setEvalType] = useState(""); // Evaluation type selection for Baseline
  const [llmPlaceholder, setLLMPlaceholder] = useState("Select a model");
  const [hasError, setHasError] = useState(false);
  const navigate = useNavigate();

  const handleEvaluateClick = (e) => {
    e.preventDefault();
    let error = false;

    if (!evalLLM) {
      setLLMPlaceholder("Please select a model");
      error = true;
    } else {
      setLLMPlaceholder("Select a model");
    }

    setHasError(error);
    if (error) return;

    navigate("/plot", { state: { evalLLM, evalType } });
  };

  return (
    <div className="Evaluationpage">
      <Header />
      <Helmet>
        <title>Evaluation</title>
        <meta name="description" content="Evaluation page" />
      </Helmet>

      <div className="evalcontainer">
        <h3 className="eval-title">Evaluation</h3>
        <div className="evalinputs">
          <div className="evalinput">
            <label className="evallabel">Language Model:</label>
            <select
              name="evalLLM"
              id="evalLLM"
              className={`llm ${hasError && !evalLLM ? "error" : ""}`}
              value={evalLLM}
              onChange={(e) => setEvalLLM(e.target.value)}
            >
              <option value="" disabled>
                {llmPlaceholder}
              </option>
              <option value="Baseline">Baseline</option>
              <option value="Fine-Tuned">Fine-Tuned</option>
            </select>
          </div>
          {evalLLM === "Baseline" && (
            <div className="evalinput">
              <label className="evallabel">Evaluation Type:</label>
              <select
                name="evalType"
                id="evalType"
                className="llm"
                value={evalType}
                onChange={(e) => setEvalType(e.target.value)}
              >
                <option value="" disabled>
                  Select evaluation type
                </option>
                <option value="LLAMA2 Baseline">LLAMA2 Baseline</option>
                <option value="Hofstede Questions-LLAMA2 Model">Hofstede Questions-LLAMA2 Model</option>
                <option value="Hofstede Questions-Cohere Model">Hofstede Questions-Cohere Model</option>
              </select>
            </div>
          )}
        </div>
        <div className="submit-container">
          <button className='evalsubmit' onClick={handleEvaluateClick}>Evaluate</button>
        </div>
      </div>
      <Footer />
    </div>
  );
};
