/**
 * Opportunities.jsx
 * -----------------
 * The matching local contracts. The backend only returns the list once the
 * readiness score reaches 70%; below that we show a locked screen that
 * tells Lebo what is missing. "Submit quotation" is a front-end-only demo
 * action (nothing is saved on the backend).
 */

import { useEffect, useState } from "react";
import { getOpportunities } from "../api";

export default function Opportunities() {
  const [data, setData] = useState(null);       // the /opportunities reply
  const [submitted, setSubmitted] = useState([]); // ids of contracts Lebo has quoted on

  useEffect(() => {
    getOpportunities().then(setData);
  }, []);

  /** Remember that we sent a quotation for this contract. */
  function handleSubmit(id) {
    setSubmitted([...submitted, id]);
  }

  if (!data) return <p>Loading…</p>;

  // LOCKED state
  if (!data.unlocked) {
    return (
      <div>
        <h2>Opportunities</h2>
        <div className="card lock">
          <div className="lock-icon">🔒</div>
          <h3>Contracts are locked</h3>
          <p className="muted">
            Your readiness is {data.score}%. Reach {data.needed}% to see local
            contracts that match your business.
          </p>
          <p className="muted small">Tip: complete your bookkeeping and generate your procurement pack.</p>
        </div>
      </div>
    );
  }

  // UNLOCKED state
  return (
    <div>
      <h2>Opportunities</h2>
      <p className="muted">{data.items.length} local contracts match Lebo's Kitchen.</p>

      {data.items.map((o) => (
        <div className="card opp" key={o.id}>
          <strong>{o.buyer}</strong>
          <div>{o.need}</div>
          <div className="row">
            <span className="muted">Budget: {o.budget}</span>
            {submitted.includes(o.id) ? (
              <span className="tag paid">Quotation sent ✓</span>
            ) : (
              <button className="btn-small" onClick={() => handleSubmit(o.id)}>Submit quotation</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}