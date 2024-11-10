import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

function Switcher() {
 
  const { i18n } = useTranslation();

  // const changeLanguage = (lang) => {
  //   i18n.changeLanguage(lang); // Change language globally
  // };

  const changeLanguage = (event) => {
    const selectedLang = event.target.value;
    i18n.changeLanguage(selectedLang); // Change language globally
  };
  useEffect(() => {
    document.body.dir = i18n.dir(); // Update text direction (LTR/RTL) based on language
  }, [i18n.language]);

  return (
    <div className="language-switcher">
        
      {/* <button onClick={() => changeLanguage('en')}>English</button>
      <button onClick={() => changeLanguage('ch')}>中文</button>
      <button onClick={() => changeLanguage('ar')}>العربية</button> */}
 
      <select onChange={changeLanguage} defaultValue={i18n.language}>
        <option value="en">English</option>
        <option value="ch">中文</option>
        <option value="ar">العربية</option>
      </select>
     
    </div>
  );
}

export default Switcher;
