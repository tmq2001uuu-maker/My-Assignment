import { Link, useLocation } from "react-router-dom";

// Thông báo "cần đăng nhập" dùng khi khách vào trang yêu cầu tài khoản
export default function RequireLogin() {
  const location = useLocation();
  return (
    <div className="container py-5 d-flex justify-content-center">
      <div className="card shadow-sm text-center p-4" style={{ maxWidth: 450, width: "100%" }}>
        <h3 className="mb-3">Bạn chưa đăng nhập</h3>
        <p className="text-muted mb-4">Bạn cần đăng nhập để sử dụng chức năng này.</p>
        <div className="d-flex justify-content-center gap-2">
          <Link to="/login" state={{ from: location.pathname }} className="btn btn-dark px-4">Đăng nhập</Link>
          <Link to="/register" className="btn btn-outline-dark px-4">Đăng ký</Link>
        </div>
      </div>
    </div>
  );
}
