from qa_core.contracts.schemas import SourceReference


class KnowledgeRetriever:
    """RAG retrieval boundary.

    The current MVP only returns a placeholder source when a policy/process
    question is detected. Later this class should query Chroma or Milvus and
    return matched document chunks.
    """

    def retrieve(self, message: str) -> list[SourceReference]:
        if not self._looks_like_knowledge_question(message):
            return []

        return [
            SourceReference(
                title="ERP knowledge base placeholder",
                type="knowledge",
                reference="knowledge_base/*.md",
            )
        ]

    @staticmethod
    def _looks_like_knowledge_question(message: str) -> bool:
        keywords = [
            "rule",
            "policy",
            "process",
            "manual",
            "faq",
            "how to",
            "standard",
            "制度",
            "流程",
            "规则",
            "手册",
            "怎么",
        ]
        normalized = message.lower()
        return any(keyword in normalized or keyword in message for keyword in keywords)
