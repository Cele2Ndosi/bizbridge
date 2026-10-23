"""
scoring.py
----------
All the "business intelligence" lives here: turning raw transactions into
the Business Passport numbers and the Readiness score.

No web code in this file. It only takes data in and returns results.
"""


def summarise(transactions):
    """Return headline numbers for the Business Passport.

    Returns a dict with revenue, expenses, profit, digital-payment ratio,
    repeat-customer rate, bookkeeping completeness and months of history.
    """
    income = [t for t in transactions if t["amount"] > 0]
    expenses = [t for t in transactions if t["amount"] < 0]

    revenue = sum(t["amount"] for t in income)
    total_expenses = -sum(t["amount"] for t in expenses)

    # Share of income transactions that were NOT cash
    digital = [t for t in income if t["channel"] != "Cash"]
    digital_ratio = len(digital) / len(income) if income else 0

    # Repeat customers: named customers who paid us more than once
    counts = {}
    for t in income:
        if t["counterparty"] != "Walk-in":
            counts[t["counterparty"]] = counts.get(t["counterparty"], 0) + 1
    repeat_rate = (
        sum(1 for c in counts.values() if c > 1) / len(counts) if counts else 0
    )

    # Bookkeeping completeness: share of transactions with a category
    categorised = [t for t in transactions if t["category"]]
    bookkeeping = len(categorised) / len(transactions) if transactions else 0

    # Distinct calendar months with activity ("2026-07" style prefixes)
    months = {t["date"][:7] for t in transactions}

    return {
        "revenue": revenue,
        "expenses": total_expenses,
        "profit": revenue - total_expenses,
        "digital_ratio": round(digital_ratio, 2),
        "repeat_rate": round(repeat_rate, 2),
        "bookkeeping": round(bookkeeping, 2),
        "months_trading": len(months),
        "transaction_count": len(transactions),
    }


def readiness(summary, business):
    """Build the readiness checklist and overall score (0-100).

    Each checklist item is green (1 point), amber (0.5) or red (0).
    The score is the average, so every action Lebo takes moves it.
    """
    items = []

    def add(key, label, status, detail):
        items.append({"key": key, "label": label, "status": status, "detail": detail})

    # 1. Trading history
    m = summary["months_trading"]
    add("trading", "Trading history",
        "green" if m >= 3 else "amber" if m >= 2 else "red",
        f"{m} months of activity")

    # 2. Digital payments
    d = summary["digital_ratio"]
    add("digital", "Digital payments",
        "green" if d >= 0.6 else "amber" if d >= 0.3 else "red",
        f"{int(d * 100)}% of sales paid digitally")

    # 3. Positive cash flow
    p = summary["profit"]
    add("cashflow", "Positive cash flow",
        "green" if p > 0 else "red",
        f"Estimated profit R{p:,.0f}")

    # 4. Bookkeeping
    b = summary["bookkeeping"]
    add("bookkeeping", "Bookkeeping",
        "green" if b >= 0.8 else "amber" if b >= 0.4 else "red",
        f"{int(b * 100)}% of transactions categorised")

    # 5. Procurement documents (quotation, invoice, profile)
    done = business["documents_generated"]
    add("documents", "Procurement documents",
        "green" if done else "red",
        "Quotation and invoice templates ready" if done else "No quotation template yet")

    # 6. Formal registration
    reg = business["registered"]
    add("registration", "Formal registration",
        "green" if reg else "red",
        "Registered" if reg else "Not yet registered")

    points = {"green": 1, "amber": 0.5, "red": 0}
    score = round(sum(points[i["status"]] for i in items) / len(items) * 100)
    return {"score": score, "items": items}