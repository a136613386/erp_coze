from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from qa_core.application.copilot import CopilotService
from qa_core.contracts.schemas import ChatRequest, ChatResponse

app = FastAPI(title="ERP RAG Copilot AI Service", version="0.2.0")
copilot_service = CopilotService()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://127.0.0.1:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "erp-rag-copilot"}


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    return copilot_service.chat(request)
