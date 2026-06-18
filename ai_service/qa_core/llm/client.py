from qa_core.contracts.schemas import CopilotContext


class LLMClient:
    """LLM boundary for future model integration.

    The MVP returns deterministic text from tool and retrieval results. Keeping
    this class now prevents future OpenAI, local model, or LangChain wiring from
    leaking into API routes.
    """

    def generate(self, context: CopilotContext) -> str:
        return context.draft_answer
