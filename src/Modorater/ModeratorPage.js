import React, { useState, useEffect } from 'react';
import { ref, onValue, remove, update, get } from 'firebase/database';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, realtimeDb } from '../Register/firebase';
import './ModeratorPage.css';
import { useNavigate } from 'react-router-dom';
import { Footer } from '../Footer/Footer';
import SignOutConfirmation from './SignOutConfirmation';
import { Helmet } from 'react-helmet';
import Logo from '../images/Logo.png';
import { onAuthStateChanged } from 'firebase/auth';
import { FaEye, FaEyeSlash, FaTimes } from 'react-icons/fa';

const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel, actionType }) => {
  if (!isOpen) return null;

  const confirmButtonClass =
    actionType === 'deny' ? 'deny-btn-not' :
    actionType === 'replace' ? 'replace-btn' :
    'delete-btn-not';

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

const ModeratorPage = () => {
  const [view, setView] = useState('view-edit');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [viewEditEntries, setViewEditEntries] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    message: '',
    onConfirm: null,
    actionType: null
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchModeratorData = async (user) => {
      try {
        const moderatorRef = doc(db, 'Moderators', user.uid);
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
                  ...childSnapshot.val()
                });
              });
              setViewEditEntries(entries);
            } else {
              setViewEditEntries([]);
            }
          });

          const notificationsRef = ref(realtimeDb, `notifications`);
          onValue(notificationsRef, (snapshot) => {
            if (snapshot.exists()) {
              const notificationsData = [];
              snapshot.forEach((childSnapshot) => {
                const notification = childSnapshot.val();
                if (notification.region === regionM) {
                  notificationsData.push({
                    id: childSnapshot.key,
                    ...notification
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

  const handleMenuToggle = () => setMenuOpen(!menuOpen);
  const handleProfileClick = () => navigate('/profile');
  const handleSignOut = () => setShowSignOutModal(true);
  const handleConfirmSignOut = () => {
    setShowSignOutModal(false);
    navigate('/Login');
  };
  const handleCancelSignOut = () => setShowSignOutModal(false);

  const handleDeleteValue = async (notificationId, attributeId, previousValue) => {
    setConfirmModal({
      isOpen: true,
      message: 'Are you sure you want to delete this value?',
      actionType: 'delete',
      onConfirm: async () => {
        try {
          // Get the notification details before deleting
          const notificationRef = ref(realtimeDb, `notifications/${notificationId}`);
          const notificationSnapshot = await get(notificationRef);
          const notificationData = notificationSnapshot.val();

          // 1. Delete from main database
          const [region, detailKey] = attributeId.split('-');
          const dataRef = ref(realtimeDb, `/${region}/Details/${detailKey}`);
          const snapshot = await get(dataRef);

          if (snapshot.exists()) {
            const data = snapshot.val();
            const updatedAnnotations = data.annotations.filter(annotation =>
              annotation.en_values[0] !== previousValue && annotation.en_values[0] != null
            );

            if (updatedAnnotations.length > 0) {
              await update(dataRef, { ...data, annotations: updatedAnnotations });
            }
          }

          // 2. Delete from ViewEdit table - checking attribute and value match
          const viewEditRef = ref(realtimeDb, `Viewedit/${notificationData.region}`);
          const viewEditSnapshot = await get(viewEditRef);
          
          if (viewEditSnapshot.exists()) {
            const entries = viewEditSnapshot.val();
            Object.entries(entries).forEach(async ([key, entry]) => {
              if (
                entry.value === previousValue && 
                entry.attribute === notificationData.attribute
              ) {
                await remove(ref(realtimeDb, `Viewedit/${notificationData.region}/${key}`));
                setViewEditEntries(prev => prev.filter(e => e.id !== key));
              }
            });
          }

          // 3. Delete the notification
          await remove(notificationRef);
          setNotifications(prev => prev.filter(n => n.id !== notificationId));

        } catch (error) {
          console.error('Error deleting value:', error);
        }
        setConfirmModal({ isOpen: false, message: '', onConfirm: null });
      },
    });
  };

  const handleDeleteViewEntry = async (entry) => {
    const { region, topic, attribute, userId, value } = entry;

    setConfirmModal({
      isOpen: true,
      message: "Are you sure you want to delete this Value ?",
      actionType: 'delete',
      onConfirm: async () => {
        try {
          // 1. Delete from main database
          const regionDatasetRef = ref(realtimeDb, `${region}C/Details`);
          const snapshot = await get(regionDatasetRef);

          if (snapshot.exists()) {
            const details = snapshot.val();
            let updated = false;

            for (const [detailKey, detailValue] of Object.entries(details)) {
              if (
                detailValue.topic === topic &&
                detailValue.en_question === attribute
              ) {
                const annotations = detailValue.annotations || [];
                const filteredAnnotations = annotations.filter(
                  (annotation) =>
                    !(
                      annotation.user_id === userId &&
                      annotation.en_values.includes(value)
                    )
                );

                if (filteredAnnotations.length !== annotations.length) {
                  updated = true;
                  const detailRef = ref(
                    realtimeDb,
                    `${region}C/Details/${detailKey}`
                  );
                  await update(detailRef, { ...detailValue, annotations: filteredAnnotations });
                }
              }
            }
          }

          // 2. Delete from ViewEdit
          const viewEditRef = ref(realtimeDb, `Viewedit/${region}/${entry.id}`);
          await remove(viewEditRef);

          // 3. Delete corresponding notifications - checking attribute and value match
          const notificationsRef = ref(realtimeDb, 'notifications');
          const notificationsSnapshot = await get(notificationsRef);
          
          if (notificationsSnapshot.exists()) {
            const notifications = notificationsSnapshot.val();
            Object.entries(notifications).forEach(async ([notificationId, notification]) => {
              if (
                notification.region === region && 
                notification.attribute === attribute &&
                notification.PreviousValue === value
              ) {
                await remove(ref(realtimeDb, `notifications/${notificationId}`));
                setNotifications(prev => prev.filter(n => n.id !== notificationId));
              }
            });
          }

          setViewEditEntries(prev => prev.filter(e => e.id !== entry.id));

        } catch (error) {
          console.error("Error deleting entry:", error);
        }
        setConfirmModal({ isOpen: false, message: '', onConfirm: null });
      },
      onCancel: () => setConfirmModal({ isOpen: false, message: '', onConfirm: null }),
    });
  };

  const handleDenyRequest = async (notificationId) => {
    setConfirmModal({
      isOpen: true,
      message: 'Are you sure you want to deny this request?',
      actionType: 'deny',
      onConfirm: async () => {
        try {
          const notificationRef = ref(realtimeDb, `notifications/${notificationId}`);
          await remove(notificationRef);
          setNotifications(prev => prev.filter(n => n.id !== notificationId));
        } catch (error) {
          console.error('Error denying request:', error);
        }
        setConfirmModal({ isOpen: false, message: '', onConfirm: null });
      },
    });
  };

  const handleReplaceValue = async (notification) => {
    setConfirmModal({
      isOpen: true,
      message: 'Are you sure you want to replace this value?',
      actionType: 'replace',
      onConfirm: async () => {
        try {
          const [region, detailKey] = notification.id.split('-');
          const dataRef = ref(realtimeDb, `/${region}/Details/${detailKey}`);
          const snapshot = await get(dataRef);

          if (snapshot.exists()) {
            const data = snapshot.val();
            const updatedAnnotations = notification.PreviousValue
              ? data.annotations.map(annotation => {
                  if (annotation.en_values[0] === notification.PreviousValue) {
                    return {
                      ...annotation,
                      en_values: [notification.suggestion],
                      reason: annotation.reason || 'Updated value'
                    };
                  }
                  return annotation;
                })
              : data.annotations;

            await update(dataRef, { ...data, annotations: updatedAnnotations });
            const notificationRef = ref(realtimeDb, `notifications/${notification.id}`);
            await remove(notificationRef);
            setNotifications(prev => prev.filter(n => n.id !== notification.id));
          }
        } catch (error) {
          console.error('Error replacing value:', error);
        }
        setConfirmModal({ isOpen: false, message: '', onConfirm: null });
      },
    });
  };

  const handleToggleReviewed = (entryId) => {
    setViewEditEntries(prev =>
      prev.map(entry =>
        entry.id === entryId ? { ...entry, isReviewed: !entry.isReviewed } : entry
      )
    );
  };

  return (
    <div className="moderator-container">
      <Helmet>
        <title>Moderator Page</title>
        <meta name="description" content="Moderator page" />
      </Helmet>

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
            <p onClick={handleSignOut} className="sign-out">Log out</p>
          </div>
        )}
      </header>

      <div className="header-banner">
        <h1>Moderator Page</h1>
      </div>

      <div className="toggle-buttons">
        <button 
          className={view === 'view-edit' ? 'active' : ''} 
          onClick={() => setView('view-edit')}
        >
          View Edit
        </button>
        <button 
          className={`notification-btn ${view === 'notifications' ? 'active' : ''}`} 
          onClick={() => setView('notifications')}
        >
          Notifications 
          {notifications.length > 0 && (
            <span className="notification-badge">{notifications.length}</span>
          )}
        </button>
      </div>

      {view === 'view-edit' && (
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
                        onClick={() => {
                          handleToggleReviewed(entry.id);
                          if (!entry.isReviewed) {
                            // Replace handleDeleteEntry with handleDeleteViewEntry
                            handleDeleteViewEntry(entry);
                          }
                        }}
                        title={entry.isReviewed ? "Mark as not reviewed" : "Mark as reviewed"}
                      >
                        {entry.isReviewed ? <FaEye /> : <FaEyeSlash />}
                      </button>
                    </td>
                    <td>
                      <button
                        className="action-btndelete-btn"
                        onClick={() => handleDeleteViewEntry(entry)}
                        title="Reject this Value"
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

      {view === 'notifications' && (
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
                  <th>Suggestion</th>
                  <th>Description</th>
                  <th>Delete Value</th>
                  <th>Deny Request</th>
                  <th>Replace Value</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((notification) => (
                  <tr key={notification.id}>
                    <td>{notification.userId || 'N/A'}</td>
                    <td>{notification.attribute || 'N/A'}</td>
                    <td>{notification.topic || 'N/A'}</td>
                    <td>{notification.PreviousValue || 'N/A'}</td>
                    <td>{notification.suggestion || 'N/A'}</td>
                    <td>{notification.description || 'N/A'}</td>
                    <td className="action-buttons">
                      <button
                        onClick={() => handleDeleteValue(
                          notification.id, 
                          notification.id, 
                          notification.PreviousValue
                        )}
                        className="action-btn delete-btn-not"
                        title="Delete this value"
                      >
                        Delete Value
                      </button>
                    </td>
                    <td className="action-buttons">
                      <button
                        onClick={() => handleDenyRequest(notification.id)}
                        className="action-btn deny-btn-not"
                        title="Deny request"
                      >
                        Deny Request
                      </button>
                    </td>
                    <td className="action-buttons">
                      {notification.suggestion && (
                        <button
                          onClick={() => handleReplaceValue(notification)}
                          className="action-btn replace-btn"
                          title="Replace value"
                        >
                          Replace Value
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-notifications">No notifications available</p>
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
        onCancel={() => setConfirmModal({ isOpen: false, message: '', onConfirm: null, actionType: null })}
        actionType={confirmModal.actionType}
      />

      <Footer />
    </div>
  );
};

export default ModeratorPage;