# ERP 智能助手 - 项目文档

## 项目概述

面向小微企业的 ERP 教学演示系统，支持通过自然语言对话操作企业管理功能。

## 技术栈

- **框架**: Next.js 16 (App Router)
- **核心**: React 19
- **语言**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **样式**: Tailwind CSS 4
- **AI 能力**: LLM (coze-coding-dev-sdk)

## 功能模块

### 核心模块
1. **客户管理 (CRM)** - 客户信息录入、查询、跟进记录
2. **订单管理** - 订单创建、状态跟踪、发货记录
3. **库存管理** - 商品入库、出库、库存查询
4. **财务管理** - 收款、付款、简单报表

### AI 助手能力
- 查询客户、订单、库存信息
- 生成简单的数据报表
- 回答业务问题（如"本月销售额最高的客户是谁"）
- 提醒异常情况（如库存不足提醒）

## 目录结构

```
src/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts      # AI 对话 API
│   ├── layout.tsx
│   ├── page.tsx              # AI 对话界面
│   └── globals.css
├── components/
│   └── ui/                   # shadcn/ui 组件库
├── lib/
│   ├── types.ts              # TypeScript 类型定义
│   ├── mockData.ts           # 模拟数据
│   ├── businessQuery.ts      # 业务查询服务
│   ├── intentRecognition.ts   # 意图识别服务
│   └── utils.ts              # 工具函数
└── hooks/
    └── use-mobile.ts
```

## 开发命令

- `pnpm install` - 安装依赖
- `pnpm run dev` - 启动开发服务器
- `pnpm run build` - 构建生产版本
- `pnpm run lint` - 代码检查
- `pnpm ts-check` - TypeScript 类型检查

## API 接口

### POST /api/chat

对话接口，用于 AI 助手处理用户查询。

**请求体:**
```json
{
  "message": "查看张三的订单"
}
```

**响应:** 流式文本响应

**示例查询:**
- "查看客户列表" - 查询所有客户
- "查看张三的订单" - 查询特定客户订单
- "查看库存情况" - 查询库存和预警
- "生成经营报表" - 生成统计报表
- "检查系统异常" - 检查库存不足和待收款

## 数据模型

### 客户 (Customer)
- id, name, phone, email, company, address, level, followRecords, createdAt

### 订单 (Order)
- id, orderNo, customerId, customerName, items, totalAmount, status, createTime, deliveryTime, shippingAddress

### 产品 (Product)
- id, code, name, category, unit, stock, safeStock, price, cost

### 财务记录 (FinanceRecord)
- id, type, amount, customerId, supplierId, paymentMethod, status, time, remark

## 意图识别

系统支持以下业务意图:
- `query_customer` - 查询客户信息
- `query_order` - 查询订单信息
- `query_inventory` - 查询库存信息
- `query_finance` - 查询财务信息
- `generate_report` - 生成经营报表
- `anomaly_alert` - 系统异常提醒
- `general_chat` - 闲聊/问候

## 快速开始

1. 安装依赖: `pnpm install`
2. 启动开发服务器: `pnpm run dev`
3. 访问 http://localhost:5000
4. 开始使用 AI 助手查询企业管理数据
