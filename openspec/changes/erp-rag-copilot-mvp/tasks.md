# 任务清单：ERP RAG Copilot MVP

这份清单用于看进度。  
每一项下面的“注解”说明这件事为什么要做。

## 1. 移除 Dify

- [x] 删除 `src/app/api/dify/route.ts`
  - 注解：去掉后端 Dify 转发接口，避免项目继续依赖外部 Dify 服务。

- [x] 删除 `src/components/DifyChat.tsx`
  - 注解：旧组件只适合 Dify 会话，不适合展示工具调用、来源和 trace。

- [x] 在 `src/app/page.tsx` 中把 Dify 入口替换为 Copilot 入口
  - 注解：用户入口保持在右下角，但打开的是新的 ERP Copilot。

- [x] 从 `.env.local.example` 移除 Dify 配置
  - 注解：Dify API 地址和 Key 不应该再出现在新主链路里。

## 2. 新增 Next.js Copilot 代理

- [x] 新增 `POST /api/ai/chat`
  - 注解：前端统一请求 Next.js，不直接请求 Python 服务。

- [x] 校验 `message`
  - 注解：空消息直接返回 400，避免无效请求进入 AI 服务。

- [x] 转发到 Python `ai_service`
  - 注解：AI 编排放在 Python，Next.js 只做代理和边界控制。

- [x] 返回 `answer`、`trace_id`、`latency_ms`、`tools`、`sources`
  - 注解：这些字段用于答辩展示“可追踪、可审计、有来源”。

- [x] 处理 AI 服务不可用和超时
  - 注解：Python 服务没启动时，前端能看到明确错误，不会白屏。

## 3. 新增 Copilot UI

- [x] 新增 `AICopilotChat`
  - 注解：替代 `DifyChat`，承载新的 ERP Copilot 交互。

- [x] 加入 4 个 ERP 演示快捷问题
  - 注解：快捷问题对应答辩主线，不是通用闲聊。

- [x] 展示 AI 回答
  - 注解：用户看到最终业务分析结果。

- [x] 展示工具调用
  - 注解：说明 AI 回答前查了哪些业务工具。

- [x] 展示来源引用
  - 注解：说明回答依据来自 MySQL 工具或后续知识库。

- [x] 展示 trace 和耗时
  - 注解：用于体现企业级审计和可观测性。

## 4. 新增 Python AI 服务

- [x] 新增 FastAPI 应用
  - 注解：Python 更适合后续接 LangChain、RAG、向量库和 LLM。

- [x] 新增 `/health`
  - 注解：用于快速判断 AI 服务是否启动。

- [x] 新增 `/chat`
  - 注解：这是 Next.js `/api/ai/chat` 最终转发到的核心接口。

- [x] 新增请求和响应 Schema
  - 注解：保证接口字段固定，前后端协作更清楚。

- [x] 新增 MySQL 配置读取
  - 注解：复用现有 ERP 数据库配置。

- [x] 新增只读查询方法
  - 注解：从底层限制 AI Tool 不能执行写 SQL。

- [x] 新增 README 和 requirements
  - 注解：方便后续启动和部署 Python 服务。

## 5. 新增只读 ERP 工具

- [x] 经营概览工具
  - 注解：服务“分析当前经营概览”。

- [x] 最近订单工具
  - 注解：服务“最近订单”和“订单影响库存”。

- [x] 低库存商品工具
  - 注解：服务“库存风险”和“补货建议”。

- [x] 待收款风险工具
  - 注解：服务“回款风险”和“待收款订单”。

- [x] 财务汇总工具
  - 注解：服务“现金流”和“收付款状态”。

- [x] 客户成交汇总工具
  - 注解：服务“销售最高客户”和“客户价值分析”。

## 6. 验证

- [x] Python 语法检查
  - 注解：确认新增 Python 文件没有语法错误。

- [x] TypeScript 检查
  - 注解：确认新增前端组件和 API 路由类型正确。

- [x] 本地前端 HTTP 检查
  - 注解：确认前端服务可以正常访问。

- [ ] FastAPI 运行级接口测试
  - 注解：当前 Python 环境缺少 `fastapi`，需要先执行 `pip install -r ai_service/requirements.txt` 后再测 `/health` 和 `/chat`。

- [ ] Python 服务连接真实 MySQL 测试
  - 注解：需要本机数据库配置可用后执行。

- [ ] 端到端 Copilot 聊天测试
  - 注解：需要同时启动 Next.js 和 Python `ai_service`。

## 7. 后续计划

- [x] 清理旧 AI/mock 链路
  - 注解：已删除旧 `/api/chat`、mockData、intentRecognition、businessQuery、types，避免和新的 Copilot 主链路混在一起。

- [x] 归档根目录文档和 SQL
  - 注解：项目文档移动到 `docs/`，数据库脚本移动到 `database/`，根目录只保留关键配置和入口说明。

- [x] 删除未使用模板静态资源
  - 注解：已删除未被页面引用的 `public/*.svg` 和 `assets/image.png`。

- [x] 精简无引用模板依赖
  - 注解：已从 `package.json` 移除 Coze SDK、AWS、Supabase、Drizzle、Postgres 相关依赖。

- [x] 拆出 Python AI 服务大框架
  - 注解：已把入口、编排、意图路由、工具注册、RAG、LLM、审计拆成独立模块，后续只需要在对应模块补细节。

- [x] 新增 AI 服务架构说明
  - 注解：`ai_service/docs/architecture.md` 已说明每一层负责什么。

- [x] 新增知识库目录占位
  - 注解：`ai_service/knowledge_base/README.md` 已预留 RAG 文档分类。

- [ ] 新增知识库文档目录
  - 注解：存放 ERP 操作手册、库存规则、财务制度、FAQ。

- [ ] 新增 RAG 入库脚本
  - 注解：把知识库文档切分、向量化、写入向量库。

- [ ] 接 Chroma 或 Milvus
  - 注解：Chroma 适合本地开发，Milvus 更适合答辩展示企业级方向。

- [ ] 接 LangChain 编排
  - 注解：统一管理工具调用、RAG 检索和 LLM Prompt。

- [ ] 工具调用审计落库
  - 注解：把 trace、工具名、耗时、来源保存下来，增强可审计性。

- [ ] 输出答辩材料
  - 注解：架构图、流程图、接口说明、测试用例、演示脚本放到 `E:\AI_Query\Codex\项目答辩-五`。
