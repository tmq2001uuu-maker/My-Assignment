# Libra Lite – Web thư viện đơn giản (React)

Chức năng: đăng nhập / đăng ký, xem sách theo thể loại + tìm kiếm, xem chi tiết sách, đăng ký mượn sách, xem & huỷ đơn mượn, sách yêu thích, hồ sơ + đổi mật khẩu, gợi ý sách cùng thể loại.

## Chạy project
```bash
npm install
npm run server   # terminal 1: json-server chạy ở http://localhost:3001
npm start        # terminal 2: React chạy ở http://localhost:3000
```

## Phân quyền
- **Khách (chưa đăng nhập):** xem trang chủ, danh sách sách, chi tiết sách. Bấm Đơn mượn / Yêu thích / Đăng ký mượn sẽ có thông báo cần đăng nhập.
- **Reader:** đăng ký mượn sách, huỷ đơn chờ duyệt, yêu thích, sửa hồ sơ, đổi mật khẩu.
- **Admin:** thêm / sửa / ẩn-hiện sách, duyệt hoặc từ chối phiếu mượn, xác nhận trả sách.

## Tài khoản thử
| Tài khoản | Mật khẩu |
|---|---|
| admin | Admin123@ (quản trị) |
| reader01 | Reader123@ |
| reader02 | Reader123@ |
| locked01 | Reader123@ (tài khoản đã bị khoá → không đăng nhập được) |

## Cấu trúc
```
src/
  index.js            # điểm vào, import bootstrap + toast
  App.js              # khai báo route
  api.js              # toàn bộ hàm gọi json-server
  AuthContext.js      # lưu user đăng nhập (localStorage)
  utils.js            # hàm ngày tháng, tính số sách còn
  components/         # Navbar, Footer, BookCard, Pager, ProtectedRoute, AdminRoute, RequireLogin
  pages/              # Home, Login, Register, Books, BookDetail, MyBorrowings, Favorites, Profile
  pages/admin/        # AdminBooksPage, AdminBookFormPage, AdminBorrowingsPage
```
