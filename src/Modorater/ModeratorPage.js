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
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed">
      <div className="modal-content">
        <p className="modal-message">{message}</p>
        <div className="modal-buttons">
          <button className="modal-btn confirm-btn" onClick={onConfirm}>
            Confirm
          </button>
          <button className="modal-btn cancel-btn" onClick={onCancel}>
            Cancel
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
    onConfirm: null
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
      onConfirm: async () => {
        try {
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
              const notificationRef = ref(realtimeDb, `notifications/${notificationId}`);
              await remove(notificationRef);
              setNotifications(prev => prev.filter(n => n.id !== notificationId));
            }
          }
        } catch (error) {
          console.error('Error deleting value:', error);
        }
        setConfirmModal({ isOpen: false, message: '', onConfirm: null });
      }
    });
  };

  const handleDenyRequest = async (notificationId) => {
    setConfirmModal({
      isOpen: true,
      message: 'Are you sure you want to deny this request?',
      onConfirm: async () => {
        try {
          const notificationRef = ref(realtimeDb, `notifications/${notificationId}`);
          await remove(notificationRef);
          setNotifications(prev => prev.filter(n => n.id !== notificationId));
        } catch (error) {
          console.error('Error denying request:', error);
        }
        setConfirmModal({ isOpen: false, message: '', onConfirm: null });
      }
    });
  };

  const handleReplaceValue = async (notification) => {
    setConfirmModal({
      isOpen: true,
      message: 'Are you sure you want to replace this value?',
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
      }
    });
  };

  const handleDeleteEntry = async (entryId, region) => {
    try {
      const entryRef = ref(realtimeDb, `Viewedit/${region}/${entryId}`);
      await remove(entryRef);
      setViewEditEntries(prev => prev.filter(entry => entry.id !== entryId));
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
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
                  <th>Action</th>
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
                            handleDeleteEntry(entry.id, entry.region);
                          }
                        }}
                        title={entry.isReviewed ? "Mark as not reviewed" : "Mark as reviewed"}
                      >
                        {entry.isReviewed ? <FaEye /> : <FaEyeSlash />}
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
        onCancel={() => setConfirmModal({ isOpen: false, message: '', onConfirm: null })}
      />

      <Footer />
    </div>
  );
};

export default ModeratorPage;