# ERP RAG Copilot

面向小微企业 ERP 教学演示的企业级 Copilot 项目。

当前目标不是做一个普通聊天窗口，而是做一个可以读取真实 ERP 数据、展示工具调用、带 RAG 知识库边界、可审计追踪的 ERP Copilot。

## 项目结构

```text
.
├── ai_service/                 # Python FastAPI AI 服务
│   ├── app.py                  # FastAPI 服务入口
│   ├── qa_core/                # 参考 knowforge-rag-platform 的核心能力分层
│   │   ├── application/        # Copilot 应用编排
│   │   ├── audit/              # 审计事件边界
│   │   ├── config/             # AI 服务配置
│   │   ├── contracts/          # 请求、响应、审计、来源等数据契约
│   │   ├── database/           # MySQL 只读访问
│   │   ├── evaluation/         # 评测用例和评估逻辑预留
│   │   ├── llm/                # LLM 调用边界
│   │   ├── pipeline/           # 意图路由、回答生成等链路组件
│   │   ├── retrieval/          # RAG 检索边界
│   │   └── tools/              # ERP 只读工具注册与实现
│   ├── eval_sets/              # AI/RAG 标准问题集
│   ├── reports/                # 评测报告、运行报告
│   ├── logs/                   # 本地运行日志目录
│   ├── docs/
│   └── knowledge_base/
├── database/                   # 数据库建表和初始化脚本
├── docs/                       # 项目说明、API 文档、改造方案
├── openspec/                   # OpenSpec 变更记录和规格说明
├── scripts/                    # Next.js 启动/构建脚本
└── src/                        # Next.js ERP 前端和 API
    ├── app/
    │   ├── api/
    │   │   ├── ai/chat/        # Next.js 到 Python AI 服务的代理
    │   │   ├── customers/
    │   │   ├── dashboard/
    │   │   ├── finance/
    │   │   ├── inventory/
    │   │   └── orders/
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx
    ├── components/
    ├── hooks/
    └── lib/
```

## 启动前端

```powershell
corepack pnpm install
corepack pnpm dev
```

默认访问：

```text
http://localhost:5000
```

如果当前 shell 没有全局 `pnpm`，可以直接用本地 Next：

```powershell
.\node_modules\.bin\next.cmd dev -p 5000
```

## 启动 Python AI 服务

推荐使用你的 Conda 环境：

```powershell
cd ai_service
E:\Anaconda\envs\knowforge_rag\python.exe -m uvicorn app:app --host 127.0.0.1 --port 8001 --reload
```

健康检查：

```text
http://127.0.0.1:8001/health
```

## 环境变量

复制 `.env.local.example` 为 `.env.local` 后配置：

```env
AI_SERVICE_URL=http://127.0.0.1:8001
ERP_DB_HOST=127.0.0.1
ERP_DB_PORT=3306
ERP_DB_USER=root
ERP_DB_PASSWORD=replace-with-your-db-password
ERP_DB_NAME=erp_db
```

## 当前 AI 主链路

```text
用户
  -> AICopilotChat
  -> Next.js /api/ai/chat
  -> Python ai_service /chat
  -> IntentRouter
  -> ToolRegistry
  -> MySQL read-only tools
  -> answer + trace_id + tools + sources + audit_events
```

## 重要说明

- Dify 主链路已经移除。
- 旧 mock AI `/api/chat` 已删除。
- AI 服务 MVP 阶段只读 ERP 数据，不写业务表。
- RAG、LLM、审计落库已经预留模块边界，后续在对应目录补细节。
- OpenSpec 记录见 `openspec/changes/erp-rag-copilot-mvp/`。
