"""
main.py
-------
The FastAPI web server. Each function with a @app.get / @app.post decorator
is one API endpoint that our React frontend will call.

Run it with:   uvicorn main:app --reload
Try it at:     http://127.0.0.1:8000/docs   (auto-generated test page)
"""

import os
import uuid
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import store
import scoring

app = FastAPI(title="FNB BizBridge API")

# Which websites may call this API (CORS).
# Locally that's the Vite dev server. When deployed, we add the real
# frontend URL through an environment variable called FRONTEND_ORIGIN
# (set in the Render dashboard in step 6, no trailing slash).
origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
frontend_origin = os.environ.get("FRONTEND_ORIGIN")
if frontend_origin:
    origins.append(frontend_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Readiness score needed to unlock the opportunities list
UNLOCK_SCORE = 70

# Fake procurement opportunities shown once Lebo is ready
OPPORTUNITIES = [
    {"id": 1, "buyer": "Soweto Primary School", "need": "Catering for 300 people (prize-giving)", "budget": "R18,000"},
    {"id": 2, "buyer": "Joburg Events Co.", "need": "Weekly staff lunches, 40 people", "budget": "R9,500 / month"},
    {"id": 3, "buyer": "Kasi Tech Hub", "need": "Launch-day finger food", "budget": "R6,200"},
]


# ---------- Request bodies (what the frontend sends us) ----------

class PaymentLinkIn(BaseModel):
    """Data needed to create a 'Pay Lebo's Kitchen' link."""
    customer: str
    amount: float
    description: str


class CategoryIn(BaseModel):
    """The category Lebo picks when asked 'What was this?'."""
    category: str


# ---------- Endpoints ----------

@app.get("/passport")
def get_passport():
    """Everything the Business Passport screen needs in one call."""
    summary = scoring.summarise(store.TRANSACTIONS)
    ready = scoring.readiness(summary, store.BUSINESS)
    return {
        "business": store.BUSINESS,
        "summary": summary,
        "readiness": ready,
        "unlocked": ready["score"] >= UNLOCK_SCORE,
    }


@app.get("/transactions")
def get_transactions():
    """All transactions (newest first) plus the allowed categories."""
    ordered = sorted(store.TRANSACTIONS, key=lambda t: t["date"], reverse=True)
    return {
        "transactions": ordered,
        "income_categories": store.INCOME_CATEGORIES,
        "expense_categories": store.EXPENSE_CATEGORIES,
    }


@app.post("/transactions/{tx_id}/categorise")
def categorise(tx_id: str, body: CategoryIn):
    """Set the category of one transaction (the 'automatic bookkeeping' step)."""
    for t in store.TRANSACTIONS:
        if t["id"] == tx_id:
            t["category"] = body.category
            return t
    raise HTTPException(status_code=404, detail="Transaction not found")


@app.post("/payment-links")
def create_payment_link(body: PaymentLinkIn):
    """Create a payment link Lebo can share on WhatsApp."""
    link_id = uuid.uuid4().hex[:6]
    link = {
        "id": link_id,
        "customer": body.customer,
        "amount": body.amount,
        "description": body.description,
        "status": "pending",
        "url": f"https://pay.fnb.example/lebos-kitchen/{link_id}",
    }
    store.PAYMENT_LINKS.append(link)
    return link


@app.get("/payment-links")
def list_payment_links():
    """All payment links created so far."""
    return store.PAYMENT_LINKS


@app.post("/payment-links/{link_id}/pay")
def simulate_payment(link_id: str):
    """DEMO ONLY: pretend the customer paid. Creates an uncategorised
    income transaction so the app can ask 'What was this?'."""
    for link in store.PAYMENT_LINKS:
        if link["id"] == link_id:
            if link["status"] == "paid":
                raise HTTPException(status_code=400, detail="Already paid")
            link["status"] = "paid"
            tx = store._tx(0, link["description"], link["amount"],
                           link["customer"], "PayShap")
            store.TRANSACTIONS.append(tx)
            return tx
    raise HTTPException(status_code=404, detail="Link not found")


@app.post("/procurement/generate")
def generate_documents():
    """'Become procurement-ready': mark the documents as generated."""
    store.BUSINESS["documents_generated"] = True
    return {"ok": True}


@app.post("/business/register")
def register_business():
    """DEMO ONLY: pretend FNB helped Lebo register with CIPC."""
    store.BUSINESS["registered"] = True
    return {"ok": True}


@app.get("/quotation")
def get_quotation():
    """Data for the auto-generated procurement pack screen."""
    summary = scoring.summarise(store.TRANSACTIONS)
    return {
        "business": store.BUSINESS["name"],
        "owner": store.BUSINESS["owner"],
        "months_trading": summary["months_trading"],
        "revenue": summary["revenue"],
        "expenses": summary["expenses"],
        "profit": summary["profit"],
        "catalogue": [
            {"item": "Party platter (10 people)", "price": 650},
            {"item": "Lunch box", "price": 55},
            {"item": "Full event catering (per head)", "price": 85},
        ],
    }


@app.get("/opportunities")
def get_opportunities():
    """Procurement matches. Locked until readiness reaches UNLOCK_SCORE."""
    summary = scoring.summarise(store.TRANSACTIONS)
    ready = scoring.readiness(summary, store.BUSINESS)
    if ready["score"] < UNLOCK_SCORE:
        return {"unlocked": False, "needed": UNLOCK_SCORE, "score": ready["score"], "items": []}
    return {"unlocked": True, "needed": UNLOCK_SCORE, "score": ready["score"], "items": OPPORTUNITIES}


@app.post("/reset")
def reset_demo():
    """Reset to the starting state. Handy to re-run the demo before judging."""
    store.reset()
    return {"ok": True}