import { useAuth } from "../AuthContext";
import RequireLogin from "./RequireLogin";

// Trang dành cho người đã đăng nhập (khách sẽ thấy thông báo cần đăng nhập)
export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <RequireLogin />;
}
