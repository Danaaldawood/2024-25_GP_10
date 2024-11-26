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

// Modal component for confirmations (delete, deny, replace actions)
const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed">
      <div className="modal-content">
        <p className="modal-message">{message}</p>
        <div className="modal-buttons">
          <button className="modal-btn confirm-btn-not" onClick={onConfirm}>
            Confirm
          </button>
          <button className="modal-btn cancel-btn-not" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const ModeratorPage = () => {
  // State variables for managing the component
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

  // Fetch moderator-specific data after authentication
  useEffect(() => {
    const fetchModeratorData = async (user) => {
      try {
        const moderatorRef = doc(db, 'Moderators', user.uid);
        const moderatorSnap = await getDoc(moderatorRef);

        if (moderatorSnap.exists()) {
          const { regionM } = moderatorSnap.data();

          // Fetch entries in "View Edit" specific to the moderator's region
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

          // Fetch notifications related to the moderator's region
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

    // Subscribe to auth changes to fetch user-specific data
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchModeratorData(user);
      }
    });

    return () => unsubscribe(); // Cleanup auth listener
  }, []);

  // Handlers for various UI actions
  const handleMenuToggle = () => setMenuOpen(!menuOpen);
  const handleProfileClick = () => navigate('/profile');
  const handleSignOut = () => setShowSignOutModal(true);
  const handleConfirmSignOut = () => {
    setShowSignOutModal(false);
    navigate('/Login');
  };
  const handleCancelSignOut = () => setShowSignOutModal(false);

  // Deletes a specific value and updates the notification list
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

  // Deny a user request by removing the corresponding notification
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

  // Replace a value with the user's suggested value
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

  // Deletes an entry from the "View Edit" table
  const handleDeleteEntry = async (entryId, region) => {
    try {
      const entryRef = ref(realtimeDb, `Viewedit/${region}/${entryId}`);
      await remove(entryRef);
      setViewEditEntries(prev => prev.filter(entry => entry.id !== entryId));
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };

  // Toggles the reviewed status of a "View Edit" entry
  const handleToggleReviewed = (entryId) => {
    setViewEditEntries(prev =>
      prev.map(entry =>
        entry.id === entryId ? { ...entry, isReviewed: !entry.isReviewed } : entry
      )
    );
  };

  // Render the component
  return (
    <div className="moderator-container">
      {/* Page metadata */}
      <Helmet>
        <title>Moderator Page</title>
        <meta name="description" content="Moderator page" />
      </Helmet>

      {/* Header with logo and menu */}
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

      {/* Tabs */}
      <div className="tabs">
        <button
          className={view === 'view-edit' ? 'active' : ''}
          onClick={() => setView('view-edit')}
        >
          View/Edit
        </button>
        <button
          className={view === 'notifications' ? 'active' : ''}
          onClick={() => setView('notifications')}
        >
          Notifications
        </button>
      </div>

      {/* Conditional rendering of tab content */}
      <div className="content">
        {view === 'view-edit' && (
          <div className="view-edit-tab">
            <h2>View/Edit</h2>
            {viewEditEntries.length > 0 ? (
              <table className="entries-table">
                <thead>
                  <tr>
                    <th>Details</th>
                    <th>Actions</th>
                    <th>Reviewed</th>
                  </tr>
                </thead>
                <tbody>
                  {viewEditEntries.map(entry => (
                    <tr key={entry.id}>
                      <td>{entry.details}</td>
                      <td>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteEntry(entry.id, entry.region)}
                        >
                          Delete
                        </button>
                      </td>
                      <td>
                        <button
                          className={`reviewed-btn ${entry.isReviewed ? 'reviewed' : ''}`}
                          onClick={() => handleToggleReviewed(entry.id)}
                        >
                          {entry.isReviewed ? 'Reviewed' : 'Not Reviewed'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No entries available.</p>
            )}
          </div>
        )}

        {view === 'notifications' && (
          <div className="notifications-tab">
            <h2>Notifications</h2>
            {notifications.length > 0 ? (
              <table className="notifications-table">
                <thead>
                  <tr>
                    <th>Message</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map(notification => (
                    <tr key={notification.id}>
                      <td>{notification.message}</td>
                      <td>
                        <button
                          className="replace-btn"
                          onClick={() => handleReplaceValue(notification)}
                        >
                          Replace
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteValue(notification.id)}
                        >
                          Delete
                        </button>
                        <button
                          className="deny-btn"
                          onClick={() => handleDenyRequest(notification.id)}
                        >
                          Deny
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No notifications available.</p>
            )}
          </div>
        )}
      </div>

      {/* Confirmation modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ isOpen: false, message: '', onConfirm: null })}
      />

      {/* Footer */}
      <Footer />

      {/* Sign-out confirmation modal */}
      <SignOutConfirmation
        isOpen={showSignOutModal}
        onConfirm={handleConfirmSignOut}
        onCancel={handleCancelSignOut}
      />
    </div>
  );
};

export default ModeratorPage;
