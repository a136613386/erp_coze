# 项目说明：ERP RAG Copilot

## 这个项目要做什么

本项目是在现有 ERP 演示系统上继续升级，不推倒重做。

目标是把它从“普通 ERP 页面 + 外部 Dify 聊天窗口”，改成：

> 一个可以读取真实 ERP 业务数据、展示工具调用过程、带知识库问答能力、能分析经营风险的 ERP Copilot。

也就是说，重点不是单纯聊天，而是让 AI 能围绕 ERP 业务数据做分析，并且让答辩老师能看到：

- AI 查了哪些业务数据
- AI 调用了哪些工具
- AI 回答依据来自哪里
- 每次回答有没有 `trace_id` 可以追踪
- AI 有没有遵守“只读、不改业务数据”的边界

## 当前改造方向

保留现有 Next.js ERP 前端和 MySQL 业务表。

先移除 Dify，新增一套自建 Python AI 服务：

- 前端：`AICopilotChat`
- Next.js 代理接口：`/api/ai/chat`
- Python AI 服务：`ai_service`
- 数据工具：只读 MySQL Tool
- 后续 RAG：用于制度、流程、规则、FAQ、经营分析模板

## MVP 演示主线

第一版优先服务答辩演示，主线是：

1. 在 ERP 页面创建订单
2. 订单自动扣减库存
3. 新增财务收款记录
4. 打开 ERP Copilot
5. 让 AI 分析经营概览
6. 让 AI 分析库存风险
7. 让 AI 分析待收款风险
8. 展示 AI 回答中的工具调用、来源引用、`trace_id` 和耗时

## 关键约束

这些约束是为了让项目更像企业级系统，而不是简单聊天 Demo。

- AI 第一版不能写 ERP 数据，只能读取、分析、建议。
- AI 不直接生成任意 SQL。
- MySQL Tool 必须使用固定 SQL 模板。
- 用户输入只能用于判断调用哪个工具，不能拼进 SQL。
- 结构化业务数据统一来自 MySQL Tool。
- RAG 只处理制度、流程、规则、FAQ 等非结构化知识。
- 第一版用 `tenant_id` 和 `user_role` 模拟企业边界。
- 第一版不用流式输出，先用普通 JSON，降低实现风险。

## 本次已经完成的内容

详细步骤见：

- [变更提案](changes/erp-rag-copilot-mvp/proposal.md)
- [逐步注解](changes/erp-rag-copilot-mvp/implementation-notes.md)
- [任务清单](changes/erp-rag-copilot-mvp/tasks.md)
- [能力规格](changes/erp-rag-copilot-mvp/specs/copilot/spec.md)
