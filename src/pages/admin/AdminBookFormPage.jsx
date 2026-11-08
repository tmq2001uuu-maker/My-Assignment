import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { createBook, getBookRaw, getCategories, getShelves, updateBook } from "../../api";

const EMPTY = {
  title: "", author: "", categoryId: "", shelfId: "", description: "",
  totalCopies: 1, damagedCopies: 0, lostCopies: 0, coverImage: "",
};

const num = (label, min) =>
  z.number({ message: `${label} phải là số.` }).int(`${label} phải là số nguyên.`).min(min, `${label} tối thiểu ${min}.`);

// borrowed: số bản đang được mượn (admin không sửa trực tiếp)
function makeSchema(borrowed) {
  return z
    .object({
      title: z.string().trim().min(1, "Tên sách không được để trống.").max(100, "Tên sách tối đa 100 ký tự."),
      author: z.string().trim().min(1, "Tác giả không được để trống.").max(60, "Tác giả tối đa 60 ký tự."),
      categoryId: z.string().min(1, "Vui lòng chọn thể loại."),
      shelfId: z.string().min(1, "Vui lòng chọn kệ sách."),
      description: z.string().trim().min(10, "Nội dung tối thiểu 10 ký tự.").max(1000, "Nội dung tối đa 1000 ký tự."),
      totalCopies: num("Tổng số bản", 1),
      damagedCopies: num("Số bản hỏng", 0),
      lostCopies: num("Số bản mất", 0),
      coverImage: z.string().trim(),
    })
    .refine((v) => v.totalCopies >= borrowed + v.damagedCopies + v.lostCopies, {
      message: `Tổng số bản phải ≥ đang mượn (${borrowed}) + hỏng + mất.`,
      path: ["totalCopies"],
    });
}

function BookForm({ id, initial, categories, shelves }) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const borrowed = initial?.borrowedCopies || 0;
  const schema = useMemo(() => makeSchema(borrowed), [borrowed]);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initial ? { ...EMPTY, ...initial } : EMPTY,
  });

  async function onSubmit(values) {
    const data = { ...values, coverImage: values.coverImage || "/images/libra.jpg" };
    try {
      setSaving(true);
      if (id) await updateBook(id, data);
      else await createBook(data);
      toast.success(id ? "Đã cập nhật sách." : "Đã thêm sách mới.");
      navigate("/admin/books");
    } catch (e) {
      toast.error(e.message || "Lưu thất bại.");
    } finally {
      setSaving(false);
    }
  }

  const input = (name, label, props = {}) => (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <input className={`form-control ${errors[name] ? "is-invalid" : ""}`} {...register(name, props.reg)} {...props.attrs} />
      <div className="invalid-feedback">{errors[name]?.message}</div>
    </div>
  );

  const select = (name, label, options) => (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <select className={`form-select ${errors[name] ? "is-invalid" : ""}`} {...register(name)}>
        <option value="">-- Chọn --</option>
        {options.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
      </select>
      <div className="invalid-feedback">{errors[name]?.message}</div>
    </div>
  );

  const numReg = { reg: { valueAsNumber: true }, attrs: { type: "number", min: 0 } };

  return (
    <div className="card shadow-sm mx-auto" style={{ maxWidth: 720 }}>
      <div className="card-body p-4">
        <h3 className="mb-4">{id ? "Sửa sách" : "Thêm sách mới"}</h3>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {input("title", "Tên sách")}
          {input("author", "Tác giả")}
          <div className="row">
            <div className="col-md-6">{select("categoryId", "Thể loại", categories)}</div>
            <div className="col-md-6">{select("shelfId", "Kệ sách", shelves)}</div>
          </div>
          <div className="mb-3">
            <label className="form-label">Nội dung / mô tả</label>
            <textarea rows="4" className={`form-control ${errors.description ? "is-invalid" : ""}`} {...register("description")} />
            <div className="invalid-feedback">{errors.description?.message}</div>
          </div>
          <div className="row">
            <div className="col-md-4">{input("totalCopies", "Tổng số bản", numReg)}</div>
            <div className="col-md-4">{input("damagedCopies", "Số bản hỏng", numReg)}</div>
            <div className="col-md-4">{input("lostCopies", "Số bản mất", numReg)}</div>
          </div>
          {id && <p className="text-muted small">Đang được mượn: {borrowed} bản (tự cập nhật khi duyệt / nhận trả sách).</p>}
          {input("coverImage", "Link ảnh bìa (để trống sẽ dùng ảnh mặc định)")}
          <div className="d-flex gap-2">
            <button className="btn btn-dark" disabled={saving}>{saving ? "Đang lưu..." : "Lưu"}</button>
            <Link to="/admin/books" className="btn btn-outline-dark">Huỷ</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminBookFormPage() {
  const { id } = useParams(); // có id = sửa, không có = thêm mới
  const [state, setState] = useState({ loading: true, error: "", book: null, categories: [], shelves: [] });

  useEffect(() => {
    Promise.all([getCategories(), getShelves(), id ? getBookRaw(id) : Promise.resolve(null)])
      .then(([categories, shelves, book]) => setState({ loading: false, error: "", book, categories, shelves }))
      .catch((e) => setState((s) => ({ ...s, loading: false, error: e.message })));
  }, [id]);

  if (state.loading) return <div className="text-center py-5"><div className="spinner-border" /></div>;
  if (state.error) return <p className="text-center text-danger py-5">{state.error}</p>;
  return <BookForm id={id} initial={state.book} categories={state.categories} shelves={state.shelves} />;
}
