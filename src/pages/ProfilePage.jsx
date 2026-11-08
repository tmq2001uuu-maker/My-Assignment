import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-toastify";
import { changePassword, updateName } from "../api";
import { useAuth } from "../AuthContext";

const nameSchema = z.object({
  name: z.string().trim().min(2, "Tên hiển thị tối thiểu 2 ký tự.").max(30, "Tên hiển thị tối đa 30 ký tự."),
});

const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại."),
    newPassword: z.string().min(6, "Mật khẩu mới tối thiểu 6 ký tự.").max(40, "Mật khẩu mới tối đa 40 ký tự."),
    confirmPassword: z.string().min(1, "Vui lòng nhập lại mật khẩu mới."),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp.",
    path: ["confirmPassword"],
  });

function NameForm() {
  const { user, saveUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: user.name || "" },
  });

  async function onSubmit({ name }) {
    try {
      setSaving(true);
      await updateName(user.id, name);
      saveUser({ ...user, name });
      toast.success("Đã cập nhật tên hiển thị.");
    } catch (e) {
      toast.error(e.message || "Cập nhật thất bại.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body p-4">
        <h5 className="mb-3">Thông tin cá nhân</h5>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-3">
            <label className="form-label">Tài khoản</label>
            <input className="form-control" value={user.username} disabled readOnly />
          </div>
          <div className="mb-3">
            <label className="form-label">Tên hiển thị</label>
            <input className={`form-control ${errors.name ? "is-invalid" : ""}`} {...register("name")} />
            <div className="invalid-feedback">{errors.name?.message}</div>
          </div>
          <button className="btn btn-dark" disabled={saving}>{saving ? "Đang lưu..." : "Lưu thay đổi"}</button>
        </form>
      </div>
    </div>
  );
}

const passwordFields = [
  { name: "oldPassword", label: "Mật khẩu hiện tại" },
  { name: "newPassword", label: "Mật khẩu mới" },
  { name: "confirmPassword", label: "Nhập lại mật khẩu mới" },
];

function PasswordForm() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(passwordSchema) });

  async function onSubmit({ oldPassword, newPassword }) {
    try {
      setSaving(true);
      await changePassword(user.id, oldPassword, newPassword);
      toast.success("Đổi mật khẩu thành công.");
      reset();
    } catch (e) {
      toast.error(e.message || "Đổi mật khẩu thất bại.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body p-4">
        <h5 className="mb-3">Đổi mật khẩu</h5>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {passwordFields.map((f) => (
            <div className="mb-3" key={f.name}>
              <label className="form-label">{f.label}</label>
              <input type="password" className={`form-control ${errors[f.name] ? "is-invalid" : ""}`} {...register(f.name)} />
              <div className="invalid-feedback">{errors[f.name]?.message}</div>
            </div>
          ))}
          <button className="btn btn-dark" disabled={saving}>{saving ? "Đang lưu..." : "Đổi mật khẩu"}</button>
        </form>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <div className="mx-auto" style={{ maxWidth: 520 }}>
      <h3 className="mb-3">Hồ sơ của tôi</h3>
      <NameForm />
      <PasswordForm />
    </div>
  );
}
