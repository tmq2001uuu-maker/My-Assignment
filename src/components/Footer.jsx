import { ExternalLink, ZodiacLibra } from "lucide-react";

export default function Footer() {
  return (
    <footer className="app-footer py-4 mt-5">
      <div className="container d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="logo-icon"><ZodiacLibra size={18} /></span>
            <h5 className="mb-0">Nhà sách Libra</h5>
          </div>
          <p className="mb-0 small">
            Nơi chia sẻ những cuốn sách hay, giúp bạn dễ dàng tìm kiếm và lưu giữ tri thức mỗi ngày.
          </p>
        </div>
        <div className="d-flex gap-3">
          <a href="https://github.com/" target="_blank" rel="noreferrer" className="d-flex align-items-center gap-2">
            <ExternalLink size={16} /> GitHub
          </a>
          <a href="https://facebook.com/" target="_blank" rel="noreferrer" className="d-flex align-items-center gap-2">
            <ExternalLink size={16} /> Facebook
          </a>
        </div>
      </div>
    </footer>
  );
}
