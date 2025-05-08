// --- Imports ---
import React, { useState, useEffect } from "react";
import "./ProfilePage.css";
import Notification from "./Notification";
import DeleteConfirmation from "./DeleteConfirmation";
import defaultProfilePic from "../images/Photo-Profile.jpg";
import { FaArrowLeft, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../Register/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { deleteUser } from "firebase/auth";
import { Footer } from "../Footer/Footer";
import { Helmet } from "react-helmet";
import '../Footer/Footer.css';
import { RiTwitterXLine } from "react-icons/ri";
import { IoLogoInstagram } from "react-icons/io5";
import { MdEmail } from "react-icons/md";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faTwitter, faInstagram } from "@fortawesome/free-brands-svg-icons";
const ProfilePage = () => {
  // --- State Management ---
  const [profileName, setProfileName] = useState(
    localStorage.getItem("profileName") || ""
  );
  const [email, setEmail] = useState(localStorage.getItem("email") || "");
  const [notification, setNotification] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // --- Data Fetching ---
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          // Get user document from Firestore
          const userDoc = await getDoc(doc(db, "Moderators", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Update state and local storage
            setProfileName(userData.fullName || "");
            setEmail(userData.email || "");
            localStorage.setItem("profileName", userData.fullName || "");
            localStorage.setItem("email", userData.email || "");
          } else {
            console.log("No such document!");
          }
        } else {
          console.error("No authenticated user.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  // --- Event Handlers ---
  // Handle profile save
  const handleSaveProfile = async () => {
    if (!profileName.trim()) {
      setNotification({
        type: "error",
        message: "Full name cannot be empty. Please enter a valid name.",
      });
      return;
    }

    try {
      const user = auth.currentUser;
      if (user) {
        // Update Firestore document
        const userDocRef = doc(db, "Moderators", user.uid);
        await updateDoc(userDocRef, {
          fullName: profileName,
          email: email,
        });

        // Update local storage
        localStorage.setItem("profileName", profileName);
        localStorage.setItem("email", email);

        // Show success notification
        setNotification({
          type: "success",
          message: "Profile saved successfully!",
        });
        setTimeout(() => {
          setNotification(null);
        }, 3000);
      } else {
        setNotification({ type: "error", message: "No user logged in." });
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      setNotification({ type: "error", message: "Failed to save profile." });
    }
  };

  // Handle account deletion
  const handleDeleteAccount = () => {
    setShowModal(true);
  };

  // Confirm account deletion
  const handleConfirmDelete = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setNotification({ type: "error", message: "No user is logged in." });
        return;
      }

      // Delete user authentication and document
      await deleteUser(user);
      const userDocRef = doc(db, "Moderators", user.uid);
      await deleteDoc(userDocRef);

      // Clear local storage
      localStorage.removeItem("profileName");
      localStorage.removeItem("email");

      setNotification({
        type: "success",
        message: "Account deleted successfully.",
      });
      navigate("/sign");
    } catch (error) {
      console.error("Error deleting account:", error.message);
      setNotification({
        type: "error",
        message: `Failed to delete account: ${error.message}`,
      });
    }
    setShowModal(false);
  };

  // Close notification
  const closeNotification = () => {
    setNotification(null);
  };

  return (
    <div className="profile-page-container">
      {/* Meta Tags */}
      <Helmet>
        <title>Profile</title>
        <meta name="description" content="This is Profile page" />
      </Helmet>

      {/* Header Section */}
      <header className="profile-header">
        <button className="back-btn" onClick={() => navigate("/moderator")}>
          <FaArrowLeft className="back-icon" />
        </button>
        <h1>Moderator Profile</h1>
      </header>

      {/* Main Content */}
      <div className="profile-content">
        {/* Profile Details */}
        <div className="profile-details">
          <img src={defaultProfilePic} alt="Profile" className="profile-pic" />
          <h3>{profileName}</h3>
        </div>

        {/* Profile Form */}
        <div className="profile-form-container">
          <h2 className="headname">Moderator Information</h2>
          <div className="profile-form">
            {/* Name Input */}
            <div className="form-row">
              <label>Full Name</label>
              <input
                type="text"
                className="formProf-input"
                placeholder="Name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
              />
            </div>

            {/* Email Input */}
            <div className="form-row">
              <label>Email</label>
              <input
                type="email"
                className="formProf-input"
                placeholder="Email"
                value={email}
                readOnly
              />
            </div>

            {/* Action Buttons */}
            <button className="save-button" onClick={handleSaveProfile}>
              Save Profile
            </button>
            <button className="delete-button" onClick={handleDeleteAccount}>
              Delete Account <FaTrash className="trash-icon" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals and Notifications */}
      {showModal && (
        <DeleteConfirmation
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowModal(false)}
        />
      )}

      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={closeNotification}
        />
      )}

      {/* Footer */}
  <footer className="footer">
            <p>©2024 CultureLens All rights reserved</p>

      <div className="footer-icons">
        <a
          href="mailto:Culturelens@outlook.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <MdEmail className="footer-icon" />
        </a>
        <a
          href="https://x.com/CultureLens43"
          target="_blank"
          rel="noopener noreferrer"
        >
          <RiTwitterXLine className="footer-icon" />
        </a>
        <a
          href="https://www.instagram.com/culturelens43/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <IoLogoInstagram className="footer-icon" />
        </a>
      </div>
    </footer>    </div>
  );
};

export default ProfilePage;
