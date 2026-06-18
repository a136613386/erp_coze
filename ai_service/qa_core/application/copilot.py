from time import perf_counter
from uuid import uuid4

from qa_core.audit.logger import AuditLogger
from qa_core.contracts.schemas import ChatRequest, ChatResponse, CopilotContext, SourceReference, ToolAudit
from qa_core.llm.client import LLMClient
from qa_core.pipeline.answer_builder import AnswerBuilder
from qa_core.pipeline.intent_router import IntentRouter
from qa_core.retrieval.retriever import KnowledgeRetriever
from qa_core.tools.registry import ToolRegistry


class CopilotService:
    """Coordinates intent routing, ERP tools, RAG retrieval, LLM, and audit."""

    def __init__(self) -> None:
        self.intent_router = IntentRouter()
        self.tool_registry = ToolRegistry()
        self.retriever = KnowledgeRetriever()
        self.answer_builder = AnswerBuilder()
        self.llm_client = LLMClient()
        self.audit_logger = AuditLogger()

    def chat(self, request: ChatRequest) -> ChatResponse:
        started_at = perf_counter()
        trace_id = f"erp-ai-{uuid4().hex[:12]}"

        selected_tools = self.intent_router.select_tools(request.message)
        tool_payloads: list[dict] = []
        tool_audits: list[ToolAudit] = []

        for tool_name in selected_tools:
            payload, audit = self.tool_registry.run(tool_name)
            tool_payloads.append(payload)
            tool_audits.append(audit)

        sources = self._build_sources(tool_audits)
        sources.extend(self.retriever.retrieve(request.message))

        draft_answer = self.answer_builder.build(tool_payloads)
        context = CopilotContext(
            trace_id=trace_id,
            message=request.message,
            tenant_id=request.tenant_id,
            user_role=request.user_role,
            draft_answer=draft_answer,
            tool_payloads=tool_payloads,
            tools=tool_audits,
            sources=sources,
        )

        audit_events = [
            self.audit_logger.new_event(trace_id, "chat.request", f"role={request.user_role}, tenant={request.tenant_id}"),
            self.audit_logger.new_event(trace_id, "tools.selected", ",".join(selected_tools)),
        ]

        return ChatResponse(
            answer=self.llm_client.generate(context),
            trace_id=trace_id,
            latency_ms=int((perf_counter() - started_at) * 1000),
            tools=tool_audits,
            sources=sources,
            audit_events=audit_events,
        )

    @staticmethod
    def _build_sources(tool_audits: list[ToolAudit]) -> list[SourceReference]:
        if not tool_audits:
            return []

        return [
            SourceReference(
                title="ERP MySQL read-only tools",
                type="database",
                reference="customer_t/order_t/order_item_t/inventory_t/finance_t",
            )
        ]
