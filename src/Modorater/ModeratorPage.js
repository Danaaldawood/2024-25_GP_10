
import React, { useState, useEffect, useCallback } from "react";
import {
  ref,
  onValue,
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

const NotificationRow = ({ notification, onDelete, onDeny, filterType }) => {
  return (
    <tr>
      <td>{notification.userId?.shortId || "N/A"}</td>
      <td>{notification.attribute?.en || notification.attribute || "N/A"}</td>
      <td>{notification.topic || "N/A"}</td>
      {filterType === "value" && (
        <td>
          {notification.PreviousValue?.en || notification.PreviousValue || "N/A"}
        </td>
      )}
      <td>{notification.description || "N/A"}</td>
      <td className="action-buttons">
        <button
          onClick={() => onDelete(notification)}
          className="action-btn delete-btn-not"
          title={filterType === "value" ? "Delete this value" : "Delete this attribute"}
        >
          {filterType === "value" ? "Delete Value" : "Delete Attribute"}
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
  const [filterType, setFilterType] = useState("value");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  const navigate = useNavigate();

  const createUserNotification = useCallback(
    async (userId, attribute, notifiedValue, action) => {
      try {
        if (!userId || !attribute || !action) return;

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
        setError("Failed to send user notification.");
      }
    },
    []
  );

  useEffect(() => {
    const fetchModeratorData = async (user) => {
      try {
        // Set loading state to true at the beginning
        setLoading(true);
        console.log("Loading data..."); // This will show in console instead of on page
        
        const moderatorRef = doc(db, "Moderators", user.uid);
        const moderatorSnap = await getDoc(moderatorRef);

        if (moderatorSnap.exists()) {
          const { regionM } = moderatorSnap.data();

          const viewEditRef = ref(realtimeDb, `Viewedit/${regionM}`);
          const unsubscribeViewEdit = onValue(viewEditRef, (snapshot) => {
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
          const unsubscribeNotifications = onValue(notificationsRef, (snapshot) => {
            const notificationsData = [];
            if (snapshot.exists()) {
              snapshot.forEach((childSnapshot) => {
                const notificationGroup = childSnapshot.val();
                if (notificationGroup?.notifications) {
                  notificationGroup.notifications.forEach((notification) => {
                    if (
                      notification.region === regionM &&
                      notification.modAction === "noaction"
                    ) {
                      notificationsData.push({
                        ...notification,
                        uniqueId: `${childSnapshot.key}-${notification.userId?.shortId}-${Date.now()}`,
                        id: childSnapshot.key,
                      });
                    }
                  });
                }
              });
            }
            setNotifications(notificationsData);
            // Set loading to false once data is loaded
            setLoading(false);
          });

          return () => {
            unsubscribeViewEdit();
            unsubscribeNotifications();
          };
        }
      } catch (error) {
        console.error("Error fetching moderator data:", error);
        setError("Failed to load moderator data.");
        setLoading(false); // Make sure loading state is turned off even if there's an error
      }
    };

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) fetchModeratorData(user);
    });

    return () => unsubscribeAuth();
  }, []);

  const handleToggleReviewed = useCallback(
    async (entry) => {
      setError(null);
      try {
        const fullUserId = entry.fullUserId || entry.userId;

        await update(ref(realtimeDb, `Viewedit/${entry.region}/${entry.id}`), {
          modAction: "action",
        });

        const notificationsRef = ref(realtimeDb, `notifications`);
        const notificationsSnap = await get(notificationsRef);

        if (notificationsSnap.exists()) {
          const notificationsData = notificationsSnap.val();
          for (const [notifId, notifDetails] of Object.entries(notificationsData)) {
            if (!notifDetails.notifications) continue;

            const updatedNotifications = notifDetails.notifications.map((n) => {
              if (
                n.attribute?.en === entry.en_question &&
                n.PreviousValue?.en === entry.value &&
                n.region === entry.region
              ) {
                return { ...n, modAction: "action" };
              }
              return n;
            });

            await set(ref(realtimeDb, `notifications/${notifId}`), {
              notifications: updatedNotifications,
            });

            const matchingNotifications = notifDetails.notifications.filter(
              (n) =>
                n.attribute?.en === entry.en_question &&
                n.PreviousValue?.en === entry.value &&
                n.region === entry.region
            );

            if (matchingNotifications.length > 0 && matchingNotifications[0].userId?.fullId) {
              await createUserNotification(
                matchingNotifications[0].userId.fullId,
                matchingNotifications[0].attribute,
                matchingNotifications[0].PreviousValue,
                "denied"
              );
            }
          }
        }

        const notificationValue = {
          en: entry.value || "",
          ar: entry.region === "Arab" ? entry.native_value || "" : "",
          ch: entry.region === "Chinese" ? entry.native_value || "" : "",
        };

        const notificationAttribute = {
          en: entry.en_question || "",
          ar: entry.question || "",
          ch: entry.ch_question || "",
        };

        await createUserNotification(
          fullUserId,
          notificationAttribute,
          notificationValue,
          "reviewed"
        );

        setViewEditEntries((prev) => prev.filter((e) => e.id !== entry.id));
      } catch (error) {
        console.error("Error in handleToggleReviewed:", error);
        setError("Failed to mark as reviewed.");
      }
    },
    [createUserNotification]
  );

  const handleDeleteViewEntry = useCallback(
    async (entry) => {
      setConfirmModal({
        isOpen: true,
        message: "Are you sure you want to delete this value from the dataset?",
        actionType: "delete",
        onConfirm: async () => {
          setError(null);
          try {
            const fullUserId = entry.fullUserId || entry.userId;

            const notificationValue = {
              en: entry.value || "",
              ar: entry.region === "Arab" ? entry.native_value || "" : "",
              ch: entry.region === "Chinese" ? entry.native_value || "" : "",
            };

            const notificationAttribute = {
              en: entry.en_question || "",
              ar: entry.question || "",
              ch: entry.ch_question || "",
            };

            const regionDatasetRef = ref(realtimeDb, `${entry.region}C/Details`);
            const snapshot = await get(regionDatasetRef);

            if (snapshot.exists()) {
              const details = snapshot.val();
              for (const [detailKey, detailValue] of Object.entries(details)) {
                if (detailValue.topic === entry.topic) {
                  const annotations = detailValue.annotations || [];
                  const filteredAnnotations = annotations.filter(
                    (annotation) =>
                      !(
                        annotation.user_id === entry.userId &&
                        (annotation.en_values || []).includes(entry.value)
                      )
                  );

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

            await update(ref(realtimeDb, `Viewedit/${entry.region}/${entry.id}`), {
              modAction: "action",
            });

            const notificationsRef = ref(realtimeDb, `notifications`);
            const notificationsSnap = await get(notificationsRef);
            if (notificationsSnap.exists()) {
              const notificationsData = notificationsSnap.val();
              for (const [notifId, notifDetails] of Object.entries(notificationsData)) {
                const notifArray = notifDetails.notifications || [];
                const updatedNotifArray = notifArray.map((n) => {
                  if (
                    n.userId.shortId === entry.userId &&
                    n.attribute.en === entry.en_question &&
                    n.PreviousValue.en === entry.value
                  ) {
                    return { ...n, modAction: "action" };
                  }
                  return n;
                });

                await update(ref(realtimeDb, `notifications/${notifId}`), {
                  notifications: updatedNotifArray,
                });

                const cleanedArray = updatedNotifArray.filter(
                  (n) =>
                    !(
                      n.userId.shortId === entry.userId &&
                      n.attribute.en === entry.en_question &&
                      n.PreviousValue.en === entry.value
                    )
                );

                if (cleanedArray.length < updatedNotifArray.length) {
                  await update(ref(realtimeDb, `notifications/${notifId}`), {
                    notifications: cleanedArray,
                  });
                }
              }
            }

            await createUserNotification(
              fullUserId,
              notificationAttribute,
              notificationValue,
              "deleted"
            );

            setViewEditEntries((prev) => prev.filter((e) => e.id !== entry.id));
          } catch (error) {
            console.error("Error in handleDeleteViewEntry:", error);
            setError("Failed to delete value.");
          } finally {
            setConfirmModal({ isOpen: false, message: "", onConfirm: null });
          }
        },
      });
    },
    [createUserNotification]
  );

  const handleDeleteValue = useCallback(
    async (notification) => {
      setConfirmModal({
        isOpen: true,
        message: "Are you sure you want to delete this value?",
        actionType: "delete",
        onConfirm: async () => {
          setError(null);
          try {
            const shortId = notification.userId.shortId;
            const fullId = notification.userId.fullId;
            const valueToDelete = notification.PreviousValue.en;
            const attributeName = notification.attribute.en;

            const regionDatasetRef = ref(realtimeDb, `${notification.region}C/Details`);
            const snapshot = await get(regionDatasetRef);

            if (snapshot.exists()) {
              const details = snapshot.val();
              for (const [detailKey, detailValue] of Object.entries(details)) {
                if (detailValue.en_question === attributeName) {
                  if (!detailValue.annotations) continue;

                  const annotations = [...detailValue.annotations];
                  let removed = false;

                  const updatedAnnotations = annotations.filter((annotation) => {
                    let valueMatches = false;
                    if (Array.isArray(annotation.en_values)) {
                      valueMatches = annotation.en_values.includes(valueToDelete);
                    } else if (typeof annotation.en_values === "string") {
                      valueMatches = annotation.en_values === valueToDelete;
                    }
                    if (valueMatches) {
                      removed = true;
                      return false;
                    }
                    return true;
                  });

                  if (removed) {
                    await update(
                      ref(realtimeDb, `${notification.region}C/Details/${detailKey}`),
                      {
                        ...detailValue,
                        annotations: updatedAnnotations,
                      }
                    );
                  }
                }
              }
            }

            const vieweditRef = ref(realtimeDb, `Viewedit/${notification.region}`);
            const vieweditSnap = await get(vieweditRef);

            if (vieweditSnap.exists()) {
              const vieweditEntries = vieweditSnap.val();
              for (const [entryId, entryData] of Object.entries(vieweditEntries)) {
                const attributeMatches =
                  entryData.en_question === attributeName ||
                  entryData.attribute?.en === attributeName;

                const valueMatches =
                  entryData.value === valueToDelete ||
                  entryData.PreviousValue?.en === valueToDelete;

                if (attributeMatches && valueMatches) {
                  await update(
                    ref(realtimeDb, `Viewedit/${notification.region}/${entryId}`),
                    { modAction: "action" }
                  );
                }
              }
            }

            if (notification.id) {
              const notificationRef = ref(
                realtimeDb,
                `notifications/${notification.id}/notifications`
              );
              const notifSnapshot = await get(notificationRef);

              if (notifSnapshot.exists()) {
                const notificationArray = notifSnapshot.val();
                const cleanedNotifications = notificationArray.filter(
                  (n) =>
                    !(
                      n.attribute?.en === attributeName &&
                      n.PreviousValue?.en === valueToDelete
                    )
                );

                if (cleanedNotifications.length < notificationArray.length) {
                  await set(notificationRef, cleanedNotifications);
                }
              }
            }

            if (fullId) {
              await createUserNotification(
                fullId,
                notification.attribute,
                notification.PreviousValue,
                "deleted"
              );
            }

            setNotifications((prev) =>
              prev.filter(
                (n) =>
                  !(
                    n.attribute.en === notification.attribute.en &&
                    n.PreviousValue.en === notification.PreviousValue.en
                  )
              )
            );
          } catch (error) {
            console.error("Error deleting value:", error);
            setError("Failed to delete value.");
          } finally {
            setConfirmModal({ isOpen: false, message: "", onConfirm: null });
          }
        },
      });
    },
    [createUserNotification]
  );

  const handleDeleteAttribute = useCallback(
    async (notification) => {
      setConfirmModal({
        isOpen: true,
        message: "Are you sure you want to delete this attribute from the dataset?",
        actionType: "delete",
        onConfirm: async () => {
          setError(null);
          try {
            const attributeName = notification.attribute.en;
            const region = notification.region;

            const regionDatasetRef = ref(realtimeDb, `${region}C/Details`);
            const snapshot = await get(regionDatasetRef);

            if (snapshot.exists()) {
              const details = snapshot.val();
              const updatedDetails = details.filter(
                (detail) => detail.en_question !== attributeName
              );

              if (updatedDetails.length < details.length) {
                await set(regionDatasetRef, updatedDetails);
              }
            }

            if (notification.id) {
              const notificationRef = ref(
                realtimeDb,
                `notifications/${notification.id}/notifications`
              );
              const notifSnapshot = await get(notificationRef);

              if (notifSnapshot.exists()) {
                const notificationArray = notifSnapshot.val();
                const cleanedNotifications = notificationArray.filter(
                  (n) => n.attribute?.en !== attributeName
                );

                await set(notificationRef, cleanedNotifications);
              }
            }

            const vieweditRef = ref(realtimeDb, `Viewedit/${region}`);
            const vieweditSnap = await get(vieweditRef);

            if (vieweditSnap.exists()) {
              const vieweditEntries = vieweditSnap.val();
              for (const [entryId, entryData] of Object.entries(vieweditEntries)) {
                if (
                  entryData.en_question === attributeName ||
                  entryData.attribute?.en === attributeName
                ) {
                  await update(
                    ref(realtimeDb, `Viewedit/${region}/${entryId}`),
                    { modAction: "action" }
                  );
                }
              }
            }

            if (notification.userId?.fullId) {
              await createUserNotification(
                notification.userId.fullId,
                notification.attribute,
                notification.PreviousValue || { en: "" },
                "deleted"
              );
            }

            setNotifications((prev) =>
              prev.filter((n) => n.attribute.en !== attributeName)
            );
          } catch (error) {
            console.error("Error deleting attribute:", error);
            setError("Failed to delete attribute.");
          } finally {
            setConfirmModal({ isOpen: false, message: "", onConfirm: null });
          }
        },
      });
    },
    [createUserNotification]
  );

  const handleDenyRequest = useCallback(
    async (notification) => {
      setConfirmModal({
        isOpen: true,
        message: "Are you sure you want to deny this request?",
        actionType: "deny",
        onConfirm: async () => {
          setError(null);
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
                    n.attribute?.en === notification.attribute.en &&
                    n.PreviousValue?.en === notification.PreviousValue.en &&
                    n.region === notification.region
                  ) {
                    return { ...n, modAction: "action" };
                  }
                  return n;
                }
              );

              await set(notificationRef, { notifications: updatedNotifications });

              const vieweditRef = ref(realtimeDb, `Viewedit/${notification.region}`);
              const vieweditSnap = await get(vieweditRef);

              if (vieweditSnap.exists()) {
                const vieweditEntries = vieweditSnap.val();
                for (const [entryId, entryData] of Object.entries(vieweditEntries)) {
                  const attributeMatches =
                    entryData.en_question === notification.attribute.en ||
                    entryData.attribute?.en === notification.attribute.en;

                  const valueMatches =
                    entryData.value === notification.PreviousValue.en ||
                    entryData.PreviousValue?.en === notification.PreviousValue.en;

                  if (attributeMatches && valueMatches) {
                    await update(
                      ref(realtimeDb, `Viewedit/${notification.region}/${entryId}`),
                      { modAction: "action" }
                    );
                  }
                }
              }

              if (notification.userId?.fullId) {
                await createUserNotification(
                  notification.userId.fullId,
                  notification.attribute,
                  notification.PreviousValue,
                  "denied"
                );
              }

              setNotifications((prev) =>
                prev.filter(
                  (n) =>
                    !(
                      n.attribute.en === notification.attribute.en &&
                      n.PreviousValue.en === notification.PreviousValue.en
                    )
                )
              );
            }
          } catch (error) {
            console.error("Error denying request:", error);
            setError("Failed to deny request.");
          } finally {
            setConfirmModal({ isOpen: false, message: "", onConfirm: null });
          }
        },
      });
    },
    [createUserNotification]
  );

  const handleMenuToggle = () => setMenuOpen(!menuOpen);
  const handleProfileClick = () => navigate("/profile");
  const handleSignOut = () => setShowSignOutModal(true);
  const handleConfirmSignOut = () => {
    setShowSignOutModal(false);
    navigate("/Login");
  };
  const handleCancelSignOut = () => setShowSignOutModal(false);

  // Filter notifications based on the current selected filter type
  const filteredNotifications = notifications.filter(
    notification => notification.notificationType === filterType
  );

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
          User Report Page
        </a>
        <button className="menu-btn" onClick={handleMenuToggle}>
          <span className="menu-icon">☰</span>
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
      {error && <div className="error-message">{error}</div>}
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
      
      {loading ? (
        <div className="loading-indicator">
          {/* You can add a spinner or loading animation here if needed */}
        </div>
      ) : (
        <>
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
              <div className="filter-container">
                <label htmlFor="filterType">Filter by: </label>
                <select
                  id="filterType"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="filter-select"
                >
                  <option value="value">Values</option>
                  <option value="attribute">Attributes</option>
                </select>
              </div>
              
              {filteredNotifications.length > 0 ? (
                <table className="styled-table">
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>Attribute</th>
                      <th>Topic</th>
                      {filterType === "value" && <th>Previous Value</th>}
                      <th>Description</th>
                      <th>{filterType === "value" ? "Delete Value" : "Delete Attribute"}</th>
                      <th>Deny Request</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredNotifications.map((notification) => (
                      <NotificationRow
                        key={notification.uniqueId}
                        notification={notification}
                        onDelete={
                          filterType === "value" ? handleDeleteValue : handleDeleteAttribute
                        }
                        onDeny={handleDenyRequest}
                        filterType={filterType}
                      />
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-notifications">No {filterType} notifications</p>
              )}
            </div>
          )}
        </>
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
      </footer>
    </div>
  );
};

export default ModeratorPage;