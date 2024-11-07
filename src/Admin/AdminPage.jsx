import React, { useState } from 'react';
import './AdminPage.css';
import { useNavigate } from 'react-router-dom';
import Logo from '../images/Logo.png';
import { Footer } from '../Footer/Footer';
import { Helmet } from 'react-helmet';

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

  const navigate = useNavigate();

  const handleApproveRequest = (id) => {
    setRequests(requests.map(request => 
      request.id === id ? { ...request, status: 'Approved' } : request
    ));
  };

  const handleDenyRequest = (id) => {
    setRequests(requests.map(request => 
      request.id === id ? { ...request, status: 'Denied' } : request
    ));
  };

  const handleModelUpload = () => {
    alert('Model has been successfully uploaded.');
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
          <h2>Upload Fine-Tuned Model</h2>
          <div className="model-upload-box" onClick={handleModelUpload}>
            <p>Click here to upload a new LLM model</p>
          </div>
          <button className="upload-btn" onClick={handleModelUpload}>Confirm Upload</button>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AdminPage;
