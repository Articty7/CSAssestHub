//import React from "react";
import { createBrowserRouter } from "react-router-dom";
import Layout from "./layout.jsx";                 // ⬅ matches your file name
import LoginFormPage from "../components/LoginFormPage";
import SignupFormPage from "../components/SignupFormPage";
import Assets from "../pages/Assets.jsx";          // ⬅ new

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <h1>Welcome!</h1> },
      { path: "login", element: <LoginFormPage /> },
      { path: "signup", element: <SignupFormPage /> },
      { path: "assets", element: <Assets /> },     // ⬅ new route
    ],
  },
]);
