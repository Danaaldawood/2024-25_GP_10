import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { db, auth } from './firebase';
import { collection, getDocs, updateDoc, doc, deleteDoc,query ,orderBy} from "firebase/firestore";
import emailjs from 'emailjs-com';
import './AdminPage.css';
import { Helmet } from 'react-helmet';
import { Footer } from '../Footer/Footer';
import LOGO from '../images/Logo.png';
import SignOutConfirmation from '../Modorater/SignOutConfirmation'; 
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth'; 
 
 

export const AdminPage = () => {
  const [view, setView] = useState('moderator-requests');
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all'); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false); 
  const [modelName, setModelName] = useState('');
  const [modelVision, setModelVision] = useState('');
  const [fineTuneRegion, setFineTuneRegion] = useState('');
  const [cloudLink, setCloudLink] = useState('');
  const [errors, setErrors] = useState({});
  const [showPopup, setShowPopup] = useState({ type: null, message: '' });
  const navigate = useNavigate();

  // Load moderator requests from Firestore
  useEffect(() => {
    const fetchModeratorRequests = async () => {
      try {
        const q = query(collection(db, 'Moderators'), orderBy('RequestDate', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const requestsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
  
          const customId = `Moderator_${doc.id.slice(-4).toUpperCase()}`;

          return { id: customId, ...data };
        });
        setRequests(requestsData);
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
  
    fetchModeratorRequests();
  }, []);
  
  
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
      return newErrors;
    });
  };

  const handleModelUpload = (e) => {
    e.preventDefault();

    const newErrors = {};

    // Validate form fields
    if (!modelName.trim()) {
      newErrors.modelName = true;
    } else if (/[^a-zA-Z\s]/.test(modelName)) {
      setShowPopup({ type: 'error', message: 'Language Model Name should only contain letters and spaces.' });
      return;
    }

    if (!modelVision.trim()) {
      newErrors.modelVision = true;
    }

    if (!fineTuneRegion.trim()) {
      newErrors.fineTuneRegion = true;
    } else if (/[^a-zA-Z\s]/.test(fineTuneRegion)) {
      setShowPopup({ type: 'error', message: 'Fine-Tune Region should only contain letters and spaces.' });
      return;
    }

    if (!cloudLink.trim()) {
      newErrors.cloudLink = true;
    } else if (!/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(cloudLink)) {
      newErrors.cloudLink = 'Invalid URL. Please enter a valid URL.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // If no errors, show success message
    console.log('Model Uploaded:', { modelName, modelVision, fineTuneRegion, cloudLink });
    setErrors({});
    setModelName('');
    setModelVision('');
    setFineTuneRegion('');
    setCloudLink('');
    setShowPopup({ type: 'success', message: 'Model uploaded successfully!' });

    // Hide success popup after 3 seconds
    setTimeout(() => {
      setShowPopup({ type: null, message: '' });
    }, 3000);
  };
  
  // Send email based on approval or denial
  const sendEmail = async (recipientEmail, subject, message) => {
    if (!recipientEmail || recipientEmail.trim() === "") {
      console.error("Email is empty, cannot send email.");
      alert("Email address is missing or invalid.");
      return;
    }
  
    const templateId = subject === 'Approval Notification' 
    ? 'template_p63o225'  //   template ID for approval
    : 'template_iwkfwin';  //template ID for denial

    const serviceId = 'service_x8k8qvv';  //  service ID
    const publicKey = 'ItSVToYmWJ3KR2fkX';  //  public key
  
    try {
      await emailjs.send(
        serviceId,
        templateId,
        {
          to_email: recipientEmail,  // Use the template variable for the email address
          subject: subject,         // The subject
          message: message,         // The message
        },
        publicKey
      );
      console.log('Email successfully sent.');
    } catch (error) {
      console.error('Error sending email:', error);
      alert(`Email sending failed: ${error.text}`);
    }
  };

  const handleApproveRequest = async (id, email) => {
    if (!email || email.trim() === "") {
      console.error("Cannot approve request, email is missing for ID:", id);
      alert("Email is missing for this request.");
      return;
    }
    try {
      const updatedRequests = requests.map(request =>
        request.id === id ? { ...request, status: 'Approved' } : request
      );
      setRequests(updatedRequests);

      const docRef = doc(db, 'Moderators', id);
      await updateDoc(docRef, { status: 'Approved' });

      // Send email notification
      sendEmail(email, 'Approval Notification', 'Your moderator request has been approved!');
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const handleDenyRequest = async (id, email) => {
    if (!email || email.trim() === "") {
      console.error("Cannot deny request, email is missing for ID:", id);
      alert("Email is missing for this request.");
      return;
    }
    try {
      // Remove the request from the table and Firestore
      const updatedRequests = requests.map(request =>
        request.id === id ? { ...request, status: 'Denied' } : request
      );
      setRequests(updatedRequests);
      
      const docRef = doc(db, 'Moderators', id);
      await updateDoc(docRef, { status: 'Denied' });  // Update the status in Firestore
      

      // Send email notification
      sendEmail(email, 'Denial Notification', 'Your moderator request has been denied.');
    } catch (err) {
      setError('Failed to update status');
      console.error(err);
    }
  };

  const filteredRequests = statusFilter === 'all'
    ? requests
    : requests.filter(request => request.status === statusFilter);

  const handleSignOut = () => {
    setShowSignOutModal(true);
  };

  const confirmSignOut = () => {
    signOut(auth)
      .then(() => {
        navigate('/'); 
      })
      .catch((error) => {
        console.error('Error during sign-out:', error);
      });
    setShowSignOutModal(false); 
  };

  const cancelSignOut = () => {
    setShowSignOutModal(false); 
  };

  return (
    <div className="main-content">
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
  
        {showSignOutModal && (
          <SignOutConfirmation onConfirm={confirmSignOut} onCancel={cancelSignOut} />
        )}
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

      {loading && <div>Loading...</div>}
      {error && <div className="error">{error}</div>}

      {view === 'moderator-requests' && !loading && !error && (
        <div className="requests-section">
          <div className="filter-container">
            <label htmlFor="status-filter">Filter by Status: </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
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
                  <th>Request Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map(request => (
                  <tr key={request.id}> {/* استخدم الـ id المعدل هنا */}
                  <td>{request.id}</td> {/* عرض الـ id المعدل */}
                    <td>{request.fullName}</td>
                    <td>{request.email}</td>
                    <td>{request.regionM}</td>
                    <td>{request.reason}</td>
                    <td>{request.RequestDate ? new Date(request.RequestDate).toLocaleString() : 'N/A'}</td> {/* Display Request Date */}
                    <td className={`status status-${request.status ? request.status.toLowerCase() : ''}`}>
                      {request.status}
                    </td>
                    <td style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
            <button type="submit" className="upload-btn">Upload</button>
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
                <button className="confirm-btn" onClick={() => setShowPopup({ type: null, message: '' })}>OK</button>
              </div>
            </>
          )}
          {showPopup.type === 'success' && (
            <>
              <FontAwesomeIcon icon={faCheckCircle} style={{ color: 'green', fontSize: '24px' }} />
              <div className="success-message">{showPopup.message}</div>
            </>
          )}
        </div>
      )}
 
 
 <footer className="footer-admin">
  <p style={{ color: "white" }}>©2024 CultureLens. All rights reserved.</p>
</footer>
 
  

     </div>
  );
};

export default AdminPage;