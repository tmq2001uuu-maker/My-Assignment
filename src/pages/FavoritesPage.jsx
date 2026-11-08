import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getCategories, getMyFavorites } from "../api";
import { useAuth } from "../AuthContext";
import BookCard from "../components/BookCard";

export default function FavoritesPage() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [categoryMap, setCategoryMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyFavorites(user.id), getCategories()])
      .then(([b, c]) => {
        setBooks(b);
        setCategoryMap(Object.fromEntries(c.map((x) => [x.id, x.name])));
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [user.id]);

  if (loading) return <div className="text-center py-5"><div className="spinner-border" /></div>;

  return (
    <>
      <h3 className="mb-3">Sách yêu thích</h3>
      {books.length === 0 ? (
        <p className="text-muted">Bạn chưa thích cuốn nào. <Link to="/books">Xem danh sách sách</Link></p>
      ) : (
        <div className="row g-3">
          {books.map((b) => (
            <div className="col-6 col-md-4 col-lg-3" key={b.id}>
              <BookCard book={b} categoryName={categoryMap[b.categoryId]} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
