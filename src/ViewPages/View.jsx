import React, { useState } from "react";
import "./View.css";
import { useNavigate } from "react-router-dom";
import {Header} from '../Header/Header'
import {Footer} from '../Footer/Footer'


function View() {
  const [searchTerm, setSearchTerm] = useState(""); // State for search input
  const [filterRegion, setFilterRegion] = useState(""); // State for filtering by region
  const [data, setData] = useState([
    {
      userId: 1,
      attributId: "Mark",
      region: "North",
      question: "What is your name?",
      value: "Mark",
      reason: "Curiosity",
      cultureLevel: "High",
      dimension: "Personal",
    },
    {
      userId: 2,
      attributId: "Jacob",
      region: "South",
      question: "What is your age?",
      value: "25",
      reason: "Demographics",
      cultureLevel: "Medium",
      dimension: "Age",
    },
    {
      userId: 3,
      attributId: "Larry",
      region: "East",
      question: "What is your favorite color?",
      value: "Blue",
      reason: "Preference",
      cultureLevel: "Low",
      dimension: "Preference",
    },
  ]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    setFilterRegion(e.target.value);
  };

  // Filter data based on search term and selected region
  const filteredData = data.filter((item) => {
    const matchesSearchTerm =
      item.attributId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.cultureLevel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.dimension.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilterRegion =
      filterRegion === "" || item.region === filterRegion;

    return matchesSearchTerm && matchesFilterRegion;
  });

  return (
    <div className="viewpage">
      <Header/>
    <main>
      <section>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearchChange}
          style={{ margin: "20px 0", padding: "10px", width: "100%" }}
        />
        <select
          value={filterRegion}
          onChange={handleFilterChange}
          style={{ padding: "10px", margin: "20px 0", width: "100%" }}
        >
          <option value="">All Regions</option>
          <option value="North">North</option>
          <option value="South">South</option>
          <option value="East">East</option>
          <option value="West">West</option>
        </select>
        <table className="table">
          <thead>
            <tr>
              <th>UserID</th>
              <th>AttributID</th>
              <th>Region</th>
              <th>Question</th>
              <th>Value</th>
              <th>Reason</th>
              <th>CultureLevel</th>
              <th>Dimension</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr key={item.userId}>
                <th scope="row">{item.userId}</th>
                <td>{item.attributId}</td>
                <td>{item.region}</td>
                <td>{item.question}</td>
                <td>{item.value}</td>
                <td>{item.reason}</td>
                <td>{item.cultureLevel}</td>
                <td>{item.dimension}</td>
                <td>
                  <button id="editvalue">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
    <Footer/>
    </div>
  );
}

export default View;

/////////////////////////////// for dynamic data  from firebase with search
// import React, { useState, useEffect } from 'react';
// import './View.css';
// import { useNavigate } from 'react-router-dom';

// function View() {
//   const [data, setData] = useState([]); // State to hold data from database
//   const [searchTerm, setSearchTerm] = useState(''); // State for search term
//   const [isEditing, setIsEditing] = useState(null);
//   const [editedRow, setEditedRow] = useState({});

//   // Fetch data from database
//   useEffect(() => {
//     const fetchData = async () => {
//       const response = await fetch('YOUR_DATASET_URL'); // Replace with your data source
//       const dataset = await response.json();
//       setData(dataset);
//     };
//     fetchData();
//   }, []);

//   // Handle input changes
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setEditedRow({ ...editedRow, [name]: value });
//   };

//   // Handle edit button click
//   const handleEditClick = (index) => {
//     setIsEditing(index);
//     setEditedRow({ ...data[index] });
//   };

//   // Handle save button click
//   const handleSaveClick = (index) => {
//     const updatedData = [...data];
//     updatedData[index] = editedRow;
//     setData(updatedData);
//     setIsEditing(null);
//   };

//   // Filter data based on search term
//   const filteredData = data.filter((item) => {
//     return (
//       item.userId.toString().includes(searchTerm) ||
//       item.attributId.toString().includes(searchTerm) ||
//       item.reigon.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       item.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       item.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       item.cultureLevel.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       item.dimintion.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//   });

//   return (
//     <main>
//       <section>
//         <input
//           type="text"
//           placeholder="Search..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//         <table className="table">
//           <thead>
//             <tr>
//               <th>UserID</th>
//               <th>AttributID</th>
//               <th>Reigon</th>
//               <th>Question</th>
//               <th>Value</th>
//               <th>Reason</th>
//               <th>CultureLevel</th>
//               <th>Dimintion</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredData.map((item, index) => (
//               <tr key={index}>
//                 <td>{isEditing === index ? <input type="text" name="userId" value={editedRow.userId} onChange={handleInputChange} /> : item.userId}</td>
//                 <td>{isEditing === index ? <input type="text" name="attributId" value={editedRow.attributId} onChange={handleInputChange} /> : item.attributId}</td>
//                 <td>{isEditing === index ? <input type="text" name="reigon" value={editedRow.reigon} onChange={handleInputChange} /> : item.reigon}</td>
//                 <td>{isEditing === index ? <input type="text" name="question" value={editedRow.question} onChange={handleInputChange} /> : item.question}</td>
//                 <td>{isEditing === index ? <input type="text" name="value" value={editedRow.value} onChange={handleInputChange} /> : item.value}</td>
//                 <td>{isEditing === index ? <input type="text" name="reason" value={editedRow.reason} onChange={handleInputChange} /> : item.reason}</td>
//                 <td>{isEditing === index ? <input type="text" name="cultureLevel" value={editedRow.cultureLevel} onChange={handleInputChange} /> : item.cultureLevel}</td>
//                 <td>{isEditing === index ? <input type="text" name="dimintion" value={editedRow.dimintion} onChange={handleInputChange} /> : item.dimintion}</td>
//                 <td>
//                   {isEditing === index ? (
//                     <button onClick={() => handleSaveClick(index)}>Save</button>
//                   ) : (
//                     <button onClick={() => handleEditClick(index)}>Edit</button>
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </section>
//       <footer className="footer">
//         <p>© 2024 CultureLens. All rights reserved.</p>
//       </footer>
//     </main>
//   );
// }

// export default View;
