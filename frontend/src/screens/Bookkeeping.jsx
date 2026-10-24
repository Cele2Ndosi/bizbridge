/**
 * Bookkeeping.jsx
 * ---------------
 * The "automatic bookkeeping" screen. The app asks "What was this?" for
 * every uncategorised transaction. Each answer is saved to the backend,
 * and the readiness score at the top updates straight away. That rising
 * number is the key moment of this part of the demo.
 */

import { useEffect, useState } from "react";
import { getTransactions, categorise, getPassport } from "../api";
import { rand, pct } from "../format";

/**
 * OPTIONAL one-click helper: guess a category from the transaction.
 * It is a simple keyword rule (no real AI) but it makes a great demo
 * moment: "FNB categorises it for you". Delete this and the
 * "Auto-categorise" button below if you don't want it.
 */
function guessCategory(tx) {
  if (tx.amount > 0) return "Customer payment";
  const text = `${tx.description} ${tx.counterparty}`.toLowerCase();
  if (text.includes("makro") || text.includes("packaging")) return "Inventory / Stock";
  if (text.includes("fuel") || text.includes("engen")) return "Transport";
  if (text.includes("electric") || text.includes("city power")) return "Utilities";
  return "Other expense";
}

export default function Bookkeeping() {
  const [txs, setTxs] = useState([]);             // all transactions
  const [incomeCats, setIncomeCats] = useState([]);
  const [expenseCats, setExpenseCats] = useState([]);
  const [passport, setPassport] = useState(null); // for the score at the top

  /** Reload transactions AND the passport (so the score stays fresh). */
  async function load() {
    const t = await getTransactions();
    setTxs(t.transactions);
    setIncomeCats(t.income_categories);
    setExpenseCats(t.expense_categories);
    setPassport(await getPassport());
  }

  useEffect(() => {
    load();
  }, []);

  /** Save one answer, then refresh everything. */
  async function handlePick(id, category) {
    await categorise(id, category);
    load();
  }

  /** Categorise every pending transaction using guessCategory(). */
  async function handleAutoAll() {
    const pending = txs.filter((t) => !t.category);
    await Promise.all(pending.map((t) => categorise(t.id, guessCategory(t))));
    load();
  }

  if (!passport) return <p>Loading…</p>;

  const pending = txs.filter((t) => !t.category);
  const done = txs.filter((t) => t.category);

  return (
    <div>
      <h2>Bookkeeping</h2>
      <p className="muted">Tell us what each payment was and your books build themselves.</p>

      {/* Live score summary */}
      <div className="card score-strip">
        <div>
          <span className="muted small">Readiness score</span>
          <div className="big">{passport.readiness.score}%</div>
        </div>
        <div>
          <span className="muted small">Books complete</span>
          <div className="big">{pct(passport.summary.bookkeeping)}</div>
        </div>
      </div>

      {/* Transactions that still need an answer */}
      <div className="row section-title">
        <h3>What was this? ({pending.length})</h3>
        {pending.length > 0 && (
          <button className="btn-small demo" onClick={handleAutoAll}>Auto-categorise all</button>
        )}
      </div>

      {pending.length === 0 && <div className="banner banner-ok">All caught up. 🎉</div>}

      {pending.map((tx) => {
        // Income gets income categories, expenses get expense categories.
        const options = tx.amount > 0 ? incomeCats : expenseCats;
        return (
          <div className="card tx" key={tx.id}>
            <div className="row">
              <strong>{tx.description}</strong>
              <strong className={tx.amount > 0 ? "in" : "out"}>{rand(tx.amount)}</strong>
            </div>
            <div className="muted small">{tx.counterparty} · {tx.channel} · {tx.date}{tx.self_reported ? " · self-reported" : ""}</div>
            <div className="chips">
              {options.map((c) => (
                <button key={c} className="chip" onClick={() => handlePick(tx.id, c)}>{c}</button>
              ))}
            </div>
          </div>
        );
      })}

      {/* Already categorised */}
      <h3 className="section-title">Recorded ({done.length})</h3>
      {done.map((tx) => (
        <div className="card tx" key={tx.id}>
          <div className="row">
            <span>{tx.description}</span>
            <span className={tx.amount > 0 ? "in" : "out"}>{rand(tx.amount)}</span>
          </div>
          <div className="muted small">{tx.category} · {tx.date}{tx.self_reported ? " · cash, self-reported" : ""}</div>
        </div>
      ))}
    </div>
  );
}