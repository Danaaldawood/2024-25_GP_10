import React, { useState, useEffect, useRef } from 'react';
import { ref, onValue, remove, get, set } from 'firebase/database';
import { auth, realtimeDb } from '../Register/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import './NotificationBell.css';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userId, setUserId] = useState(null);
  const dropdownRef = useRef(null);
  const { t, i18n } = useTranslation('headerpage');
  const isRTL = i18n.dir() === 'rtl';

  // Get display text based on current language and data structure
  const getDisplayText = (item) => {
    if (!item) return "";
    const currentLang = i18n.language;
    
    // First try exact language match
    if (item[currentLang]) {
      return item[currentLang];
    }
    
    // Handle specific language cases
    if (currentLang === "ar" && item.ar) {
      return item.ar;
    } else if (currentLang === "ch" && item.ch) {
      return item.ch;
    }
    
    // Fallback to English or empty string
    return item.en || "";
  };

  // Format the complete notification message
  const formatNotificationMessage = (notification) => {
    if (!notification) return "";
    
    const action = getDisplayText(notification.action);
    const attribute = getDisplayText(notification.attribute);
    const value = notification.notifiedValue ? getDisplayText(notification.notifiedValue) : "";

    return value 
      ? `${action} - ${attribute} (${value})`
      : `${action} - ${attribute}`;
  };

  // Handle clicks outside of notification dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle user authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to notifications updates
  useEffect(() => {
    if (!userId) return;

    const notificationsRef = ref(realtimeDb, `userNotifications/${userId}`);
    
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const notificationsData = snapshot.val();
        let notificationsArray = Array.isArray(notificationsData) 
          ? notificationsData 
          : Object.values(notificationsData);
        
        // Add unique keys and sort by timestamp
        const processedNotifications = notificationsArray
          .map(notification => ({
            ...notification,
            uniqueKey: `${notification.id}-${notification.timestamp}-${Math.random().toString(36).substring(7)}`
          }))
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        setNotifications(processedNotifications);
      } else {
        setNotifications([]);
      }
    });

    return () => unsubscribe();
  }, [userId]);

  // Handle marking notification as read
  const handleMarkAsRead = async (notificationId) => {
    if (!userId) return;

    try {
      // Optimistic update
      setNotifications(prev => prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true } 
          : notification
      ));

      const userNotificationsRef = ref(realtimeDb, `userNotifications/${userId}`);
      const snapshot = await get(userNotificationsRef);

      if (snapshot.exists()) {
        const existingNotifications = snapshot.val();
        const notificationsArray = Array.isArray(existingNotifications) 
          ? [...existingNotifications]
          : Object.values(existingNotifications);

        const updatedNotifications = notificationsArray.map(notification =>
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        );

        await set(userNotificationsRef, updatedNotifications);
      }
    } catch (error) {
      // Revert optimistic update on error
      console.error("Error marking notification as read:", error);
      setNotifications(prev => prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: false } 
          : notification
      ));
    }
  };

  // Handle deleting notification
  const handleDelete = async (notificationId) => {
    if (!userId) return;

    try {
      // Optimistic update
      setNotifications(prev => prev.filter(notification => notification.id !== notificationId));

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
        } else {
          await set(userNotificationsRef, updatedNotifications);
        }
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      // Revert optimistic update on error
      const userNotificationsRef = ref(realtimeDb, `userNotifications/${userId}`);
      const snapshot = await get(userNotificationsRef);
      if (snapshot.exists()) {
        setNotifications(Object.values(snapshot.val()));
      }
    }
  };

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <div className="bell-icon" onClick={() => setShowDropdown(!showDropdown)}>
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
                  key={notification.uniqueKey}
                  className={`notification-item-header ${notification.read ? 'read' : 'unread'}`}
                >
                  <div className="notification-content">
                    <p className="notification-text">
                      {formatNotificationMessage(notification)}
                    </p>
                    <span className="notification-time">
                      {new Date(notification.timestamp).toLocaleDateString(
                        isRTL ? 'ar-SA' : 'en-US',
                        { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }
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
                      className="delete-btn-bell"
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