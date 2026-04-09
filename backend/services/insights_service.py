from sqlalchemy.orm import Session
from models.expense import Expense
from datetime import datetime, timedelta, date
from collections import defaultdict
import calendar


def get_insights(db: Session, user_id: int) -> dict:
    expenses = db.query(Expense).filter(Expense.user_id == user_id).order_by(Expense.date.desc()).all()

    if not expenses:
        return {
            "total_spent": 0,
            "top_category": None,
            "category_breakdown": [],
            "monthly_trends": [],
            "monthly_change": None,
            "unusual_spending": [],
            "suggestions": ["Start tracking your expenses to get personalized insights!"],
            "predicted_next_month": 0,
            "spending_by_month": [],
        }

    # ── Category breakdown ──
    category_totals = defaultdict(float)
    for exp in expenses:
        category_totals[exp.category] += exp.amount

    total_spent = sum(category_totals.values())
    top_category = max(category_totals, key=category_totals.get)

    category_breakdown = [
        {"category": cat, "amount": round(amt, 2), "percentage": round(amt / total_spent * 100, 1)}
        for cat, amt in sorted(category_totals.items(), key=lambda x: -x[1])
    ]

    # ── Monthly totals ──
    monthly_totals = defaultdict(float)
    monthly_category_totals = defaultdict(lambda: defaultdict(float))
    for exp in expenses:
        month_key = exp.date.strftime("%Y-%m")
        monthly_totals[month_key] += exp.amount
        monthly_category_totals[month_key][exp.category] += exp.amount

    sorted_months = sorted(monthly_totals.keys())
    monthly_trends = [
        {"month": m, "amount": round(monthly_totals[m], 2)}
        for m in sorted_months
    ]

    # ── Month-over-month change ──
    monthly_change = None
    if len(sorted_months) >= 2:
        prev = monthly_totals[sorted_months[-2]]
        curr = monthly_totals[sorted_months[-1]]
        if prev > 0:
            monthly_change = round((curr - prev) / prev * 100, 1)

    # ── Spending by month with category detail ──
    spending_by_month = []
    for m in sorted_months:
        cats = [
            {"category": c, "amount": round(a, 2)}
            for c, a in monthly_category_totals[m].items()
        ]
        spending_by_month.append({
            "month": m,
            "total": round(monthly_totals[m], 2),
            "categories": sorted(cats, key=lambda x: -x["amount"])
        })

    # ── Unusual spending detection ──
    unusual_spending = []
    if len(sorted_months) >= 2:
        current_month = sorted_months[-1]
        # compare each category to its average in prior months
        prior_months = sorted_months[:-1]
        for cat in category_totals:
            prior_cat_totals = [
                monthly_category_totals[m].get(cat, 0) for m in prior_months
            ]
            if prior_cat_totals:
                avg = sum(prior_cat_totals) / len(prior_cat_totals)
                current_cat = monthly_category_totals[current_month].get(cat, 0)
                if avg > 0 and current_cat > avg * 1.3:
                    pct_increase = round((current_cat - avg) / avg * 100, 1)
                    unusual_spending.append({
                        "category": cat,
                        "current": round(current_cat, 2),
                        "average": round(avg, 2),
                        "increase_pct": pct_increase,
                    })

    unusual_spending.sort(key=lambda x: -x["increase_pct"])

    # ── Smart suggestions ──
    suggestions = _generate_suggestions(
        category_totals, monthly_totals, sorted_months,
        monthly_category_totals, unusual_spending, top_category, monthly_change
    )

    # ── Next month prediction (weighted moving average) ──
    predicted_next_month = _predict_next_month(monthly_totals, sorted_months)

    return {
        "total_spent": round(total_spent, 2),
        "top_category": top_category,
        "category_breakdown": category_breakdown,
        "monthly_trends": monthly_trends,
        "monthly_change": monthly_change,
        "unusual_spending": unusual_spending,
        "suggestions": suggestions,
        "predicted_next_month": predicted_next_month,
        "spending_by_month": spending_by_month,
    }


def _predict_next_month(monthly_totals: dict, sorted_months: list) -> float:
    if len(sorted_months) == 0:
        return 0
    if len(sorted_months) == 1:
        return round(monthly_totals[sorted_months[0]], 2)

    # Use weighted moving average of last 3 months
    recent = sorted_months[-3:] if len(sorted_months) >= 3 else sorted_months
    weights = list(range(1, len(recent) + 1))
    total_weight = sum(weights)
    weighted_sum = sum(monthly_totals[m] * w for m, w in zip(recent, weights))
    prediction = weighted_sum / total_weight

    # Add a small growth factor if trending up
    if len(sorted_months) >= 2:
        last = monthly_totals[sorted_months[-1]]
        prev = monthly_totals[sorted_months[-2]]
        if prev > 0:
            growth = (last - prev) / prev
            if growth > 0:
                prediction *= (1 + growth * 0.3)

    return round(prediction, 2)


def _generate_suggestions(
    category_totals, monthly_totals, sorted_months,
    monthly_category_totals, unusual_spending, top_category, monthly_change
) -> list:
    suggestions = []

    # Suggestion based on top category
    if top_category:
        top_pct = round(category_totals[top_category] / sum(category_totals.values()) * 100, 1)
        suggestions.append(
            f"Your highest spending category is {top_category} at {top_pct}% of total expenses. "
            f"Consider setting a monthly budget for this category."
        )

    # Monthly change suggestions
    if monthly_change is not None:
        if monthly_change > 20:
            suggestions.append(
                f"⚠️ Your spending increased by {monthly_change}% compared to last month. "
                f"Review your recent expenses to identify areas to cut back."
            )
        elif monthly_change > 0:
            suggestions.append(
                f"Your spending increased by {monthly_change}% compared to last month. "
                f"Keep an eye on your budget."
            )
        elif monthly_change < -10:
            suggestions.append(
                f"🎉 Great job! Your spending decreased by {abs(monthly_change)}% compared to last month. "
                f"Keep up the good work!"
            )

    # Unusual spending suggestions
    for item in unusual_spending[:3]:
        suggestions.append(
            f"You spent {item['increase_pct']}% more on {item['category']} this month "
            f"(₹{item['current']}) compared to your average (₹{item['average']}). "
            f"This seems unusual — worth reviewing."
        )

    # General tips
    if len(category_totals) <= 2:
        suggestions.append(
            "Your expenses are concentrated in few categories. "
            "Make sure you're tracking all spending for accurate insights."
        )

    if not suggestions:
        suggestions.append(
            "Your spending looks balanced! Keep tracking to maintain good financial habits."
        )

    return suggestions
