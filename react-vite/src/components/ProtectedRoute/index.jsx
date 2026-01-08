import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute ({ children}) {
    const user = useSelector ((state) => state.session.user);
    const location = useLocation();

    if(!user) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }
    
    return children;
    
}
