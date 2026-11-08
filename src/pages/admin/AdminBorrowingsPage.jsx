import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { approveBorrowing, getAllBorrowings, rejectBorrowing, returnBorrowing } from "../../api";
import Pager from "../../components/Pager";
import { STATUS } from "../../utils";

const PAGE_SIZE = 10;
const TABS = [
  { key: "pending", label: "Chờ duyệt" },
  { key: "borrowing", label: "Đang mượn" },
  { key: "returned", label: "Đã trả" },
  { key: "rejected", label: "Từ chối" },
  { key: "cancelled", label: "Đã huỷ" },
  { key: "all", label: "Tất cả" },
];

export default function AdminBorrowingsPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("pending");
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState(null);
  const today = new Date().toLocaleDateString("sv-SE");

  async function load() {
    try {
      setList(await getAllBorrowings());
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  // Chạy 1 thao tác, báo kết quả rồi tải lại danh sách
  async function run(id, action, successMsg) {
    try {
      setBusyId(id);
      await action();
      toast.success(successMsg);
    } catch (e) {
      toast.error(e.message || "Có lỗi xảy ra.");
    } finally {
      setBusyId(null);
      load();
    }
  }

  function handleReject(b) {
    const reason = window.prompt("Nhập lý do từ chối:");
    if (reason === null) return; // bấm Cancel
    if (!reason.trim()) return toast.error("Vui lòng nhập lý do từ chối.");
    run(b.id, () => rejectBorrowing(b.id, reason.trim()), "Đã từ chối đơn.");
  }

  const count = (key) => (key === "all" ? list.length : list.filter((b) => b.status === key).length);
  const filtered = tab === "all" ? list : list.filter((b) => b.status === tab);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const shown = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <>
      <h3 className="mb-3">Duyệt phiếu mượn</h3>

      <ul className="nav nav-pills mb-3 gap-1">
        {TABS.map((t) => (
          <li className="nav-item" key={t.key}>
            <button
              className={`nav-link ${tab === t.key ? "active bg-dark" : "text-dark"}`}
              onClick={() => { setTab(t.key); setPage(1); }}
            >
              {t.label} ({count(t.key)})
            </button>
          </li>
        ))}
      </ul>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border" /></div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle bg-white">
            <thead className="table-light">
              <tr>
                <th>Người mượn</th><th>Sách</th><th>Ngày đăng ký</th><th>Hạn trả</th><th>Trạng thái</th><th></th>
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 && (
                <tr><td colSpan="6" className="text-center text-muted py-4">Không có phiếu mượn nào.</td></tr>
              )}
              {shown.map((b) => {
                const st = STATUS[b.status] || { text: b.status, color: "secondary" };
                const overdue = b.status === "borrowing" && b.dueDate && b.dueDate < today;
                return (
                  <tr key={b.id}>
                    <td>
                      {b.user?.name || "Người dùng đã bị xoá"}
                      {b.user && <div className="small text-muted">{b.user.username}</div>}
                    </td>
                    <td>{b.book?.title || "Sách đã bị xoá"}</td>
                    <td>{b.requestDate || b.borrowDate || "—"}</td>
                    <td>
                      {b.dueDate || "—"}
                      {overdue && <div className="small text-danger fw-semibold">Quá hạn</div>}
                    </td>
                    <td>
                      <span className={`badge text-bg-${st.color}`}>{st.text}</span>
                      {b.status === "rejected" && b.rejectReason && (
                        <div className="small text-danger">Lý do: {b.rejectReason}</div>
                      )}
                    </td>
                    <td className="text-end text-nowrap">
                      {b.status === "pending" && (
                        <>
                          <button
                            className="btn btn-success btn-sm me-2"
                            disabled={busyId === b.id}
                            onClick={() => run(b.id, () => approveBorrowing(b.id), "Đã duyệt đơn mượn.")}
                          >
                            Duyệt
                          </button>
                          <button className="btn btn-outline-danger btn-sm" disabled={busyId === b.id} onClick={() => handleReject(b)}>
                            Từ chối
                          </button>
                        </>
                      )}
                      {b.status === "borrowing" && (
                        <button
                          className="btn btn-outline-dark btn-sm"
                          disabled={busyId === b.id}
                          onClick={() => run(b.id, () => returnBorrowing(b.id), "Đã xác nhận trả sách.")}
                        >
                          Xác nhận trả
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <Pager page={current} totalPages={totalPages} onChange={setPage} />
    </>
  );
}
