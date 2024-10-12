import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Login from "./Register/Login"; //    
import Sign from "./Register/sign"; //      
import Index from "./Fpage/Fpage"; // تأكد من أن الاسم الآن كبير
 function App() {
   const route = createBrowserRouter([
    {
      path: "/",  // الصفحة الافتراضية
      element: <Index />, // تغيير إلى Index
    },
    {
      path: "/login",  // مسار صفحة تسجيل الدخول
      element: <Login />,
    },
    {
      path: "/sign",  // مسار صفحة التسجيل
      element: <Sign />, // تأكد من أن المكون Sign صحيح
    },
     
  ]);

  return (
    <div className="App">
      <RouterProvider router={route}></RouterProvider>
    </div>
  );
}

export default App;

