/**
 * api.js
 * ------
 * One place for every call to our FastAPI backend.
 * Screens import these functions instead of writing fetch() themselves.
 * I've included all the functions we'll need in later steps, so you
 * won't have to come back and edit this file.
 */

// When deployed, Render injects VITE_API_URL at build time.
// Locally it's not set, so we fall back to your local backend.
const BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

/**
 * Small helper that calls the backend and returns the JSON reply.
 * @param {string} path   e.g. "/passport"
 * @param {string} method "GET" or "POST"
 * @param {object} body   optional data to send as JSON
 */
async function request(path, method = "GET", body = null) {
  const options = { method, headers: { "Content-Type": "application/json" } };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(BASE + path, options);
  if (!res.ok) throw new Error(`Request failed: ${res.status} ${path}`);
  return res.json();
}

// ---- Passport (Step 2) ----
export const getPassport = () => request("/passport");
export const resetDemo = () => request("/reset", "POST");

// ---- Payments and bookkeeping (Step 3) ----
export const getTransactions = () => request("/transactions");
export const categorise = (id, category) =>
  request(`/transactions/${id}/categorise`, "POST", { category });
export const createPaymentLink = (data) => request("/payment-links", "POST", data);
export const getPaymentLinks = () => request("/payment-links");
export const simulatePayment = (id) => request(`/payment-links/${id}/pay`, "POST");

// ---- Procurement and opportunities (Step 4) ----
export const generateDocuments = () => request("/procurement/generate", "POST");
export const getQuotation = () => request("/quotation");
export const registerBusiness = () => request("/business/register", "POST");
export const getOpportunities = () => request("/opportunities");