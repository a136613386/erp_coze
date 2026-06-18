from typing import Any

from qa_core.database.mysql import query_all


def business_overview() -> dict[str, Any]:
    rows = query_all(
        """
        SELECT
          (SELECT COUNT(*) FROM customer_t) AS customer_count,
          (SELECT COUNT(*) FROM order_t) AS order_count,
          (SELECT COUNT(*) FROM inventory_t) AS product_count,
          (SELECT COALESCE(SUM(amount), 0) FROM order_t) AS cumulative_sales,
          (SELECT COUNT(*) FROM inventory_t WHERE current_stock < safe_stock) AS low_stock_count
        """
    )
    overview = rows[0] if rows else {}
    overview["summary"] = (
        f"{overview.get('customer_count', 0)} customers, "
        f"{overview.get('order_count', 0)} orders, "
        f"{overview.get('low_stock_count', 0)} low-stock products"
    )
    return overview


def recent_orders(limit: int = 5) -> dict[str, Any]:
    rows = query_all(
        """
        SELECT
          o.id,
          o.order_no,
          o.deal_date,
          o.amount,
          o.status,
          c.customer_name
        FROM order_t o
        LEFT JOIN customer_t c ON c.id = o.customer_id
        ORDER BY o.deal_date DESC, o.id DESC
        LIMIT %s
        """,
        (limit,),
    )
    return {"orders": rows, "summary": f"{len(rows)} recent orders"}


def low_stock_products(limit: int = 10) -> dict[str, Any]:
    rows = query_all(
        """
        SELECT
          id,
          product_code,
          product_name,
          current_stock,
          safe_stock,
          unit
        FROM inventory_t
        WHERE current_stock < safe_stock
        ORDER BY (safe_stock - current_stock) DESC, id DESC
        LIMIT %s
        """,
        (limit,),
    )
    return {"products": rows, "summary": f"{len(rows)} low-stock products"}


def pending_receivables(limit: int = 10) -> dict[str, Any]:
    rows = query_all(
        """
        SELECT
          o.id,
          o.order_no,
          o.deal_date,
          o.amount,
          o.status,
          c.customer_name,
          COALESCE(SUM(CASE WHEN f.amount IS NULL THEN 0 ELSE f.amount END), 0) AS received_amount
        FROM order_t o
        LEFT JOIN customer_t c ON c.id = o.customer_id
        LEFT JOIN finance_t f ON f.order_id = o.id
        GROUP BY o.id, o.order_no, o.deal_date, o.amount, o.status, c.customer_name
        HAVING received_amount < o.amount
        ORDER BY o.deal_date ASC, o.id ASC
        LIMIT %s
        """,
        (limit,),
    )
    total = sum(float(row.get("amount") or 0) - float(row.get("received_amount") or 0) for row in rows)
    return {"orders": rows, "total_amount": total, "summary": f"{len(rows)} receivable-risk orders"}


def finance_summary() -> dict[str, Any]:
    rows = query_all(
        """
        SELECT
          type,
          status,
          COUNT(*) AS record_count,
          COALESCE(SUM(amount), 0) AS total_amount
        FROM finance_t
        GROUP BY type, status
        ORDER BY type, status
        """
    )
    return {"items": rows, "summary": f"{len(rows)} finance groups"}


def customer_sales_summary(limit: int = 10) -> dict[str, Any]:
    rows = query_all(
        """
        SELECT
          c.id,
          c.customer_name,
          c.company_name,
          COUNT(o.id) AS order_count,
          COALESCE(SUM(o.amount), 0) AS total_amount
        FROM customer_t c
        LEFT JOIN order_t o ON o.customer_id = c.id
        GROUP BY c.id, c.customer_name, c.company_name
        ORDER BY total_amount DESC, order_count DESC
        LIMIT %s
        """,
        (limit,),
    )
    return {"customers": rows, "summary": f"{len(rows)} customer sales rows"}
