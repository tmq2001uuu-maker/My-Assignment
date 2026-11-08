import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { BookHeart, Heart, ShelvingUnit, SquareUserRound, Telescope } from "lucide-react";
import { addFavorite, borrowBook, getBook, getBooks, getFavorite, removeFavorite } from "../api";
import BookCard from "../components/BookCard";
import { useAuth } from "../AuthContext";
import { addDays, availableCopies } from "../utils";

const MAX_DAYS = 30;

export default function BookDetailPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.role === "admin";
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [dueDate, setDueDate] = useState(addDays(14));
  const [submitting, setSubmitting] = useState(false);
  const [favorite, setFavorite] = useState(null); // bản ghi yêu thích hoặc null
  const [related, setRelated] = useState([]);
  const [needLogin, setNeedLogin] = useState(false); // khách bấm mượn / yêu thích

  useEffect(() => {
    setData(null);
    setError("");
    setNeedLogin(false);
    getBook(id).then(setData).catch((e) => setError(e.message));
  }, [id]);

  // Trạng thái yêu thích của người đăng nhập
  useEffect(() => {
    setFavorite(null);
    if (isAuthenticated && !isAdmin) getFavorite(user.id, id).then(setFavorite).catch(() => {});
  }, [id, isAuthenticated, isAdmin, user?.id]);

  // Sách cùng thể loại
  useEffect(() => {
    if (!data) return;
    getBooks()
      .then((list) =>
        setRelated(list.filter((b) => b.categoryId === data.book.categoryId && b.id !== data.book.id).slice(0, 4))
      )
      .catch(() => {});
  }, [data]);

  async function toggleFavorite() {
    if (!isAuthenticated) return setNeedLogin(true);
    try {
      if (favorite) {
        await removeFavorite(favorite.id);
        setFavorite(null);
        toast.success("Đã bỏ khỏi danh sách yêu thích.");
      } else {
        setFavorite(await addFavorite(user.id, id));
        toast.success("Đã thêm vào danh sách yêu thích.");
      }
    } catch (err) {
      toast.error(err.message || "Có lỗi xảy ra.");
    }
  }

  async function handleBorrow(e) {
    e.preventDefault();
    if (!isAuthenticated) return setNeedLogin(true);
    if (!dueDate || dueDate < addDays(1) || dueDate > addDays(MAX_DAYS)) {
      toast.error(`Ngày trả phải trong khoảng từ ngày mai đến ${MAX_DAYS} ngày tới.`);
      return;
    }
    try {
      setSubmitting(true);
      await borrowBook(user.id, id, dueDate);
      toast.success("Đã gửi đăng ký mượn sách, vui lòng chờ duyệt.");
      navigate("/my-borrowings");
    } catch (err) {
      toast.error(err.message || "Đăng ký mượn thất bại.");
    } finally {
      setSubmitting(false);
    }
  }

  if (error) return <p className="text-center text-danger py-5">{error}</p>;
  if (!data) return <div className="text-center py-5"><div className="spinner-border" /></div>;

  const { book, category, shelf } = data;
  const left = availableCopies(book);

  return (
    <>
      <Link to="/books" className="btn btn-link px-0 mb-2">Quay lại danh sách</Link>
      <div className="card shadow-sm">
        <div className="row g-0">
          <div className="col-md-4">
            <img
              src={book.coverImage}
              alt={book.title}
              className="detail-cover rounded-start"
              onError={(e) => { e.currentTarget.src = "/images/libra.jpg"; }}
            />
          </div>
          <div className="col-md-8">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start gap-2">
                <h2>{book.title}</h2>
                {!isAdmin && (
                  <button
                    className={`btn btn-sm text-nowrap ${favorite ? "btn-danger" : "btn-outline-danger"}`}
                    onClick={toggleFavorite}
                  >
                    <Heart size={16} className="me-1" fill={favorite ? "currentColor" : "none"} />
                    {favorite ? "Bỏ yêu thích" : "Yêu thích"}
                  </button>
                )}
              </div>
              {category && <span className="badge text-bg-secondary mb-3">{category.name}</span>}

              <table className="table table-sm mb-3">
                <tbody>
                  <tr><th style={{ width: 190 }}><SquareUserRound size={16} className="me-2" />Tác giả</th><td>{book.author}</td></tr>
                  <tr><th><BookHeart size={16} className="me-2" />Thể loại</th><td>{category?.name || "—"}</td></tr>
                  <tr><th><ShelvingUnit size={16} className="me-2" />Vị trí</th><td>{shelf ? `${shelf.name} – ${shelf.location}` : "—"}</td></tr>
                  <tr><th><Telescope size={16} className="me-2" />Tổng số bản</th><td>{book.totalCopies}</td></tr>
                  <tr>
                    <th>Còn có thể mượn</th>
                    <td className={left > 0 ? "text-success fw-semibold" : "text-danger fw-semibold"}>
                      {left > 0 ? `${left} cuốn` : "Hết sách"}
                    </td>
                  </tr>
                </tbody>
              </table>

              <h5>Nội dung</h5>
              <p className="mb-4">{book.description}</p>

              {needLogin && (
                <div className="alert alert-warning d-flex justify-content-between align-items-center">
                  <span>Bạn cần đăng nhập để mượn sách hoặc thêm vào yêu thích.</span>
                  <Link to="/login" state={{ from: `/books/${id}` }} className="btn btn-dark btn-sm ms-3">
                    Đăng nhập
                  </Link>
                </div>
              )}

              {!isAdmin &&
                (left <= 0 ? (
                  <button className="btn btn-secondary" disabled>Hết sách</button>
                ) : (
                  <form onSubmit={handleBorrow} className="row g-2 align-items-end">
                    <div className="col-auto">
                      <label className="form-label small mb-1">Ngày trả dự kiến</label>
                      <input
                        type="date"
                        className="form-control"
                        onClick={(e) => e.currentTarget.showPicker?.()}
                        value={dueDate}
                        min={addDays(1)}
                        max={addDays(MAX_DAYS)}
                        onChange={(e) => setDueDate(e.target.value)}
                      />
                    </div>
                    <div className="col-auto">
                      <button className="btn btn-dark" disabled={submitting}>
                        {submitting ? "Đang gửi..." : "Đăng ký mượn"}
                      </button>
                    </div>
                  </form>
                ))}
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <>
          <h5 className="mt-4 mb-3">Sách cùng thể loại</h5>
          <div className="row g-3">
            {related.map((b) => (
              <div className="col-6 col-md-3" key={b.id}>
                <BookCard book={b} categoryName={category?.name} />
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
