/**
 * GetPaid.jsx
 * -----------
 * The "Get Paid" screen. Lebo creates a payment link for a customer,
 * shares it on WhatsApp, and (for the demo only) clicks a button to
 * pretend the customer paid. That creates a new transaction in the
 * backend which she can then categorise in the Bookkeeping screen.
 *
 * Props:
 *   onNavigate - function from App.jsx to switch tabs, e.g. onNavigate("bookkeeping")
 */

import { useEffect, useState } from "react";
import { createPaymentLink, getPaymentLinks, simulatePayment } from "../api";
import { rand } from "../format";
import CashSale from "../components/CashSale";

export default function GetPaid({ onNavigate }) {
  // Form fields, pre-filled so the live demo is quick to run.
  const [customer, setCustomer] = useState("ABC Events");
  const [amount, setAmount] = useState("850");
  const [description, setDescription] = useState("Event catering");

  const [links, setLinks] = useState([]);   // all payment links created so far
  const [notice, setNotice] = useState(""); // "R850 received from..." message
  const [error, setError] = useState("");

  /** Load the list of payment links from the backend. */
  async function loadLinks() {
    try {
      setLinks(await getPaymentLinks());
    } catch (e) {
      setError("Can't reach the backend. Is uvicorn running?");
    }
  }

  // Load once when the screen first appears.
  useEffect(() => {
    loadLinks();
  }, []);

  /** Create a new payment link from the form values. */
  async function handleCreate(e) {
    e.preventDefault(); // stop the browser from reloading the page
    setNotice("");
    await createPaymentLink({
      customer,
      amount: parseFloat(amount),
      description,
    });
    loadLinks();
  }

  /** DEMO ONLY: pretend the customer paid this link. */
  async function handlePay(id) {
    const tx = await simulatePayment(id);
    setNotice(`${rand(tx.amount)} received from ${tx.counterparty}`);
    loadLinks();
  }

  /** Open WhatsApp with the payment link already typed into a message. */
  function shareOnWhatsApp(link) {
    const text = `Hi ${link.customer}, please pay ${rand(link.amount)} for ${link.description}: ${link.url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  return (
    <div>
      <h2>Get Paid</h2>
      <p className="muted">Create a payment link and share it with your customer.</p>

      {error && <p className="error">{error}</p>}

      {/* Create-link form */}
      <form className="card form" onSubmit={handleCreate}>
        <label>Customer
          <input value={customer} onChange={(e) => setCustomer(e.target.value)} required />
        </label>
        <label>Amount (R)
          <input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </label>
        <label>What is it for?
          <input value={description} onChange={(e) => setDescription(e.target.value)} required />
        </label>
        <button className="btn" type="submit">Create payment link</button>
      </form>
            <CashSale onNavigate={onNavigate} />

      {/* Shown after a simulated payment */}
      {notice && (
        <div className="banner banner-ok">
          ✅ {notice}.{" "}
          <button className="link-btn inline" onClick={() => onNavigate("bookkeeping")}>
            Record it in Bookkeeping →
          </button>
        </div>
      )}

      {/* List of links, newest first */}
      {[...links].reverse().map((link) => (
        <div className="card link-card" key={link.id}>
          <div className="row">
            <strong>Pay Lebo's Kitchen</strong>
            <span className={`tag ${link.status}`}>{link.status}</span>
          </div>
          <div>{link.customer} · {rand(link.amount)} · {link.description}</div>
          <div className="muted small">{link.url}</div>

          <div className="row actions">
            <button className="btn-small" onClick={() => navigator.clipboard.writeText(link.url)}>
              Copy link
            </button>
            <button className="btn-small" onClick={() => shareOnWhatsApp(link)}>
              Share on WhatsApp
            </button>
            {link.status === "pending" && (
              <button className="btn-small demo" onClick={() => handlePay(link.id)}>
                Demo: customer pays
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}