# 变更提案：ERP RAG Copilot MVP

## 一句话说明

把原来的 Dify 助手替换成自建 ERP Copilot。

这次改造不是重做 ERP，而是在现有 ERP 系统上新增 AI 分析层：

- ERP 业务页面继续保留
- Dify 链路移除
- 前端改用 `AICopilotChat`
- Next.js 新增 `/api/ai/chat`
- Python 新增 `ai_service`
- Python 服务通过只读 MySQL Tool 查询 ERP 数据
- AI 回答返回工具调用、来源、`trace_id` 和耗时

## 为什么要这样改

原来的 Dify 助手更像“外部聊天接入”，答辩时不容易证明：

- AI 到底查了哪些 ERP 数据
- AI 有没有直接操作数据库
- 回答是否可追踪
- 业务分析是否来自真实数据
- 系统是不是企业级闭环

改成自建 Copilot 后，架构更清晰：

```text
用户
  ↓
ERP 前端 AICopilotChat
  ↓
Next.js /api/ai/chat
  ↓
Python ai_service /chat
  ↓
只读 MySQL Tools + 后续 RAG 知识库
  ↓
带 trace_id / tools / sources 的 AI 回答
```

## 本次改造范围

### 已经做的

- 移除 Dify 主链路
- 新增 Copilot 聊天窗口
- 新增 Next.js AI 代理接口
- 新增 Python FastAPI AI 服务
- 新增第一批只读 MySQL 工具
- 新增 OpenSpec 记录
- 完成 TypeScript 和 Python 语法检查
- 验证前端可以访问 `http://localhost:5000`

### 暂时不做的

- 不做 AI 写入 ERP 数据
- 不做完整登录、权限、租户体系
- 不做流式输出
- 不马上接 Milvus
- 不马上接完整 LangChain Agent
- 不马上做生产级审计日志落库

这些后续都可以继续加，但 MVP 先保证答辩链路能跑通。

## 每一步改动索引

更详细的中文注解写在：

[implementation-notes.md](implementation-notes.md)

这里先列总览：

| 步骤 | 目的 | 主要文件 |
| --- | --- | --- |
| Step 1 | 切断 Dify 链路 | `src/app/page.tsx`、删除 `src/app/api/dify/route.ts`、删除 `src/components/DifyChat.tsx` |
| Step 2 | 新增 Next.js AI 代理 | `src/app/api/ai/chat/route.ts` |
| Step 3 | 新增 Copilot 前端窗口 | `src/components/AICopilotChat.tsx` |
| Step 4 | 新增 Python AI 服务 | `ai_service/app/main.py` 等 |
| Step 5 | 新增只读 MySQL 工具 | `ai_service/app/tools.py`、`ai_service/app/db.py` |
| Step 6 | 配置环境变量 | `.env.local.example` |
| Step 7 | 验证代码 | `tsc`、`py_compile`、本地 HTTP 检查 |

## 验收标准

这次 MVP 改造完成后，应该满足：

- 前端不再依赖 Dify
- 项目源码里没有 `/api/dify` 主链路
- 点击右下角助手打开的是 ERP Copilot
- Copilot 请求走 `/api/ai/chat`
- `/api/ai/chat` 再转发到 Python `ai_service`
- Python AI 服务只执行只读 SQL
- AI 返回结果包含：
  - `answer`
  - `trace_id`
  - `latency_ms`
  - `tools`
  - `sources`

## 当前风险

- 当前仓库部分中文显示存在历史编码问题，本次没有顺手重构所有页面文案。
- 当前 Python AI 服务是 MVP 版，先用规则选择工具，还没有接 LLM 和 RAG。
- 当前环境没有全局 `pnpm`，所以验证时使用了本地 `node_modules/.bin` 里的命令。
- 还没有完成“Python 服务连接真实 MySQL 后的端到端聊天验证”，因为需要本机数据库配置可用。
