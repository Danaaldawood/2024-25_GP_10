

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

const ModeratorPage = () => {
  const [view, setView] = useState('view-edit');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [viewEditEntries, setViewEditEntries] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchModeratorData = async (user) => {
      try {
        const moderatorRef = doc(db, 'Moderators', user.uid);
        const moderatorSnap = await getDoc(moderatorRef);

        if (moderatorSnap.exists()) {
          const { regionM } = moderatorSnap.data();

          // Fetch ViewEdit entries based on the moderator's region
          const viewEditRef = ref(realtimeDb, `Viewedit/${regionM}`);
          onValue(viewEditRef, (snapshot) => {
            if (snapshot.exists()) {
              const entries = [];
              snapshot.forEach((childSnapshot) => {
                entries.push({
                  id: childSnapshot.key,
                  ...childSnapshot.val()
                });
              });
              setViewEditEntries(entries);
            } else {
              setViewEditEntries([]);
            }
          });

          // Fetch Notifications based on the moderator's region
          const notificationsRef = ref(realtimeDb, `notifications`);
          onValue(notificationsRef, (snapshot) => {
            if (snapshot.exists()) {
              const notificationsData = [];
              snapshot.forEach((childSnapshot) => {
                const notification = childSnapshot.val();
                // Only include notifications that match the moderator's region
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
        } else {
          console.error("Moderator document not found");
        }
      } catch (error) {
        console.error("Error fetching moderator data:", error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchModeratorData(user);
      } else {
        console.error("User not authenticated");
      }
    });

    // Cleanup listener on component unmount
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
    try {
      const dataRef = ref(realtimeDb, `/${attributeId}`);
      const snapshot = await get(dataRef);

      if (snapshot.exists()) {
        const data = snapshot.val();

        // Update annotations by removing entries with the previous value or null
        const updatedAnnotations = data.annotations.filter(annotation => {
          return annotation.en_values[0] !== previousValue && annotation.en_values[0] != null;
        });

        // Update with the new annotations
        await update(dataRef, { ...data, annotations: updatedAnnotations });

        // Remove the notification
        const notificationRef = ref(realtimeDb, `notifications/${notificationId}`);
        await remove(notificationRef);
        setNotifications(notifications.filter(n => n.id !== notificationId));
      }
    } catch (error) {
      console.error('Error deleting value:', error);
    }
  };

  const handleDenyRequest = async (notificationId) => {
    try {
      const notificationRef = ref(realtimeDb, `notifications/${notificationId}`);
      await remove(notificationRef);
      setNotifications(notifications.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error denying request:', error);
    }
  };

  const handleReplaceValue = async (notification) => {
    try {
      const dataRef = ref(realtimeDb, `/${notification.id}`);
      const snapshot = await get(dataRef);

      if (snapshot.exists()) {
        const data = snapshot.val();

        const updatedAnnotations = notification.PreviousValue
          ? data.annotations.map(annotation => {
              if (annotation.en_values[0] === notification.PreviousValue) {
                return { ...annotation, en_values: [notification.suggestion] };
              }
              return annotation;
            })
          : data.annotations; // If PreviousValue is null, don't change annotations

        await update(dataRef, { ...data, annotations: updatedAnnotations });

        // Remove the notification
        const notificationRef = ref(realtimeDb, `notifications/${notification.id}`);
        await remove(notificationRef);
        setNotifications(notifications.filter(n => n.id !== notification.id));
      }
    } catch (error) {
      console.error('Error replacing value:', error);
    }
  };
  return (
    <div className="moderator-container">
      <Helmet>
        <title>Moderator Page</title>
        <meta name="description" content="This is Moderator page" />
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
          Notifications {notifications.length > 0 && <span className="notification-badge">{notifications.length}</span>}
        </button>
      </div>

      {view === 'view-edit' && (
        <div className="table-container">
          <h2 className="pagename">View Edit Dataset</h2>
          <table className="styled-table">
            <thead>
              <tr>
                <th>Attribute</th>
                <th>User ID</th>
                <th>Region</th>
                <th>Topic</th>
                <th>Value</th>
                <th>Reason</th>
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
                </tr>
              ))}
            </tbody>
          </table>
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
    <th>Notification ID</th>
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
  {notifications.map(notification => (
    <tr key={notification.id}>
      <td>{notification.userId || 'N/A'}</td>
      <td>{notification.id || 'N/A'}</td>
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
          title="Delete this value from the dataset"
        >
          Delete Value
        </button>
      </td>
      <td className="action-buttons">
         <button
          onClick={() => handleDenyRequest(notification.id)}
          className="action-btn deny-btn-not"
          title="Deny this notification request"
        >
          Deny Request
        </button>
      </td>
      <td className="action-buttons">
         {notification.suggestion && (
          <button
            onClick={() => handleReplaceValue(notification)}
            className="action-btn replace-btn"
            title="Replace with suggested value"
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

      <Footer />
    </div>
  );
};

export default ModeratorPage;