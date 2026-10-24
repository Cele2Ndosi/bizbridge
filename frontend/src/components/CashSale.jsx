/**
 * CashSale.jsx
 * ------------
 * A small card on the Get Paid screen: "Paid in cash?" with a button that
 * opens a two-field form. The sale is saved to the backend as a
 * self-reported cash transaction (see POST /transactions/cash).
 *
 * Props:
 *   onNavigate - function from App.jsx to switch tabs
 */

import { useState } from "react";
import { recordCashSale } from "../api";
import { rand } from "../format";

export default function CashSale({ onNavigate }) {
  const [open, setOpen] = useState(false);               // is the form showing?
  const [description, setDescription] = useState("Cash sale at market");
  const [amount, setAmount] = useState("300");
  const [notice, setNotice] = useState("");              // success message
  const [error, setError] = useState("");

  /** Send the cash sale to the backend. */
  async function handleSave(e) {
    e.preventDefault(); // stop the browser reloading the page
    setError("");
    try {
      const tx = await recordCashSale({ description, amount: parseFloat(amount) });
      setNotice(`${rand(tx.amount)} cash sale recorded (self-reported)`);
      setOpen(false);
    } catch (err) {
      setError("Could not save the cash sale. Is the backend running?");
    }
  }

  return (
    <div className="card">
      <div className="row">
        <div>
          <strong>Paid in cash?</strong>
          <div className="muted small">Log it in seconds. It is labelled self-reported.</div>
        </div>
        {!open && (
          <button className="btn-small" onClick={() => { setNotice(""); setOpen(true); }}>
            Record cash sale
          </button>
        )}
      </div>

      {open && (
        <form className="form" style={{ marginTop: 12 }} onSubmit={handleSave}>
          <label>What was sold?
            <input value={description} onChange={(e) => setDescription(e.target.value)} required />
          </label>
          <label>Amount (R)
            <input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </label>
          <button className="btn" type="submit">Save cash sale</button>
          <button className="link-btn inline" type="button" onClick={() => setOpen(false)}>Cancel</button>
        </form>
      )}

      {notice && (
        <div className="banner banner-ok">
          ✅ {notice}.{" "}
          <button className="link-btn inline" onClick={() => onNavigate("bookkeeping")}>
            See it in Bookkeeping →
          </button>
        </div>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}