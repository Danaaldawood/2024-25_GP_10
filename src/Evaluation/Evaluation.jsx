import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Evaluation.css";
import { Footer } from "../Footer/Footer";
import { Header } from "../Header/Header";
import { Helmet } from "react-helmet";

export const Evaluation = () => {
  const [evalTopic, setEvalTopic] = useState(""); // Selected topic
  const [evalLLM, setEvalLLM] = useState(""); // Selected model

  const [topicPlaceholder, setTopicPlaceholder] = useState("Select a topic");
  const [llmPlaceholder, setLLMPlaceholder] = useState("Select a model");
  const [hasError, setHasError] = useState(false);

  const navigate = useNavigate();

  const handleEvaluateClick = (e) => {
    e.preventDefault();
    let error = false;

    if (!evalTopic) {
      setTopicPlaceholder("Please select a topic");
      error = true;
    } else {
      setTopicPlaceholder("Select a topic");
    }

    if (!evalLLM) {
      setLLMPlaceholder("Please select a model");
      error = true;
    } else {
      setLLMPlaceholder("Select a model");
    }

    setHasError(error);

    if (error) return;

    navigate("/plot", { state: { evalTopic, evalLLM } });
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
              <option value="All Topics">All Topics</option>
              <option value="food">Food</option>
              <option value="sport">Sport</option>
              <option value="family">Family</option>
              <option value="education">Education</option>
              <option value="Holidays/Celebration/Leisure">Holidays/Celebration/Leisure </option>
              <option value="work life">Work life</option>
              <option value="greeting">Greeting</option>
            </select>
          </div>
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
              <option value="Version 1">Version 1</option>
              <option value="Fine-Tuned">Fine-Tuned</option>
            </select>
          </div>
        </div>
        <div className="submit-container">
          <button className= 'evalsubmit'onClick={handleEvaluateClick}>Evaluate</button>
        </div>
      </div>
      <Footer />
    </div>
  );
};
