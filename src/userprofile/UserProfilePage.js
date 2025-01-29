import React, { useState, useEffect } from "react";
import "./UserProfilePage.css";
import Notification from "../Modorater/Notification";
import DeleteConfirmation from "../Modorater/DeleteConfirmation";
import defaultProfilePic from "../Modorater/userpro.jpg";
import { FaArrowLeft, FaTrash } from "react-icons/fa"; // Import FaTrash
import { useNavigate } from "react-router-dom";
import { auth, db } from "../Register/firebase";
import { useTranslation } from "react-i18next";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import {
  deleteUser,
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { Footer } from "../Footer/Footer";
import { Helmet } from "react-helmet";

const UserProfilePage = () => {
  const { t ,i18n} = useTranslation("userProfile");   
  // --- State Management ---
  const [profileName, setProfileName] = useState(
    localStorage.getItem("profileName") || ""
  );
  const [email, setEmail] = useState(localStorage.getItem("email") || "");
  const [region, setRegion] = useState(localStorage.getItem("region") || "");
  const [notification, setNotification] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // --- Data Fetching ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const fetchUserData = async () => {
          try {
            // Get user document from Firestore
            const userDoc = await getDoc(doc(db, "Users", user.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              // Update state and local storage

              setProfileName(userData.fullName || "");
              setEmail(userData.email || "");
              setRegion(userData.region || "");
              localStorage.setItem("profileName", userData.fullName || "");
              localStorage.setItem("email", userData.email || "");
              localStorage.setItem("region", userData.region || "");
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
          }
        };
        fetchUserData();
      }
    });
    return () => unsubscribe();
  }, []);

  // --- Event Handlers ---
  // Handle profile save

  const handleSaveProfile = async () => {
    if (!profileName.trim()) {
      setNotification({
        type: "error",
        message:  (t("userProfile.Full name cannot be empty. Please enter a valid name.")),
      });
      return;
    }

    try {
      const user = auth.currentUser;
      if (user) {
        // Update Firestore document

        const userDocRef = doc(db, "Users", user.uid);

        await updateDoc(userDocRef, {
          fullName: profileName,
          email: email,
          region: region,
        });

        // Update local storage

        localStorage.setItem("profileName", profileName);
        localStorage.setItem("email", email);
        localStorage.setItem("region", region);

        // Show success notification

        setNotification({
          type: "success",
          message:  (t('userProfile.Profile saved successfully!')),
        });
      } else {
        setNotification({ type: "error", message:  (t("userProfile.No user logged in."))

        });
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      setNotification({ type: "error", message: (t("userProfile.Failed to save profile." ))});
    }
  };
  // Handle account deletion

  const handleDeleteAccount = () => {
    setShowModal(true);
  };
  // Confirm account deletion

  const handleConfirmDelete = async (password) => {
    setErrorMessage("");
    try {
      const user = auth.currentUser;
      if (!user) {
        setNotification({ type: "error", message: (t("userProfile.No user is logged in.")) });
        return;
      }
      // Delete user authentication and document

      const credential = EmailAuthProvider.credential(user.email, password);

      await reauthenticateWithCredential(user, credential);

      const userDocRef = doc(db, "Users", user.uid);
      await deleteDoc(userDocRef);
      await deleteUser(user);

      // Clear local storage

      localStorage.removeItem("profileName");
      localStorage.removeItem("email");
      localStorage.removeItem("region");

      setNotification({
        type: "success",
        message: (t("userProfile.Account deleted successfully.")),
      });
      navigate("/sign");
    } catch (error) {
      if (error.code === "auth/wrong-password") {
        setErrorMessage (t("userProfile.Incorrect password. Please try again."));
      } else {
        setErrorMessage(`Error: ${error.message}`);
      }
    }
  };

  // Close notification

  const closeNotification = () => {
    setNotification(null);
  };

  return (
    <div className="profile-page-container">
      {/* Meta Tags */}

      <Helmet>
        <title>{t("userProfile.Profile Page")}</title>
        <meta name="description" content="This is Profile page" />
      </Helmet>
      {/* Header Section */}

      <header className="profile-header">
        <button className="back-btn" onClick={() => navigate("/HomePage")}>
          <FaArrowLeft className="back-icon" />
        </button>
        <h1>{t("userProfile.h1")}</h1>
      </header>
      
      {/* Main Content */}
      <div className="profile-content">

        {/* Profile Details */}
        <div className="profile-details">
          <img src={defaultProfilePic} alt="Profile" className="profile-pic" />
          <h3>{profileName}</h3>
          <p>{region}</p>
        </div>

        {/* Profile Form */}
        <div className="profile-form-container">
          <h2>{t("userProfile.h2")}</h2>
          <div className="form-row">

            {/* Name Input */}
            <label>{t("userProfile.nameLabel")}</label>
              <input
              type="text"
              className="formProf-input"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
            />
          </div>

          {/* Email Input */}
          <div className="form-row">
          <label>{t("userProfile.emailLabel")}</label>
             <input
              type="email"
              className="formProf-input"
              value={email}
              readOnly
            />
          </div>

          {/* Region Input */}
          <div className="form-row">
          <label>{t("userProfile.regionLabel")}</label>
          <input
              type="text"
              className="formProf-input"
              value={region}
              readOnly
            />
          </div>

          {/* Action Buttons */}
          <button className="save-button" onClick={handleSaveProfile}>
          {t("userProfile.saveButton")}          </button>

          <button className="delete-button" onClick={handleDeleteAccount}>
          {t("userProfile.deleteButton")} <FaTrash className="trash-icon" />
          </button>
        </div>
      </div>

      {/* Modals and Notifications */}
      {showModal && (
        <DeleteConfirmation
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowModal(false)}
          errorMessage={errorMessage}
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
      <Footer />
    </div>
  );
};

export default UserProfilePage;
