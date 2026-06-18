# 逐步注解：ERP RAG Copilot MVP

这份文件给你看“每一步到底改了什么、为什么改、改完有什么用”。  
它比 `tasks.md` 更适合答辩、交接和后续继续开发。

## Step 1：移除 Dify 主链路

### 为什么要改

原项目里有 Dify 助手：

- 前端组件：`src/components/DifyChat.tsx`
- 后端接口：`src/app/api/dify/route.ts`
- 主页面引用：`src/app/page.tsx`

它的问题是：

- 业务链路依赖外部 Dify 服务
- Dify 接口里有硬编码地址和 Key
- 工具调用过程不可控
- 不方便展示“AI 查了哪些 ERP 数据”
- 不符合后续“自建企业级 Copilot”的目标

所以第一步先把 Dify 从主链路移除。

### 改了哪些文件

删除：

- `src/app/api/dify/route.ts`
- `src/components/DifyChat.tsx`

修改：

- `src/app/page.tsx`
- `.env.local.example`

### 具体改动说明

在 `src/app/page.tsx` 中：

- 原来导入 `DifyChat`
- 现在改成导入 `AICopilotChat`

原来的状态名：

```ts
const [difyOpen, setDifyOpen] = useState(false);
```

改成：

```ts
const [copilotOpen, setCopilotOpen] = useState(false);
```

这样命名更准确，因为现在打开的是自建 ERP Copilot，不是 Dify。

页面底部原来渲染：

```tsx
{difyOpen && <DifyChat onClose={() => setDifyOpen(false)} />}
```

现在改成：

```tsx
{copilotOpen && <AICopilotChat onClose={() => setCopilotOpen(false)} />}
```

### 改完后的效果

用户仍然点击右下角浮动按钮打开聊天窗口，但背后已经不再走 Dify。

## Step 2：新增 Next.js AI 代理接口

### 为什么要加代理接口

前端不应该直接调用 Python AI 服务。

原因：

- 前端直接调用 Python 服务，后续部署和鉴权不好控制
- Next.js 可以统一做参数校验
- Next.js 可以统一处理超时和错误
- 后续可以在这里加登录态、租户、权限、审计

所以新增：

```text
src/app/api/ai/chat/route.ts
```

前端只请求：

```text
POST /api/ai/chat
```

Next.js 再转发到：

```text
POST http://127.0.0.1:8001/chat
```

### 接口做了什么

`src/app/api/ai/chat/route.ts` 主要做几件事：

1. 读取请求体里的 `message`
2. 校验 `message` 必须是非空字符串
3. 自动补充模拟企业边界：
   - `tenant_id`
   - `user_role`
4. 转发到 Python AI 服务
5. 设置 30 秒超时
6. 把 Python 返回结果整理成前端统一格式

### 为什么要有 `tenant_id` 和 `user_role`

第一版不做完整登录系统，但企业级 AI 一定要有边界意识。

所以先用：

```json
{
  "tenant_id": "demo_tenant",
  "user_role": "manager"
}
```

模拟“某个企业、某个角色”的请求上下文。后续加真实登录时，可以替换这里。

### 返回格式为什么这样设计

返回：

```json
{
  "answer": "...",
  "trace_id": "...",
  "latency_ms": 123,
  "tools": [],
  "sources": []
}
```

含义：

- `answer`：AI 给用户看的回答
- `trace_id`：本次调用追踪 ID，答辩时可以展示“可审计”
- `latency_ms`：耗时
- `tools`：AI 调用了哪些业务工具
- `sources`：回答依据来自哪里，比如 MySQL 表或知识库文档

## Step 3：新增 Copilot 聊天窗口

### 为什么新增组件

原来的 `DifyChat` 是围绕 Dify 会话写的，有 `conversation_id` 和 `/api/dify`。

现在 Copilot 需要展示：

- 工具调用
- 来源引用
- trace_id
- 耗时
- ERP 业务快捷问题

所以新增：

```text
src/components/AICopilotChat.tsx
```

### 组件有什么功能

`AICopilotChat` 做了这些事：

- 显示聊天消息
- 提供 4 个快捷问题
- 调用 `/api/ai/chat`
- 展示 AI 回答
- 展示工具调用列表
- 展示来源引用
- 展示 `trace_id` 和耗时

### 四个快捷问题为什么这样设计

当前快捷问题是：

- 分析当前经营概览
- 检查库存风险
- 分析待收款风险
- 说明最近订单对库存的影响

它们对应答辩主线：

- 经营分析
- 库存预警
- 回款风险
- 订单和库存联动

不是随便聊天，而是围绕 ERP 核心价值设计。

## Step 4：新增 Python AI 服务

### 为什么要单独做 Python 服务

AI 编排、RAG、LangChain、向量库这些能力更适合放在 Python 服务里。

Next.js 继续负责：

- 页面
- 表单
- ERP API
- 前端代理

Python 负责：

- 意图判断
- 工具调用
- RAG 检索
- Prompt 组装
- LLM 调用
- 审计信息

这就是前后职责分离。

### 新增目录

```text
ai_service/
  README.md
  requirements.txt
  app/
    __init__.py
    config.py
    db.py
    schemas.py
    tools.py
    main.py
```

### 每个文件干什么

`ai_service/README.md`

- 写 Python 服务怎么启动
- 写环境变量怎么配置

`ai_service/requirements.txt`

- Python 依赖列表
- 当前包含 FastAPI、Uvicorn、Pydantic、PyMySQL、dotenv

`ai_service/app/config.py`

- 读取数据库环境变量
- 支持 `ERP_DB_*`
- 也兼容旧的 `MYSQL_*`

`ai_service/app/db.py`

- 创建 MySQL 连接
- 提供 `query_all`
- 限制只能执行 `SELECT`

`ai_service/app/schemas.py`

- 定义请求和响应格式
- 包括 `ChatRequest`、`ChatResponse`、`ToolAudit`、`SourceReference`

`ai_service/app/tools.py`

- 定义 ERP 只读工具
- 每个工具对应一个固定 SQL 查询

`ai_service/app/main.py`

- FastAPI 入口
- 提供 `/health`
- 提供 `/chat`
- 根据用户问题选择工具
- 汇总工具结果生成回答

## Step 5：新增只读 MySQL 工具

### 为什么工具必须只读

AI 直接写 ERP 数据风险很高。

比如用户说“帮我删掉这个订单”，如果 AI 真的执行写 SQL，会产生业务事故。

所以 MVP 明确限制：

- AI 只能查
- 不能新增
- 不能修改
- 不能删除

### 现在有哪些工具

`business_overview`

- 查客户数、订单数、商品数、累计销售额、低库存数量
- 用于“经营概览”“经营报表”“整体分析”

`recent_orders`

- 查最近订单
- 用于“最近订单”“订单对库存影响”

`low_stock_products`

- 查当前库存低于安全库存的商品
- 用于“库存风险”“缺货”“补货建议”

`pending_receivables`

- 查可能需要跟进回款的订单
- 用于“待收款风险”“回款风险”

`finance_summary`

- 按收付款类型和状态汇总财务记录
- 用于“现金流”“财务概览”

`customer_sales_summary`

- 按客户统计订单数和成交额
- 用于“销售最高客户”“客户成交汇总”

### 为什么说它安全

在 `ai_service/app/db.py` 里有保护：

```py
if not normalized.startswith("select"):
    raise ValueError("Only SELECT statements are allowed in AI tools")
```

这表示工具层只允许 SELECT 查询。

另外，用户输入不会被拼进 SQL。用户输入只用来判断调用哪个工具。

## Step 6：修改环境变量样例

### 改了什么

`.env.local.example` 中移除了：

```env
DIFY_API_URL=...
DIFY_API_KEY=...
```

新增：

```env
AI_SERVICE_URL=http://127.0.0.1:8001
```

### 为什么这样改

项目现在不依赖 Dify。

Next.js 只需要知道 Python AI 服务在哪里，所以保留一个 `AI_SERVICE_URL` 就够了。

## Step 7：验证

### 已经验证的内容

Python 语法检查：

```powershell
python -m py_compile ai_service\app\main.py ai_service\app\tools.py ai_service\app\db.py ai_service\app\config.py ai_service\app\schemas.py
```

TypeScript 检查：

```powershell
.\node_modules\.bin\tsc.cmd -p tsconfig.json
```

前端启动验证：

```powershell
.\node_modules\.bin\next.cmd dev -p 5000
Invoke-WebRequest http://localhost:5000
```

结果：

- Python 语法检查通过
- TypeScript 检查通过
- 前端 HTTP 返回 200

### 还没验证的内容

还没完成：

- Python 服务连接真实 MySQL 后的运行测试
- 前端 Copilot 到 Python 服务再到 MySQL 的端到端测试

原因：

- 需要本机 MySQL 环境变量配置正确
- 需要启动 `ai_service`

## 后续开发顺序建议

建议下一步按这个顺序继续：

1. 启动 Python `ai_service`
2. 用 `/health` 验证服务可用
3. 用 `/chat` 验证 MySQL Tool 能查真实数据
4. 前端点开 Copilot，测试四个快捷问题
5. 新增 `knowledge_base/` 文档目录
6. 加 RAG ingestion 脚本
7. 接 Chroma 或 Milvus
8. 再接 LangChain 和真实 LLM
9. 最后补答辩文档和演示脚本

## Step 8：先搭大框架，暂不抠细节

### 为什么现在要拆框架

如果继续把所有逻辑都写在 `main.py`，后面接 RAG、LangChain、LLM、审计落库时会越来越乱。

所以现在先把大的架构边界拆出来：

```text
FastAPI route
  -> CopilotService
    -> IntentRouter
    -> ToolRegistry
      -> ERP read-only tools
      -> MySQL query helper
    -> KnowledgeRetriever
    -> AnswerBuilder
    -> LLMClient
    -> AuditLogger
```

### 改了哪些文件

新增：

- `ai_service/app/services/copilot.py`
- `ai_service/app/services/intent_router.py`
- `ai_service/app/services/answer_builder.py`
- `ai_service/app/tooling/registry.py`
- `ai_service/app/tooling/erp_tools.py`
- `ai_service/app/rag/retriever.py`
- `ai_service/app/llm/client.py`
- `ai_service/app/audit/logger.py`
- `ai_service/docs/architecture.md`
- `ai_service/knowledge_base/README.md`

重构：

- `ai_service/app/main.py`
- `ai_service/app/schemas.py`

删除：

- `ai_service/app/tools.py`

### 每层现在负责什么

`main.py`

- 只负责 FastAPI 路由
- 不再写具体业务编排

`CopilotService`

- 负责整个 AI 请求流程
- 串起意图识别、工具调用、RAG、回答生成和审计

`IntentRouter`

- 根据用户问题选择工具名
- 现在是关键词规则
- 后续可以换成 LLM 意图识别

`ToolRegistry`

- 集中管理 AI 可以调用哪些工具
- 后续新增工具时，先注册到这里

`erp_tools.py`

- 放固定 SQL 的 ERP 只读工具
- 不接收用户 SQL

`KnowledgeRetriever`

- RAG 检索边界
- 现在只是占位
- 后续接 Chroma 或 Milvus

`LLMClient`

- LLM 调用边界
- 现在先返回确定性分析文本
- 后续接 OpenAI、本地模型或 LangChain

`AuditLogger`

- 审计事件边界
- 现在只返回响应里的 `audit_events`
- 后续可以落库

### 改完后的好处

- 后续做 RAG 不会影响 ERP Tool
- 后续换 LLM 不会影响 API 路由
- 后续加工具只改 `tooling`
- 后续加审计落库只改 `audit`
- 结构更适合答辩时画系统架构图
