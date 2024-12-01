import React from "react";
import "./Cardtopic.css";

function Cardtopic({ Icon, title, text }) {
  return (
    // card conatiner  for flip
    <div className="flip-card">
      {/* conatiner of inner content of card*/}

      <div className="flip-card-inner">
        {/* conatiner of front side */}

        <div className="flip-card-front">
          <h1>{title}</h1>
          {Icon && <Icon className="icon" style={{ fontSize: "45px" }} />}
        </div>
        {/* conatiner of back side  */}

        <div className="flip-card-back">
          <p>{text}</p>
        </div>
      </div>
    </div>
  );
}

export default Cardtopic;
