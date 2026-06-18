# 能力规格：ERP RAG Copilot

这份文件描述“系统应该具备什么能力”。  
它不是代码说明，而是验收标准。

## ADDED Requirements

## Requirement 1：前端必须提供 Copilot 聊天入口

系统必须用新的 ERP Copilot 替代原来的 Dify 助手入口。

注解：

- 用户操作方式不需要大变，仍然是右下角浮动按钮。
- 但打开的组件必须是 `AICopilotChat`。
- 这样答辩时可以自然展示 AI 分析能力。

### Scenario：打开 Copilot

- GIVEN 用户已经进入 ERP 首页
- WHEN 用户点击右下角助手按钮
- THEN 系统打开 `AICopilotChat`
- AND 聊天窗口展示 ERP 业务快捷问题

## Requirement 2：Next.js 必须提供 AI 代理接口

系统必须通过 Next.js 的 `/api/ai/chat` 接收前端聊天请求。

注解：

- 前端不直接访问 Python 服务。
- Next.js 代理层后续可以加登录态、租户校验、权限判断和审计。

### Scenario：发送合法消息

- GIVEN 前端发送 `message`、`tenant_id`、`user_role`
- WHEN `POST /api/ai/chat` 收到请求
- THEN 它把请求转发给 Python AI 服务
- AND 返回统一 JSON：
  - `answer`
  - `trace_id`
  - `latency_ms`
  - `tools`
  - `sources`

### Scenario：消息为空

- GIVEN 前端发送空 `message`
- WHEN `/api/ai/chat` 校验参数
- THEN 返回 HTTP 400

注解：

- 这样可以防止无意义请求进入 AI 服务。

### Scenario：Python AI 服务不可用

- GIVEN Python AI 服务没有启动
- WHEN `/api/ai/chat` 转发请求失败
- THEN 返回明确的服务不可用错误

注解：

- 这样前端可以提示用户启动 `ai_service`，而不是页面无响应。

## Requirement 3：Python AI 服务必须提供健康检查和聊天接口

Python AI 服务必须提供：

- `GET /health`
- `POST /chat`

### Scenario：健康检查

- WHEN 调用 `GET /health`
- THEN 返回：

```json
{ "status": "ok" }
```

注解：

- 用于确认 Python 服务已经启动。

### Scenario：聊天请求

- GIVEN 请求体包含用户问题
- WHEN 调用 `POST /chat`
- THEN 服务根据问题选择 ERP 只读工具
- AND 返回回答、追踪 ID、耗时、工具调用记录和来源引用

## Requirement 4：AI 查询 ERP 数据必须通过只读工具

AI 服务不能直接执行用户拼出来的 SQL。

注解：

- 用户问题只能用于判断调用哪个工具。
- 每个工具内部使用固定 SQL 模板。
- 工具层只允许 SELECT。

### Scenario：经营概览

- WHEN 用户问“经营概览”“经营报表”“分析当前经营”
- THEN 系统调用 `business_overview`
- AND 返回客户数、订单数、商品数、累计销售额、低库存数量

### Scenario：库存风险

- WHEN 用户问“库存风险”“低库存”“缺货”“补货”
- THEN 系统调用 `low_stock_products`
- AND 返回低库存商品信息

### Scenario：回款风险

- WHEN 用户问“待收款”“回款风险”“收款情况”
- THEN 系统调用 `pending_receivables`
- AND 同时调用 `finance_summary`
- AND 返回待跟进订单和财务汇总

### Scenario：最近订单

- WHEN 用户问“最近订单”“订单对库存影响”
- THEN 系统调用 `recent_orders`
- AND 返回最近订单信息

### Scenario：客户成交汇总

- WHEN 用户问“客户成交”“销售最高客户”
- THEN 系统调用 `customer_sales_summary`
- AND 返回客户成交排名信息

## Requirement 5：每次回答必须可审计

每次 Copilot 回答都必须带审计信息。

注解：

- 这是项目区别于普通聊天机器人的关键。
- 答辩时可以展示工具调用和 trace，证明回答不是凭空生成。

### Scenario：工具调用成功

- GIVEN 某个工具执行成功
- WHEN AI 返回结果
- THEN `tools` 数组中包含：
  - 工具名
  - 状态
  - 耗时
  - 摘要

### Scenario：回答可追踪

- GIVEN 一次聊天请求被处理
- WHEN 返回响应
- THEN 响应中包含 `trace_id`
- AND 前端显示 `trace_id`

## Requirement 6：MVP 阶段 AI 禁止写入 ERP 数据

AI 服务第一版只能分析和建议，不能创建、修改、删除 ERP 数据。

注解：

- 创建订单、库存出入库、财务收款仍然由现有 ERP 表单完成。
- AI 只负责解释、分析、提醒风险。

### Scenario：用户要求 AI 修改数据

- GIVEN 用户要求 AI 创建订单、修改库存或删除记录
- WHEN AI 服务处理请求
- THEN AI 只能给出建议或说明
- AND 不能执行写 SQL
