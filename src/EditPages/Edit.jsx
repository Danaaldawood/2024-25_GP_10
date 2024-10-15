import React, { useState } from "react";
import "./Edit.css";
import { useNavigate } from "react-router-dom";
import {Header} from '../Header/Header'
import {Footer} from '../Footer/Footer'

export const Edit = () => {
  const navigate = useNavigate();

  const handleEditClick = () => {
    navigate("/culturevalues");
  };

  return (
    <div>
      <Header />

      <div className="editformcontainer">
        <div className="editheader">
          <div className="edit-title">Edit</div>
          <div className="underline"></div>
        </div>
        <div className="edit-inputs">
          <div className="edit-input">
            <label className="label">Email:</label>
            <input
              type="text"
              id="email"
              name="email"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="edit-input">
            <label className="label">Topic:</label>
            <select name="dimension" id="dimension" className="dimension">
              <option value="" disabled selected>
                Select a Topic
              </option>
              <option value="Food">Food</option>
              <option value="Sport">Sport</option>
              <option value="Family">Family</option>
              <option value="Education">Education</option>
              <option value="Holidays">Holidays</option>
              <option value="Work-life">Work-life</option>
            </select>
          </div>

          <div className="edit-input">
            <label className="label">Value:</label>
            <input
              type="text"
              id="value"
              placeholder="Enter value"
              name="value"
              required
            />
          </div>

          <div className="edit-input">
            <label className="label">Region:</label>
            <select name="domain" id="domain" className="domain">
              <option value="" disabled selected>
                Select a reigon
              </option>
              <option value="Arab">Arab</option>
              <option value="Western"> Western</option>
              <option value="Chinese">Chinese</option>
            </select>
          </div>

          <div className="edit-input">
            <label className="label">Edit Reason:</label>
            <input
              type="radio"
              class="reason"
              name="reason"
              value="Subculture"
            />
            Subculture
            <input
              type="radio"
              name="reason"
              class="reason"
              value="variance value"
            />
            variance value
          </div>
        </div>
        <div className="edisubmit-container">
          <div className="edit-submit">
            <button onClick={handleEditClick}>Edit</button>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};
export default Edit;
