import React, { useState } from 'react';
import './AdminPage.css';
import { useNavigate } from 'react-router-dom';
import Logo from '../images/Logo.png';
import { Footer } from '../Footer/Footer';
import { Helmet } from 'react-helmet';
import { realtimeDb } from '../Register/firebase';
import { ref, push } from "firebase/database";

export const AdminPage = () => {
  const [view, setView] = useState('moderator-requests');
  const [requests, setRequests] = useState([
    { id: 1, moderatorId: 'mod_123', reason: 'Review and approve cultural dataset updates for accurate subculture representation in Arabic regions.', status: 'Pending' },
    { id: 2, moderatorId: 'mod_456', reason: 'Review and approve cultural dataset updates for accurate subculture representation in Wastren regions.', status: 'Pending' },
    { id: 3, moderatorId: 'mod_789', reason: 'Review and approve cultural dataset updates for accurate subculture representation in Chiness regions.', status: 'Pending' },
    { id: 4, moderatorId: 'mod_101', reason: '', status: 'Pending' },
    { id: 5, moderatorId: 'mod_102', reason: '', status: 'Pending' },
    { id: 6, moderatorId: 'mod_103', reason: '', status: 'Pending' },
    { id: 7, moderatorId: 'mod_104', reason: '', status: 'Pending' },
    { id: 8, moderatorId: 'mod_105', reason: '', status: 'Pending' },
  ]);
  
  // Add missing state variables for form inputs
  const [modelName, setModelName] = useState('');
  const [modelVision, setModelVision] = useState('');
  const [modelRegion, setModelRegion] = useState('');
  const [modelUrl, setModelUrl] = useState('');
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  // Approve a moderator request
  const handleApproveRequest = (id) => {
    setRequests(requests.map(request => 
      request.id === id ? { ...request, status: 'Approved' } : request
    ));
  };

  // Deny a moderator request
  const handleDenyRequest = (id) => {
    setRequests(requests.map(request => 
      request.id === id ? { ...request, status: 'Denied' } : request
    ));
  };

  // Handle model upload logic
  const handleModelUpload = async (e) => {
    e.preventDefault();
  
    const newErrors = {};
    if (!/^[A-Za-z\s]+$/.test(modelName)) newErrors.modelName = "Only letters and spaces allowed.";
    if (!/^[A-Za-z\s]+$/.test(modelRegion)) newErrors.modelRegion = "Only letters and spaces allowed.";
    if (!modelName) newErrors.modelName = "This field is required.";
    if (!modelVision) newErrors.modelVision = "This field is required.";
    if (!modelRegion) newErrors.modelRegion = "This field is required.";
    if (!modelUrl) newErrors.modelUrl = "This field is required.";
    else if (!/^https:\/\/huggingface\.co\/[\w\-]+\/[\w\-]+$/.test(modelUrl)) newErrors.modelUrl = "Invalid Hugging Face URL format.";

    // Show any validation errors
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // Upload valid model
    try {
      const modelRef = ref(realtimeDb, 'FineTunedModels/');
      await push(modelRef, {
        modelName,
        modelVision,
        region: modelRegion,
        huggingFaceURL: modelUrl,
        timestamp: new Date().toISOString(),
      });
  
      alert("Model uploaded and saved successfully.");
      setModelName('');
      setModelVision('');
      setModelRegion('');
      setModelUrl('');
      setErrors({});
    } catch (error) {
      console.error("Error saving model:", error);
      alert("Upload failed: " + error.message);
    }
  };
  
  return (
    <div className="admin-container">
      <Helmet>
        <title>Admin Page</title>
        <meta name="description" content="Admin control panel for managing moderator requests and model updates" />
      </Helmet>

      <header className="header">
        <div className="header-left">
          <img src={Logo} alt="CultureLens Logo" className="logo-img" />
          <h1 className="logo-title">CultureLens</h1>
        </div>
      </header>

      <div className="admin-header-banner">
        <h1>Admin Dashboard</h1>
      </div>

      <div className="admin-toggle-buttons">
        <button className={view === 'moderator-requests' ? 'active' : ''} onClick={() => setView('moderator-requests')}>
          Moderator Requests
        </button>
        <button className={view === 'model-upload' ? 'active' : ''} onClick={() => setView('model-upload')}>
          Upload Model
        </button>
      </div>

      {view === 'moderator-requests' && (
        <div className="requests-section">
          {requests.map(request => (
            <div className="request-card" key={request.id}>
              <h3>Moderator ID: {request.moderatorId}</h3>
              <p><strong>Request:</strong> {request.reason}</p>
              <p><strong>Status:</strong> {request.status}</p>
              <div className="request-card-actions">
                <button className="approve-btn" onClick={() => handleApproveRequest(request.id)}>Approve</button>
                <button className="deny-btn" onClick={() => handleDenyRequest(request.id)}>Deny</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'model-upload' && (
        <div className="model-upload-section">
          <h2>Upload Fine-Tuned Language Model</h2>
          <form onSubmit={handleModelUpload}>
            <div className="form-group">
              <label>Language Model Name:</label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className={errors.modelName ? "error-input" : ""}
              />
              {errors.modelName && <span className="error-text">{errors.modelName}</span>}
            </div>

            <div className="form-group">
              <label>Language Model Vision:</label>
              <input
                type="text"
                value={modelVision}
                onChange={(e) => setModelVision(e.target.value)}
                className={errors.modelVision ? "error-input" : ""}
              />
              {errors.modelVision && <span className="error-text">{errors.modelVision}</span>}
            </div>

            <div className="form-group">
              <label>Fine-Tune Region:</label>
              <input
                type="text"
                value={modelRegion}
                onChange={(e) => setModelRegion(e.target.value)}
                className={errors.modelRegion ? "error-input" : ""}
              />
              {errors.modelRegion && <span className="error-text">{errors.modelRegion}</span>}
            </div>

            <div className="form-group">
              <label>Link to Cloud Fine-Tuned LLM (Hugging Face):</label>
              <input
                type="text"
                value={modelUrl}
                onChange={(e) => setModelUrl(e.target.value)}
                className={errors.modelUrl ? "error-input" : ""}
              />
              {errors.modelUrl && <span className="error-text">{errors.modelUrl}</span>}
            </div>

            <button className="upload-btn" type="submit">Upload</button>
          </form>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AdminPage;