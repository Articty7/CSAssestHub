import { useSelector } from "react-redux";

export default function RequireRole({ allow =[], children, fallback = null }) {
    const user = useSelector((state) => state.session.user);
    const role =user?.role;

    if (!role || !allow.includes (role)) {
        return fallback;
    }

    return children;
}