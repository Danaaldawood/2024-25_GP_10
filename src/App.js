import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Login from "./Register/Login";
import Sign from './Register/sign';  // Ensure case matches the file on disk
import Index from "./Fpage/Fpage";
import HomePage from "./HomePage/HomePage";
import Edit from './EditPages/Edit';
import ComparePage from './Compare/CrossCultureComparison';
import { Evaluation } from './Evaluation/Evaluation';
import View from './ViewPages/View';
import CompareResult from './Compare/CompareResult';  // Import CompareResult page
import  {Plot}  from './Plot/Plot'; // 
import {ConversationLayout} from './Freestyle/Freestyle'
import Discrption from './DiscrptionPages/Discrption';
import ModeratorPage from './Modorater/ModeratorPage';
import{ToastContainer} from "react-toastify";

function App() {
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
      path: "/edit",  
      element: <Edit />,
    },
    {
      path: "/compare",  
      element: <ComparePage />, 
    },
    {
      path: "/compare-result",  
      element: <CompareResult />,  
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
  ]);

  return (
    <div className="App">
      <RouterProvider router={route}></RouterProvider>
      <ToastContainer />

    </div>
    
  );
}

export default App;

