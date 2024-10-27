// ModeratorPage.js

import React, { useState } from 'react';
import './ModeratorPage.css';
import { useNavigate } from 'react-router-dom';
import Logo from '../images/Logo.png';
import { Footer } from '../Footer/Footer';
import SignOutConfirmation from './SignOutConfirmation'; 
import { Helmet } from 'react-helmet';

const ModeratorPage = () => {
  const [view, setView] = useState('view-edit');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, userId: 'user_123', attribute: 'Ara-ko-36', description: 'Attribute contains null value', status: 'In Progress' },
    { id: 2, userId: 'user_456', attribute: 'Ara-ko-59', description: 'The value for attribute is wrong', status: 'Done' },
    { id: 3, userId: 'user_789', attribute: 'Ara-ko-39', description: 'No value', status: 'In Progress' },
  ]);

  const navigate = useNavigate();

  const handleMenuToggle = () => setMenuOpen(!menuOpen);
  const handleProfileClick = () => navigate('/profile');
  const handleSignOut = () => setShowSignOutModal(true);
  const handleConfirmSignOut = () => { setShowSignOutModal(false); navigate('/Login'); };
  const handleCancelSignOut = () => setShowSignOutModal(false);

  const handleDeleteNotification = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  const handleDismissAllNotifications = () => {
    setNotifications(notifications.map(notification => ({ ...notification, status: 'Dismissed' })));
  };

  const handleStatusChange = (id, newStatus) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, status: newStatus } : notification
    ));
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
        <button className={view === 'view-edit' ? 'active' : ''} onClick={() => setView('view-edit')}>View Edit</button>
        <button className={view === 'notifications' ? 'active' : ''} onClick={() => setView('notifications')}>Notifications</button>
      </div>

      {view === 'view-edit' && (
        <div className="table-container">
          <h2 className="pagename">View Edit Dataset</h2>
          <table className="styled-table">
            <thead>
              <tr>
                <th>Attribute-ID</th>
                <th>UserID</th>
                <th>Region</th>
                <th>Topic</th>
                <th>Value</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Ara-ko-39</td>
                <td>user_47</td>
                <td>Arab</td>
                <td>Food</td>
                <td>Tea</td>
                <td>Sub-culture</td>
              </tr>
              <tr>
                <td>Ara-ko-71</td>
                <td>user_80</td>
                <td>Arab</td>
                <td>Food</td>
                <td>Coffee</td>
                <td>Variance</td>
              </tr>
              <tr>
                <td>Ara-de-20</td>
                <td>user_40</td>
                <td>Arab</td>
                <td>Holiday</td>
                <td>New Year</td>
                <td>Variance</td>
              </tr>
              <tr>
                <td>Ara-ko-89</td>
                <td>user_99</td>
                <td>Arab</td>
                <td>Sport</td>
                <td>Water</td>
                <td>Variance</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {view === 'notifications' && (
        <div className="notifications-container">
          <h2 className="pagename">Notifications</h2>
          <div className="dismiss-all-container">
            <button className="dismiss-all-btn" onClick={handleDismissAllNotifications}>Dismiss All</button>
          </div>
          <table className="styled-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Attribute</th>
                <th>Problem Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map(notification => (
                <tr key={notification.id}>
                  <td>{notification.userId}</td>
                  <td>{notification.attribute}</td>
                  <td>{notification.description}</td>
                  <td>
                    <select
                      value={notification.status}
                      onChange={(e) => handleStatusChange(notification.id, e.target.value)}
                      className={`status-select ${notification.status.toLowerCase().replace(" ", "-")}`}
                    >
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                      <option value="Dismissed">Dismissed</option>
                    </select>
                  </td>
                  <td>
                    <button className="delete-btn" onClick={() => handleDeleteNotification(notification.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showSignOutModal && (
        <SignOutConfirmation onConfirm={handleConfirmSignOut} onCancel={handleCancelSignOut} />
      )}

      <Footer />
    </div>
  );
};

export default ModeratorPage;
