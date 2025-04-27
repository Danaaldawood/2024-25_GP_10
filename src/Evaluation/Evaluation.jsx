import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Evaluation.css";
import { Footer } from "../Footer/Footer";
import { Header } from "../Header/Header";
import { Helmet } from "react-helmet";
import { useTranslation } from 'react-i18next';

export const Evaluation = () => {
  const { t } = useTranslation(['evalutionpage']);
  const [evalLLM, setEvalLLM] = useState("");
  const [evalType, setEvalType] = useState("");
  const [llmPlaceholder, setLLMPlaceholder] = useState("");
  const [hasError, setHasError] = useState(false);
  const [hasTypeError, setHasTypeError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLLMPlaceholder(hasError ? t('pleaseSelectModel') : t('selectModelPlaceholder'));
  }, [t, hasError]);

  // Clear error state when a selection is made
  useEffect(() => {
    if (evalLLM) {
      setHasError(false);
    }
  }, [evalLLM]);

  useEffect(() => {
    if (evalType) {
      setHasTypeError(false);
    }
  }, [evalType]);

  const handleEvaluateClick = (e) => {
    e.preventDefault();
    let error = false;

    if (!evalLLM) {
      setLLMPlaceholder(t('pleaseSelectModel'));
      setHasError(true);
      error = true;
    } else {
      setHasError(false);
    }

    if (!evalType && evalLLM) {
      setHasTypeError(true);
      error = true;
    } else {
      setHasTypeError(false);
    }

    if (error) return;

    console.log("Navigating to Plot with:", { evalLLM, evalType });
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
              className={`llm ${hasError ? "error" : ""}`}
              value={evalLLM}
              onChange={(e) => setEvalLLM(e.target.value)}
            >
              <option value="" disabled>{llmPlaceholder}</option>
              <option value="Baseline">{t('baseline')}</option>
              <option value="Fine-Tuned">{t('fineTuned')}</option>
            </select>
          </div>
          {evalLLM && (
            <div className="evalinput">
              <label className="evallabel">{t('evaluationType')}</label>
              <select
                name="evalType"
                id="evalType"
                className={`llm ${hasTypeError ? "error" : ""}`}
                value={evalType}
                onChange={(e) => setEvalType(e.target.value)}
              >
                <option value="" disabled>{t('selectEvaluationTypePlaceholder')}</option>
                {evalLLM === "Baseline" ? (
                  <>
                    <option value="LLAMA2 Baseline">{t('llamaBaseline')}</option>
                    <option value="Mistral Baseline">{t('cohereBaseline')}</option>
                    <option value="Hofstede Questions-LLAMA2 Model">{t('hofstedeLlama')}</option>
                    <option value="Hofstede Questions-Mistral Model">{t('hofstedeCohere')}</option>
                  </>
                ) : (
                  <>
                    <option value="Mistral Fine-tuned Model">{t('cohereFineTuned')}</option>
                    <option value="Hofstede Questions-Mistral Fine-tuned Model">{t('hofstedeCohereFineTuned')}</option>
                    <option value="Llama2 Fine-tuned Model">{t('LlamaFineTuned')}</option>
                    <option value="Hofstede Questions-Llama2 Fine-tuned Model">{t('hofstedeLlama2FineTuned')}</option>
                  </>
                )}
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