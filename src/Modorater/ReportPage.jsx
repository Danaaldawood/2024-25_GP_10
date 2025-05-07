import React, { useState, useEffect } from "react";
import { ref, onValue, push, update, get, set } from "firebase/database";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { realtimeDb, auth, db } from '../Register/firebase';
import { onAuthStateChanged } from "firebase/auth";
import "./ReportPage.css";
import { Helmet } from 'react-helmet';
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import '../Footer/Footer.css';
import { RiTwitterXLine } from "react-icons/ri";
import { IoLogoInstagram } from "react-icons/io5";
import { MdEmail } from "react-icons/md";
import { Footer } from "../Footer/Footer";

const ReportPage = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [moderatorRegion, setModeratorRegion] = useState("");
  const [showMoreAddedValues, setShowMoreAddedValues] = useState({});
  const [showMoreNotifications, setShowMoreNotifications] = useState({});
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'blocked'

  const maxItemsToShow = 3;

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
                  if (!entry || !entry.fullUserId) return; // Skip invalid entries
                  
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
                  if (group && group.notifications) {
                    group.notifications.forEach(notification => {
                      if (notification && notification.region === regionM && notification.userId?.fullId) {
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
  
                        const previousValue = notification.PreviousValue?.en;
  
                        userMap.get(userId).notifications.push({
                          attribute: notification.attribute?.en || notification.attribute,
                          description: notification.description,
                          previousValue: previousValue,
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

  const filteredUsers = users.filter((user) => {
    if (statusFilter === 'all') return true;
    return user.status === statusFilter;
  });

  const toggleShowMoreAddedValues = (userId) => {
    setShowMoreAddedValues((prevState) => ({
      ...prevState,
      [userId]: !prevState[userId]
    }));
  };

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
  };
  
  return (
    <div className="reportpage-container">
      <Helmet>
        <title>Report Page</title>
      </Helmet>
      <button className="Back-btn" onClick={() => navigate("/moderator")}>
        <FaArrowLeft className="Report-back-icon" />
      </button>

      <div className="report-container">
        <h1 className="reportpage-title">User Reports - {moderatorRegion} Region</h1>
        
        <div className="filterReportPage-container">
          <label htmlFor="status-filter" className="filter-label">Filter by Status:</label>
          <select
            id="status-filter"
            className="filterReportPage-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

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
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.userId}>
                  <td>{user.shortId}</td>
                  <td>
                    <div className="card-group">
                      {(user.addedValues || [])
                        .slice(0, showMoreAddedValues[user.userId] ? (user.addedValues || []).length : maxItemsToShow)
                        .map((value, index) => (
                          <div className="mini-card value-card" key={index}>
                            <strong>{value.attribute}</strong>
                            <p>Value: {value.value}</p>
                          </div>
                        ))}
                    </div>
                    {(user.addedValues || []).length > maxItemsToShow && (
                      <button
                        className="show-more-btn"
                        onClick={() => toggleShowMoreAddedValues(user.userId)}
                      >
                        {showMoreAddedValues[user.userId] ? "Show Less" : "Show More"}
                      </button>
                    )}
                  </td>

                  <td>
                    <div className="card-group">
                      {(user.notifications || [])
                        .slice(0, showMoreNotifications[user.userId] ? (user.notifications || []).length : maxItemsToShow)
                        .map((notification, index) => (
                          <div className="mini-card notif-card" key={index}>
                            <strong>{notification.attribute}</strong>
                            <p>Previous: {notification.previousValue || 'N/A'}</p>
                            <p>Description: {notification.description}</p>
                          </div>
                        ))}
                    </div>
                    {(user.notifications || []).length > maxItemsToShow && (
                      <button
                        className="show-more-btn"
                        onClick={() => toggleShowMoreNotifications(user.userId)}
                      >
                        {showMoreNotifications[user.userId] ? "Show Less " : "Show More "}
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
      <Footer />
    </div>
  );
};

export default ReportPage;