/**
 * Passport.jsx
 * ------------
 * The Business Passport screen: headline numbers, the readiness ring
 * and the checklist. It loads fresh data from the backend every time
 * it appears, so after Lebo does something in another screen, coming
 * back here shows the new score.
 */

import { useEffect, useState } from "react";
import { getPassport, resetDemo } from "../api";
import ReadinessRing from "../components/ReadinessRing";
import ChecklistItem from "../components/ChecklistItem";

/** Format a number as South African Rand, e.g. 12800 -> "R12 800". */
const rand = (n) => `R${Math.round(n).toLocaleString("en-ZA")}`;

/** Format 0.71 as "71%". */
const pct = (n) => `${Math.round(n * 100)}%`;

export default function Passport() {
  const [data, setData] = useState(null);   // the full /passport reply
  const [shown, setShown] = useState(0);    // score the ring is currently showing
  const [error, setError] = useState("");

  /** Fetch the passport from the backend. */
  async function load() {
    try {
      const result = await getPassport();
      setData(result);
      // Small delay so the ring animates from 0 up to the real score.
      setTimeout(() => setShown(result.readiness.score), 150);
    } catch (e) {
      setError("Can't reach the backend. Is uvicorn running on port 8000?");
    }
  }

  // Run load() once when the screen first appears.
  useEffect(() => {
    load();
  }, []);

  /** Reset the demo data and reload (handy before judging). */
  async function handleReset() {
    setShown(0);
    await resetDemo();
    load();
  }

  if (error) return <p className="error">{error}</p>;
  if (!data) return <p>Loading…</p>;

  const { business, summary, readiness, unlocked } = data;

  return (
    <div>
      <h2>{business.name}</h2>
      <p className="muted">Business Passport · Owner: {business.owner}</p>

      {/* Score ring + checklist */}
      <div className="card passport-top">
        <ReadinessRing score={shown} />
        <div className="checklist">
          {readiness.items.map((item) => (
            <ChecklistItem key={item.key} item={item} />
          ))}
        </div>
      </div>

      {/* Banner that changes once the score reaches 70 */}
      <div className={`banner ${unlocked ? "banner-ok" : ""}`}>
        {unlocked
          ? "🎉 You're procurement-ready. Local contracts are unlocked!"
          : "Reach 70% to unlock local procurement opportunities."}
      </div>

      {/* Headline numbers */}
      <div className="stats">
        <div className="card stat"><span>Revenue</span><strong>{rand(summary.revenue)}</strong></div>
        <div className="card stat"><span>Expenses</span><strong>{rand(summary.expenses)}</strong></div>
        <div className="card stat"><span>Profit</span><strong>{rand(summary.profit)}</strong></div>
        <div className="card stat"><span>Digital payments</span><strong>{pct(summary.digital_ratio)}</strong></div>
        <div className="card stat"><span>Repeat customers</span><strong>{pct(summary.repeat_rate)}</strong></div>
        <div className="card stat"><span>Months trading</span><strong>{summary.months_trading}</strong></div>
      </div>

      <button className="link-btn" onClick={handleReset}>Reset demo</button>
    </div>
  );
}