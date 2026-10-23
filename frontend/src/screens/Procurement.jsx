/**
 * Procurement.jsx
 * ---------------
 * The "Become procurement-ready" screen.
 *
 * Before the documents exist: shows what will be generated and a big button.
 * After: shows the generated procurement pack (business profile, financial
 * summary, quotation template, invoice template) and a button to register
 * the business (demo only). Every action refreshes the readiness score.
 */

import { useEffect, useState } from "react";
import { getPassport, generateDocuments, getQuotation, registerBusiness } from "../api";
import { rand } from "../format";

export default function Procurement() {
  const [passport, setPassport] = useState(null); // score + business flags
  const [pack, setPack] = useState(null);         // data for the generated documents

  /** Reload the passport; only fetch the pack data once documents exist. */
  async function load() {
    const p = await getPassport();
    setPassport(p);
    setPack(p.business.documents_generated ? await getQuotation() : null);
  }

  useEffect(() => {
    load();
  }, []);

  /** "Become procurement-ready": ask the backend to generate the documents. */
  async function handleGenerate() {
    await generateDocuments();
    load();
  }

  /** DEMO ONLY: pretend FNB helped Lebo register with CIPC. */
  async function handleRegister() {
    await registerBusiness();
    load();
  }

  if (!passport) return <p>Loading…</p>;

  const { business, readiness, unlocked } = passport;

  return (
    <div>
      <h2>Procurement readiness</h2>
      <p className="muted">Everything bigger customers ask for, built from your trading history.</p>

      {/* Live score */}
      <div className="card score-strip">
        <div>
          <span className="muted small">Readiness score</span>
          <div className="big">{readiness.score}%</div>
        </div>
        <div>
          <span className="muted small">Contracts</span>
          <div className="big">{unlocked ? "Unlocked" : "Locked"}</div>
        </div>
      </div>

      {/* STATE 1: documents not generated yet */}
      {!business.documents_generated && (
        <div className="card">
          <h3>We will create for you:</h3>
          <ul className="plain-list">
            <li>📄 Business profile</li>
            <li>📊 Financial summary from your real transactions</li>
            <li>🧾 Quotation template with your price list</li>
            <li>💳 Invoice template</li>
          </ul>
          <button className="btn full" onClick={handleGenerate}>Become procurement-ready</button>
        </div>
      )}

      {/* STATE 2: documents generated, show the pack */}
      {pack && (
        <>
          <div className="banner banner-ok">✅ Your procurement pack is ready.</div>

          <div className="card doc">
            <h3>📄 Business profile</h3>
            <div>{pack.business}</div>
            <div className="muted small">Owner: {pack.owner} · {pack.months_trading} months of trading history</div>
          </div>

          <div className="card doc">
            <h3>📊 Financial summary</h3>
            <div className="row"><span>Revenue</span><strong>{rand(pack.revenue)}</strong></div>
            <div className="row"><span>Expenses</span><strong>{rand(pack.expenses)}</strong></div>
            <div className="row"><span>Operating profit</span><strong>{rand(pack.profit)}</strong></div>
          </div>

          <div className="card doc">
            <h3>🧾 Quotation template</h3>
            <table className="table">
              <tbody>
                {pack.catalogue.map((c) => (
                  <tr key={c.item}><td>{c.item}</td><td className="right">{rand(c.price)}</td></tr>
                ))}
              </tbody>
            </table>
            <div className="muted small">Valid for 30 days · Prepared by {pack.business}</div>
          </div>

          <div className="card doc">
            <h3>💳 Invoice template</h3>
            <div className="muted small">Invoice no. INV-001 · Bill to: [customer] · Pay via your FNB payment link</div>
          </div>

          {/* Registration step */}
          {!business.registered ? (
            <div className="card">
              <h3>Formal registration</h3>
              <p className="muted small">Larger buyers and government need a registered business.</p>
              <button className="btn full" onClick={handleRegister}>Register with CIPC (demo)</button>
            </div>
          ) : (
            <div className="banner banner-ok">🏛️ Business registered.</div>
          )}
        </>
      )}

      {/* If documents exist but the score is still under 70, say why */}
      {pack && !unlocked && (
        <div className="banner">Almost there. Finish your bookkeeping to reach 70% and unlock contracts.</div>
      )}
    </div>
  );
}