import { useEffect, useState } from 'react';
import { db, auth } from './firebase';
import { collection, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
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
  const [statusFilter, setStatusFilter] = useState('all'); // New state for filter
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false); 
  const navigate = useNavigate();
 
   // Load moderator requests from Firestore
  useEffect(() => {
    const fetchModeratorRequests = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'Moderators'));
        const requestsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return { id: doc.id, ...data };
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
  const handleModelUpload = () => {
    alert('Model has been successfully uploaded.');
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
      const updatedRequests = requests.filter(request => request.id !== id);
      setRequests(updatedRequests);

      const docRef = doc(db, 'Moderators', id);
      await deleteDoc(docRef);  // Delete the document from Firestore

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
     

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

   

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
   

  {/* Log Out button directly in the header */}
  <button className="Adminlogout-btn" onClick={handleSignOut}>
    Log out
  </button>

  {/* sign-out confirmation modal */}
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
                              <th>Status</th>
                              <th>Actions</th>
                          </tr>
                      </thead>
                      <tbody>
                        {filteredRequests.map(request => (
                            <tr key={request.id}>
                                <td>{request.Moderator_Id}</td>
                                <td>{request.fullName}</td>
                                <td>{request.email}</td>
                                <td>{request.regionM}</td>
                                <td>{request.reason}</td>
                                <td className={`status status-${request.status ? request.status.toLowerCase() : ''}`}>
                                    {request.status}
                                </td>

                                <td>
  <div className="button-container">
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
  </div>
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
          <div className="model-upload-box" onClick={handleModelUpload}>
            <p>Click here to upload a new LLM model</p>
          </div>
          <button className="upload-btn" onClick={handleModelUpload}>Confirm Upload</button>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
