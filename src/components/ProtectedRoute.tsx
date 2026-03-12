import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export function ProtectedRoute() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#020617]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="font-serif italic text-slate-400">Verifying Authority...</p>
        </div>
      </div>
    );
  }

  // No user logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Not an admin
  if (role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
