
// import React from 'react';

// const Edit = () => {
//     return (
//         <div>
//             <h1>Edit Page</h1>
//         </div>
//     );
// };


import React from 'react';
import './Edit.css';
import { useNavigate } from 'react-router-dom';

export const Edit = () => {
const navigate = useNavigate();

 const handleEditClick = () => {
    navigate('/description');
 };

  return (
    <div className='formcontainer'>
      <div className='header'>
        <div className='text'>Edit</div>
        <div className='underline'></div>
      </div>
      <div className="inputs">
      <div className="input">
          <label className="label">Email:</label>
          <input type="text" id="email" name="email" placeholder="Enter your email"  required/>                    
        </div>
         

        <div className="input">
          <label className="label">Dimension:</label>
          <select name="dimension" id="dimension" className="dimension">
            <option value="" disabled selected>Select a dimension</option>
            <option value="Food">Food</option>
            <option value="Sport">Sport</option>
            <option value="Family">Family</option>
            <option value="Education">Education</option>
            <option value="Holidays">Holidays</option>
            <option value="Work-life">Work-life</option>
          </select>
        </div>

        <div className="input">
          <label className="label">Value:</label>
          <input type="text" id="value"  placeholder="Enter value"  name="value"  required/>                    
        </div>

        
        <div className="input">
          <label className="label">Region:</label>
          <select name="domain" id="domain" className="domain">
            <option value="" disabled selected>Select a reigon</option>
            <option value="Arab">Arab</option>
            <option value="Western"> Western</option>
            <option value="Chinese">Chinese</option>
           
          </select>
        </div>
      
        <div className="input">
          <label className="label">Edit Reason:</label>
          <input type="radio" class="reason" name="reason" value="Subculture"/> 
          Subculture

          <input type="radio" name="reason" class="reason" value="variance value"/> 
          variance value

        
        </div>
      </div>
      <div className="submit-container">
        <div className="submit">
          <button onClick={handleEditClick}>Edit</button>
        </div>
      </div>
    </div>
  );
};
export default Edit;