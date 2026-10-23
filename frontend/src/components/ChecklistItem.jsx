/**
 * ChecklistItem.jsx
 * -----------------
 * One row of the readiness checklist: a coloured dot, the label
 * (e.g. "Bookkeeping") and a short detail line from the backend.
 *
 * Props:
 *   item - { key, label, status: "green" | "amber" | "red", detail }
 */

export default function ChecklistItem({ item }) {
  return (
    <div className="check-item">
      {/* The CSS class "dot green" / "dot amber" / "dot red" sets the colour */}
      <span className={`dot ${item.status}`} />
      <div>
        <div className="check-label">{item.label}</div>
        <div className="check-detail">{item.detail}</div>
      </div>
    </div>
  );
}