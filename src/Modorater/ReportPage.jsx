import React, { useState, useEffect } from "react";
import { ref, onValue, push, update, get, set } from "firebase/database";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { realtimeDb, auth, db } from '../Register/firebase';
import { onAuthStateChanged } from "firebase/auth";
import "./ReportPage.css";
import { Helmet } from 'react-helmet';
import Logo from "../images/Logo.png";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import '../Footer/Footer.css';
import { RiTwitterXLine } from "react-icons/ri";
import { IoLogoInstagram } from "react-icons/io5";
import { MdEmail } from "react-icons/md";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faTwitter, faInstagram } from "@fortawesome/free-brands-svg-icons";
const ReportPage = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [moderatorRegion, setModeratorRegion] = useState("");

  // Show more/less state for added values and notifications
  const [showMoreAddedValues, setShowMoreAddedValues] = useState({});
  const [showMoreNotifications, setShowMoreNotifications] = useState({});

  const maxItemsToShow = 3;  // Limit number of items to show initially

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const moderatorRef = doc(db, "Moderators", user.uid);
          const moderatorSnap = await getDoc(moderatorRef);

          if (moderatorSnap.exists()) {
            const { regionM } = moderatorSnap.data();
            setModeratorRegion(regionM);

            const viewEditRef = ref(realtimeDb, `Viewedit/${regionM}`);
            onValue(viewEditRef, async (viewEditSnapshot) => {
              const userMap = new Map();

              if (viewEditSnapshot.exists()) {
                const viewEditData = viewEditSnapshot.val();
                Object.entries(viewEditData).forEach(([key, entry]) => {
                  const userId = entry.fullUserId;
                  if (!userMap.has(userId)) {
                    userMap.set(userId, {
                      userId,
                      shortId: entry.userId || `user_${userId.slice(-4)}`,
                      addedValues: [],
                      notifications: [],
                      status: 'active'
                    });
                  }
                  userMap.get(userId).addedValues.push({
                    value: entry.value,
                    topic: entry.topic,
                    attribute: entry.en_question || entry.attribute,
                    modAction: entry.modAction || 'noaction'
                  });
                });
              }

              const notificationsRef = ref(realtimeDb, 'notifications');
              const notifSnapshot = await get(notificationsRef);

              if (notifSnapshot.exists()) {
                const notifData = notifSnapshot.val();
                Object.entries(notifData).forEach(([groupId, group]) => {
                  if (group.notifications) {
                    group.notifications.forEach(notification => {
                      if (notification.region === regionM && notification.userId?.fullId) {
                        const userId = notification.userId.fullId;
                        if (!userMap.has(userId)) {
                          userMap.set(userId, {
                            userId,
                            shortId: notification.userId.shortId,
                            addedValues: [],
                            notifications: [],
                            status: 'active'
                          });
                        }
                        userMap.get(userId).notifications.push({
                          attribute: notification.attribute,
                          description: notification.description,
                          previousValue: notification.PreviousValue,
                          modAction: notification.modAction || 'noaction'
                        });
                      }
                    });
                  }
                });
              }

              const usersRef = ref(realtimeDb, 'Users');
              const usersSnapshot = await get(usersRef);

              if (usersSnapshot.exists()) {
                const usersData = usersSnapshot.val();
                userMap.forEach((userData, userId) => {
                  if (usersData[userId]) {
                    userData.status = usersData[userId].status || 'active';
                  }
                });
              }

              setUsers(Array.from(userMap.values()));
            });
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Toggle show more/less for added values
  const toggleShowMoreAddedValues = (userId) => {
    setShowMoreAddedValues((prevState) => ({
      ...prevState,
      [userId]: !prevState[userId]
    }));
  };

  // Toggle show more/less for notifications
  const toggleShowMoreNotifications = (userId) => {
    setShowMoreNotifications((prevState) => ({
      ...prevState,
      [userId]: !prevState[userId]
    }));
  };

  const handleBlock = async (userId) => {
    try {
      const updates = {
        status: 'blocked',
        blockedAt: new Date().toISOString()
      };

      await update(ref(realtimeDb, `Users/${userId}`), updates);
      await setDoc(doc(db, "Users", userId), updates, { merge: true });

      setUsers(prev => prev.map(user => 
        user.userId === userId ? { ...user, status: 'blocked' } : user
      ));

      const notificationData = {
        id: push(ref(realtimeDb)).key,
        attribute: 'Account Status',
        action: 'Your account has been blocked',
        timestamp: new Date().toISOString(),
        read: false
      };

      const userNotificationsRef = ref(realtimeDb, `userNotifications/${userId}`);
      const snapshot = await get(userNotificationsRef);
      const existingNotifications = snapshot.exists() ? snapshot.val() : [];
      await set(userNotificationsRef, [...existingNotifications, notificationData]);

    } catch (error) {
      console.error("Error blocking user:", error);
    }
    //Remove User Block From Table
    const handleBlock = async (userId) => {
      try {
         const updates = {
          status: 'blocked',
          blockedAt: new Date().toISOString()
        };
    
         await update(ref(realtimeDb, `Users/${userId}`), updates);
        await setDoc(doc(db, "Users", userId), updates, { merge: true });
    
         setUsers(prev => prev.filter(user => user.userId !== userId));  // حذف المستخدم المحظور من المصفوفة
    
         const notificationData = {
          id: push(ref(realtimeDb)).key,
          attribute: 'Account Status',
          action: 'Your account has been blocked',
          timestamp: new Date().toISOString(),
          read: false
        };
    
        const userNotificationsRef = ref(realtimeDb, `userNotifications/${userId}`);
        const snapshot = await get(userNotificationsRef);
        const existingNotifications = snapshot.exists() ? snapshot.val() : [];
        await set(userNotificationsRef, [...existingNotifications, notificationData]);
    
      } catch (error) {
        console.error("Error blocking user:", error);
      }
    };
     
  };

  return (
    <div>
      <Helmet>
        <title>Report Page</title>
        <meta name="description" content="" />
      </Helmet>
      <button className="Back-btn" onClick={() => navigate("/moderator")}>
        <FaArrowLeft className="Report-back-icon" />
      </button>
      <div className="report-container">
        <h1>User Reports - {moderatorRegion} Region</h1>
        <table className="report-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Added Values</th>
              <th>Notifications</th>
               <th>Status</th>
               <th>Action</th>
            </tr>
          </thead>
          <tbody>
  {users.length > 0 ? (
    users.map((user) => (
      user.status !== 'blocked' && (  
        <tr key={user.userId}>
          <td>{user.shortId}</td>
          <td>
            <ul className="value-list">
              {user.addedValues.slice(0, showMoreAddedValues[user.userId] ? user.addedValues.length : maxItemsToShow).map((value, index) => (
                <li key={index}>
                  <strong>{value.attribute}</strong>
                  <br />
                  Value: {value.value}
                  <br />
                </li>
              ))}
            </ul>
            {user.addedValues.length > maxItemsToShow && (
              <button onClick={() => toggleShowMoreAddedValues(user.userId)}>
                {showMoreAddedValues[user.userId] ? "Show Less" : "Show More"}
              </button>
            )}
          </td>
          <td>
            <ul className="notificationReportPage-list">
              {user.notifications.slice(0, showMoreNotifications[user.userId] ? user.notifications.length : maxItemsToShow).map((notification, index) => (
                <li key={index}>
                  <strong>{notification.attribute}</strong>
                  <br />
                  Previous: {notification.previousValue}
                  <br />
                  Description: {notification.description}
                </li>
              ))}
            </ul>
            {user.notifications.length > maxItemsToShow && (
              <button className="ReportPageButton" onClick={() => toggleShowMoreNotifications(user.userId)}>
                {showMoreNotifications[user.userId] ? "Show Less" : "Show More"}
              </button>
            )}
          </td>
          <td>
            <span className={`status-badge ${user.status}`}>
              {user.status}
            </span>
          </td>
          <td>
            {user.status !== 'blocked' && (
              <button className="block-button" onClick={() => handleBlock(user.userId)}>
                Block User
              </button>
            )}
          </td>
        </tr>
      )
    ))
  ) : (
    <tr>
      <td colSpan="5" className="no-data">
        No users to display
      </td>
    </tr>
  )}
</tbody>

        </table>
         
       </div>
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

export default ReportPage;
