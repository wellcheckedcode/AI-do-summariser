import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

const ProtectedRoute = ({ redirectTo = "/login", allow = null }) => {
	const { user, loading, department } = useAuth();

	if (loading) return null;

	if (!user) {
		return <Navigate to={redirectTo} replace />;
	}

	if (allow && Array.isArray(allow) && department && !allow.includes(department)) {
		return <Navigate to={redirectTo} replace />;
	}

	return <Outlet />;
};

export default ProtectedRoute;


