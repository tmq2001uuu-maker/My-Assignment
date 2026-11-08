// Số sách còn có thể mượn
export function availableCopies(book) {
  return book.totalCopies - book.borrowedCopies - book.damagedCopies - book.lostCopies;
}

// Ngày (yyyy-mm-dd, theo giờ máy) sau n ngày kể từ hôm nay
export function addDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString("sv-SE");
}

export const STATUS = {
  pending: { text: "Chờ duyệt", color: "warning" },
  borrowing: { text: "Đang mượn", color: "primary" },
  returned: { text: "Đã trả", color: "success" },
  rejected: { text: "Bị từ chối", color: "danger" },
  cancelled: { text: "Đã huỷ", color: "secondary" },
};
