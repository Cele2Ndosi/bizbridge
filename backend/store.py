"""
store.py
--------
Our fake "database". Everything lives in Python lists/dicts in memory.
When the server restarts, the data resets. That is perfect for a demo.

It holds:
  - BUSINESS: Lebo's Kitchen profile and a few flags
  - TRANSACTIONS: money in (positive) and money out (negative)
  - PAYMENT_LINKS: links Lebo has created to get paid
"""

import uuid
from datetime import date, timedelta

# Categories the user can pick from when we ask "What was this?"
INCOME_CATEGORIES = ["Customer payment", "Other income"]
EXPENSE_CATEGORIES = ["Inventory / Stock", "Transport", "Utilities", "Other expense"]

# Shared objects. We mutate them in place (never reassign) so that
# other files that imported them always see the latest data.
BUSINESS = {}
TRANSACTIONS = []
PAYMENT_LINKS = []


def _tx(days_ago, description, amount, counterparty, channel, category=None):
    """Build one transaction dict.

    days_ago:     how many days before today it happened
    amount:       positive = income, negative = expense (in Rand)
    channel:      "EFT", "PayShap", "Card" or "Cash"
    category:     None means "not yet categorised" (the app will ask Lebo)
    """
    return {
        "id": uuid.uuid4().hex[:8],
        "date": (date.today() - timedelta(days=days_ago)).isoformat(),
        "description": description,
        "amount": amount,
        "counterparty": counterparty,
        "channel": channel,
        "category": category,
        "self_reported": channel == "Cash",   # NEW: cash can't be verified from bank data
    }


def reset():
    """Wipe everything and reload the starting demo data for Lebo's Kitchen."""
    BUSINESS.clear()
    BUSINESS.update({
        "name": "Lebo's Kitchen",
        "owner": "Lebo",
        "registered": False,           # formal CIPC registration done?
        "documents_generated": False,  # quotation/invoice templates created?
    })

    TRANSACTIONS.clear()
    TRANSACTIONS.extend([
        _tx(95, "Wedding catering deposit", 4200, "Zodwa M.", "EFT", "Customer payment"),
        _tx(90, "Makro stock", -1800, "Makro", "Card", "Inventory / Stock"),
        _tx(70, "Birthday platters", 2500, "ABC Events", "EFT"),
        _tx(65, "Gas and packaging", -950, "Builders", "Card"),
        _tx(60, "Church lunch", 3100, "Grace Church", "PayShap"),
        _tx(45, "Makro stock", -2200, "Makro", "Card", "Inventory / Stock"),
        _tx(40, "Office lunch order", 1800, "Sipho K.", "PayShap"),
        _tx(35, "Cash sales at market", 900, "Walk-in", "Cash"),
        _tx(30, "Delivery fuel", -400, "Engen", "Card"),
        _tx(20, "Corporate platters", 2700, "ABC Events", "EFT"),
        _tx(15, "Makro stock", -1500, "Makro", "Card"),
        _tx(10, "Baby shower order", 1650, "Zodwa M.", "PayShap", "Customer payment"),
        _tx(5, "Cash sales at market", 750, "Walk-in", "Cash"),
        _tx(2, "Electricity", -600, "City Power", "EFT", "Utilities"),
    ])

    PAYMENT_LINKS.clear()


# Load the starting data as soon as this file is imported.
reset()