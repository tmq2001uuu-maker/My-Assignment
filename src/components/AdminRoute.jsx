import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../AuthContext";
import RequireLogin from "./RequireLogin";

// Chỉ admin mới vào được các trang /admin/*
export default function AdminRoute() {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <RequireLogin />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return <Outlet />;
}
