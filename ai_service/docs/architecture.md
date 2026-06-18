# AI Service Architecture

The AI service is intentionally split into large framework layers first.

```text
FastAPI route
  -> CopilotService
    -> IntentRouter
    -> ToolRegistry
      -> ERP read-only tools
      -> MySQL read-only query helper
    -> KnowledgeRetriever
    -> AnswerBuilder
    -> LLMClient
    -> AuditLogger
```

## Layers

### API Layer

File: `app.py`

Only exposes HTTP endpoints and delegates all chat logic to `CopilotService`.

### Orchestration Layer

File: `qa_core/application/copilot.py`

Coordinates intent routing, tool execution, RAG retrieval, answer generation,
and audit event creation.

### Intent Layer

File: `qa_core/pipeline/intent_router.py`

Maps a user message to tool names. This is a lightweight router for the MVP and
can later be replaced by an LLM classifier or LangChain router.

### Tool Layer

Files:

- `qa_core/tools/registry.py`
- `qa_core/tools/erp_tools.py`
- `qa_core/database/mysql.py`

The registry is the only place that exposes AI-callable tools. ERP tools use
fixed SQL templates and `mysql.py` rejects non-SELECT statements.

### RAG Layer

File: `qa_core/retrieval/retriever.py`

Currently a placeholder. Later it should call Chroma or Milvus and return
source chunks.

### LLM Layer

File: `qa_core/llm/client.py`

Currently returns the deterministic draft answer. Later it should call the
selected LLM or LangChain chain.

### Audit Layer

File: `qa_core/audit/logger.py`

Currently creates request-scoped audit events. Later it should persist events
for trace lookup.
