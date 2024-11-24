import { useEffect, useState } from 'react';
import { db, auth } from './firebase';
import { collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import './AdminPage.css';
import { Helmet } from 'react-helmet';
import LOGO from '../images/Logo.png';
import SignOutConfirmation from '../Modorater/SignOutConfirmation';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

export const AdminPage = () => {
  const [view, setView] = useState('moderator-requests');
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [modelName, setModelName] = useState('');
  const [modelVision, setModelVision] = useState('');
  const [fineTuneRegion, setFineTuneRegion] = useState('');
  const [cloudLink, setCloudLink] = useState('');
  const [errors, setErrors] = useState({});
  const [showPopup, setShowPopup] = useState({ type: null, message: '' });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchModeratorRequests = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'Moderators'));
        const requestsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRequests(requestsData);
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchModeratorRequests();
  }, []);

  const validateInputs = () => {
    const newErrors = {};

    // Validation for empty fields (highlight only)
    if (!modelName.trim()) {
      newErrors.modelName = true;
    }
    if (!modelVision.trim()) {
      newErrors.modelVision = true;
    }
    if (!fineTuneRegion.trim()) {
      newErrors.fineTuneRegion = true;
    }
    if (!cloudLink.trim()) {
      newErrors.cloudLink = true;
    }

    // Validation for invalid input values (non-empty but incorrect)
    if (modelName.trim() && /[^a-zA-Z\s]/.test(modelName)) {
      newErrors.modelName = 'Invalid model name. Only letters and spaces are allowed.';
    }
    if (fineTuneRegion.trim() && /[^a-zA-Z\s]/.test(fineTuneRegion)) {
      newErrors.fineTuneRegion = 'Invalid region name. Only letters and spaces are allowed.';
    }
    if (cloudLink.trim() && !/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(cloudLink)) {
      newErrors.cloudLink = 'Invalid URL. Please enter a valid URL.';
    }

    return newErrors;
  };

  const handleModelUpload = (e) => {
    e.preventDefault();
    const newErrors = validateInputs();
    const hasInvalidValues = Object.values(newErrors).some(
      (value) => typeof value === 'string' // Check if the error is an invalid message, not just true for empty fields
    );

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors); // Highlight invalid inputs

      // Show error popup if there are invalid values (not empty fields)
      if (hasInvalidValues) {
        setShowPopup({ type: 'error', message: 'Please correct the invalid fields and try again.' });
      }
      return;
    }

    // Clear fields and display success message
    console.log('Model Uploaded:', { modelName, modelVision, fineTuneRegion, cloudLink });
    setErrors({});
    setModelName('');
    setModelVision('');
    setFineTuneRegion('');
    setCloudLink('');
    setShowPopup({ type: 'success', message: 'Model uploaded successfully!' });

    // Automatically hide the success popup after 3 seconds
    setTimeout(() => {
      setShowPopup({ type: null, message: '' });
    }, 3000);
  };

  const handleApproveRequest = async (id, email) => {
    if (!email.trim()) {
      alert('Email is missing for this request.');
      return;
    }
    try {
      const updatedRequests = requests.map((request) =>
        request.id === id ? { ...request, status: 'Approved' } : request
      );
      setRequests(updatedRequests);

      const docRef = doc(db, 'Moderators', id);
      await updateDoc(docRef, { status: 'Approved' });

      alert('Request approved and email sent!');
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const handleDenyRequest = async (id, email) => {
    if (!email.trim()) {
      alert('Email is missing for this request.');
      return;
    }
    try {
      const updatedRequests = requests.filter((request) => request.id !== id);
      setRequests(updatedRequests);

      const docRef = doc(db, 'Moderators', id);
      await deleteDoc(docRef);

      alert('Request denied and email sent!');
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const filteredRequests = statusFilter === 'all'
    ? requests
    : requests.filter((request) => request.status === statusFilter);

  const handleSignOut = () => setShowSignOutModal(true);

  const confirmSignOut = () => {
    signOut(auth)
      .then(() => navigate('/'))
      .catch((error) => console.error('Error during sign-out:', error));
    setShowSignOutModal(false);
  };

  const cancelSignOut = () => setShowSignOutModal(false);

  const handleClosePopup = () => {
    setShowPopup({ type: null, message: '' });
  };

  const handleInputChange = (e, field) => {
    const { value } = e.target;

    // Update field values
    switch (field) {
      case 'modelName':
        setModelName(value);
        break;
      case 'modelVision':
        setModelVision(value);
        break;
      case 'fineTuneRegion':
        setFineTuneRegion(value);
        break;
      case 'cloudLink':
        setCloudLink(value);
        break;
      default:
        break;
    }

    // Remove error dynamically if the input is valid
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      if (value.trim() !== '') {
        delete newErrors[field];
      }
      if (field === 'modelName' && /^[a-zA-Z\s]*$/.test(value)) {
        delete newErrors.modelName;
      }
      if (field === 'fineTuneRegion' && /^[a-zA-Z\s]*$/.test(value)) {
        delete newErrors.fineTuneRegion;
      }
      if (field === 'cloudLink' && /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(value)) {
        delete newErrors.cloudLink;
      }
      return newErrors;
    });
  };

  const iconStyles = {
    fontSize: '48px',
    color: '#28a745',
    marginBottom: '15px',
  };

  return (
    <div>
      <Helmet>
        <title>Admin Page</title>
        <meta name="description" content="Admin control panel for managing moderator requests and model updates" />
      </Helmet>

      <header className="header-admin">
        <div className="header-left">
          <img src={LOGO} alt="CultureLens Logo" className="logo-img" />
          <h1 className="logo-title">CultureLens</h1>
        </div>

        <button className="Adminlogout-btn" onClick={handleSignOut}>
          Log out
        </button>
        {showSignOutModal && <SignOutConfirmation onConfirm={confirmSignOut} onCancel={cancelSignOut} />}
      </header>

      <div className="admin-header-banner">
        <h1>Admin Dashboard</h1>
      </div>

      <div className="admin-toggle-buttons">
        <button className={view === 'moderator-requests' ? 'active' : ''} onClick={() => setView('moderator-requests')}>
          Moderator Requests
        </button>
        <button className={view === 'model-upload' ? 'active' : ''} onClick={() => setView('model-upload')}>
          Upload
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {view === 'moderator-requests' && !loading && !error && (
        <div className="requests-section">
          <div className="filter-container">
            <label htmlFor="status-filter">Filter by Status:</label>
            <select id="status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Denied">Denied</option>
            </select>
          </div>
          {filteredRequests.length === 0 ? (
            <div>No requests available.</div>
          ) : (
            <table className="requests-table">
              <thead>
                <tr>
                  <th>Moderator ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Region</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.id}>
                    <td>{request.Moderator_Id}</td>
                    <td>{request.fullName}</td>
                    <td>{request.email}</td>
                    <td>{request.regionM}</td>
                    <td>{request.reason}</td>
                    <td className={`status status-${request.status?.toLowerCase()}`}>{request.status}</td>
                    <td>
                      {request.status !== 'Approved' && (
                        <button className="approve-btn" onClick={() => handleApproveRequest(request.id, request.email)}>
                          Approve
                        </button>
                      )}
                      {request.status !== 'Denied' && (
                        <button className="deny-btn" onClick={() => handleDenyRequest(request.id, request.email)}>
                          Deny
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {view === 'model-upload' && (
        <div className="model-upload-section">
          <h2>Upload Fine-Tuned Model</h2>
          <form className="model-upload-form" onSubmit={handleModelUpload}>
            <div className="form-group">
              <label htmlFor="modelName">Language Model Name:</label>
              <input
                type="text"
                id="modelName"
                placeholder="Enter Language Model Name"
                className={`input-field ${errors.modelName ? 'error' : ''}`}
                value={modelName}
                onChange={(e) => handleInputChange(e, 'modelName')}
              />
            </div>
            <div className="form-group">
              <label htmlFor="modelVision">Language Model Vision:</label>
              <input
                type="text"
                id="modelVision"
                placeholder="Enter Language Model Vision"
                className={`input-field ${errors.modelVision ? 'error' : ''}`}
                value={modelVision}
                onChange={(e) => handleInputChange(e, 'modelVision')}
              />
            </div>
            <div className="form-group">
              <label htmlFor="fineTuneRegion">Fine-Tune Region:</label>
              <input
                type="text"
                id="fineTuneRegion"
                placeholder="Enter Fine-Tune Region"
                className={`input-field ${errors.fineTuneRegion ? 'error' : ''}`}
                value={fineTuneRegion}
                onChange={(e) => handleInputChange(e, 'fineTuneRegion')}
              />
            </div>
            <div className="form-group">
              <label htmlFor="cloudLink">Link to Cloud Fine-Tuned LLM:</label>
              <input
                type="url"
                id="cloudLink"
                placeholder="Enter a valid URL"
                className={`input-field ${errors.cloudLink ? 'error' : ''}`}
                value={cloudLink}
                onChange={(e) => handleInputChange(e, 'cloudLink')}
              />
            </div>
            <button type="submit" className="upload-btn">Submit</button>
          </form>
        </div>
      )}

      {showPopup.type && (
        <div className={showPopup.type === 'error' ? 'error-popup' : 'success-popup'}>
          {showPopup.type === 'error' && (
            <>
              <div className="error-title">Error</div>
              <div className="error-message">{showPopup.message}</div>
              <div className="error-actions">
                <button className="confirm-btn" onClick={handleClosePopup}>OK</button>
              </div>
            </>
          )}
          {showPopup.type === 'success' && (
            <>
              <FontAwesomeIcon icon={faCheckCircle} style={iconStyles} />
              <div className="success-message">{showPopup.message}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
