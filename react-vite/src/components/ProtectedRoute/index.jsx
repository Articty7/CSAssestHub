/**
 * ProtectedRoute
 * --------------
 * Wraps routes that require authentication.
 * If the user is NOT logged in, redirect them to /login.
 *
 * Uses Redux session state set by thunkAuthenticate().
 */
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  // Grab the logged-in user from Redux
  const user = useSelector((state) => state.session.user);

  // Save current location so we can redirect back after login
  const location = useLocation();

  // If no user exists, force login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Otherwise, render the protected content
  return children;
}
