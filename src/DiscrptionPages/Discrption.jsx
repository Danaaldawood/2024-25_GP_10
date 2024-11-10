import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import "./Discrption.css";
import Cardtopic from "./Cardtopic.jsx";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import WavingHandIcon from "@mui/icons-material/WavingHand";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import TodayIcon from "@mui/icons-material/Today";
import ball from "../images/Group6.png";
import about from "../images/aboutdata.png";
import { Header } from "../Header/Header";
import { Footer } from "../Footer/Footer";
import { Helmet } from 'react-helmet';

// const Discrption = () => {
//   const navigate = useNavigate();

//   const handleClick = () => {
//     navigate("/view");
//   };
//   return (
//     <div className="descrptionpage">
//       <Header />
//       <Helmet>
//           <title>Cultural Values</title>
//           <meta name="description" content="This is Cultural Values page" />
//         </Helmet>
//       <main>
      
//         <section id="CoreDimintion">
//         {/* <img src={about} id="aboutlogo" alt="aboutlogo"  /> */}

//           <div className="discrptionbox">
             
//             <div >
//               <p class='discrptiontext'>
//                 Our cultural values dataset integrates information from multiple
//                 sources, encompassing a large number of entries to ensure
//                 comprehensive coverage across diverse attributes and topics.
//                 This extensive dataset offers in-depth insights into three
//                 primary cultural regions: Arab, Chinese, and Western. By uniting
//                 multiple datasets, it encapsulates a wide spectrum of
//                 perspectives, providing refined knowledge on cultural topics and
//                 regional variances. This framework improve a cultural
//                 understanding and supports precise analysis and comparison
//                 across these distinct regions.
//               </p>
//             </div>
//             <button
//               type="button"
//               onClick={handleClick}
//               className="normal-button"
//             >
//               View
//             </button>
//           </div>
//         </section>
//         <section id="cardsection">
        
//           <h2 class='datasettopic'>Dataset Topics</h2>
//           {/* <img src={ball} id="corner-ball" alt=",," /> */}
//           <div className="containerrows">
//             <div className="row">
//               {/* First Card */}
//               <div className="col-md-6">
//                 <Cardtopic
//                   Icon={RestaurantIcon}
//                   title="Food"
//                   text="What is a common snack for preschool kids in your country?"
//                 />
//               </div>
//               {/* Second Card */}
//               <div className="col-md-6">
//                 <Cardtopic
//                   Icon={FamilyRestroomIcon}
//                   title="Family"
//                   text="What is a popular outdoor place for families to have fun with little kids in your country?"
//                 />
//               </div>
//             </div>
//             <div className="row">
//               {/* Third Card */}
//               <div className="col-md-6">
//                 <Cardtopic
//                   Icon={FitnessCenterIcon}
//                   title="Sport"
//                   text="What is the most popular sport team in your country?"
//                 />
//               </div>
//               {/* Fourth Card */}
//               <div className="col-md-6">
//                 <Cardtopic
//                   Icon={WorkHistoryIcon}
//                   title="Work-life"
//                   text="What is the maximum number of hours one can work per week in your country?"
//                 />
//               </div>
//             </div>
//             <div className="row">
//               {/* Fifth Card */}
//               <div className="col-md-6">
//                 <Cardtopic
//                   Icon={WavingHandIcon}
//                   title="Greeting"
//                   text="What are the common greeting gestures in your culture ?"
//                 />
//               </div>
//               {/* Sixth Card */}
//               <div className="col-md-6">
//                 <Cardtopic
//                   Icon={MenuBookIcon}
//                   title="Education"
//                   text="What is a popular second language for high school students in your country?"
//                 />
//               </div>
//             </div>
//             <div className="row">
//               {/* Seventh Card */}
//               <div className="col-md-6">
//                 <Cardtopic
//                   Icon={TodayIcon}
//                   title="Holidays"
//                   text="What do people do to celebrate New Year's Day in your country?"
//                 />
//               </div>
//             </div>
//           </div>
//         </section>
//       </main>
//       {/* Footer */}
//       <Footer/>
//     </div>
//   );
// };

// export default Discrption;









import { useTranslation } from 'react-i18next';

const Discrption = () => {
  const { t } = useTranslation('descriptionPage');  // This hook will fetch the correct translations

  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/view");
  };

  return (
    <div className="descrptionpage">
      <Header />
      <Helmet>
        <title>{t('culturalValuesTitle')}</title>
        <meta name="description" content={t('metaDescription')} />
      </Helmet>
      <main>
        <section id="CoreDimintion">
          <div className="discrptionbox">
            <div>
              <p className="discrptiontext">
                {t('coreDescription')}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClick}
              className="normal-button"
            >
              {t('viewButton')}
            </button>
          </div>
        </section>

        <section id="cardsection">
          <h2 className="datasettopic">{t('datasetTopics')}</h2>
          <div className="containerrows">
            <div className="row">
              <div className="col-md-6">
                <Cardtopic
                  Icon={RestaurantIcon}
                  title={t('foodCard.title')}
                  text={t('foodCard.text')}
                />
              </div>
              <div className="col-md-6">
                <Cardtopic
                  Icon={FamilyRestroomIcon}
                  title={t('familyCard.title')}
                  text={t('familyCard.text')}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <Cardtopic
                  Icon={FitnessCenterIcon}
                  title={t('sportCard.title')}
                  text={t('sportCard.text')}
                />
              </div>
              <div className="col-md-6">
                <Cardtopic
                  Icon={WorkHistoryIcon}
                  title={t('workLifeCard.title')}
                  text={t('workLifeCard.text')}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <Cardtopic
                  Icon={WavingHandIcon}
                  title={t('greetingCard.title')}
                  text={t('greetingCard.text')}
                />
              </div>
              <div className="col-md-6">
                <Cardtopic
                  Icon={MenuBookIcon}
                  title={t('educationCard.title')}
                  text={t('educationCard.text')}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <Cardtopic
                  Icon={TodayIcon}
                  title={t('holidaysCard.title')}
                  text={t('holidaysCard.text')}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Discrption;
