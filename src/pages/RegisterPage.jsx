import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { register as registerApi } from "../api";
import { useAuth } from "../AuthContext";

const schema = z
  .object({
    name: z.string().trim().min(2, "Tên hiển thị tối thiểu 2 ký tự.").max(30, "Tên hiển thị tối đa 30 ký tự."),
    username: z.string().min(4, "Tài khoản tối thiểu 4 ký tự.").max(30, "Tài khoản tối đa 30 ký tự."),
    password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự.").max(40, "Mật khẩu tối đa 40 ký tự."),
    confirmPassword: z.string().min(1, "Vui lòng nhập lại mật khẩu."),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp.",
    path: ["confirmPassword"],
  });

const fields = [
  { name: "name", label: "Tên hiển thị", type: "text" },
  { name: "username", label: "Tài khoản", type: "text" },
  { name: "password", label: "Mật khẩu", type: "password" },
  { name: "confirmPassword", label: "Nhập lại mật khẩu", type: "password" },
];

export default function RegisterPage() {
  const { saveUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit({ name, username, password }) {
    try {
      setLoading(true);
      const user = await registerApi({ name, username, password });
      saveUser(user);
      toast.success("Đăng ký thành công!");
      navigate("/", { replace: true });
    } catch (e) {
      toast.error(e.message || "Đăng ký thất bại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card mx-auto shadow-sm" style={{ maxWidth: 420 }}>
      <div className="card-body p-4">
        <h3 className="mb-4 text-center">Đăng ký</h3>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {fields.map((f) => (
            <div className="mb-3" key={f.name}>
              <label className="form-label">{f.label}</label>
              <input type={f.type} className={`form-control ${errors[f.name] ? "is-invalid" : ""}`} {...register(f.name)} />
              <div className="invalid-feedback">{errors[f.name]?.message}</div>
            </div>
          ))}
          <button className="btn btn-dark w-100" disabled={loading}>
            {loading ? "Đang xử lý..." : "Tạo tài khoản"}
          </button>
        </form>
        <p className="text-center small mt-3 mb-0">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
