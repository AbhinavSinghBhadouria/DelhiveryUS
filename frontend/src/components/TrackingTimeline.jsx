// components/TrackingTimeline.jsx - order ki history events chronologically dikhata hai
// customer/OrderDetail.jsx aur agent/OrderDetail.jsx dono mein use hota hai
// events prop order.service.js se aata hai - orderTrackingEvent records hain

import StatusBadge from "./StatusBadge.jsx";

export default function TrackingTimeline({ events }) {
  // events?.length - optional chaining - null/undefined safe check
  if (!events?.length) {
    return <p className="muted">No tracking events yet.</p>;
  }

  return (
    <ol className="timeline">
      {events.map((event) => (
        <li key={event.id} className="timeline-item">
          <div className="timeline-dot" />
          <div className="timeline-content">
            <div className="timeline-header">
              {/* StatusBadge components/StatusBadge.jsx se - colored status pill */}
              <StatusBadge status={event.newStatus} />
              {/* toLocaleString() - user ke browser timezone mein readable format */}
              <time>{new Date(event.createdAt).toLocaleString()}</time>
            </div>

            {/* pehle event mein oldStatus null hota hai - toh yeh line nahi dikhegi */}
            {event.oldStatus && (
              <p className="timeline-transition">
                {event.oldStatus} → {event.newStatus}
              </p>
            )}

            {/* note optional hai - sirf tab dikhao jab ho */}
            {event.note && <p className="timeline-note">{event.note}</p>}

            {/* actorUserId pura dikhana zaroori nahi - pehle 8 characters kaafi hain UI ke liye */}
            <p className="timeline-actor">
              By {event.actorRole} ({event.actorUserId.slice(0, 8)}…)
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
