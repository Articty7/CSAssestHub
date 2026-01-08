//import React from "react";
import { createBrowserRouter } from "react-router-dom";
import Layout from "./Layout.jsx";                 // 
import LoginFormPage from "../components/LoginFormPage";
import SignupFormPage from "../components/SignupFormPage";
import Dashboard from "../pages/Dashboard.jsx";          // Management Tools
import PublicAssets from "../pages/PublicAssets.jsx";  // Public Demo
import ProtectedRoute from "../components/ProtectedRoute/index.jsx";


export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <h1>Welcome!</h1> },
      { path: "login", element: <LoginFormPage /> },
      { path: "signup", element: <SignupFormPage /> },
      { path: "assets", element: <PublicAssets /> },     // Public Demo
      { path: "dashboard",
        element:(
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
       } // Management tools
    ],
  },
]);
