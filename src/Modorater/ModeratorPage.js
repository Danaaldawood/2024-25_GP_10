import React, { useState } from 'react';
import './ModeratorPage.css'; 
import { useNavigate } from 'react-router-dom';
import Clogo from './Clogo.png';  


const ModeratorPage = () => {
  const [view, setView] = useState('view-edit');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleSignOut = () => { 
    alert("Signed out!");
  };

  return (
    <div className="moderator-container">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <img src={Clogo} alt="CultureLens Logo" className="logo-img" />
          <h1 className="logo-title">CultureLens</h1>
        </div>

        <button className="menu-btn" onClick={handleMenuToggle}>
          <span className="menu-icon">&#9776;</span>
        </button>
        {menuOpen && (
          <div className="menu-dropdown">
            <p onClick={handleProfileClick}>Profile</p>
            <p onClick={handleSignOut} className="sign-out">Sign out</p>
          </div>
        )}
      </header>

      {/* Header for Page Title */}
      <div className="header-banner">
        <h1>Moderator Page</h1>
      </div>

      {/* Toggle Buttons */}
      <div className="toggle-buttons">
        <button
          className={view === 'view-edit' ? 'active' : ''}
          onClick={() => setView('view-edit')}
        >
          View Edit
        </button>
        <button
          className={view === 'notifications' ? 'active' : ''}
          onClick={() => setView('notifications')}
        >
          Notifications
        </button>
      </div>

      {/* Content Views */}
      {view === 'view-edit' && (
        <div className="table-container">
          <h2 className='pagename'>View Edit Dataset</h2>
          <table className="styled-table">
            <thead>
              <tr>
                <th>Dimension</th>
                <th>Value</th>
                <th>QID</th>
                <th>Timestamp</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Food</td>
                <td>Tea</td>
                <td>Q1-123</td>
                <td>2024-09-30 09:30</td>
                <td>Sub-culture</td>
              </tr>
              <tr>
                <td>Food</td>
                <td>Coffee</td>
                <td>Q2-1234</td>
                <td>2024-09-30 10:00</td>
                <td>Variance</td>
              </tr>
              <tr>
                <td>Holiday</td>
                <td>New Year</td>
                <td>Q10-1234</td>
                <td>2024-09-30 10:00</td>
                <td>Variance</td>
              </tr>
              <tr>
                <td>Food</td>
                <td>Coffee</td>
                <td>Q2-1234</td>
                <td>2024-09-30 10:00</td>
                <td>Variance</td>
              </tr>
              <tr>
                <td>Greeting</td>
                <td>Right Hand</td>
                <td>Q3-1234</td>
                <td>2024-09-30 10:00</td>
                <td>Sub-Culture</td>
              </tr>
              <tr>
                <td>Work Life</td>
                <td>Abaya</td>
                <td>Q8-1234</td>
                <td>2024-09-30 10:00</td>
                <td>Sub-Culture</td>
              </tr>
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination">
            <button className="pagination-btn active">1</button>
          </div>
        </div>
      )}

      {view === 'notifications' && (
        <div className="notifications-container">
          <h2 className='pagename'>Notifications</h2>
          <p>No new notifications.</p>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <p>© 2024 CultureLens. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default ModeratorPage;

