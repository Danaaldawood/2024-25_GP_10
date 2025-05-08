import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { db, auth } from "./firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import emailjs from "emailjs-com";
import "./AdminPage.css";
import { Helmet } from "react-helmet";
import { Footer } from "../Footer/Footer";
import LOGO from "../images/Logo.png";
import SignOutConfirmation from "../Modorater/SignOutConfirmation";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
 
export const AdminPage = () => {
  // State variables
  const [view, setView] = useState("moderator-requests");
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [modelName, setModelName] = useState("");
  const [modelVision, setModelVision] = useState("");
  const [fineTuneRegion, setFineTuneRegion] = useState("");
  const [cloudLink, setCloudLink] = useState("");
  const [errors, setErrors] = useState({});
  const [showPopup, setShowPopup] = useState({ type: null, message: "" });
  const navigate = useNavigate();

  // Load moderator requests from Firestore
  useEffect(() => {
    const fetchModeratorRequests = async () => {
      try {
        const q = query(
          collection(db, "Moderators"),
          orderBy("RequestDate", "desc")
        );
        const querySnapshot = await getDocs(q);

        const requestsData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const displayId = `Moderator_${doc.id.slice(-4).toUpperCase()}`;
          return {
            id: doc.id,
            displayId: displayId,
            ...data,
          };
        });
        setRequests(requestsData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data");
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
      case "modelName":
        setModelName(value);
        break;
      case "modelVision":
        setModelVision(value);
        break;
      case "fineTuneRegion":
        setFineTuneRegion(value);
        break;
      case "cloudLink":
        setCloudLink(value);
        break;
      default:
        break;
    }

    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      if (value.trim() !== "") {
        delete newErrors[field];
      }
      return newErrors;
    });
  };

  // Handle model upload form submission
  const handleModelUpload = (e) => {
    e.preventDefault();

    const newErrors = {};

    // Validate form fields
    if (!modelName.trim()) {
      newErrors.modelName = true;
    } else if (/[^a-zA-Z\s]/.test(modelName)) {
      setShowPopup({
        type: "error",
        message: "Language Model Name should only contain letters and spaces.",
      });
      return;
    }

    if (!modelVision.trim()) {
      newErrors.modelVision = true;
    }

    if (!fineTuneRegion.trim()) {
      newErrors.fineTuneRegion = true;
    } else if (/[^a-zA-Z\s]/.test(fineTuneRegion)) {
      setShowPopup({
        type: "error",
        message: "Fine-Tune Region should only contain letters and spaces.",
      });
      return;
    }

    if (!cloudLink.trim()) {
      newErrors.cloudLink = true;
    } else if (!/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(cloudLink)) {
      newErrors.cloudLink = "Invalid URL. Please enter a valid URL.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // If no errors, show success message
    console.log("Model Uploaded:", {
      modelName,
      modelVision,
      fineTuneRegion,
      cloudLink,
    });
    setErrors({});
    setModelName("");
    setModelVision("");
    setFineTuneRegion("");
    setCloudLink("");
    setShowPopup({ type: "success", message: "Model uploaded successfully!" });

    // Hide success popup after 3 seconds
    setTimeout(() => {
      setShowPopup({ type: null, message: "" });
    }, 3000);
  };

  // Send email based on approval or denial
  const sendEmail = async (recipientEmail, subject, message) => {
    if (!recipientEmail || recipientEmail.trim() === "") {
      console.error("Email is empty, cannot send email.");
      alert("Email address is missing or invalid.");
      return;
    }

    const templateId =
      subject === "Approval Notification"
        ? "template_p63o225" // template ID for approval
        : "template_iwkfwin"; // template ID for denial

    const serviceId = "service_x8k8qvv"; // service ID
    const publicKey = "ItSVToYmWJ3KR2fkX"; // public key

    try {
      await emailjs.send(
        serviceId,
        templateId,
        {
          to_email: recipientEmail,
          subject: subject,
          message: message,
        },
        publicKey
      );
      console.log("Email successfully sent.");
    } catch (error) {
      console.error("Error sending email:", error);
      alert(`Email sending failed: ${error.text}`);
    }
  };

  const handleApproveRequest = async (request) => {
    if (!request.email || request.email.trim() === "") {
      console.error(
        "Cannot approve request, email is missing for ID:",
        request.displayId
      );
      alert("Email is missing for this request.");
      return;
    }
    try {
      const updatedRequests = requests.map((r) =>
        r.id === request.id ? { ...r, status: "Approved" } : r
      );
      setRequests(updatedRequests);

      const docRef = doc(db, "Moderators", request.id);
      await updateDoc(docRef, { status: "Approved" });

      sendEmail(
        request.email,
        "Approval Notification",
        "Your moderator request has been approved!"
      );
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Failed to update status");
    }
  };

  const handleDenyRequest = async (request) => {
    if (!request.email || request.email.trim() === "") {
      console.error(
        "Cannot deny request, email is missing for ID:",
        request.displayId
      );
      alert("Email is missing for this request.");
      return;
    }
    try {
      const updatedRequests = requests.map((r) =>
        r.id === request.id ? { ...r, status: "Denied" } : r
      );
      setRequests(updatedRequests);

      const docRef = doc(db, "Moderators", request.id);
      await updateDoc(docRef, { status: "Denied" });

      sendEmail(
        request.email,
        "Denial Notification",
        "Your moderator request has been denied."
      );
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Failed to update status");
    }
  };

  // Filter requests based on selected status
  const filteredRequests =
    statusFilter === "all"
      ? requests
      : requests.filter((request) => request.status === statusFilter);

  // Handle sign out
  const handleSignOut = () => {
    setShowSignOutModal(true);
  };

  const confirmSignOut = () => {
    signOut(auth)
      .then(() => {
        navigate("/");
      })
      .catch((error) => {
        console.error("Error during sign-out:", error);
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
        <meta
          name="description"
          content="Admin control panel for managing moderator requests and model updates"
        />
      </Helmet>

      {/* Header */}

      <header className="header-admin">
        <div className="header-left">
          <img src={LOGO} alt="CultureLens Logo" className="logo-img" />
          <h1 className="logoA-title" style={{ color: 'white' }}>CultureLens</h1>
          </div>

        <button className="Adminlogout-btn" onClick={handleSignOut}>
          Log out
        </button>

        {showSignOutModal && (
          <SignOutConfirmation
            onConfirm={confirmSignOut}
            onCancel={cancelSignOut}
          />
        )}
      </header>

      <div className="admin-header-banner">
        <h1>Admins Dashboard</h1>
      </div>
  {/* Toggle buttons for moderator requests and model upload */}

  <div className="admin-toggle-buttons">
        <button
          className={view === "moderator-requests" ? "active" : ""}
          onClick={() => setView("moderator-requests")}
        >
          Moderator Requests
        </button>
        <button
          className={view === "model-upload" ? "active" : ""}
          onClick={() => setView("model-upload")}
        >
          Upload
        </button>
      </div>
     

      {loading && <div>Loading...</div>}
      {error && <div className="error">{error}</div>}

      {/* Moderator requests section */}

      {view === "moderator-requests" && !loading && !error && (
        <div className="requests-section">
        <div className="filterAdmin-container">
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
  <div className="no-requests-message">No requests available.</div>
) : (
  // Content for displaying filtered requests
 

 
            <table className="requests-table">
              <thead>
                <tr>
                  <th>Moderator ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Region</th>
                  <th>Reason</th>
                  <th>LinkedIn Link</th>
                   <th>Request Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.id}>
                    <td>{request.displayId}</td>
                    <td>{request.fullName}</td>
                    <td>{request.email}</td>
                    <td>{request.regionM}</td>
                    <td>{request.reason}</td>
                    <td>
          {request.Linkedin ? (
            <a
              href={request.Linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="linkedin-link"
            >
              LinkedIn Link
            </a>
          ) : (
            ""
          )}
        </td>      
         <td>
  {request.RequestDate
    ? new Date(request.RequestDate).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A"}
</td>

                    <td
                      className={`status status-${
                        request.status ? request.status.toLowerCase() : ""
                      }`}
                    >
                      {request.status}
                    </td>
                    <td>
  <div className="actions">
    {request.status !== "Approved" && (
      <button
        className="approve-btn"
        onClick={() => handleApproveRequest(request)}
      >
        Approve
      </button>
    )}
    {request.status !== "Denied" && (
      <button
        className="deny-btn"
        onClick={() => handleDenyRequest(request)}
      >
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

   {/* Model upload section */}

   {view === "model-upload" && (
        <div className="model-upload-section">
          <h2>Upload Fine-Tuned Model</h2>
          <form className="model-upload-form" onSubmit={handleModelUpload}>
            <div className="form-group">
              <label htmlFor="modelName">Language Model Name:</label>
              <input
                type="text"
                id="modelName"
                placeholder="Enter Language Model Name"
                className={`input-field ${errors.modelName ? "error" : ""}`}
                value={modelName}
                onChange={(e) => handleInputChange(e, "modelName")}
              />
            </div>
            <div className="form-group">
              <label htmlFor="modelVision">Language Model Vision:</label>
              <input
                type="text"
                id="modelVision"
                placeholder="Enter Language Model Vision"
                className={`input-field ${errors.modelVision ? "error" : ""}`}
                value={modelVision}
                onChange={(e) => handleInputChange(e, "modelVision")}
              />
            </div>
            <div className="form-group">
              <label htmlFor="fineTuneRegion">Fine-Tune Region:</label>
              <input
                type="text"
                id="fineTuneRegion"
                placeholder="Enter Fine-Tune Region"
                className={`input-field ${
                  errors.fineTuneRegion ? "error" : ""
                }`}
                value={fineTuneRegion}
                onChange={(e) => handleInputChange(e, "fineTuneRegion")}
              />
            </div>
            <div className="form-group">
              <label htmlFor="cloudLink">Link to Cloud Fine-Tuned LLM:</label>
              <input
                type="url"
                id="cloudLink"
                placeholder="Enter a valid URL"
                className={`input-field ${errors.cloudLink ? "error" : ""}`}
                value={cloudLink}
                onChange={(e) => handleInputChange(e, "cloudLink")}
              />
            </div>
            <button type="submit" className="upload-btn">
              Upload
            </button>
          </form>
        </div>
      )}
       
      {showPopup.type && (
        <div
          className={
            showPopup.type === "error" ? "error-popup" : "success-popup"
          }
        >
          {showPopup.type === "error" && (
            <>
              <div className="error-title">Error</div>
              <div className="error-message">{showPopup.message}</div>
              <div className="error-actions">
                <button
                  className="confirm-btn"
                  onClick={() => setShowPopup({ type: null, message: "" })}
                >
                  OK
                </button>
              </div>
            </>
          )}
          {showPopup.type === "success" && (
            <>
              <FontAwesomeIcon
                icon={faCheckCircle}
                style={{ color: "green", fontSize: "24px" }}
              />
              <div className="success-message">{showPopup.message}</div>
            </>
          )}
        </div>
      )}

      {/* Footer */}

      <footer className="footer-admin">
        <p >
          ©2024 CultureLens. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default AdminPage;