import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getBooks, getCategories } from "../api";
import BookCard from "../components/BookCard";

const PAGE_SIZE = 8;

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    Promise.all([getBooks(), getCategories()])
      .then(([b, c]) => { setBooks(b); setCategories(c); })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  const kw = keyword.trim().toLowerCase();

  // Chỉ hiện sách thuộc thể loại còn hoạt động
  const filtered = books.filter(
    (b) =>
      categoryMap[b.categoryId] &&
      (!categoryId || b.categoryId === categoryId) &&
      (!kw || b.title.toLowerCase().includes(kw) || b.author.toLowerCase().includes(kw))
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const shown = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <>
      <h3 className="mb-3">Danh sách sách</h3>

      <input
        className="form-control mb-3"
        placeholder="Tìm theo tên sách hoặc tác giả..."
        value={keyword}
        onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
      />

      <div className="d-flex flex-wrap gap-2 mb-4">
        <button
          className={`btn btn-sm ${categoryId === "" ? "btn-dark" : "btn-outline-dark"}`}
          onClick={() => { setCategoryId(""); setPage(1); }}
        >
          Tất cả
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className={`btn btn-sm ${categoryId === c.id ? "btn-dark" : "btn-outline-dark"}`}
            onClick={() => { setCategoryId(c.id); setPage(1); }}
          >
            {c.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border" /></div>
      ) : shown.length === 0 ? (
        <p className="text-center text-muted py-5">Không tìm thấy sách phù hợp.</p>
      ) : (
        <div className="row g-3">
          {shown.map((b) => (
            <div className="col-6 col-md-4 col-lg-3" key={b.id}>
              <BookCard book={b} categoryName={categoryMap[b.categoryId]} />
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
          <button className="btn btn-outline-dark btn-sm" disabled={current === 1} onClick={() => setPage(current - 1)}>
            Trước
          </button>
          <span className="small">Trang {current} / {totalPages}</span>
          <button className="btn btn-outline-dark btn-sm" disabled={current === totalPages} onClick={() => setPage(current + 1)}>
            Sau
          </button>
        </div>
      )}
    </>
  );
}
