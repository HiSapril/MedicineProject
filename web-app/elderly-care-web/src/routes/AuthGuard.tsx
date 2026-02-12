import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthGuard() {
  const { token, isInitialized } = useAuth();

  // Chờ khởi tạo xong từ localStorage để tránh bị đá văng ra Login page
  if (!isInitialized) {
    return null; // Hoặc một loading spinner
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
