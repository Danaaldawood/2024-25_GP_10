import React, { useState, useEffect, useRef } from 'react';
import { ref, onValue, update, remove, get } from 'firebase/database';
import { auth, realtimeDb } from '../Register/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next'; // Add i18n support
import './NotificationBell.css';
 const NotificationBell = () => {
  
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userId, setUserId] = useState(null);
  const dropdownRef = useRef(null);
  const { t, i18n } = useTranslation('headerpage');
  const isRTL = i18n.dir() === 'rtl';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        const notificationsArray = Array.isArray(existingNotifications) 
          ? existingNotifications 
          : Object.values(existingNotifications);

        const updatedNotifications = notificationsArray.map(notification => 
          notification.id === notificationId ? { ...notification, read: true } : notification
        );

        const notificationsObject = updatedNotifications.reduce((obj, notification, index) => {
          obj[index] = notification;
          return obj;
        }, {});

        await update(userNotificationsRef, notificationsObject);
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
        const notificationsArray = Array.isArray(existingNotifications) 
          ? existingNotifications 
          : Object.values(existingNotifications);

        const updatedNotifications = notificationsArray.filter(
          notification => notification.id !== notificationId
        );

        if (updatedNotifications.length === 0) {
          await remove(userNotificationsRef);
          setNotifications([]);
        } else {
          const notificationsObject = updatedNotifications.reduce((obj, notification, index) => {
            obj[index] = notification;
            return obj;
          }, {});

          await update(userNotificationsRef, notificationsObject);
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
    <div className="notification-bell-container" ref={dropdownRef}>
      <div className="bell-icon" onClick={toggleDropdown}>
        <FontAwesomeIcon icon={faBell} />
        {notifications.length > 0 && (
          <span className="notification-count">{notifications.length}</span>
        )}
      </div>
      
      {showDropdown && (
        <div className="notification-dropdown" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
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
                      {new Date(notification.timestamp).toLocaleDateString(
                        isRTL ? 'ar-SA' : 'en-US'
                      )}
                    </span>
                  </div>
                  <div className="notification-actions">
                    {!notification.read && (
                      <button 
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="mark-read-btn"
                      >
                        {t("Markasread")}
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(notification.id)}
                      className="delete-btn"
                    >
                      {t("Delete")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-notifications">{t("No notifications")}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;