import { Link } from "react-router-dom";
import { availableCopies } from "../utils";

export default function BookCard({ book, categoryName }) {
  const left = availableCopies(book);
  return (
    <Link to={`/books/${book.id}`} className="text-decoration-none text-dark">
      <div className="card h-100 book-card">
        <img
          src={book.coverImage}
          alt={book.title}
          className="card-img-top book-cover"
          onError={(e) => { e.currentTarget.src = "/images/libra.jpg"; }}
        />
        <div className="card-body">
          {categoryName && <span className="badge text-bg-secondary mb-2">{categoryName}</span>}
          <h6 className="card-title mb-1">{book.title}</h6>
          <p className="text-muted small mb-2">{book.author}</p>
          <span className={`badge ${left > 0 ? "text-bg-success" : "text-bg-danger"}`}>
            {left > 0 ? `Còn ${left} cuốn` : "Hết sách"}
          </span>
        </div>
      </div>
    </Link>
  );
}
