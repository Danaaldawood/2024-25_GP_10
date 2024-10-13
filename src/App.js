import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Login from "./Register/Login";
import Sign from './Register/sign'; // Ensure case matches the file on disk
import Index from "./Fpage/Fpage";
import HomePage from "./HomePage/HomePage";
import EditPage from './EditPages/Edit';
import ComparePage from './Compare/CrossCultureComparison'; 
import { Evaluation } from './Evaluation/Evaluation';
import  View  from './ViewPages/View'; // 






function App() {
  const route = createBrowserRouter([
    {
      path: "/",  
      element: <Index />, // Default page
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
      element: <HomePage />, // HomePage with the navigation bar
    },
    {
      path: "/view",  
      element: <View />, // HomePage with the navigation bar
    },

    {
      path: "/edit",  
      element: <EditPage />, // Edit page
    },
    {
      path: "/compare",  
      element: <ComparePage />, // Compare page
    },
    
    {
      path: "/evaluation",  
      element: <Evaluation />, // Evaluation page
    },
    

  ]);

  return (
    <div className="App">
      <RouterProvider router={route}></RouterProvider>
    </div>
  );
}

export default App;


