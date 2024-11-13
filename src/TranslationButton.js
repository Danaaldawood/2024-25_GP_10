// import { useState, useEffect } from 'react';
// import { Globe2 } from 'lucide-react';

// const TranslateWidget = () => {
//   const [isLoaded, setIsLoaded] = useState(false);
//   const [currentLang, setCurrentLang] = useState('en');
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);

//   const languages = [
//     { code: 'en', name: 'English' },

//     { code: 'zh-CN', name: 'Chinese (Simplified)' },
//     { code: 'ar', name: 'Arabic' },

//   ];

//   useEffect(() => {
//     // Initialize Google Translate
//     const addScript = () => {
//       const script = document.createElement('script');
//       script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
//       script.async = true;
//       document.body.appendChild(script);

//       window.googleTranslateElementInit = () => {
//         new window.google.translate.TranslateElement(
//           {
//             pageLanguage: 'en',
//             includedLanguages: languages.map(lang => lang.code).join(','),
//             layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
//             autoDisplay: false,
//           },
//           'google_translate_element'
//         );
//         setIsLoaded(true);
//       };
//     };

//     if (!document.querySelector('script[src*="translate.google.com"]')) {
//       addScript();
//     }

//     // Cleanup
//     return () => {
//       const script = document.querySelector('script[src*="translate.google.com"]');
//       if (script) {
//         script.remove();
//       }
//       delete window.googleTranslateElementInit;
//     };
//   }, []);

//   const handleTranslation = (languageCode) => {
//     if (!isLoaded) return;

//     const element = document.getElementsByClassName('goog-te-combo')[0];
//     if (element) {
//       element.value = languageCode;
//       element.dispatchEvent(new Event('change'));
//       setCurrentLang(languageCode);
//     }
//     setIsDropdownOpen(false);
//   };

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (isDropdownOpen && !event.target.closest('.translate-widget-container')) {
//         setIsDropdownOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, [isDropdownOpen]);

//   return (
//     <div className="fixed top-4 right-4 z-50 translate-widget-container">
//       {/* Hidden Google Translate Element */}
//       <div id="google_translate_element" className="hidden" />
      
//       {/* Custom Translation UI */}
//       <div className="relative">
//         <button
//           className={`flex items-center space-x-2 ${
//             isLoaded ? 'bg-white' : 'bg-gray-100'
//           } rounded-lg shadow-md px-4 py-2 hover:bg-gray-50 transition-colors`}
//           onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//           disabled={!isLoaded}
//         >
//           <Globe2 className="h-5 w-5" />
//           <span>{isLoaded ? 'Translate' : 'Loading...'}</span>
//         </button>

//         {isDropdownOpen && (
//           <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
//             {languages.map((lang) => (
//               <button
//                 key={lang.code}
//                 className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${
//                   currentLang === lang.code ? 'bg-gray-50' : ''
//                 }`}
//                 onClick={() => handleTranslation(lang.code)}
//               >
//                 {lang.name}
//               </button>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TranslateWidget;

import { useState } from 'react';
import { Globe2 } from 'lucide-react';

const TranslationButton = () => {
  const [currentLang, setCurrentLang] = useState('en');

  const languages = [
    { code: 'en', name: 'English' },
   
    { code: 'ar', name: 'Arabic' },
    { code: 'zh', name: 'Chinese' }
  ];

  const translatePage = (targetLang) => {
    // Only translate if the target language is different
    if (targetLang !== currentLang) {
      // Add Google Translate script if it doesn't exist
      if (!window.google?.translate) {
        const script = document.createElement('script');
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        document.head.appendChild(script);

        window.googleTranslateElementInit = () => {
          new window.google.translate.TranslateElement({
            pageLanguage: currentLang,
            includedLanguages: languages.map(lang => lang.code).join(','),
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false
          }, 'google_translate_element');
        };
      }

      // Trigger translation
      if (window.google?.translate?.TranslateElement) {
        const select = document.querySelector('.goog-te-combo');
        if (select) {
          select.value = targetLang;
          select.dispatchEvent(new Event('change'));
          setCurrentLang(targetLang);
        }
      }
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div id="google_translate_element" className="hidden" />
      <div className="relative">
        <button
          className="flex items-center space-x-2 bg-white rounded-lg shadow-md px-4 py-2 hover:bg-gray-50"
          onClick={() => document.getElementById('languageDropdown').classList.toggle('hidden')}
        >
          <Globe2 className="h-5 w-5" />
          <span>Translate</span>
        </button>
        
        <div
          id="languageDropdown"
          className="hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200"
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
              onClick={() => translatePage(lang.code)}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TranslationButton;