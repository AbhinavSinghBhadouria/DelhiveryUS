// components/StatusBadge.jsx - order status ko colored badge ke roop mein dikhata hai
// customer/OrderDetail.jsx, agent/OrderDetail.jsx, aur listing pages mein use hota hai

// har status ke liye ek color mapped kiya hai - index.css mein .status-{color} classes defined hain
const STATUS_COLORS = {
  CREATED: "gray",
  CONFIRMED: "blue",
  ASSIGNED: "purple",
  PICKED_UP: "teal",
  IN_TRANSIT: "cyan",
  OUT_FOR_DELIVERY: "orange",
  DELIVERED: "green",
  FAILED: "red",
  RESCHEDULED: "amber",
  CANCELLED: "gray"
};

export default function StatusBadge({ status }) {
  // unknown status ke liye gray fallback - future statuses bhi handle ho jaayenge
  const color = STATUS_COLORS[status] || "gray";
  // dynamic className - `status-badge status-green` jaise - CSS mein yeh class honi chahiye
  return <span className={`status-badge status-${color}`}>{status}</span>;
}
