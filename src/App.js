import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Login from "./Register/Login";
import Sign from './Register/sign';  // Ensure case matches the file on disk
import Index from "./Fpage/Fpage";
import HomePage from "./HomePage/HomePage";
import EditPage from './EditPages/Edit';
import ComparePage from './Compare/CrossCultureComparison';
import { Evaluation } from './Evaluation/Evaluation';
import View from './ViewPages/View';
import CompareResult from './Compare/CompareResult';  // Import CompareResult page

function App() {
  const route = createBrowserRouter([
    {
      path: "/",  
      element: <Index />,  // Default page
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
      element: <EditPage />,
    },
    {
      path: "/compare",  
      element: <ComparePage />,  // Compare page
    },
    {
      path: "/compare-result",  
      element: <CompareResult />,  // Compare Result page, make sure it's defined
    },
    {
      path: "/evaluation",  
      element: <Evaluation />,
    },
  ]);

  return (
    <div className="App">
      <RouterProvider router={route}></RouterProvider>
    </div>
  );
}

export default App;

