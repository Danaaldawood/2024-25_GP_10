import React, { useState, useEffect } from 'react';
import { ref, onValue, update, remove, get } from 'firebase/database';
import { auth, realtimeDb } from '../Register/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import './NotificationBell.css';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const lastFourUID = user.uid.slice(-4);
        setUserId(`user_${lastFourUID}`);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const notificationsRef = ref(realtimeDb, `userNotifications/${userId}`);
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const notificationsData = snapshot.val();
        // Convert object to array if needed
        const notificationsArray = Array.isArray(notificationsData) 
          ? notificationsData 
          : Object.values(notificationsData);
        setNotifications(notificationsArray);
      } else {
        setNotifications([]);
      }
    });

    return () => unsubscribe();
  }, [userId]);

  const handleMarkAsRead = async (notificationId) => {
    if (!userId) return;

    try {
      const userNotificationsRef = ref(realtimeDb, `userNotifications/${userId}`);
      const snapshot = await get(userNotificationsRef);

      if (snapshot.exists()) {
        const existingNotifications = snapshot.val();
        // Convert to array if it's an object
        const notificationsArray = Array.isArray(existingNotifications) 
          ? existingNotifications 
          : Object.values(existingNotifications);

        const updatedNotifications = notificationsArray.map(notification => 
          notification.id === notificationId ? { ...notification, read: true } : notification
        );

        // Convert array to object with numeric keys
        const notificationsObject = updatedNotifications.reduce((obj, notification, index) => {
          obj[index] = notification;
          return obj;
        }, {});

        await update(userNotificationsRef, notificationsObject);
        setNotifications(updatedNotifications);
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleDelete = async (notificationId) => {
    if (!userId) return;

    try {
      const userNotificationsRef = ref(realtimeDb, `userNotifications/${userId}`);
      const snapshot = await get(userNotificationsRef);

      if (snapshot.exists()) {
        const existingNotifications = snapshot.val();
        // Convert to array if it's an object
        const notificationsArray = Array.isArray(existingNotifications) 
          ? existingNotifications 
          : Object.values(existingNotifications);

        const updatedNotifications = notificationsArray.filter(
          notification => notification.id !== notificationId
        );

        if (updatedNotifications.length === 0) {
          // If no notifications left, remove the entire node
          await remove(userNotificationsRef);
          setNotifications([]);
        } else {
          // Convert array to object with numeric keys
          const notificationsObject = updatedNotifications.reduce((obj, notification, index) => {
            obj[index] = notification;
            return obj;
          }, {});

          await update(userNotificationsRef, notificationsObject);
          setNotifications(updatedNotifications);
        }
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div className="notification-bell-container">
      <div className="bell-icon" onClick={toggleDropdown}>
        <FontAwesomeIcon icon={faBell} />
        {notifications.length > 0 && (
          <span className="notification-count">{notifications.length}</span>
        )}
      </div>
      
      {showDropdown && (
        <div className="notification-dropdown">
          {notifications.length > 0 ? (
            <div className="notifications-list">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`notification-item-header ${notification.read ? 'read' : 'unread'}`}
                >
                  <div className="notification-content">
                    <p className="notification-text">
                      {`${notification.action} for ${notification.attribute}`}
                    </p>
                    <span className="notification-time">
                      {new Date(notification.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="notification-actions">
                    {!notification.read && (
                      <button 
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="mark-read-btn"
                      >
                        Mark as read
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(notification.id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-notifications">No notifications</div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;