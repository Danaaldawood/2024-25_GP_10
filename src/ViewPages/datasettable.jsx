import React, { useState, useEffect } from 'react';
import './View.css';

function View() {
  const [data, setData] = useState([]);
  const [isEditing, setIsEditing] = useState(null); // Track the row being edited
  const [editedRow, setEditedRow] = useState({});   // Store the values being edited

  // Fetch data or load dataset here
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('YOUR_DATASET_URL'); // Replace with your data source
      const dataset = await response.json();
      setData(dataset);
    };
    fetchData();
  }, []);

  // Handle edit button click
  const handleEditClick = (index) => {
    setIsEditing(index); // Set the row index being edited
    setEditedRow({ ...data[index] }); // Preload current data into editedRow state
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedRow({ ...editedRow, [name]: value });
  };

  // Handle save button click
  const handleSaveClick = (index) => {
    const updatedData = [...data];
    updatedData[index] = editedRow; // Update the row with new values
    setData(updatedData);
    setIsEditing(null); // Exit editing mode
  };

  return (
    <table className="table">
      <thead>
        <tr>
          <th>UserID</th>
          <th>AttributID</th>
          <th>Reigon</th>
          <th>Question</th>
          <th>Value</th>
          <th>Reason</th>
          <th>CultureLevel</th>
          <th>Dimintion</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={index}>
            <td>{isEditing === index ? <input type="text" name="userId" value={editedRow.userId} onChange={handleInputChange} /> : item.userId}</td>
            <td>{isEditing === index ? <input type="text" name="attributId" value={editedRow.attributId} onChange={handleInputChange} /> : item.attributId}</td>
            <td>{isEditing === index ? <input type="text" name="reigon" value={editedRow.reigon} onChange={handleInputChange} /> : item.reigon}</td>
            <td>{isEditing === index ? <input type="text" name="question" value={editedRow.question} onChange={handleInputChange} /> : item.question}</td>
            <td>{isEditing === index ? <input type="text" name="value" value={editedRow.value} onChange={handleInputChange} /> : item.value}</td>
            <td>{isEditing === index ? <input type="text" name="reason" value={editedRow.reason} onChange={handleInputChange} /> : item.reason}</td>
            <td>{isEditing === index ? <input type="text" name="cultureLevel" value={editedRow.cultureLevel} onChange={handleInputChange} /> : item.cultureLevel}</td>
            <td>{isEditing === index ? <input type="text" name="dimintion" value={editedRow.dimintion} onChange={handleInputChange} /> : item.dimintion}</td>
            <td>
              {isEditing === index ? (
                <button onClick={() => handleSaveClick(index)}>Save</button>
              ) : (
                <button onClick={() => handleEditClick(index)}>Edit</button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default View;
