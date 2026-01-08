import { createBrowserRouter } from "react-router-dom";
import Layout from "./Layout.jsx";
import LoginFormPage from "../components/LoginFormPage";
import SignupFormPage from "../components/SignupFormPage";
import Dashboard from "../pages/Dashboard.jsx";
import PublicAssets from "../pages/PublicAssets.jsx";
import ProtectedRoute from "../components/ProtectedRoute";

/**
 * Router configuration
 * --------------------
 * - /assets     → Public demo (no login required)
 * - /dashboard  → Management tools (login required)
 */
export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <h1>Welcome!</h1> },
      { path: "login", element: <LoginFormPage /> },
      { path: "signup", element: <SignupFormPage /> },

      // Public, read-only demo
      { path: "assets", element: <PublicAssets /> },

      // Protected management area
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
