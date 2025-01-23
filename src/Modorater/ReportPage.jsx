import React, { useState, useEffect } from "react";
import { ref, onValue, push } from "firebase/database"; 
import { realtimeDb } from '../Register/firebase';
import "./ReportPage.css"; 

const ReportPage = () => {
  const [userAdds, setUserAdds] = useState([]);

  // Fetch user additions data
  useEffect(() => {
    const region = "Arab";
    const viewEditRef = ref(realtimeDb, `Viewedit/${region}`);
  
    const unsubscribe = onValue(viewEditRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
  
        const groupedData = {};
        Object.values(data).forEach((entry) => {
          const userId = entry.userId;
          const value = Array.isArray(entry.value) ? entry.value : [entry.value];
          const description = entry.description || "No description available"; // Default if description is missing
  
          if (!groupedData[userId]) {
            groupedData[userId] = {
              userId,
              value: [],
              description, // Store description for the user
            };
          }
  
          groupedData[userId].value = [...groupedData[userId].value, ...value];
        });
  
        const formattedData = Object.values(groupedData).map((entry) => ({
          ...entry,
          value: Array.from(new Set(entry.value)),
        }));
  
        setUserAdds(formattedData);
      } else {
        setUserAdds([]);
      }
    });
  
    return () => unsubscribe();
  }, []);

  const handleValueChange = (event, userId) => {
    const newValue = event.target.value;

    // Save the selection as a notification in the database
    saveNotification(userId, newValue);
  };

  const saveNotification = (userId, value) => {
    const notificationData = {
      userId: userId,
      value: value,
      timestamp: new Date().toISOString(),
      status: "pending", 
    };

    const notificationsRef = ref(realtimeDb, `notifications/${userId}`);

    push(notificationsRef, notificationData)
      .then(() => {
        console.log(`Notification saved for ${userId}`);
      })
      .catch((error) => {
        console.error("Error saving notification:", error);
      });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Complaints Page</h1>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr>
            <th>User ID</th>
            <th>Value</th>
            <th>Notification</th>
            <th>Send Complaints</th>
          </tr>
        </thead>
        <tbody>
          {userAdds.length > 0 ? (
            userAdds.map((add, index) => (
              <tr key={index}>
                <td>{add.userId}</td>
                <td>
                  <select
                    onChange={(e) => handleValueChange(e, add.userId)}
                    style={{
                      padding: "8px",
                      fontSize: "14px",
                      borderRadius: "4px",
                      border: "1px solid #ddd",
                      backgroundColor: "#f8f8f8",
                      width: "100%",
                    }}
                  >
                    {add.value.map((value, idx) => (
                      <option key={idx} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </td>
                {/* Display description in the Notification column */}
                <td>{add.description}</td> {/* Show description here */}
                <td>
                  <button
                    onClick={() => saveNotification(add.userId, add.description)}
                    style={{
                      padding: "8px 16px",
                      fontSize: "14px",
                      color: "#fff",
                      backgroundColor: "#007bff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Send
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>
                No data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ReportPage;
