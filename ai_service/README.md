# ERP RAG Copilot AI Service

FastAPI service for the ERP Copilot. The MVP focuses on auditable read-only
business tools. RAG and LLM orchestration can be added behind the same `/chat`
contract later.

## Framework Layers

```text
app.py
  FastAPI HTTP entrypoint only

qa_core/application/copilot.py
  Main orchestration service

qa_core/pipeline/intent_router.py
  Selects which ERP tools should run

qa_core/tools/registry.py
  Central list of AI-callable tools

qa_core/tools/erp_tools.py
  Read-only MySQL business tools

qa_core/retrieval/retriever.py
  RAG boundary, currently a placeholder

qa_core/llm/client.py
  LLM boundary, currently deterministic

qa_core/audit/logger.py
  Audit event boundary, ready for persistence later
```

See `docs/architecture.md` for the full framework explanation.

## Run

```bash
cd ai_service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --host 127.0.0.1 --port 8001 --reload
```

The Next.js app calls this service through `POST /api/ai/chat`.

## API

### GET /health

Checks whether the Python service is running.

### POST /chat

Request:

```json
{
  "message": "分析当前经营概览",
  "tenant_id": "demo_tenant",
  "user_role": "manager"
}
```

Response:

```json
{
  "answer": "...",
  "trace_id": "erp-ai-xxxxxxxxxxxx",
  "latency_ms": 12,
  "tools": [],
  "sources": [],
  "audit_events": []
}
```

## Environment

The service accepts the same database variables used by the Next.js app:

```env
ERP_DB_HOST=127.0.0.1
ERP_DB_PORT=3306
ERP_DB_USER=root
ERP_DB_PASSWORD=replace-with-your-db-password
ERP_DB_NAME=erp_db
```

Legacy `MYSQL_*` aliases are also supported.
