# `erp_coze` 改造成企业级 ERP RAG Copilot 方案

## Summary

将现有 `erp_coze` 从“ERP 管理系统 + Dify 聊天入口”升级为：

**AI 驱动的企业 ERP 智能运营 RAG Copilot 平台**

保留现有 Next.js ERP 业务系统，新增独立 Python AI 服务，使用 **FastAPI + LangChain + Milvus + MySQL Tool + RAG** 实现经营分析、库存预警、回款风险、业务制度问答和经营报告生成。

核心原则：

- ERP 结构化数据走 MySQL Tool，不让大模型直接拼 SQL。
- 业务制度、操作手册、风控规则、FAQ 走 RAG 检索。
- AI 回答必须带数据来源、检索来源、trace_id 和诊断信息。
- 现有 Dify 入口降级为可选外部助手，不作为项目主链路。

## 需求设计

### 1. 业务需求

新增 4 个 AI 场景：

| 场景 | 示例问题 | 数据来源 |
|---|---|---|
| 经营分析 | “本月经营情况怎么样？” | MySQL 经营数据 + RAG 经营分析模板 |
| 库存预警 | “哪些商品需要补货？” | MySQL 库存/订单 + RAG 库存规则 |
| 回款风险 | “哪些客户有回款风险？” | MySQL 订单/财务 + RAG 财务制度 |
| ERP 知识问答 | “创建订单后库存怎么变化？” | RAG 操作手册/FAQ |

答辩主演示流程：

1. 在 ERP 页面新增客户、订单。
2. 订单创建后自动扣库存、写库存流水。
3. 财务模块新增收款记录。
4. 打开 AI 助手，提问“本月经营情况怎么样，有哪些风险？”
5. AI 调用 SQL Tool 查询真实 ERP 数据。
6. AI 检索业务规则知识库。
7. 输出经营分析报告、库存风险、待收款风险和引用来源。

### 2. 企业级需求

必须补齐：

- 环境变量管理：Dify Key、AI 服务地址、数据库配置全部从 `.env.local` 读取。
- AI 审计日志：记录用户问题、工具调用、检索来源、回答、耗时、trace_id。
- 受控工具调用：AI 只能调用白名单工具，不能自由执行 SQL。
- RAG 知识库版本：至少支持 `kb_version` 字段和 active 版本概念。
- 错误兜底：AI 服务不可用时，前端展示可恢复错误，不影响 ERP 基础功能。
- 基础评测：准备 10-20 条标准问题，验证意图、工具调用、引用来源和回答质量。

## Key Changes

### 1. 新增 Python AI 服务

新增目录建议：

```text
ai_service/
  app.py
  requirements.txt
  qa_core/
    config/
    llm/
    retrieval/
    tools/
    pipeline/
    prompts/
    evaluation/
  knowledge_base/
    faq.csv
    erp_operation_manual.md
    inventory_policy.md
    finance_collection_policy.md
    business_report_template.md
```

AI 服务接口：

| Method | Path | 用途 |
|---|---|---|
| `POST` | `/api/ai/chat` | ERP Copilot 主问答接口 |
| `POST` | `/api/ai/retrieval/debug` | 检索调试接口 |
| `GET` | `/api/ai/health` | AI 服务健康检查 |
| `POST` | `/api/ai/kb/rebuild` | 重建知识库，答辩可选 |

主请求格式：

```json
{
  "query": "本月经营情况怎么样，有哪些风险？",
  "session_id": "optional",
  "tenant_id": "default",
  "user_role": "admin"
}
```

主响应格式：

```json
{
  "answer": "经营分析文本",
  "intent": "business_report",
  "trace_id": "uuid",
  "tool_calls": ["get_sales_overview", "get_pending_payments"],
  "sources": [],
  "diagnostics": {
    "elapsed_ms": 1234,
    "retrieval_top_score": 0.82
  }
}
```

### 2. LangChain + RAG 主链路

实现流程：

```text
用户问题
  -> 意图识别
  -> 判断是否需要 SQL Tool
  -> 调用受控 MySQL 工具
  -> 检索 ERP 规则知识库
  -> Prompt Profile 选择
  -> LLM 生成回答
  -> 保存审计日志
  -> 返回前端
```

Prompt Profile 至少 4 类：

| Profile | 用途 |
|---|---|
| `business_report` | 经营分析、月报 |
| `inventory_risk` | 库存预警、补货建议 |
| `finance_risk` | 待收款、回款风险 |
| `erp_qa` | ERP 操作问答 |

### 3. MySQL Tool 设计

AI 服务通过只读工具访问现有 ERP 数据。

必须实现这些工具：

| Tool | 作用 |
|---|---|
| `get_dashboard_overview` | 查询客户数、订单数、销售额、待付款数、低库存数 |
| `get_recent_orders` | 查询最近订单 |
| `get_low_stock_products` | 查询低库存商品 |
| `get_pending_payment_orders` | 查询待付款订单 |
| `get_customer_sales_summary` | 查询客户成交汇总 |
| `get_finance_summary` | 查询收付款汇总 |

禁止：

- AI 直接拼接 SQL。
- AI 执行写操作。
- AI 修改客户、订单、库存、财务数据。

### 4. 改造 Next.js 前端

保留现有 ERP 页面和业务 API。

改造点：

- `DifyChat` 改名为 `AICopilotChat`。
- `/api/dify` 不再作为主链路，新增 `/api/ai/chat` 代理到 Python AI 服务。
- 聊天窗口展示：
  - AI 回答
  - 调用的数据工具
  - 引用来源
  - trace_id
  - 响应耗时
- 快捷问题改为：
  - “生成本月经营分析”
  - “查看库存风险”
  - “分析待收款风险”
  - “订单创建后库存如何变化？”

### 5. 清理现有风险点

必须处理：

- `src/app/api/dify/route.ts` 里的 Dify 地址和 API Key 不能硬编码。
- `.env.local.example` 保留模板值，不放真实密钥。
- `src/lib/businessQuery.ts` 当前依赖 mockData，AI 主链路不能再使用它。
- `src/lib/types.ts` 中旧 mock 类型可以保留，但不作为 AI 工具的数据来源。

## Test Plan

### 1. ERP 原有功能回归

验证：

- 客户列表、新增客户正常。
- 创建订单后：
  - 订单主表写入。
  - 订单明细写入。
  - 库存扣减。
  - 库存流水写入。
- 新增收款/付款记录正常。
- 经营概览统计正常。

### 2. AI 服务测试

准备标准问题：

```text
本月经营情况怎么样？
有哪些订单还没收款？
哪些商品库存不足？
最近订单有哪些？
帮我分析客户成交情况。
订单创建后库存会怎么变化？
```

验证：

- 意图识别正确。
- SQL Tool 调用正确。
- RAG 来源返回正确。
- 回答包含真实 ERP 数据。
- 回答不编造不存在的客户、订单、库存。
- AI 服务不可用时前端有错误提示。

### 3. RAG 质量测试

准备 10 条知识库问答测试：

- ERP 操作流程类
- 库存规则类
- 财务回款类
- 经营报表类

指标：

- 检索命中率。
- 来源引用是否存在。
- 高风险问题是否走正确 Prompt Profile。
- 无资料问题是否明确回答“当前知识库无依据”。

### 4. 答辩验收场景

最终演示必须能跑通：

1. 创建一笔订单。
2. 库存自动减少。
3. 查看经营概览变化。
4. 新增财务收款。
5. 让 AI 生成经营分析。
6. 让 AI 分析库存风险。
7. 让 AI 分析待收款风险。
8. 展示 AI 回答的工具调用和引用来源。

## Assumptions

- 不重写整个 `erp_coze`，只新增 AI 服务并替换 AI 助手主链路。
- 现有 Next.js、MySQL、ERP 业务模块继续保留。
- Python AI 服务使用 FastAPI + LangChain，向量库使用 Milvus。
- ERP 真实业务数据通过 MySQL Tool 查询，RAG 只负责业务规则、制度、FAQ、操作手册。
- 第一版不做完整登录系统，先用 `user_role` 和 `tenant_id` 参数模拟权限边界；后续可扩展 JWT/RBAC。
- 第一版不做流式输出，先做普通 JSON 返回；如果时间充足，再升级为 SSE/WebSocket 流式回答。
