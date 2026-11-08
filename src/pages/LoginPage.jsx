import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Lock, LogIn, User } from "lucide-react";
import { login } from "../api";
import { useAuth } from "../AuthContext";

const schema = z.object({
  username: z.string().min(1, "Tài khoản không được để trống."),
  password: z.string().min(1, "Mật khẩu không được để trống."),
});

export default function LoginPage() {
  const { saveUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit({ username, password }) {
    try {
      setLoading(true);
      const user = await login(username, password);
      saveUser(user);
      navigate(location.state?.from || (user.role === "admin" ? "/admin/books" : "/"), { replace: true });
    } catch (e) {
      toast.error(e.message || "Đăng nhập thất bại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card mx-auto shadow-sm" style={{ maxWidth: 420 }}>
      <div className="card-body p-4">
        <h3 className="mb-4 text-center">Đăng nhập</h3>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-3">
            <label className="form-label">Tài khoản</label>
            <div className="input-group">
              <span className="input-group-text"><User size={18} /></span>
              <input className={`form-control ${errors.username ? "is-invalid" : ""}`} {...register("username")} />
              <div className="invalid-feedback">{errors.username?.message}</div>
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Mật khẩu</label>
            <div className="input-group">
              <span className="input-group-text"><Lock size={18} /></span>
              <input type="password" className={`form-control ${errors.password ? "is-invalid" : ""}`} {...register("password")} />
              <div className="invalid-feedback">{errors.password?.message}</div>
            </div>
          </div>
          <button className="btn btn-dark w-100 d-flex align-items-center justify-content-center gap-2" disabled={loading}>
            <LogIn size={18} />
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>
        <p className="text-center small mt-3 mb-0">
          Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
        </p>
      </div>
    </div>
  );
}
