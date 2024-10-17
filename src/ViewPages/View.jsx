import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { Table } from 'react-bootstrap';
import { realtimeDb } from '../Register/firebase';
import 'bootstrap/dist/css/bootstrap.min.css';


export function RealtimeData() {
  const [tableData, setTableData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const dbRef = ref(realtimeDb, '/');
    
    const unsubscribe = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Convert object to array
        const dataArray = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        }));
        setTableData(dataArray);
      } else {
        setError("No data available in Firebase.");
      }
    }, (error) => {
      setError("Error fetching data: " + error.message);
    });

    return () => unsubscribe();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>#</th>
          <th>Region</th>
          <th>Attribute</th>
          <th>Values</th>
          <th>Topic</th>
          <th>Reason</th>
       
        </tr>
      </thead>
      <tbody>
        {tableData.map((row, index) => (
          <tr key={row.id}>
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
            <td>{row.topic}{row.annotations?.en_values}</td>
            <td>Variation</td>
          
            
            
            
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default RealtimeData;