import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Evaluation.css";
import { Footer } from "../Footer/Footer";
import { Header } from "../Header/Header";
import { Helmet } from "react-helmet";
import { useTranslation } from 'react-i18next';

export const Evaluation = () => {
  const { t } = useTranslation(['evalutionpage']);
  const [evalLLM, setEvalLLM] = useState(""); // Selected model
  const [evalType, setEvalType] = useState(""); // Evaluation type selection for Baseline
  const [llmPlaceholder, setLLMPlaceholder] = useState("");
  const [hasError, setHasError] = useState(false);
  const navigate = useNavigate();

  // Update placeholder when language changes
  useEffect(() => {
    setLLMPlaceholder(hasError ? t('pleaseSelectModel') : t('selectModelPlaceholder'));
  }, [t, hasError]);

  const handleEvaluateClick = (e) => {
    e.preventDefault();
    let error = false;

    if (!evalLLM) {
      setLLMPlaceholder(t('pleaseSelectModel'));
      error = true;
    } else {
      setLLMPlaceholder(t('selectModelPlaceholder'));
    }

    setHasError(error);
    if (error) return;

    navigate("/plot", { state: { evalLLM, evalType } });
  };

  return (
    <div className="Evaluationpage">
      <Header />
      <Helmet>
        <title>{t('pageTitle')}</title>
        <meta name="description" content="Evaluation page" />
      </Helmet>

      <div className="evalcontainer">
        <h3 className="eval-title">{t('title')}</h3>
        <div className="evalinputs">
          <div className="evalinput">
            <label className="evallabel">{t('languageModel')}</label>
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
              <option value="Baseline">{t('baseline')}</option>
              <option value="Fine-Tuned">{t('fineTuned')}</option>
            </select>
          </div>
          {evalLLM === "Baseline" && (
            <div className="evalinput">
              <label className="evallabel">{t('evaluationType')}</label>
              <select
                name="evalType"
                id="evalType"
                className="llm"
                value={evalType}
                onChange={(e) => setEvalType(e.target.value)}
              >
                <option value="" disabled>
                  {t('selectEvaluationTypePlaceholder')}
                </option>
                <option value="LLAMA2 Baseline">{t('llamaBaseline')}</option>
                <option value="Cohere Baseline">{t('cohereBaseline')}</option>
                <option value="Hofstede Questions-LLAMA2 Model">{t('hofstedeLlama')}</option>
                <option value="Hofstede Questions-Cohere Model">{t('hofstedeCohere')}</option>
              </select>
            </div>
          )}
          {evalLLM === "Fine-Tuned" && (
            <div className="evalinput">
              <label className="evallabel">{t('evaluationType')}</label>
              <select
                name="evalType"
                id="evalType"
                className="llm"
                value={evalType}
                onChange={(e) => setEvalType(e.target.value)}
              >
                <option value="" disabled>
                  {t('selectEvaluationTypePlaceholder')}
                </option>
                <option value="Cohere Fine-tuned Model">{t('cohereFineTuned')}</option>
                <option value="Hofstede Questions-Cohere Fine-tuned Model">{t('hofstedeCohereFineTuned')}</option>
              </select>
            </div>
          )}
        </div>
        <div className="submit-container">
          <button className='evalsubmit' onClick={handleEvaluateClick}>{t('evaluateButton')}</button>
        </div>
      </div>
      <Footer />
    </div>
  );
};