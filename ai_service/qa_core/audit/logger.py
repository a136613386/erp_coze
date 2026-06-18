from qa_core.contracts.schemas import AuditEvent


class AuditLogger:
    """MVP audit logger.

    The current implementation keeps audit events in memory for the request
    lifecycle only. A later iteration can persist the same event shape to
    MySQL, PostgreSQL, or an observability platform.
    """

    def new_event(self, trace_id: str, event_type: str, detail: str) -> AuditEvent:
        return AuditEvent(trace_id=trace_id, event_type=event_type, detail=detail)
