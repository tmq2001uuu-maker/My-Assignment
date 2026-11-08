export default function Pager({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="d-flex justify-content-center align-items-center gap-3 mt-3">
      <button className="btn btn-outline-dark btn-sm" disabled={page === 1} onClick={() => onChange(page - 1)}>Trước</button>
      <span className="small">Trang {page} / {totalPages}</span>
      <button className="btn btn-outline-dark btn-sm" disabled={page === totalPages} onClick={() => onChange(page + 1)}>Sau</button>
    </div>
  );
}
