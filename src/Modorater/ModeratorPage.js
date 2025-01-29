import React, { useState, useEffect } from "react";
import {
  ref,
  onValue,
  remove,
  update,
  get,
  push,
  set,
} from "firebase/database";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, realtimeDb } from "../Register/firebase";
import "./ModeratorPage.css";
import { useNavigate } from "react-router-dom";
import SignOutConfirmation from "./SignOutConfirmation";
import { Helmet } from "react-helmet";
import Logo from "../images/Logo.png";
import { onAuthStateChanged } from "firebase/auth";
import { FaEyeSlash, FaTimes } from "react-icons/fa";
import "../Footer/Footer.css";
import { RiTwitterXLine } from "react-icons/ri";
import { IoLogoInstagram } from "react-icons/io5";
import { MdEmail } from "react-icons/md";

const ConfirmationModal = ({
  isOpen,
  message,
  onConfirm,
  onCancel,
  actionType,
}) => {
  if (!isOpen) return null;

  const confirmButtonClass =
    actionType === "deny" ? "deny-btn-not" : "delete-btn-not";

  return (
    <div className="fixed">
      <div className="modal-content">
        <p className="modal-message">{message}</p>
        <div className="modal-buttons">
          <button className="modal-btn cancel-btn-not-modal" onClick={onCancel}>
            Cancel
          </button>
          <button
            className={`modal-btn ${confirmButtonClass}-modal`}
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const NotificationRow = ({ notification, onDelete, onDeny }) => {
  return (
    <tr>
      <td>{notification.userId?.shortId || "N/A"}</td>
      <td>{notification.attribute?.en || notification.attribute || "N/A"}</td>
      <td>{notification.topic || "N/A"}</td>
      <td>
        {notification.PreviousValue?.en || notification.PreviousValue || "N/A"}
      </td>
      <td>{notification.description || "N/A"}</td>
      <td className="action-buttons">
        <button
          onClick={() => onDelete(notification)}
          className="action-btn delete-btn-not"
          title="Delete this value"
        >
          Delete Value
        </button>
      </td>
      <td className="action-buttons">
        <button
          onClick={() => onDeny(notification)}
          className="action-btn deny-btn-not"
          title="Deny request"
        >
          Deny Request
        </button>
      </td>
    </tr>
  );
};

const ModeratorPage = () => {
  const [view, setView] = useState("view-edit");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [viewEditEntries, setViewEditEntries] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    message: "",
    onConfirm: null,
    actionType: null,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchModeratorData = async (user) => {
      try {
        const moderatorRef = doc(db, "Moderators", user.uid);
        const moderatorSnap = await getDoc(moderatorRef);
    
        if (moderatorSnap.exists()) {
          const { regionM } = moderatorSnap.data();

          const viewEditRef = ref(realtimeDb, `Viewedit/${regionM}`);
          onValue(viewEditRef, (snapshot) => {
            const entries = [];
            snapshot.forEach((childSnapshot) => {
              const entry = childSnapshot.val();
              if (entry.modAction === "noaction") {
                entries.push({
                  id: childSnapshot.key,
                  ...entry,
                });
              }
            });
            setViewEditEntries(entries);
          });

          const notificationsRef = ref(realtimeDb, "notifications");
      onValue(notificationsRef, (snapshot) => {
        const notificationsData = [];
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const notificationGroup = childSnapshot.val();
            if (notificationGroup?.notifications) {
              notificationGroup.notifications.forEach((notification) => {
                if (notification.region === regionM && notification.modAction === "noaction") {
                  notificationsData.push({
                    ...notification,
                    uniqueId: `${childSnapshot.key}-${notification.userId?.shortId}-${Date.now()}`,
                    id: childSnapshot.key
                  });
                }
              });
            }
          });
        }
        setNotifications(notificationsData);
      });
    }
  } catch (error) {
    console.error("Error fetching moderator data:", error);
  }
};

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) fetchModeratorData(user);
    });

    return () => unsubscribe();
  }, []);

  const createUserNotification = async (
    userId,
    attribute,
    notifiedValue,
    action
  ) => {
    try {
      if (!userId || !attribute || !action) return;

      // Map the actions to their translations
      const actionTranslations = {
        deleted: {
          en: "your request has been deleted",
          ar: "تم حذف طلبك",
          ch: "您的请求已被删除",
        },
        denied: {
          en: "your request has been denied",
          ar: "تم رفض طلبك",
          ch: "您的请求已被拒绝",
        },
        reviewed: {
          en: "your request has been reviewed",
          ar: "تمت مراجعة طلبك",
          ch: "您的请求已审核",
        },
      };

      const newNotification = {
        id: push(ref(realtimeDb)).key,
        attribute: {
          en: attribute.en || "",
          ar: attribute.ar || "",
          ch: attribute.ch || "",
        },
        notifiedValue: {
          en: notifiedValue.en || "",
          ar: notifiedValue.ar || "",
          ch: notifiedValue.ch || "",
        },
        action: actionTranslations[action] || actionTranslations["reviewed"],
        timestamp: new Date().toISOString(),
        read: false,
      };

      const userNotificationsRef = ref(
        realtimeDb,
        `userNotifications/${userId}`
      );
      const snapshot = await get(userNotificationsRef);
      const existingNotifications = snapshot.exists() ? snapshot.val() : [];
      await set(userNotificationsRef, [
        ...existingNotifications,
        newNotification,
      ]);
    } catch (error) {
      console.error("Error creating user notification:", error);
    }
  };

  const handleToggleReviewed = async (entry) => {
    try {
      console.log("Entry data:", entry); // Debug log
  
      // Use fullUserId instead of userId
      const fullUserId = entry.fullUserId || entry.userId;
      
      await update(ref(realtimeDb, `Viewedit/${entry.region}/${entry.id}`), {
        modAction: "action",
      });
  
      // Create notification with proper translations
      const notificationValue = {
        en: entry.value || "",
        ar: entry.region === "Arab" ? entry.native_value || "" : "",
        ch: entry.region === "Chinese" ? entry.native_value || "" : ""
      };
  
      const notificationAttribute = {
        en: entry.en_question || "",
        ar: entry.question || "",
        ch: entry.ch_question || ""
      };
  
      console.log("Creating notification with:", {
        userId: fullUserId,
        attribute: notificationAttribute,
        value: notificationValue
      });
  
      // Create notification with the full user ID
      await createUserNotification(
        fullUserId, // Using fullUserId instead of userId
        notificationAttribute,
        notificationValue,
        "reviewed"
      );
  
      setViewEditEntries((prev) => prev.filter((e) => e.id !== entry.id));
    } catch (error) {
      console.error("Error in handleToggleReviewed:", error);
    }
  };

  const handleDeleteViewEntry = async (entry) => {
    setConfirmModal({
      isOpen: true,
      message: "Are you sure you want to delete this value from the dataset?",
      actionType: "delete",
      onConfirm: async () => {
        try {
          console.log("Entry being deleted:", entry); // Debug log
  
          // Use fullUserId instead of userId
          const fullUserId = entry.fullUserId || entry.userId;
          console.log("Using userId for notification:", fullUserId); // Debug log
  
          // Prepare notification value with translations
          const notificationValue = {
            en: entry.value || "",
            ar: entry.region === "Arab" ? entry.native_value || "" : "",
            ch: entry.region === "Chinese" ? entry.native_value || "" : ""
          };
  
          // Prepare notification attribute with translations
          const notificationAttribute = {
            en: entry.en_question || "",
            ar: entry.question || "",
            ch: entry.ch_question || ""
          };
  
          // Update the dataset
          const regionDatasetRef = ref(realtimeDb, `${entry.region}C/Details`);
          const snapshot = await get(regionDatasetRef);
  
          if (snapshot.exists()) {
            const details = snapshot.val();
            for (const [detailKey, detailValue] of Object.entries(details)) {
              if (detailValue.topic === entry.topic) {
                const annotations = detailValue.annotations || [];
                const filteredAnnotations = annotations.filter((annotation) => {
                  const shouldKeep = !(
                    annotation.user_id === entry.userId &&
                    (annotation.en_values || []).includes(entry.value)
                  );
                  return shouldKeep;
                });
  
                if (filteredAnnotations.length < annotations.length) {
                  await update(
                    ref(realtimeDb, `${entry.region}C/Details/${detailKey}`),
                    {
                      ...detailValue,
                      annotations: filteredAnnotations,
                    }
                  );
                }
              }
            }
          }
  
          // Update the view edit entry status
          await update(
            ref(realtimeDb, `Viewedit/${entry.region}/${entry.id}`),
            {
              modAction: "action",
            }
          );
  
          // Create notification with proper translations
          const actionTranslations = {
            deleted: {
              en: "your request has been deleted",
              ar: "تم حذف طلبك",
              ch: "您的请求已被删除"
            }
          };
  
          console.log("Creating notification with data:", {
            userId: fullUserId,
            attribute: notificationAttribute,
            value: notificationValue,
            action: actionTranslations.deleted
          });
  
          // Create user notification with the full user ID
          await createUserNotification(
            fullUserId,
            notificationAttribute,
            notificationValue,
            "deleted"
          );
  
          // Update local state
          setViewEditEntries((prev) => prev.filter((e) => e.id !== entry.id));
  
        } catch (error) {
          console.error("Error in handleDeleteViewEntry:", error);
        }
        setConfirmModal({ isOpen: false, message: "", onConfirm: null });
      },
    });
  };

  const handleDeleteValue = async (notification) => {
    setConfirmModal({
      isOpen: true,
      message: "Are you sure you want to delete this value?",
      actionType: "delete",
      onConfirm: async () => {
        try {
          // First handle the dataset update
          const regionDatasetRef = ref(
            realtimeDb,
            `${notification.region}C/Details`
          );
          const snapshot = await get(regionDatasetRef);

          if (snapshot.exists()) {
            const details = snapshot.val();
            for (const [detailKey, detailValue] of Object.entries(details)) {
              if (detailValue.en_question === notification.attribute.en) {
                const annotations = detailValue.annotations || [];
                const filteredAnnotations = annotations.filter(
                  (annotation) =>
                    !(
                      annotation.en_values?.includes(
                        notification.PreviousValue.en
                      ) && annotation.user_id === notification.userId.shortId
                    )
                );

                if (filteredAnnotations.length < annotations.length) {
                  await update(
                    ref(
                      realtimeDb,
                      `${notification.region}C/Details/${detailKey}`
                    ),
                    {
                      ...detailValue,
                      annotations: filteredAnnotations,
                    }
                  );
                }
              }
            }
          }

          // Then update the notification status
          const notificationRef = ref(
            realtimeDb,
            `notifications/${notification.id}/notifications`
          );
          const notifSnapshot = await get(notificationRef);

          if (notifSnapshot.exists()) {
            const notificationArray = notifSnapshot.val();

            // Find the index of the notification to update
            const notificationIndex = notificationArray.findIndex(
              (n) =>
                n.userId.shortId === notification.userId.shortId &&
                n.attribute.en === notification.attribute.en &&
                n.PreviousValue.en === notification.PreviousValue.en
            );

            if (notificationIndex !== -1) {
              // Create updated array with modAction changed
              const updatedNotifications = [...notificationArray];
              updatedNotifications[notificationIndex] = {
                ...updatedNotifications[notificationIndex],
                modAction: "action",
              };

              // Update the notifications array in Firebase
              await set(notificationRef, updatedNotifications);
            }
          }

          // Create user notification
          await createUserNotification(
            notification.userId.fullId,
            notification.attribute,
            notification.PreviousValue,
            "deleted"
          );

          // Update local state
          setNotifications((prev) =>
            prev.filter(
              (n) =>
                !(
                  n.userId.shortId === notification.userId.shortId &&
                  n.attribute.en === notification.attribute.en &&
                  n.PreviousValue.en === notification.PreviousValue.en
                )
            )
          );
        } catch (error) {
          console.error("Error deleting value:", error);
        }
        setConfirmModal({ isOpen: false, message: "", onConfirm: null });
      },
    });
  };

  const handleDenyRequest = async (notification) => {
    setConfirmModal({
      isOpen: true,
      message: "Are you sure you want to deny this request?",
      actionType: "deny",
      onConfirm: async () => {
        try {
          const notificationRef = ref(
            realtimeDb,
            `notifications/${notification.id}`
          );
          const snapshot = await get(notificationRef);
          const notificationData = snapshot.val();

          if (notificationData?.notifications) {
            const updatedNotifications = notificationData.notifications.map(
              (n) => {
                if (
                  n.userId.shortId === notification.userId.shortId &&
                  n.attribute.en === notification.attribute.en &&
                  n.PreviousValue.en === notification.PreviousValue.en
                ) {
                  return { ...n, modAction: "action" };
                }
                return n;
              }
            );

            await set(notificationRef, { notifications: updatedNotifications });

            await createUserNotification(
              notification.userId.fullId,
              notification.attribute,
              notification.PreviousValue,
              "denied"
            );

            setNotifications((prev) =>
              prev.filter((n) => n.id !== notification.id)
            );
          }
        } catch (error) {
          console.error("Error denying request:", error);
        }
        setConfirmModal({ isOpen: false, message: "", onConfirm: null });
      },
    });
  };

  const handleMenuToggle = () => setMenuOpen(!menuOpen);
  const handleProfileClick = () => navigate("/profile");
  const handleSignOut = () => setShowSignOutModal(true);
  const handleConfirmSignOut = () => {
    setShowSignOutModal(false);
    navigate("/Login");
  };
  const handleCancelSignOut = () => setShowSignOutModal(false);

  return (
    <div className="moderator-container">
      <Helmet>
        <title>Moderator Page</title>
        <meta name="description" content="Moderator interface" />
      </Helmet>
      <header className="header">
        <div className="header-left">
          <img src={Logo} alt="Logo" className="logo-img" />
          <h1 className="logo-title">CultureLens</h1>
        </div>
        <a
          className="complaints-link"
          onClick={() => (window.location.href = "/ReportPage")}
        >
          Complaints Page
        </a>

        <button className="menu-btn" onClick={handleMenuToggle}>
          <span className="menu-icon">&#9776;</span>
        </button>
        {menuOpen && (
          <div className="menu-dropdown">
            <p onClick={handleProfileClick}>Profile</p>
            <p onClick={handleSignOut} className="sign-out">
              Log out
            </p>
          </div>
        )}
      </header>
      <div className="header-banner">
        <h1>Moderator Page</h1>
      </div>
      <div className="toggle-buttons">
        <button
          className={`toggle-btn ${view === "view-edit" ? "active" : ""}`}
          onClick={() => setView("view-edit")}
        >
          View Edit
        </button>
        <button
          className={`notification-btn ${
            view === "notifications" ? "active" : ""
          }`}
          onClick={() => setView("notifications")}
        >
          Notifications
          {notifications.length > 0 && (
            <span className="notification-badge">{notifications.length}</span>
          )}
        </button>
      </div>
      {view === "view-edit" && (
        <div className="table-container">
          <h2 className="pagename">View Edit Dataset</h2>
          {viewEditEntries.length > 0 ? (
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Attribute</th>
                  <th>User ID</th>
                  <th>Region</th>
                  <th>Topic</th>
                  <th>Value</th>
                  <th>Reason</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {viewEditEntries.map((entry) => (
                  <tr key={`${entry.id}-${entry.userId}`}>
                  <td>{entry.en_question}</td>
                  <td>{entry.userId}</td>
                  <td>{entry.region}</td>
                  <td>{entry.topic}</td>
                  <td>{entry.value}</td>
                  <td>{entry.reason}</td>
                  <td className="action-cell">
                    <button
                      className="action-btn eye-btn"
                      onClick={() => handleToggleReviewed(entry)}
                      title="Mark as reviewed"
                    >
                      <FaEyeSlash className="icon" />
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteViewEntry(entry)}
                      title="Delete value"
                    >
                      <FaTimes className="icon" />
                    </button>
                  </td>
                </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-records">No edits to review</p>
          )}
        </div>
      )}
      {view === "notifications" && (
        <div className="notifications-container">
          <h2 className="pagename">Notifications</h2>
          {notifications.length > 0 ? (
            <table className="styled-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Attribute</th>
                  <th>Topic</th>
                  <th>Previous Value</th>
                  <th>Description</th>
                  <th>Delete Value</th>
                  <th>Deny Request</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((notification) => (
                  <NotificationRow
                    key={notification.uniqueId}
                    notification={notification}
                    onDelete={handleDeleteValue}
                    onDeny={handleDenyRequest}
                  />
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-notifications">No notifications</p>
          )}
        </div>
      )}
      {showSignOutModal && (
        <SignOutConfirmation
          onConfirm={handleConfirmSignOut}
          onCancel={handleCancelSignOut}
        />
      )}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() =>
          setConfirmModal({ isOpen: false, message: "", onConfirm: null })
        }
        actionType={confirmModal.actionType}
      />
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
      </footer>{" "}
    </div>
  );
};

export default ModeratorPage;
