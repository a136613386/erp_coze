# Knowledge Base

This directory is reserved for RAG source documents.

Planned document groups:

- `erp_manual.md`: ERP operation manual.
- `inventory_rules.md`: inventory warning and replenishment rules.
- `finance_collection_policy.md`: receivables and collection policy.
- `business_analysis_templates.md`: business analysis templates.
- `faq.md`: common ERP questions.

The MVP service exposes the RAG boundary through `app/rag/retriever.py`. Real
chunking, embedding, and vector storage should be added after the main service
framework is stable.
