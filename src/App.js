import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Login from "./Register/Login"; //    
import Sign from "./Register/sign"; //      
import Index from "./Fpage/Fpage"; //
import HomePage from "./HomePage/HomePage";

 function App() {
   const route = createBrowserRouter([
    {
      path: "/",  // الصفحة الافتراضية
      element: <Index />, // تغيير إلى Index
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
    }
     
  ]);

  return (
    <div className="App">
      <RouterProvider router={route}></RouterProvider>
    </div>
  );
}

export default App;

