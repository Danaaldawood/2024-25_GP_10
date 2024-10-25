import React from "react";
import "./Cardtopic.css";

function Cardtopic({ Icon, title, text }) {
  return (
    <div
      className="flip-card"
   
    >
      <div className="flip-card-inner">
        <div className="flip-card-front">
          <h1>{title}</h1>
          {Icon && <Icon className="icon" style={{ fontSize: "45px" }} />}
        </div>
        <div className="flip-card-back">
          <p>{text}</p>
        </div>
      </div>
    </div>
  );
}

export default Cardtopic;
