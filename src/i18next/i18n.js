// import i18n from 'i18next';    
// import { initReactI18next } from 'react-i18next';

// import headertrans from '../Transulation/Headr_trans.json';
// import hometrans from '../Transulation/HomePage_trans.json';
// import fpagetrans from '../Transulation/Fpage_trans.json';
// import logintrans from '../Transulation/Login_trans.json';
// import signuptrans from '../Transulation/Signup_trans.json';
// import discrptiontran from '../Transulation/DiscrptionPage_trans.json';

// i18n.use(initReactI18next).init({
//     lng: 'en', // default language
//     fallbackLng: 'ar', // fallback language
//     ns: ['headerpage','homepage','viewPage','fpage','login','signup','descriptionPag','EdiPage'], // list of namespaces
//     defaultNS: 'viewPage', // default namespace if not specified
//     resources: {
//       en: {
//         headerpage:headertrans.en,
//         homepage:hometrans.en,
//         fpage:fpagetrans.en,
//         login:logintrans.en,
//         signup:signuptrans.en,
//         descriptionPage:discrptiontran.en,
        

//         // viewPage:viewPageEn,
    
//       },
//       ar: {
//         headerpage:headertrans.ar,
//         homepage:hometrans.ar,
//         fpage:fpagetrans.ar,
//         login:logintrans.ar,
//         signup:signuptrans.ar,
//         descriptionPage:discrptiontran.ar,
//         // viewPage: viewPageAr,
      
//       },
//       ch: {
//         headerpage:headertrans.ch,
//         homepage:hometrans.ch,
//         fpage:fpagetrans.ch,
//         login:logintrans.ch,
//         signup:signuptrans.ch,
//         descriptionPage:discrptiontran.ch,
//         // viewPage: viewPageCh,
       
//       },
//     },
//   });
  
// export default i18n;







import i18n from 'i18next';    
import { initReactI18next } from 'react-i18next';

import headertrans from '../Transulation/Headr_trans.json';
import hometrans from '../Transulation/HomePage_trans.json';
import fpagetrans from '../Transulation/Fpage_trans.json';
import logintrans from '../Transulation/Login_trans.json';
import signuptrans from '../Transulation/Signup_trans.json';
import discrptiontran from '../Transulation/DiscrptionPage_trans.json';
import viewtrans from '../Transulation/Viewpage_trans.json';

i18n.use(initReactI18next).init({
  lng: localStorage.getItem('i18nextLng') || 'en', // Load from localStorage if available, else default to 'en'
  fallbackLng: 'ar', // fallback language
  ns: ['headerpage', 'homepage', 'viewPage', 'fpage', 'login', 'signup', 'descriptionPage', 'EdiPage'],
  defaultNS: 'viewPage', // default namespace if not specified
  resources: {
    en: {
      headerpage: headertrans.en,
      homepage: hometrans.en,
      fpage: fpagetrans.en,
      login: logintrans.en,
      signup: signuptrans.en,
      descriptionPage: discrptiontran.en,
      viewPage:viewtrans.en,
    },
    ar: {
      headerpage: headertrans.ar,
      homepage: hometrans.ar,
      fpage: fpagetrans.ar,
      login: logintrans.ar,
      signup: signuptrans.ar,
      descriptionPage: discrptiontran.ar,
      viewPage:viewtrans.ar,
    },
    ch: {
      headerpage: headertrans.ch,
      homepage: hometrans.ch,
      fpage: fpagetrans.ch,
      login: logintrans.ch,
      signup: signuptrans.ch,
      descriptionPage: discrptiontran.ch,
      viewPage:viewtrans.ch,
    },
  },
  react: {
    useSuspense: false, // Optional: only if you have issues with Suspense
  },
});

// Watch for language change and save it to localStorage
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('i18nextLng', lng);
});

export default i18n;
