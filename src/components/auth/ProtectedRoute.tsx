import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useAuthStore } from "../../store/authStore";

interface ProtectedRouteProps {
  adminOnly?: boolean;
}

function ProtectedRoute({
  adminOnly = false,
}: ProtectedRouteProps) {
  const location = useLocation();

  const user = useAuthStore(
    (state) => state.user,
  );

  const isAuthenticated =
    useAuthStore(
      (state) => state.isAuthenticated,
    );

  const authenticated =
    isAuthenticated();

  if (!authenticated || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  if (
    adminOnly &&
    user.role !== "admin"
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;