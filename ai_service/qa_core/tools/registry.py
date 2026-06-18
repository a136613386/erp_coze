from collections.abc import Callable
from time import perf_counter
from typing import Any

from qa_core.contracts.schemas import ToolAudit
from qa_core.tools import erp_tools

ToolFn = Callable[[], dict[str, Any]]


class ToolRegistry:
    """Central registry for all AI-callable ERP tools."""

    def __init__(self) -> None:
        self._tools: dict[str, ToolFn] = {
            "business_overview": erp_tools.business_overview,
            "recent_orders": erp_tools.recent_orders,
            "low_stock_products": erp_tools.low_stock_products,
            "pending_receivables": erp_tools.pending_receivables,
            "finance_summary": erp_tools.finance_summary,
            "customer_sales_summary": erp_tools.customer_sales_summary,
        }

    def run(self, name: str) -> tuple[dict[str, Any], ToolAudit]:
        started_at = perf_counter()
        tool = self._tools.get(name)
        if tool is None:
            latency_ms = int((perf_counter() - started_at) * 1000)
            return {"error": f"Unknown tool: {name}"}, ToolAudit(
                name=name,
                status="error",
                latency_ms=latency_ms,
                summary="Unknown tool",
            )

        try:
            payload = tool()
            latency_ms = int((perf_counter() - started_at) * 1000)
            return payload, ToolAudit(
                name=name,
                status="success",
                latency_ms=latency_ms,
                summary=payload.get("summary"),
            )
        except Exception as exc:
            latency_ms = int((perf_counter() - started_at) * 1000)
            return {"error": str(exc)}, ToolAudit(
                name=name,
                status="error",
                latency_ms=latency_ms,
                summary=str(exc),
            )
