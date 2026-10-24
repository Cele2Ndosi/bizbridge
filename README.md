# FNB BizBridge

**From first payment to first big contract.**

BizBridge turns the activity of a small informal business into a **Business Passport**: a live readiness score that shows an entrepreneur how close they are to being bankable, procurement-ready and fundable.

**Live demo:** https://bizbridge-1-7y2y.onrender.com
**API docs:** https://bizbridge-9123.onrender.com/docs

> The demo runs on a free server that sleeps when idle. The first load can take about a minute. Click **Reset demo** on the Passport tab before you start.

## The problem

Young entrepreneurs often have customers, regular sales and a bank account, but no bookkeeping, invoices or paperwork. To banks, large buyers and funders, their business is invisible.

## The solution

Every transaction becomes a stepping stone from informal trading to a formal, fundable, market-connected business. The app does the administrative work so the entrepreneur can focus on selling and serving customers.

## Demo story: Lebo's Kitchen

Lebo is 22 and runs a catering business from home.

1. **Passport:** her readiness starts at **50%**, with red items for bookkeeping, documents and registration.
2. **Get Paid:** she creates a payment link, shares it on WhatsApp, and the customer pays. A new transaction lands.
3. **Books:** the app asks "What was this?" for each transaction. As the books fill in, her score rises.
4. **Procurement:** one tap generates a business profile, financial summary, quotation template and invoice template.
5. **Contracts:** above 70%, matching local contracts unlock and she submits a quotation.
6. **Register:** she completes formal registration and reaches **100%**.

A live score badge in the header shows the number moving on every screen.

## What is real and what is simulated

| Real | Simulated for the demo |
|---|---|
| Readiness scoring logic (trading history, digital payments, cash flow, bookkeeping, documents, registration) | Payments (a "Demo: customer pays" button) |
| Business Passport figures calculated from transactions | Company registration |
| Payment links, categorisation and document generation flow | The contract opportunities list |
| Unlock rule (70% readiness) | Transaction data (in-memory sample data, resets on restart) |
| | Auto-categorisation (simple keyword rules, not AI) |
| Cash sale recording, labelled self-reported | |

## Tech stack

- **Backend:** Python, FastAPI, in-memory data store (no database needed)
- **Frontend:** React, Vite, plain CSS
- **Hosting:** Render (free tier)

## Project structure

```
bizbridge/
├── backend/
│   ├── main.py          API endpoints
│   ├── scoring.py       Business Passport and readiness logic
│   ├── store.py         In-memory sample data
│   └── requirements.txt
└── frontend/
    └── src/
        ├── App.jsx      App shell and tabs
        ├── api.js       Calls to the backend
        ├── screens/     Passport, GetPaid, Bookkeeping, Procurement, Opportunities
        └── components/  ReadinessRing, ChecklistItem, ScoreBadge
```

## Run it locally (Windows, PowerShell)

**Backend**

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

API docs open at http://127.0.0.1:8000/docs

**Frontend** (in a second terminal)

```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## API overview

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/passport` | Business Passport, readiness score and checklist |
| GET | `/transactions` | Transactions and categories |
| POST | `/transactions/{id}/categorise` | Record what a transaction was |
| POST / GET | `/payment-links` | Create and list payment links |
| POST | `/payment-links/{id}/pay` | Demo only: simulate a customer paying |
| POST | `/procurement/generate` | Generate the procurement documents |
| GET | `/quotation` | Data for the generated procurement pack |
| POST | `/business/register` | Demo only: simulate registration |
| GET | `/opportunities` | Matching contracts (unlocked at 70%) |
| POST | `/reset` | Reset the demo |

## What we would build next

- Read real FNB transaction data, with the customer's consent
- Optional accountant sign-off, so packs can be marked "accountant-verified"
- AI categorisation suggestions that the owner confirms
- Funding Readiness plan with a 30-day action list
- Fraud Shield: flag suspicious payment requests and unusual transactions
- Real payment links and QR payments, company registration and contract-matching partners

## Design decisions and FAQ

**Does it handle cash payments?**
Yes. Owners record a cash sale in seconds from the Get Paid screen. It counts toward revenue and bookkeeping, but it is labelled self-reported and does not count toward the digital-payments measure, because cash can't be verified from bank data. That way a bank or funder can weigh it differently from bank-verified income.

**What about human verification?**
Today the owner confirms every category herself, and the "Auto-categorise all" option uses simple keyword rules. Planned, not yet built: flag unusual or low-confidence items for review, and an optional accountant sign-off that marks a procurement pack as "accountant-verified" before it goes to a buyer or funder.

**Why wouldn't an entrepreneur just hire an accountant?**
Most informal entrepreneurs don't have one, and an accountant works periodically on past records. BizBridge builds the records as the business trades and connects them to contracts and funding readiness. It is also accountant-friendly: clean, categorised records make a later sign-off faster and cheaper.

**How does it generate income?**
BizBridge would live inside FNB's app, so the return comes from business-banking growth rather than a stand-alone app. Ideas to test: more digital payment volume through payment links, a pipeline of better-documented borrowers, an optional premium tier such as accountant-verified packs, and a matching fee from buyers who post opportunities. These are hypotheses and have not been validated.

## Team

Menzi Prosper Cele