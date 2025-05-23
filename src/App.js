import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Login from "./Register/Login";
import Sign from "./Register/sign";
import Index from "./Fpage/Fpage";
import HomePage from "./HomePage/HomePage";
import Edit from "./EditPages/Edit";
import { Evaluation } from "./Evaluation/Evaluation";
import View from "./ViewPages/View";
import CompareResult from "./Compare/CompareResult";
import { Plot } from "./Plot/Plot";
import { ConversationLayout } from "./Freestyle/Freestyle";
import Discrption from "./DiscrptionPages/Discrption";
import ModeratorPage from "./Modorater/ModeratorPage";
import ProfilePage from "./Modorater/ProfilePage";
import UserProfilePage from "./userprofile/UserProfilePage";
import { ToastContainer } from "react-toastify";
import { ForgotPassword } from "./ResetPassword/ForgotPassword";
import { ResetPassword } from "./ResetPassword/ResetPassword";
import { Notifymodrator } from "./Notifymodratorpages/Notifymodrator";
import Switcher from "./Switcher";
import TranslationButton from "./TranslationButton";
import Modal from "./Register/Modal";
import ReportPage from"./Modorater/ReportPage";
import TermsConditionUser from"./Register/TermsModal";
import "./i18next/i18n";
import AdminPage from "./Register/AdminPage";
import AdminLogin from "./Register/AdminLogin";
import AdminForgetPass from "./AdminPassword/AdminForgetPass";
import AdminRestPass from "./AdminPassword/AdminRestPass";
import FreeStyleAdd from "./Freestyle/FreeStyleAdd";
import LensLeaderBoard from "./Freestyle/LensLeaderBoard";
 function App() {
  const { t, i18n } = useTranslation();

  // Handle RTL language setup
  useEffect(() => {
    if (i18n.language === "ar") {
      document.body.classList.add("rtl");
    } else {
      document.body.classList.remove("rtl");
    }
  }, [i18n.language]);

  // Define React Router routes
  const route = createBrowserRouter([
    {
      path: "/",
      element: <Index />,
    },
    {
      path: "/home",
      element: <HomePage />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "adminlogin",
      element: <AdminLogin />,
    },
    {
      path: "/admin",
      element: <AdminPage />,
    },
    {
      path: "/adminforgetpass",
      element: <AdminForgetPass />,
    },
    {
      path: "/adminrestpass",
      element: <AdminRestPass />,
    },
    {
      path: "/forgot",
      element: <ForgotPassword />,
    },
    {
      path: "/reset",
      element: <ResetPassword />,
    },
    {
      path: "/sign",
      element: <Sign />,
    },
    {
      path: "/homepage",
      element: <HomePage />,
    },
    {
      path: "/view",
      element: <View />,
    },
    {
      path: "/edit/:id",
      element: <Edit />,
    },
    
    {
      path: "/compare-result",
      element: <CompareResult />, // Flask message will be handled here
    },
    {
      path: "/evaluation",
      element: <Evaluation />,
    },
    {
      path: "/plot",
      element: <Plot />,
    },
    {
      path: "/freestyle",
      element: <ConversationLayout />,
    },
    {
      path: "/culturevalues",
      element: <Discrption />,
    },
    {
      path: "/moderator",
      element: <ModeratorPage />,
    },
    {
      path: "/profile",
      element: <ProfilePage />,
    },
    {
      path: "/userprofile",
      element: <UserProfilePage />,
    },
    {
      path: "/Notifymodrator/:id",
      element: <Notifymodrator />,
    },
    { path: "/modal", 
      element: <Modal /> },

      {
        path: "/TermsConditionUser",
        element: <TermsConditionUser />
      },
      {
        path: "/reportpage", 
        element: <ReportPage />,
      },
      {
        path:"/FreeStyleAdd",
        element:<FreeStyleAdd />
      },
      {path:"/LensLeaderBoard",
        element:<LensLeaderBoard />
      },
 
       
      
  ]);

  return (
    <div className="App">
      {/* <Switcher /> */}

      <RouterProvider router={route}></RouterProvider>

      <ToastContainer />
    </div>
  );
}

export default App;
