import { useNavigate } from "react-router-dom";
import { BookMarked, BookOpen, Heart, Library } from "lucide-react";
import "./home.css";

const CARDS = [
  {
    icon: BookOpen,
    title: "Khám phá sách",
    desc: "Duyệt qua hàng trăm đầu sách chất lượng từ lập trình, khoa học đến văn học.",
    action: "Xem thư viện",
    path: "/books",
    color: "nav-blue",
  },
  {
    icon: BookMarked,
    title: "Đơn mượn của tôi",
    desc: "Theo dõi tình trạng đơn mượn và lịch sử mượn trả sách của bạn.",
    action: "Xem đơn mượn",
    path: "/my-borrowings",
    color: "nav-green",
  },
  {
    icon: Heart,
    title: "Sách yêu thích",
    desc: "Xem lại danh sách những cuốn sách bạn đã đánh dấu yêu thích.",
    action: "Xem yêu thích",
    path: "/favorites",
    color: "nav-rose",
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-overlay"></div>
        <div className="home-hero-content">
          <div className="home-hero-badge">
            <Library size={18} />
            <span>Thư viện trực tuyến Libra</span>
          </div>
          <h1 className="home-hero-title">
            Khám phá thế giới<br />
            <span className="home-hero-highlight">tri thức</span> cùng Libra
          </h1>
          <p className="home-hero-subtitle">
            Hàng trăm đầu sách chất lượng từ lập trình, khoa học đến văn học.<br />
            Mượn sách trực tuyến dễ dàng – nhanh chóng – miễn phí.
          </p>
          <div className="home-hero-actions">
            <button className="home-hero-btn home-hero-btn-primary" onClick={() => navigate("/books")}>
              <BookOpen size={18} />
              Khám phá ngay
            </button>
            <button className="home-hero-btn home-hero-btn-outline" onClick={() => navigate("/my-borrowings")}>
              <BookMarked size={18} />
              Đơn mượn của tôi
            </button>
          </div>
        </div>
        <div className="home-hero-shapes">
          <div className="home-hero-shape home-hero-shape-1"></div>
          <div className="home-hero-shape home-hero-shape-2"></div>
          <div className="home-hero-shape home-hero-shape-3"></div>
        </div>
      </section>

      <section className="home-navigation">
        <div className="home-section-header">
          <div>
            <h2 className="home-section-title">Bắt đầu khám phá</h2>
            <p className="home-section-desc">Truy cập nhanh đến các chức năng chính của thư viện</p>
          </div>
        </div>
        <div className="home-nav-grid">
          {CARDS.map((c) => (
            <div key={c.path} className={`home-nav-card ${c.color}`} onClick={() => navigate(c.path)}>
              <div className="home-nav-card-icon"><c.icon size={32} /></div>
              <h3 className="home-nav-card-title">{c.title}</h3>
              <p className="home-nav-card-desc">{c.desc}</p>
              <span className="home-nav-card-action">{c.action}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="home-cta">
        <div className="home-cta-content">
          <h2 className="home-cta-title">Sẵn sàng khám phá thế giới sách?</h2>
          <p className="home-cta-desc">
            Hãy ghé thăm thư viện để tìm cho mình những cuốn sách thú vị và bắt đầu hành trình đọc sách ngay hôm nay.
          </p>
          <button className="home-hero-btn home-hero-btn-primary" onClick={() => navigate("/books")}>
            <BookOpen size={18} />
            Khám phá thư viện
          </button>
        </div>
      </section>
    </div>
  );
}
