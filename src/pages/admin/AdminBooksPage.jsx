import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getBooks, getCategories, getShelves, setBookActive } from "../../api";
import Pager from "../../components/Pager";
import { availableCopies } from "../../utils";

const PAGE_SIZE = 10;

export default function AdminBooksPage() {
  const [books, setBooks] = useState([]);
  const [categoryMap, setCategoryMap] = useState({});
  const [shelfMap, setShelfMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);

  async function load() {
    try {
      const [b, c, s] = await Promise.all([getBooks(true), getCategories(true), getShelves()]);
      setBooks(b);
      setCategoryMap(Object.fromEntries(c.map((x) => [x.id, x.name])));
      setShelfMap(Object.fromEntries(s.map((x) => [x.id, x.name])));
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function toggleActive(book) {
    const hide = book.is_active !== false;
    if (!window.confirm(hide ? `Ẩn sách "${book.title}" khỏi thư viện?` : `Hiện lại sách "${book.title}"?`)) return;
    try {
      await setBookActive(book.id, !hide);
      toast.success(hide ? "Đã ẩn sách." : "Đã hiện lại sách.");
      load();
    } catch (e) {
      toast.error(e.message);
    }
  }

  const kw = keyword.trim().toLowerCase();
  const filtered = books.filter(
    (b) => !kw || b.title.toLowerCase().includes(kw) || b.author.toLowerCase().includes(kw)
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const shown = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Quản lý sách</h3>
        <Link to="/admin/books/new" className="btn btn-dark">Thêm sách mới</Link>
      </div>

      <input
        className="form-control mb-3"
        placeholder="Tìm theo tên sách hoặc tác giả..."
        value={keyword}
        onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
      />

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border" /></div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle bg-white">
            <thead className="table-light">
              <tr>
                <th>Tên sách</th><th>Tác giả</th><th>Thể loại</th><th>Kệ</th>
                <th className="text-center">Tổng</th><th className="text-center">Còn</th><th>Trạng thái</th><th></th>
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 && (
                <tr><td colSpan="8" className="text-center text-muted py-4">Không có sách nào.</td></tr>
              )}
              {shown.map((b) => (
                <tr key={b.id} className={b.is_active === false ? "table-secondary" : ""}>
                  <td>{b.title}</td>
                  <td>{b.author}</td>
                  <td>{categoryMap[b.categoryId] || "—"}</td>
                  <td>{shelfMap[b.shelfId] || "—"}</td>
                  <td className="text-center">{b.totalCopies}</td>
                  <td className="text-center">{availableCopies(b)}</td>
                  <td>
                    <span className={`badge ${b.is_active === false ? "text-bg-secondary" : "text-bg-success"}`}>
                      {b.is_active === false ? "Đang ẩn" : "Hiển thị"}
                    </span>
                  </td>
                  <td className="text-end text-nowrap">
                    <Link to={`/admin/books/${b.id}/edit`} className="btn btn-outline-dark btn-sm me-2">Sửa</Link>
                    <button
                      className={`btn btn-sm ${b.is_active === false ? "btn-outline-success" : "btn-outline-danger"}`}
                      onClick={() => toggleActive(b)}
                    >
                      {b.is_active === false ? "Hiện" : "Ẩn"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pager page={current} totalPages={totalPages} onChange={setPage} />
    </>
  );
}
