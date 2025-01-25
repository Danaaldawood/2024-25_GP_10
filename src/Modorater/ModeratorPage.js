import React, { useState, useEffect } from "react";
import { ref, onValue, remove, update, get, push, set } from "firebase/database";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, realtimeDb } from "../Register/firebase";
import "./ModeratorPage.css";
import { useNavigate } from "react-router-dom";
import { Footer } from "../Footer/Footer";
import SignOutConfirmation from "./SignOutConfirmation";
import { Helmet } from "react-helmet";
import Logo from "../images/Logo.png";
import { onAuthStateChanged } from "firebase/auth";
import { FaEyeSlash, FaTimes } from "react-icons/fa";

const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel, actionType }) => {
  if (!isOpen) return null;

  const confirmButtonClass = actionType === "deny" ? "deny-btn-not" : "delete-btn-not";

  return (
    <div className="fixed">
      <div className="modal-content">
        <p className="modal-message">{message}</p>
        <div className="modal-buttons">
          <button className="modal-btn cancel-btn-not" onClick={onCancel}>
            Cancel
          </button>
          <button className={`modal-btn ${confirmButtonClass}`} onClick={onConfirm}>
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
      <td>{notification.attribute || "N/A"}</td>
      <td>{notification.topic || "N/A"}</td>
      <td>{notification.PreviousValue || "N/A"}</td>
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
            snapshot.forEach((childSnapshot) => {
              const notificationGroup = childSnapshot.val();
              if (notificationGroup.notifications) {
                notificationGroup.notifications.forEach((notification) => {
                  if (notification.region === regionM && notification.modAction === "noaction") {
                    notificationsData.push({
                      id: childSnapshot.key,
                      ...notification,
                    });
                  }
                });
              }
            });
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

  const createUserNotification = async (userId, attribute, action) => {
    try {
      if (!userId || !attribute || !action) return;

      const userNotificationsRef = ref(realtimeDb, `userNotifications/${userId}`);
      const newNotification = {
        id: push(ref(realtimeDb)).key,
        attribute,
        action,
        timestamp: new Date().toISOString(),
        read: false,
      };

      const snapshot = await get(userNotificationsRef);
      const existingNotifications = snapshot.exists() ? snapshot.val() : [];
      await set(userNotificationsRef, [...existingNotifications, newNotification]);
    } catch (error) {
      console.error("Error creating user notification:", error);
    }
  };

  const handleToggleReviewed = async (entry) => {
    try {
      await update(ref(realtimeDb, `Viewedit/${entry.region}/${entry.id}`), {
        modAction: "action",
      });

      await createUserNotification(
        entry.userId,
        entry.attribute,
        'Entry has been reviewed'
      );

      setViewEditEntries((prev) => prev.filter((e) => e.id !== entry.id));
    } catch (error) {
      console.error("Error toggling reviewed status:", error);
    }
  };

  const handleDeleteViewEntry = async (entry) => {
    setConfirmModal({
      isOpen: true,
      message: "Are you sure you want to delete this value from the dataset?",
      actionType: "delete",
      onConfirm: async () => {
        try {
          console.log('Entry to delete:', {
            value: entry.value,
            userId: entry.userId,
            attribute: entry.attribute,
            region: entry.region
          });

          const regionDatasetRef = ref(realtimeDb, `${entry.region}C/Details`);
          const snapshot = await get(regionDatasetRef);

          if (snapshot.exists()) {
            const details = snapshot.val();
            let foundMatch = false;

            for (const [detailKey, detailValue] of Object.entries(details)) {
              console.log('Comparing questions:', {
                dataset: detailValue.en_question,
                entry: entry.topic
              });
              
              if (detailValue.topic === entry.topic) {
                const annotations = detailValue.annotations || [];
                console.log('Found matching topic, checking annotations:', {
                  existingAnnotations: annotations,
                  userIdToDelete: entry.userId,
                  valueToDelete: entry.value
                });
                
                const filteredAnnotations = annotations.filter(annotation => {
                  const shouldKeep = !(annotation.user_id === entry.userId && 
                                     (annotation.en_values || []).includes(entry.value));
                  console.log('Annotation check:', {
                    annotationUserId: annotation.user_id,
                    entryUserId: entry.userId,
                    annotationValues: annotation.en_values,
                    entryValue: entry.value,
                    keeping: shouldKeep
                  });
                  return shouldKeep;
                });

                if (filteredAnnotations.length < annotations.length) {
                  foundMatch = true;
                  await update(ref(realtimeDb, `${entry.region}C/Details/${detailKey}`), {
                    ...detailValue,
                    annotations: filteredAnnotations,
                  });
                  console.log('Successfully updated annotations');
                }
              }
            }

            if (!foundMatch) {
              console.log("No matching annotation found in dataset");
            }
          }

          await update(ref(realtimeDb, `Viewedit/${entry.region}/${entry.id}`), {
            modAction: "action",
          });

          await createUserNotification(
            entry.userId,
            entry.attribute,
            'Value has been deleted'
          );

          setViewEditEntries((prev) => prev.filter((e) => e.id !== entry.id));
        } catch (error) {
          console.error("Error deleting entry:", error);
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
          const regionDatasetRef = ref(realtimeDb, `${notification.region}C/Details`);
          const snapshot = await get(regionDatasetRef);

          if (snapshot.exists()) {
            const details = snapshot.val();
            for (const [detailKey, detailValue] of Object.entries(details)) {
              if (detailValue.en_question === notification.attribute) {
                const annotations = detailValue.annotations || [];
                const filteredAnnotations = annotations.filter(
                  (annotation) =>
                    !(
                      annotation.en_values?.includes(notification.PreviousValue) &&
                      annotation.user_id === notification.userId.shortId
                    )
                );

                if (filteredAnnotations.length < annotations.length) {
                  await update(ref(realtimeDb, `${notification.region}C/Details/${detailKey}`), {
                    ...detailValue,
                    annotations: filteredAnnotations,
                  });
                }
              }
            }
          }

          const notificationRef = ref(realtimeDb, `notifications/${notification.id}`);
          const notifSnapshot = await get(notificationRef);
          const notificationData = notifSnapshot.val();

          if (notificationData?.notifications) {
            const updatedNotifications = notificationData.notifications.filter(
              (n) => !(
                n.attribute === notification.attribute &&
                n.PreviousValue === notification.PreviousValue &&
                n.userId.shortId === notification.userId.shortId
              )
            );

            if (updatedNotifications.length === 0) {
              await remove(notificationRef);
            } else {
              await update(notificationRef, { notifications: updatedNotifications });
            }
          }

          const viewEditRef = ref(realtimeDb, `Viewedit/${notification.region}`);
          const viewEditSnapshot = await get(viewEditRef);
          if (viewEditSnapshot.exists()) {
            const entries = viewEditSnapshot.val();
            Object.entries(entries).forEach(async ([key, entry]) => {
              if (
                entry.value === notification.PreviousValue &&
                entry.attribute === notification.attribute
              ) {
                await remove(ref(realtimeDb, `Viewedit/${notification.region}/${key}`));
              }
            });
          }

          await createUserNotification(
            notification.userId.fullId,
            notification.attribute,
            'Value has been deleted'
          );

          setNotifications((prev) =>
            prev.filter(
              (n) =>
                n.userId.shortId !== notification.userId.shortId ||
                n.attribute !== notification.attribute ||
                n.PreviousValue !== notification.PreviousValue
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
          const notificationRef = ref(realtimeDb, `notifications/${notification.id}`);
          const snapshot = await get(notificationRef);
          const notificationData = snapshot.val();

          if (notificationData?.notifications) {
            const updatedNotifications = notificationData.notifications.map((n) => {
              if (
                n.attribute === notification.attribute &&
                n.PreviousValue === notification.PreviousValue &&
                n.userId.shortId === notification.userId.shortId
              ) {
                return { ...n, modAction: "action" };
              }
              return n;
            });

            await update(notificationRef, { notifications: updatedNotifications });

            await createUserNotification(
              notification.userId.fullId,
              notification.attribute,
              'Request has been denied'
            );

            setNotifications((prev) =>
              prev.filter(
                (n) =>
                  n.userId.shortId !== notification.userId.shortId ||
                  n.attribute !== notification.attribute ||
                  n.PreviousValue !== notification.PreviousValue
              )
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
          <button onClick={() => (window.location.href = '/ReportPage')}>
            Complaints
          </button>
        </div>

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
          className={`notification-btn ${view === "notifications" ? "active" : ""}`}
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
                    <td>{entry.attribute}</td>
                    <td>{entry.userId}</td>
                    <td>{entry.region}</td>
                    <td>{entry.topic}</td>
                    <td>{entry.value}</td>
                    <td>{entry.reason}</td>
                    <td>
                      <button
                        className="action-btn eye-btn"
                        onClick={() => handleToggleReviewed(entry)}
                        title="Mark as reviewed"
                      >
                        <FaEyeSlash />
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteViewEntry(entry)}
                        title="Delete value"
                      >
                        <FaTimes />
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
                    key={`${notification.id}-${notification.userId?.shortId}`}
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
        onCancel={() => setConfirmModal({ isOpen: false, message: "", onConfirm: null })}
        actionType={confirmModal.actionType}
      />

      <Footer />
    </div>
  );
};

export default ModeratorPage;