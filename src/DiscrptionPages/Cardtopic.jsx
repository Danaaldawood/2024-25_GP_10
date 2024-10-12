
// import React from 'react';
// import './Cardtopic.css';

// function Cardtopic({ Icon, title, text}) {
//     return(
// <div class="flip-card-inner">
//     <div class="flip-card-front">
//     <h1>{title}</h1>
//     {Icon && <Icon className="icon" style={{ fontSize: '45px' }}/>} 
//     </div>
//     <div class="flip-card-back">
//     <p>{text}</p>
//       <p></p>
//     </div>
//   </div> 
//   )
// }

// export default Cardtopic;






import React from 'react';
import './Cardtopic.css';

function Cardtopic({ Icon, title, text }) {
    return (
        <div className="flip-card" style={{ width: '230px', height: '230px', margin: '15px' }}>
            <div className="flip-card-inner">
                <div className="flip-card-front">
                    <h1>{title}</h1>
                    {Icon && <Icon className="icon" style={{ fontSize: '45px' }} />}
                </div>
                <div className="flip-card-back">
                    <p>{text}</p>
                </div>
            </div>
        </div>
    );
}

export default Cardtopic;
