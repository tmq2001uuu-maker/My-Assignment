import axios from "axios";
import { addDays, availableCopies } from "./utils";

const api = axios.create({
  baseURL: process.env.REACT_APP_SERVER_URL || "http://localhost:3001",
  timeout: 5000,
});

// Gọi API và đổi lỗi axios thành thông báo dễ hiểu
async function call(request) {
  try {
    return (await request).data;
  } catch (e) {
    if (e.code === "ECONNABORTED") throw new Error("Server phản hồi quá lâu, vui lòng thử lại.");
    if (e.request && !e.response) throw new Error("Không kết nối được server (đã chạy `npm run server` chưa?).");
    if (e.response?.status === 404) throw new Error("Không tìm thấy dữ liệu.");
    throw e;
  }
}

// Bỏ mật khẩu trước khi lưu user vào localStorage
function safeUser({ id, username, name, role, image }) {
  return { id, username, name, role, image };
}

/* ---------- Tài khoản ---------- */
export async function login(username, password) {
  const users = await call(api.get("users", { params: { username } }));
  const user = users.find((u) => u.username === username && u.password === password);
  if (!user) throw new Error("Tài khoản hoặc mật khẩu không đúng.");
  if (user.is_active === false) throw new Error("Tài khoản đã bị khoá.");
  return safeUser(user);
}

export async function register({ name, username, password }) {
  const existed = await call(api.get("users", { params: { username } }));
  if (existed.length > 0) throw new Error("Tên tài khoản đã tồn tại, vui lòng chọn tên khác.");
  const user = await call(api.post("users", { name, username, password, role: "reader", is_active: true }));
  return safeUser(user);
}

/* ---------- Sách & thể loại ---------- */
export async function getCategories(includeHidden = false) {
  const list = await call(api.get("categories"));
  return includeHidden ? list : list.filter((c) => c.is_active !== false);
}

export async function getBooks(includeHidden = false) {
  const list = await call(api.get("books"));
  return includeHidden ? list : list.filter((b) => b.is_active !== false);
}

export async function getShelves() {
  const list = await call(api.get("shelves"));
  return list.filter((s) => s.is_active !== false);
}

// Lấy 1 cuốn sách kèm thể loại + kệ
export async function getBook(id) {
  const book = await call(api.get(`books/${id}`));
  if (book.is_active === false) throw new Error("Sách này hiện không còn trong thư viện.");
  const [category, shelf] = await Promise.all([
    call(api.get(`categories/${book.categoryId}`)).catch(() => null),
    call(api.get(`shelves/${book.shelfId}`)).catch(() => null),
  ]);
  return { book, category, shelf };
}

/* ---------- Mượn sách ---------- */
export async function getMyBorrowings(userId) {
  const [list, books] = await Promise.all([
    call(api.get("borrowings", { params: { userId } })),
    call(api.get("books")),
  ]);
  const bookMap = Object.fromEntries(books.map((b) => [b.id, b]));
  return list
    .map((b) => ({ ...b, book: bookMap[b.bookId] }))
    .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
}

export async function borrowBook(userId, bookId, dueDate) {
  // Mỗi người chỉ có 1 đơn đang xử lý / đang mượn cho 1 cuốn
  const old = await call(api.get("borrowings", { params: { userId, bookId } }));
  if (old.some((b) => b.status === "pending" || b.status === "borrowing")) {
    throw new Error("Bạn đã có đơn mượn đang xử lý hoặc đang mượn cuốn sách này.");
  }
  // Lấy lại số lượng mới nhất rồi mới kiểm tra
  const book = await call(api.get(`books/${bookId}`));
  if (availableCopies(book) <= 0) throw new Error("Sách đã hết, vui lòng quay lại sau.");

  return call(
    api.post("borrowings", {
      userId,
      bookId,
      requestDate: new Date().toLocaleDateString("sv-SE"),
      borrowDate: null,
      dueDate, // ngày dự kiến trả do người mượn chọn
      returnDate: null,
      status: "pending",
      rejectReason: "",
      returnCondition: null,
      returnNote: "",
      created_at: new Date().toISOString(),
    })
  );
}

export async function cancelBorrowing(id) {
  return call(api.patch(`borrowings/${id}`, { status: "cancelled" }));
}

/* ---------- Yêu thích ---------- */
export async function getFavorite(userId, bookId) {
  const list = await call(api.get("favorites", { params: { userId, bookId } }));
  return list[0] || null;
}

export async function addFavorite(userId, bookId) {
  return call(api.post("favorites", { userId, bookId, createdAt: new Date().toISOString() }));
}

export async function removeFavorite(id) {
  return call(api.delete(`favorites/${id}`));
}

export async function getMyFavorites(userId) {
  const [list, books] = await Promise.all([
    call(api.get("favorites", { params: { userId } })),
    getBooks(),
  ]);
  const bookMap = Object.fromEntries(books.map((b) => [b.id, b]));
  return list.map((f) => bookMap[f.bookId]).filter(Boolean); // bỏ sách đã ẩn/xoá
}

/* ---------- Hồ sơ ---------- */
export async function updateName(userId, name) {
  await call(api.patch(`users/${userId}`, { name }));
  return name;
}

export async function changePassword(userId, oldPassword, newPassword) {
  const user = await call(api.get(`users/${userId}`));
  if (user.password !== oldPassword) throw new Error("Mật khẩu hiện tại không đúng.");
  if (oldPassword === newPassword) throw new Error("Mật khẩu mới phải khác mật khẩu hiện tại.");
  await call(api.patch(`users/${userId}`, { password: newPassword }));
}

/* ---------- Admin: quản lý sách ---------- */
export function getBookRaw(id) {
  return call(api.get(`books/${id}`));
}

export function createBook(data) {
  return call(api.post("books", { ...data, borrowedCopies: 0, is_active: true }));
}

export function updateBook(id, data) {
  return call(api.patch(`books/${id}`, data));
}

export function setBookActive(id, active) {
  return call(api.patch(`books/${id}`, { is_active: active }));
}

/* ---------- Admin: phiếu mượn ---------- */
export async function getAllBorrowings() {
  const [list, users, books] = await Promise.all([
    call(api.get("borrowings")),
    call(api.get("users")),
    call(api.get("books")),
  ]);
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));
  const bookMap = Object.fromEntries(books.map((b) => [b.id, b]));
  return list
    .map((b) => ({ ...b, user: userMap[b.userId], book: bookMap[b.bookId] }))
    .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
}

// Duyệt đơn: kiểm tra còn sách, tăng số đang mượn
export async function approveBorrowing(id) {
  const borrowing = await call(api.get(`borrowings/${id}`));
  if (borrowing.status !== "pending") throw new Error("Đơn này đã được xử lý hoặc người dùng đã huỷ.");
  const book = await call(api.get(`books/${borrowing.bookId}`));
  if (availableCopies(book) <= 0) throw new Error("Sách đã hết, không thể duyệt đơn.");
  await call(api.patch(`books/${book.id}`, { borrowedCopies: book.borrowedCopies + 1 }));
  return call(
    api.patch(`borrowings/${id}`, {
      status: "borrowing",
      borrowDate: new Date().toLocaleDateString("sv-SE"),
      dueDate: borrowing.dueDate || addDays(14),
    })
  );
}

export async function rejectBorrowing(id, reason) {
  const borrowing = await call(api.get(`borrowings/${id}`));
  if (borrowing.status !== "pending") throw new Error("Đơn này đã được xử lý hoặc người dùng đã huỷ.");
  return call(api.patch(`borrowings/${id}`, { status: "rejected", rejectReason: reason }));
}

// Xác nhận trả sách: giảm số đang mượn
export async function returnBorrowing(id) {
  const borrowing = await call(api.get(`borrowings/${id}`));
  if (borrowing.status !== "borrowing") throw new Error("Đơn này không ở trạng thái đang mượn.");
  const book = await call(api.get(`books/${borrowing.bookId}`));
  await call(api.patch(`books/${book.id}`, { borrowedCopies: Math.max(0, book.borrowedCopies - 1) }));
  return call(
    api.patch(`borrowings/${id}`, {
      status: "returned",
      returnDate: new Date().toLocaleDateString("sv-SE"),
      returnCondition: "normal",
    })
  );
}
