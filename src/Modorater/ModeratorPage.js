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
import { FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";

// --- Confirmation Modal Component ---
const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel, actionType }) => {
  if (!isOpen) return null;

  const confirmButtonClass =
    actionType === "deny"
      ? "deny-btn-not"
      : actionType === "replace"
      ? "replace-btn"
      : actionType === "add"
      ? "add-btn"
      : "delete-btn-not";

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

// --- Notification Row Component ---
const NotificationRow = ({
  notification,
  onDelete,
  onDeny,
  onReplace,
  onAdd,
  viewEditEntries,
}) => {
  const valueExists = viewEditEntries.some(
    (entry) =>
      entry.attribute === notification.attribute &&
      entry.value === notification.PreviousValue
  );

  const wasDeleted = !valueExists && notification.isValueDeleted;
  const disableDelete = wasDeleted && notification.suggestion;

  return (
    <tr>
      <td>{notification.userId || "N/A"}</td>
      <td>{notification.attribute || "N/A"}</td>
      <td>{notification.topic || "N/A"}</td>
      <td>{notification.PreviousValue || "N/A"}</td>
      <td>{notification.suggestion || "N/A"}</td>
      <td>{notification.description || "N/A"}</td>
      <td className="action-buttons">
        <button
          onClick={() => onDelete(notification)}
          className="action-btn delete-btn-not"
          disabled={disableDelete}
          style={{
            opacity: disableDelete ? 0.5 : 1,
            cursor: disableDelete ? "not-allowed" : "pointer",
          }}
          title={disableDelete ? "Value already deleted" : "Delete this value"}
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
      <td className="action-buttons">
        {notification.suggestion && (
          <button
            onClick={() => wasDeleted ? onAdd(notification) : onReplace(notification)}
            className={`action-btn ${wasDeleted ? "add-btn" : "replace-btn"}`}
            title={wasDeleted ? "Add new value" : "Replace value"}
          >
            {wasDeleted ? "Add Value" : "Replace Value"}
          </button>
        )}
      </td>
    </tr>
  );
};

// --- Main ModeratorPage Component ---
const ModeratorPage = () => {
  // --- State Management ---
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

  // --- Data Fetching Effect ---
  useEffect(() => {
    const fetchModeratorData = async (user) => {
      try {
        const moderatorRef = doc(db, "Moderators", user.uid);
        const moderatorSnap = await getDoc(moderatorRef);

        if (moderatorSnap.exists()) {
          const { regionM } = moderatorSnap.data();

          const viewEditRef = ref(realtimeDb, `Viewedit/${regionM}`);
          onValue(viewEditRef, (snapshot) => {
            if (snapshot.exists()) {
              const entries = [];
              snapshot.forEach((childSnapshot) => {
                entries.push({
                  id: childSnapshot.key,
                  isReviewed: false,
                  ...childSnapshot.val(),
                });
              });
              setViewEditEntries(entries);
            } else {
              setViewEditEntries([]);
            }
          });

          const notificationsRef = ref(realtimeDb, "notifications");
          onValue(notificationsRef, (snapshot) => {
            if (snapshot.exists()) {
              const notificationsData = [];
              snapshot.forEach((childSnapshot) => {
                const notificationGroup = childSnapshot.val();
                if (notificationGroup.notifications) {
                  notificationGroup.notifications.forEach((notification) => {
                    if (notification.region === regionM) {
                      notificationsData.push({
                        id: childSnapshot.key,
                        ...notification,
                      });
                    }
                  });
                }
              });
              setNotifications(notificationsData);
            } else {
              setNotifications([]);
            }
          });
        }
      } catch (error) {
        console.error("Error fetching moderator data:", error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchModeratorData(user);
      }
    });

    return () => unsubscribe();
  }, []);

  // Create user notification
  const createUserNotification = async (userId, attribute, action) => {
    try {
      const userNotificationsRef = ref(realtimeDb, `userNotifications/${userId}`);
      const newNotification = {
        id: push(ref(realtimeDb)).key,
        attribute,
        action,
        timestamp: new Date().toISOString(),
        read: false
      };
      
      const snapshot = await get(userNotificationsRef);
      const existingNotifications = snapshot.exists() ? snapshot.val() : [];
      
      await set(userNotificationsRef, [...existingNotifications, newNotification]);
    } catch (error) {
      console.error("Error creating user notification:", error);
    }
  };

  // Handle deletion of ViewEdit entry
  const handleDeleteViewEntry = async (entry) => {
    setConfirmModal({
      isOpen: true,
      message: "Are you sure you want to delete this Value?",
      actionType: "delete",
      onConfirm: async () => {
        try {
          // Delete from region dataset
          const regionDatasetRef = ref(realtimeDb, `${entry.region}C/Details`);
          const snapshot = await get(regionDatasetRef);

          if (snapshot.exists()) {
            const details = snapshot.val();
            for (const [detailKey, detailValue] of Object.entries(details)) {
              if (
                detailValue.topic === entry.topic &&
                detailValue.en_question === entry.attribute
              ) {
                const annotations = detailValue.annotations || [];
                const filteredAnnotations = annotations.filter(
                  (annotation) =>
                    !(
                      annotation.user_id === entry.userId &&
                      annotation.en_values.includes(entry.value)
                    )
                );

                if (filteredAnnotations.length !== annotations.length) {
                  const detailRef = ref(
                    realtimeDb,
                    `${entry.region}C/Details/${detailKey}`
                  );
                  await update(detailRef, {
                    ...detailValue,
                    annotations: filteredAnnotations,
                  });
                }
              }
            }
          }

          // Delete from ViewEdit
          await remove(ref(realtimeDb, `Viewedit/${entry.region}/${entry.id}`));

          // Create notification for user
          await createUserNotification(
            entry.userId,
            entry.attribute,
            'Value has been deleted'
          );

          // Update notifications
          const notificationsRef = ref(realtimeDb, "notifications");
          const notificationsSnapshot = await get(notificationsRef);

          if (notificationsSnapshot.exists()) {
            const allNotifications = notificationsSnapshot.val();

            Object.entries(allNotifications).forEach(
              async ([notificationId, notificationGroup]) => {
                if (notificationGroup.notifications) {
                  const updatedNotifications = notificationGroup.notifications.map(
                    (notification) => {
                      if (
                        notification.region === entry.region &&
                        notification.attribute === entry.attribute &&
                        notification.PreviousValue === entry.value
                      ) {
                        // If notification has suggestion, mark as deleted but keep it
                        if (notification.suggestion) {
                          return {
                            ...notification,
                            isValueDeleted: true,
                          };
                        }
                        // If no suggestion, this notification will be removed
                        return null;
                      }
                      return notification;
                    }
                  ).filter(Boolean);

                  if (updatedNotifications.length === 0) {
                    await remove(
                      ref(realtimeDb, `notifications/${notificationId}`)
                    );
                  } else if (updatedNotifications.length !== notificationGroup.notifications.length) {
                    await update(
                      ref(realtimeDb, `notifications/${notificationId}`),
                      {
                        notifications: updatedNotifications,
                      }
                    );
                  }
                }
              }
            );
          }

          // Update local state
          setViewEditEntries((prev) => prev.filter((e) => e.id !== entry.id));
          setNotifications((prev) => {
            return prev.map((n) => {
              if (
                n.region === entry.region &&
                n.attribute === entry.attribute &&
                n.PreviousValue === entry.value
              ) {
                if (n.suggestion) {
                  return {
                    ...n,
                    isValueDeleted: true,
                  };
                }
                return null;
              }
              return n;
            }).filter(Boolean);
          });
        } catch (error) {
          console.error("Error deleting entry:", error);
        }
        setConfirmModal({ isOpen: false, message: "", onConfirm: null });
      },
    });
  };

  // Handle deletion of notification value
  const handleDeleteValue = async (notification) => {
    if (!notification.isValueDeleted || !notification.suggestion) {
      setConfirmModal({
        isOpen: true,
        message: "Are you sure you want to delete this value?",
        actionType: "delete",
        onConfirm: async () => {
          try {
            const notificationRef = ref(
              realtimeDb,
              `notifications/${notification.id}`
            );
            const notificationSnapshot = await get(notificationRef);
            const notificationData = notificationSnapshot.val();

            if (notificationData?.notifications) {
              // Delete from dataset
              const regionDatasetRef = ref(
                realtimeDb,
                `${notification.region}C/Details`
              );
              const snapshot = await get(regionDatasetRef);

              if (snapshot.exists()) {
                const details = snapshot.val();
                for (const [detailKey, detailValue] of Object.entries(details)) {
                  if (
                    detailValue.topic === notification.topic &&
                    detailValue.en_question === notification.attribute
                  ) {
                    const annotations = detailValue.annotations || [];
                    const filteredAnnotations = annotations.filter(
                      (annotation) =>
                        annotation.en_values[0] !== notification.PreviousValue
                    );

                    if (filteredAnnotations.length !== annotations.length) {
                      const detailRef = ref(
                        realtimeDb,
                        `${notification.region}C/Details/${detailKey}`
                      );
                      await update(detailRef, {
                        ...detailValue,
                        annotations: filteredAnnotations,
                      });
                    }
                  }
                }
              }

              // Create notification for user
              await createUserNotification(
                notification.userId,
                notification.attribute,
                'Value has been deleted'
              );

              // Remove from ViewEdit
              const viewEditRef = ref(
                realtimeDb,
                `Viewedit/${notification.region}`
              );
              const viewEditSnapshot = await get(viewEditRef);

              if (viewEditSnapshot.exists()) {
                const entries = viewEditSnapshot.val();
                Object.entries(entries).forEach(async ([key, entry]) => {
                  if (
                    entry.value === notification.PreviousValue &&
                    entry.attribute === notification.attribute
                  ) {
                    await remove(
                      ref(realtimeDb, `Viewedit/${notification.region}/${key}`)
                    );
                  }
                });
              }

              // Update notifications
              const updatedNotifications = notificationData.notifications.filter(
                (n) =>
                  !(
                    n.attribute === notification.attribute &&
                    n.PreviousValue === notification.PreviousValue &&
                    n.userId === notification.userId
                  )
              );

              if (updatedNotifications.length === 0) {
                await remove(notificationRef);
              } else {
                await update(notificationRef, {
                  notifications: updatedNotifications,
                });
              }

              setNotifications((prev) =>
                prev.filter(
                  (n) =>
                    !(
                      n.attribute === notification.attribute &&
                      n.PreviousValue === notification.PreviousValue &&
                      n.userId === notification.userId
                    )
                )
              );
            }
          } catch (error) {
            console.error("Error deleting value:", error);
          }
          setConfirmModal({ isOpen: false, message: "", onConfirm: null });
        },
      });
    }
  };

  // Handle Request Actions
  const handleDenyRequest = async (notification) => {
    setConfirmModal({
      isOpen: true,
      message: "Are you sure you want to deny this request?",
      actionType: "deny",
      onConfirm: async () => {
        try {
          // Create notification for user
          await createUserNotification(
            notification.userId,
            notification.attribute,
            'Request has been denied'
          );

          const notificationRef = ref(
            realtimeDb,
            `notifications/${notification.id}`
          );
          const snapshot = await get(notificationRef);
          const notificationData = snapshot.val();

          if (notificationData?.notifications) {
            const updatedNotifications = notificationData.notifications.filter(
              (n) =>
                !(
                  n.attribute === notification.attribute &&
                  n.PreviousValue === notification.PreviousValue &&
                  n.userId === notification.userId
                )
            );

            if (updatedNotifications.length === 0) {
              await remove(notificationRef);
            } else {
              await update(notificationRef, {
                notifications: updatedNotifications,
              });
            }

            setNotifications((prev) =>
              prev.filter(
                (n) =>
                  !(
                    n.attribute === notification.attribute &&
                    n.PreviousValue === notification.PreviousValue &&
                    n.userId === notification.userId
                  )
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

  // Handle adding new value
  const handleAddValue = async (notification) => {
    setConfirmModal({
      isOpen: true,
      message: "Are you sure you want to add this new value?",
      actionType: "add",
      onConfirm: async () => {
        try {
          const regionDatasetRef = ref(
            realtimeDb,
            `${notification.region}C/Details`
          );
          const dataSnapshot = await get(regionDatasetRef);

          if (dataSnapshot.exists()) {
            const details = dataSnapshot.val();
            for (const [detailKey, detailValue] of Object.entries(details)) {
              if (
                detailValue.topic === notification.topic &&
                detailValue.en_question === notification.attribute
              ) {
                const annotations = detailValue.annotations || [];
                const existingAnnotation = annotations.find(
                  (ann) => ann.user_id === notification.userId
                );
                const existingReason = existingAnnotation
                  ? existingAnnotation.reason
                  : "variation";

                const newAnnotation = {
                  en_values: [notification.suggestion],
                  user_id: notification.userId,
                  reason: existingReason,
                };

                const updatedAnnotations = [...annotations, newAnnotation];

                // Update dataset
                const detailRef = ref(
                  realtimeDb,
                  `${notification.region}C/Details/${detailKey}`
                );
                await update(detailRef, {
                  ...detailValue,
                  annotations: updatedAnnotations,
                });

                // Add to ViewEdit
                const viewEditRef = ref(
                  realtimeDb,
                  `Viewedit/${notification.region}`
                );
                const newEntryRef = push(viewEditRef);
                await update(newEntryRef, {
                  attribute: notification.attribute,
                  topic: notification.topic,
                  value: notification.suggestion,
                  userId: notification.userId,
                  region: notification.region,
                  reason: existingReason,
                });

                // Create notification for user
                await createUserNotification(
                  notification.userId,
                  notification.attribute,
                  'New value has been added'
                );

                // Remove notification
                const notificationRef = ref(
                  realtimeDb,
                  `notifications/${notification.id}`
                );
                const notificationSnapshot = await get(notificationRef);
                const notificationData = notificationSnapshot.val();

                if (notificationData?.notifications) {
                  const updatedNotifications = notificationData.notifications.filter(
                    (n) =>
                      !(
                        n.attribute === notification.attribute &&
                        n.PreviousValue === notification.PreviousValue &&
                        n.userId === notification.userId
                      )
                  );

                  if (updatedNotifications.length === 0) {
                    await remove(notificationRef);
                  } else {
                    await update(notificationRef, {
                      notifications: updatedNotifications,
                    });
                  }
                }

                // Update local state
                setNotifications((prev) =>
                  prev.filter(
                    (n) =>
                      !(
                        n.attribute === notification.attribute &&
                        n.PreviousValue === notification.PreviousValue &&
                        n.userId === notification.userId
                      )
                  )
                );
              }
            }
          }
        } catch (error) {
          console.error("Error adding value:", error);
        }
        setConfirmModal({ isOpen: false, message: "", onConfirm: null });
      },
    });
  };

  // Handle replacing existing value
  const handleReplaceValue = async (notification) => {
    setConfirmModal({
      isOpen: true,
      message: "Are you sure you want to replace this value?",
      actionType: "replace",
      onConfirm: async () => {
        try {
          const regionDatasetRef = ref(
            realtimeDb,
            `${notification.region}C/Details`
          );
          const dataSnapshot = await get(regionDatasetRef);

          if (dataSnapshot.exists()) {
            const details = dataSnapshot.val();
            for (const [detailKey, detailValue] of Object.entries(details)) {
              if (
                detailValue.topic === notification.topic &&
                detailValue.en_question === notification.attribute
              ) {
                const annotations = detailValue.annotations || [];
                const originalAnnotation = annotations.find(
                  (ann) => ann.en_values[0] === notification.PreviousValue
                );
                const originalReason = originalAnnotation
                  ? originalAnnotation.reason
                  : "variation";

                // Update annotations with new value
                const updatedAnnotations = annotations.map((annotation) => {
                  if (annotation.en_values[0] === notification.PreviousValue) {
                    return {
                      ...annotation,
                      en_values: [notification.suggestion],
                      reason: originalReason,
                    };
                  }
                  return annotation;
                });

                // Update in database
                const detailRef = ref(
                  realtimeDb,
                  `${notification.region}C/Details/${detailKey}`
                );
                await update(detailRef, {
                  ...detailValue,
                  annotations: updatedAnnotations,
                });

                // Create notification for user
                await createUserNotification(
                  notification.userId,
                  notification.attribute,
                  'Value has been replaced'
                );

                // Update ViewEdit entries
                const viewEditRef = ref(
                  realtimeDb,
                  `Viewedit/${notification.region}`
                );
                const viewEditSnapshot = await get(viewEditRef);

                if (viewEditSnapshot.exists()) {
                  const entries = viewEditSnapshot.val();
                  for (const [key, entry] of Object.entries(entries)) {
                    if (
                      entry.value === notification.PreviousValue &&
                      entry.attribute === notification.attribute
                    ) {
                      await remove(
                        ref(realtimeDb, `Viewedit/${notification.region}/${key}`)
                      );
                    }
                  }
                }

                // Update notifications
                const notificationRef = ref(
                  realtimeDb,
                  `notifications/${notification.id}`
                );
                const notificationSnapshot = await get(notificationRef);
                const notificationData = notificationSnapshot.val();

                if (notificationData?.notifications) {
                  const updatedNotifications = notificationData.notifications.filter(
                    (n) =>
                      !(
                        n.attribute === notification.attribute &&
                        n.PreviousValue === notification.PreviousValue &&
                        n.userId === notification.userId
                      )
                  );

                  if (!updatedNotifications || updatedNotifications.length === 0) {
                    await remove(notificationRef);
                  } else {
                    await update(notificationRef, {
                      notifications: updatedNotifications,
                    });
                  }
                }
              }
            }
          }

          // Update local state
          setNotifications((prev) => {
            if (!prev) return [];
            return prev.filter(
              (n) =>
                !(
                  n.attribute === notification.attribute &&
                  n.PreviousValue === notification.PreviousValue &&
                  n.userId === notification.userId
                )
            );
          });
        } catch (error) {
          console.error("Error replacing value:", error);
        } finally {
          setConfirmModal({ isOpen: false, message: "", onConfirm: null });
        }
      },
    });
  };

  // Handle toggling reviewed status
  const handleToggleReviewed = async (entry) => {
    try {
      await remove(ref(realtimeDb, `Viewedit/${entry.region}/${entry.id}`));

      // Create notification for user
      await createUserNotification(
        entry.userId,
        entry.attribute,
        'Entry has been marked as reviewed'
      );

      const notificationsRef = ref(realtimeDb, "notifications");
      const notificationsSnapshot = await get(notificationsRef);

      if (notificationsSnapshot.exists()) {
        const allNotifications = notificationsSnapshot.val();

        Object.entries(allNotifications).forEach(async ([notificationId, notificationGroup]) => {
          if (notificationGroup.notifications) {
            const updatedNotifications = notificationGroup.notifications.filter(
              (notification) =>
                !(
                  notification.region === entry.region &&
                  notification.attribute === entry.attribute &&
                  notification.PreviousValue === entry.value
                )
            );

            if (updatedNotifications.length === 0) {
              await remove(ref(realtimeDb, `notifications/${notificationId}`));
            } else {
              await update(ref(realtimeDb, `notifications/${notificationId}`), {
                notifications: updatedNotifications,
              });
            }
          }
        });
      }

      // Update local state
      setViewEditEntries((prev) => prev.filter((e) => e.id !== entry.id));
      setNotifications((prev) =>
        prev.filter(
          (n) =>
            !(
              n.region === entry.region &&
              n.attribute === entry.attribute &&
              n.PreviousValue === entry.value
            )
        )
      );
    } catch (error) {
      console.error("Error toggling reviewed entry:", error);
    }
  };

  // --- Navigation and Menu Handlers ---
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
        <meta name="description" content="Moderator page" />
      </Helmet>

      {/* Header Section */}
      <header className="header">
        <div className="header-left">
          <img src={Logo} alt="CultureLens Logo" className="logo-img" />
          <h1 className="logo-title">CultureLens</h1>
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

      {/* View Toggle Buttons */}
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

      {/* ViewEdit Table */}
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
                  <th> </th>
                  <th> </th>
                </tr>
              </thead>
              <tbody>
                {viewEditEntries.map((entry) => (
                  <tr key={entry.id}>
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
                        title="Mark as review"
                      >
                        <FaEyeSlash />
                      </button>
                    </td>
                    <td>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteViewEntry(entry)}
                        title="Delete this Value"
                      >
                        <FaTimes />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-records">There is no edit to view</p>
          )}
        </div>
      )}

      {/* Notifications Table */}
      {view === "notifications" && (
        <div className="notifications-container">
          <h2 className="pagename">Notifications</h2>
          {notifications.length > 0 ? (
            <table className="styled-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th className="attribute-col">Attribute</th>
                  <th>Topic</th>
                  <th>Previous Value</th>
                  <th>Suggestion</th>
                  <th>Description</th>
                  <th>Delete Value</th>
                  <th>Deny Request</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((notification) => (
                  <NotificationRow
                    key={`${notification.id}-${notification.userId}-${notification.attribute}`}
                    notification={notification}
                    onDelete={handleDeleteValue}
                    onDeny={handleDenyRequest}
                    onReplace={handleReplaceValue}
                    onAdd={handleAddValue}
                    viewEditEntries={viewEditEntries}
                  />
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-notifications">No notifications available</p>
          )}
        </div>
      )}

      {/* Modals */}
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
          setConfirmModal({
            isOpen: false,
            message: "",
            onConfirm: null,
            actionType: null,
          })
        }
        actionType={confirmModal.actionType}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ModeratorPage;