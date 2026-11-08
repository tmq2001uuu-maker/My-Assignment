import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { cancelBorrowing, getMyBorrowings } from "../api";
import { useAuth } from "../AuthContext";
import { STATUS } from "../utils";

export default function MyBorrowingsPage() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setList(await getMyBorrowings(user.id));
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => { load(); }, [load]);

  async function handleCancel(id) {
    if (!window.confirm("Bạn chắc chắn muốn huỷ đơn này?")) return;
    try {
      await cancelBorrowing(id);
      toast.success("Đã huỷ đơn.");
      load();
    } catch (e) {
      toast.error(e.message);
    }
  }

  if (loading) return <div className="text-center py-5"><div className="spinner-border" /></div>;

  return (
    <>
      <h3 className="mb-3">Đơn mượn của tôi</h3>
      {list.length === 0 ? (
        <p className="text-muted">Bạn chưa có đơn mượn nào. <Link to="/books">Xem danh sách sách</Link></p>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle bg-white">
            <thead className="table-light">
              <tr>
                <th>Sách</th><th>Ngày đăng ký</th><th>Ngày trả dự kiến</th><th>Trạng thái</th><th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((b) => {
                const st = STATUS[b.status] || { text: b.status, color: "secondary" };
                return (
                  <tr key={b.id}>
                    <td>
                      {b.book ? <Link to={`/books/${b.book.id}`}>{b.book.title}</Link> : "Sách đã bị xoá"}
                      {b.status === "rejected" && b.rejectReason && (
                        <div className="small text-danger">Lý do: {b.rejectReason}</div>
                      )}
                    </td>
                    <td>{b.requestDate || b.borrowDate || "—"}</td>
                    <td>{b.dueDate || "—"}</td>
                    <td><span className={`badge text-bg-${st.color}`}>{st.text}</span></td>
                    <td className="text-end">
                      {b.status === "pending" && (
                        <button className="btn btn-outline-danger btn-sm" onClick={() => handleCancel(b.id)}>Huỷ</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
