from typing import Literal

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(min_length=1)
    tenant_id: str = "demo_tenant"
    user_role: str = "manager"


class ToolAudit(BaseModel):
    name: str
    status: Literal["success", "error"]
    latency_ms: int
    summary: str | None = None


class SourceReference(BaseModel):
    title: str
    type: Literal["database", "knowledge"]
    reference: str | None = None


class AuditEvent(BaseModel):
    trace_id: str
    event_type: str
    detail: str


class CopilotContext(BaseModel):
    trace_id: str
    message: str
    tenant_id: str
    user_role: str
    draft_answer: str
    tool_payloads: list[dict]
    tools: list[ToolAudit]
    sources: list[SourceReference]


class ChatResponse(BaseModel):
    answer: str
    trace_id: str
    latency_ms: int
    tools: list[ToolAudit] = []
    sources: list[SourceReference] = []
    audit_events: list[AuditEvent] = []
