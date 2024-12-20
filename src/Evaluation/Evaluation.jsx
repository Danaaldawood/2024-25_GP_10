// --- Imports ---
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Evaluation.css";
import logo from "../images/Logo.png";
import { Footer } from "../Footer/Footer";
import { Header } from "../Header/Header";
import { Helmet } from "react-helmet";

export const Evaluation = () => {
  // --- State Management ---
  const [evalTopic, setEvalTopic] = useState("");
  const [evalLLM, setEvalLLM] = useState("");
  const [evalMethod, setEvalMethod] = useState("");

  // Placeholder texts for dropdowns
  const [topicPlaceholder, setTopicPlaceholder] = useState("Select a topic");
  const [llmPlaceholder, setLLMPlaceholder] = useState("Select a model");
  const [evalMethodPlaceholder, setEvalMethodPlaceholder] = useState(
    "Select evaluation method"
  );

  // Error state
  const [hasError, setHasError] = useState(false);

  const navigate = useNavigate();

  // --- Form Submission Handler ---
  const handleEvaluateClick = (e) => {
    e.preventDefault();
    let error = false;

    // Validate topic selection
    if (!evalTopic) {
      setTopicPlaceholder("Please select a topic");
      error = true;
    } else {
      setTopicPlaceholder("Select a topic");
    }

    // Validate model selection
    if (!evalLLM) {
      setLLMPlaceholder("Please select a model");
      error = true;
    } else {
      setLLMPlaceholder("Select a model");
    }

    // Validate evaluation method selection
    if (!evalMethod) {
      setEvalMethodPlaceholder("Please select evaluation method");
      error = true;
    } else {
      setEvalMethodPlaceholder("Select evaluation method");
    }

    setHasError(error);

    // Navigate only if no errors
    if (error) return;
    navigate("/plot");
  };

  return (
    <div className="Evaluationpage">
      {/* Header and Meta Tags */}
      <Header />
      <Helmet>
        <title>Evaluation</title>
        <meta name="description" content="Evaluation page" />
      </Helmet>

      {/* Main Content Container */}
      <div className="evalcontainer">
        {/* Form Title */}
        <h3 className="eval-title">Evaluation</h3>

        {/* Form Inputs Section */}
        <div className="evalinputs">
          {/* Topic Selection Dropdown */}
          <div className="evalinput">
            <label className="evallabel">Topic:</label>
            <select
              name="evalTopic"
              id="evalTopic"
              className={`evalTopic ${hasError && !evalTopic ? "error" : ""}`}
              value={evalTopic}
              onChange={(e) => setEvalTopic(e.target.value)}
            >
              <option value="" disabled>
                {topicPlaceholder}
              </option>
              <option value="food">Food</option>
              <option value="sport">Sport</option>
              <option value="family">Family</option>
              <option value="education">Education</option>
              <option value="holidays">Holidays</option>
              <option value="work-life">Work-life</option>
              <option value="greeting">Greeting</option>
            </select>
          </div>

          {/* Language Model Selection Dropdown */}
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
              <option value="baseline">Baseline model</option>
              <option value="fine-tuned">Fine-tuned model</option>
            </select>
          </div>

          {/* Evaluation Method Selection Dropdown */}
          <div className="evalinput">
            <label className="evallabel">Evaluation Method:</label>
            <select
              name="evalmethod"
              id="evalmethod"
              className={`evalmethod ${hasError && !evalMethod ? "error" : ""}`}
              value={evalMethod}
              onChange={(e) => setEvalMethod(e.target.value)}
            >
              <option value="" disabled>
                {evalMethodPlaceholder}
              </option>
              <option value="car">CAR score</option>
            </select>
          </div>
        </div>

        {/* Submit Button Section */}
        <div className="submit-container">
          <div className="evalsubmit">
            <button onClick={handleEvaluateClick}>Evaluate</button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};
