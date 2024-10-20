
import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { Table } from 'react-bootstrap';
import { realtimeDb } from '../Register/firebase';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Header } from "../Header/Header";
import { Footer } from "../Footer/Footer";
import Search from "@mui/icons-material/Search";
import Arrow from "@mui/icons-material/ArrowRight";
import './View.css';


export function RealtimeData() {
  //states
  const [tableData, setTableData] = useState([]);
  const [error, setError] = useState(null);

  const [filterRegion, setFilterRegion] = useState(''); 
  const [searchTerm, setSearchTerm] = useState(''); 

  useEffect(() => {
    const dbRef = ref(realtimeDb, '/');
    
    const unsubscribe = onValue(
      dbRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          // For retriving data Convert object to array 
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

  // region filter
  const handleRegionChange = (e) => {
    setFilterRegion(e.target.value);
  };

  //  search input
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

 

  const filteredData = tableData.filter((row) => {
    //filter  section that check on the selection reigon to filter 
    const matchesRegion = filterRegion === '' || row.region_name === filterRegion;
    // search  section to check for match any content of  any coulmn 
    const matchesSearch = 
      row.region_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      row.en_question?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      row.topic?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      row.annotations?.some((annotation) => 
        annotation.en_values[0].toLowerCase().includes(searchTerm.toLowerCase()) 
      ) || 
      // for reason column just for limit time is static 
      "Variation".toLowerCase().includes(searchTerm.toLowerCase()); 
  
    return matchesRegion && matchesSearch;
  });
  

  if (error) {
    return <div>Error: {error}</div>;
  }

  





  return (
    <div className='viewpage'>
      <Header />

      <div className="container mt-5">
      {/* <Arrow style={{ color: 'grey', fontSize: '45px',marginBottom: '3px' }}/> */}
      <h2 class='table-title'>Cultures Data</h2>
     
       

        {/* Search and filter inputs container */}
        <div className="filter-Search-inputs-container">
          {/* Search input container */}
          <div className="search-container">
            
          <span className="search-icon">
              <Search style={{ color: '#888', fontSize: '20px' }} /> {/* Search icon inside input */}
            </span>

            <input
              type="text"
              className="search-input"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
           

          </div>

          {/* Filter input container */}
          <div className="filter-container">
            <select className="filter-select" value={filterRegion} onChange={handleRegionChange}>
              <option value="">All Regions</option>
              <option value="Western">Western</option>
              <option value="Chinese">Chinese</option>
              <option value="Arab">Arab</option>
            </select>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th></th>
              <th>Region</th>
              <th>Attribute</th>
              <th>Values</th>
              <th>Topic</th>
              <th>Reason</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {/* Section of data that we want to fetch */}
            {filteredData.map((row, index) => (
              <tr key={row.id}>
                {/* Counter for row */}
                <td>{index + 1}</td>
                <td>{row.region_name}</td>
                <td>{row.en_question}</td>
                <td>
                  <select>
                    {row.annotations?.map((annotation, i) => (
                      <option key={i} value={annotation.en_values[0]}>
                        {annotation.en_values[0]}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{row.topic}</td>
                <td>Variation</td>
                <td><button class="editbutn">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Footer />
    </div>
  );
}

export default RealtimeData;
