import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import BooksPage from "./pages/BooksPage";
import BookDetailPage from "./pages/BookDetailPage";
import MyBorrowingsPage from "./pages/MyBorrowingsPage";
import FavoritesPage from "./pages/FavoritesPage";
import ProfilePage from "./pages/ProfilePage";
import AdminBooksPage from "./pages/admin/AdminBooksPage";
import AdminBookFormPage from "./pages/admin/AdminBookFormPage";
import AdminBorrowingsPage from "./pages/admin/AdminBorrowingsPage";

// Khung chung: menu + nội dung + footer
function Layout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

// Các trang thường nằm trong container; trang chủ thì để tràn màn hình
function PageContainer() {
  return (
    <div className="container py-4">
      <Outlet />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />

            <Route element={<PageContainer />}>
              {/* Ai cũng xem được */}
              <Route path="books" element={<BooksPage />} />
              <Route path="books/:id" element={<BookDetailPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />

              {/* Cần đăng nhập */}
              <Route path="my-borrowings" element={<ProtectedRoute><MyBorrowingsPage /></ProtectedRoute>} />
              <Route path="favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
              <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

              {/* Chỉ admin */}
              <Route path="admin" element={<AdminRoute />}>
                <Route index element={<Navigate to="books" replace />} />
                <Route path="books" element={<AdminBooksPage />} />
                <Route path="books/new" element={<AdminBookFormPage />} />
                <Route path="books/:id/edit" element={<AdminBookFormPage />} />
                <Route path="borrowings" element={<AdminBorrowingsPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
