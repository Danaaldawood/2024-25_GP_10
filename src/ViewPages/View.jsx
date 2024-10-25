// RealtimeData Component: The Table Component
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { realtimeDb } from '../Register/firebase';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Header } from "../Header/Header";
import { Footer } from "../Footer/Footer";
import Search from "@mui/icons-material/Search";
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

import './View.css';

export function RealtimeData() {
  // states
  const [tableData, setTableData] = useState([]);
  const [error, setError] = useState(null);
  const [filterRegion, setFilterRegion] = useState(''); 
  const [searchTerm, setSearchTerm] = useState(''); 
  const [rowsPerPage, setRowsPerPage] = useState(10); // Default value

  const navigate = useNavigate();

  useEffect(() => {
    const dbRef = ref(realtimeDb, '/');
    
    const unsubscribe = onValue(
      dbRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const dataArray = Object.entries(data).map(([key, value]) => ({
            id: key,
            ...value,
          }));
          setTableData(dataArray);
        } else {
          setError('No data available in Firebase.');
        }
      },
      (error) => {
        setError('Error fetching data: ' + error.message);
      }
    );

    return () => unsubscribe();
  }, []);

  // Region filter
  const handleRegionChange = (e) => {
    setFilterRegion(e.target.value);
  };

  // Search input
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle input for rows per page
  const handleRowsPerPageChange = (e) => {
    let value = parseInt(e.target.value, 10);
    if (value > 1500) {
      value = 1500; // Limit to 1500
    }
    setRowsPerPage(value);
  };

  // Edit button click handler
  const handleEditClick = (row) => {
    navigate(`/edit/${row.id}`, {
      state: {
        attribute: row.en_question, // Ensure the attribute is passed
        topic: row.topic, // Ensure the topic is passed
      }
    });
  };
  
  const filteredData = tableData.filter((row) => {
    const matchesRegion = filterRegion === '' || row.region_name === filterRegion;
    
    const matchesSearch = 
      row.region_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      row.en_question?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      row.topic?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      row.annotations?.some((annotation) => 
        annotation.en_values[0]?.toLowerCase().includes(searchTerm.toLowerCase()) 
      ) || 
      "Variation".toLowerCase().includes(searchTerm.toLowerCase());
  
    return matchesRegion && matchesSearch;
  });

  const dataToShow = filteredData.slice(0, rowsPerPage);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className='viewpage'>
      <Header />
      <div className="container mt-5">

<div class='notification-btn-container'>
<button  class='notification-btn'  >   Notify moderator   {<NotificationsActiveIcon />}</button>

</div>
        
<section class='tabel_header'>
<h2 className='table-title'>Cultures Data</h2>
</section>
       

        <div className="filter-Search-inputs-container">
          <div className="search-container">
            <span className="search-icon">
              <Search style={{ color: '#888', fontSize: '20px' }} />
            </span>
            <input
              type="text"
              className="search-input"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="filter-container">
            <select className="filter-select" value={filterRegion} onChange={handleRegionChange}>
              <option value="">All Regions</option>
              <option value="Western">Western</option>
              <option value="Chinese">Chinese</option>
              <option value="Arab">Arab</option>
            </select>
            <label style={{ marginLeft: '15px' }}>Show</label>
            <input
              type="number"
              value={rowsPerPage}
              min="1"
              max="1500"
              onChange={handleRowsPerPageChange}
              style={{ width: '60px', marginLeft: '5px', marginRight: '5px' }}
            />
            <label>entries</label>
          </div>
        </div>
       <div class='table_container'>
        <table className="data-table">
          <thead>
            <tr class="tabel_titles">
              <th></th>
              <th>Region</th>
              <th>Attribute</th>
              <th>Values</th>
              <th>Topic</th>
              <th>Reason</th>
              <th>Edit</th> 
            </tr>
          </thead>
          <tbody>
            {dataToShow.map((row, index) => (
              <tr key={row.id}>
                <td>{index + 1}</td>
                <td>{row.region_name}</td>
                <td>{row.en_question}</td>
                <td>
                <select className="value-select">
  {row.annotations?.map((annotation, i) => (
    <option key={i} value={annotation.en_values[0]}>
      {annotation.en_values[0]}
    </option>
  ))}
</select>

                </td>
                <td>{row.topic}</td>
                <td>Variation</td>
                <td>
                  <button onClick={() => handleEditClick(row)} className="edit-button">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default RealtimeData;