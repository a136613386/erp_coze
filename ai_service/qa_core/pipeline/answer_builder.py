from typing import Any


class AnswerBuilder:
    """Builds the MVP answer before an LLM is connected."""

    def build(self, tool_payloads: list[dict[str, Any]]) -> str:
        if not tool_payloads:
            return "No ERP data tool was selected. Ask about business, orders, inventory, receivables, or customers."

        lines = ["Based on current ERP data, the Copilot found:"]

        for payload in tool_payloads:
            if "error" in payload:
                lines.append(f"- Tool error: {payload['error']}")
                continue

            if "customer_count" in payload:
                lines.append(
                    "- Business overview: {customer_count} customers, {order_count} orders, "
                    "{product_count} products, sales amount {cumulative_sales}, "
                    "{low_stock_count} low-stock products.".format(**payload)
                )

            if "products" in payload:
                products = payload["products"]
                if products:
                    top = products[0]
                    lines.append(
                        "- Inventory risk: {count} products are below safety stock. Highest risk: "
                        "{name}, current {stock}, safe {safe}.".format(
                            count=len(products),
                            name=top.get("product_name"),
                            stock=top.get("current_stock"),
                            safe=top.get("safe_stock"),
                        )
                    )
                else:
                    lines.append("- Inventory risk: no product is below safety stock.")

            if "orders" in payload and "total_amount" in payload:
                lines.append(
                    f"- Receivables risk: {len(payload['orders'])} orders may need follow-up, "
                    f"total amount {payload['total_amount']:.2f}."
                )

            if "orders" in payload and "total_amount" not in payload:
                orders = payload["orders"]
                if orders:
                    first = orders[0]
                    lines.append(
                        "- Recent order: {order_no}, customer {customer_name}, amount {amount}, "
                        "status {status}.".format(**first)
                    )
                else:
                    lines.append("- Recent order: no order data found.")

            if "items" in payload:
                lines.append(f"- Finance summary: {len(payload['items'])} finance status groups returned.")

            if "customers" in payload:
                customers = payload["customers"]
                if customers:
                    top = customers[0]
                    lines.append(
                        "- Customer sales: top customer is {customer_name}, {order_count} orders, "
                        "total amount {total_amount}.".format(**top)
                    )

        lines.append("Recommendation: review low-stock products and receivables first, then use trace_id for audit.")
        return "\n".join(lines)
