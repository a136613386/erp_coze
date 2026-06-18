class IntentRouter:
    """Routes a user message to high-level ERP read tools."""

    def select_tools(self, message: str) -> list[str]:
        normalized = message.lower()
        tools: list[str] = []

        if self._contains_any(message, normalized, ["inventory", "stock", "shortage", "replenish", "库存", "缺货", "低库存", "补货"]):
            tools.append("low_stock_products")

        if self._contains_any(message, normalized, ["receivable", "payment", "collection", "finance", "回款", "收款", "待收款", "财务"]):
            tools.extend(["pending_receivables", "finance_summary"])

        if self._contains_any(message, normalized, ["order", "recent", "订单", "最近"]):
            tools.append("recent_orders")

        if self._contains_any(message, normalized, ["customer", "sales", "top customer", "客户", "成交", "销售最高"]):
            tools.append("customer_sales_summary")

        if not tools or self._contains_any(message, normalized, ["overview", "report", "analysis", "经营", "概览", "报表", "分析"]):
            tools.insert(0, "business_overview")

        return self._dedupe(tools)

    @staticmethod
    def _contains_any(message: str, normalized: str, keywords: list[str]) -> bool:
        return any(keyword in normalized or keyword in message for keyword in keywords)

    @staticmethod
    def _dedupe(items: list[str]) -> list[str]:
        result: list[str] = []
        seen: set[str] = set()
        for item in items:
            if item not in seen:
                result.append(item)
                seen.add(item)
        return result
