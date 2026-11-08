import { Link, NavLink, useNavigate } from "react-router-dom";
import { BookMarked, BookOpen, FileText, Heart, House, ZodiacLibra } from "lucide-react";
import { useAuth } from "../AuthContext";

const READER_LINKS = [
  { to: "/", label: "Trang chủ", icon: House, end: true },
  { to: "/books", label: "Sách", icon: BookOpen },
  { to: "/my-borrowings", label: "Đơn mượn", icon: BookMarked },
  { to: "/favorites", label: "Yêu thích", icon: Heart },
];

const ADMIN_LINKS = [
  { to: "/admin/books", label: "Quản lý sách", icon: BookOpen },
  { to: "/admin/borrowings", label: "Duyệt phiếu mượn", icon: FileText },
];

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";
  const links = isAdmin ? ADMIN_LINKS : READER_LINKS;

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <nav className="navbar navbar-expand navbar-dark app-navbar">
      <div className="container">
        <Link to={isAdmin ? "/admin/books" : "/"} className="navbar-brand fw-bold d-flex align-items-center gap-2">
          <span className="logo-icon"><ZodiacLibra size={20} /></span>
          Libra
        </Link>
        <ul className="navbar-nav me-auto">
          {links.map((l) => (
            <li className="nav-item" key={l.to}>
              <NavLink to={l.to} end={l.end} className="nav-link">
                <l.icon size={18} /> {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="d-flex align-items-center gap-2">
          {isAuthenticated ? (
            <>
              {isAdmin && <span className="badge text-bg-warning">Admin</span>}
              <Link to="/profile" className="text-light small text-decoration-none">
                {user.name || user.username}
              </Link>
              <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>Đăng xuất</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline-light btn-sm">Đăng nhập</Link>
              <Link to="/register" className="btn btn-light btn-sm">Đăng ký</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
