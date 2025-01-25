import React, { useState, useEffect } from "react";
import { ref, onValue, push, update, get, set } from "firebase/database";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { realtimeDb, auth, db } from '../Register/firebase';
import { onAuthStateChanged } from "firebase/auth";
import "./ReportPage.css";

const ReportPage = () => {
  const [users, setUsers] = useState([]);
  const [moderatorRegion, setModeratorRegion] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get moderator's region
          const moderatorRef = doc(db, "Moderators", user.uid);
          const moderatorSnap = await getDoc(moderatorRef);
          
          if (moderatorSnap.exists()) {
            const { regionM } = moderatorSnap.data();
            setModeratorRegion(regionM);

            // Get ViewEdit data
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

              // Get notifications data
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

              // Get user status
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

  const handleBlock = async (userId) => {
    try {
      const updates = {
        status: 'blocked',
        blockedAt: new Date().toISOString()
      };

      // Update user status in both databases
      await update(ref(realtimeDb, `Users/${userId}`), updates);
      await setDoc(doc(db, "Users", userId), updates, { merge: true });

      // Update local state
      setUsers(prev => prev.map(user => 
        user.userId === userId ? { ...user, status: 'blocked' } : user
      ));

      // Send notification to user
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

  return (
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
              <tr key={user.userId} className={user.status === 'blocked' ? 'blocked-user' : ''}>
                <td>{user.shortId}</td>
                <td>
                  <ul className="value-list">
                    {user.addedValues.map((value, index) => (
                      <li key={index}>
                        <strong>{value.attribute}</strong>
                        <br />
                        Value: {value.value}
                        <br />
                        Action: {value.modAction}
                      </li>
                    ))}
                  </ul>
                </td>
                <td>
                  <ul className="notification-list">
                    {user.notifications.map((notification, index) => (
                      <li key={index}>
                        <strong>{notification.attribute}</strong>
                        <br />
                        Previous: {notification.previousValue}
                        <br />
                        {notification.description}
                        <br />
                        Action: {notification.modAction}
                      </li>
                    ))}
                  </ul>
                </td>
                <td>
                  <span className={`status-badge ${user.status}`}>
                    {user.status}
                  </span>
                </td>
                <td>
                  {user.status !== 'blocked' && (
                    <button
                      className="block-button"
                      onClick={() => handleBlock(user.userId)}
                    >
                      Block User
                    </button>
                  )}
                </td>
              </tr>
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
  );
};

export default ReportPage;