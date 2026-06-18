# ERP 业务 API 文档

本文档说明当前项目已经接通的业务接口，覆盖：

- 经营概览
- 客户管理
- 订单管理
- 库存管理
- 财务管理

默认本地地址：

```txt
http://localhost:5000
```

统一说明：

- 所有请求与响应均为 `application/json`
- 成功时通常返回 `200` 或 `201`
- 失败时返回：
  - `400` 参数校验失败或业务校验失败
  - `409` 资源冲突
  - `500` 服务端异常

## 1. 经营概览

### 1.1 获取经营概览

`GET /api/dashboard/overview`

说明：

- 获取首页经营概览卡片数据
- 获取最近订单
- 获取库存预警列表

响应示例：

```json
{
  "customerCount": 11,
  "orderCount": 11,
  "productCount": 10,
  "cumulativeSales": 210260,
  "pendingPaymentCount": 3,
  "lowStockCount": 0,
  "recentOrders": [
    {
      "id": 11,
      "orderNo": "ORD20260429140805280",
      "customerId": 21,
      "customerName": "测试客户A",
      "amount": 760,
      "status": "待付款",
      "dealDate": "2026-04-28",
      "itemCount": 1,
      "items": [
        {
          "id": 1,
          "productId": 8,
          "productCode": "IT008",
          "productName": "SSD",
          "quantity": 1,
          "unitPrice": 760,
          "subtotal": 760
        }
      ]
    }
  ],
  "lowStockProducts": []
}
```

## 2. 客户管理

### 2.1 获取客户列表

`GET /api/customers`

说明：

- 查询客户列表
- 自动聚合每个客户的订单数与累计成交金额

响应示例：

```json
{
  "customers": [
    {
      "id": "C021",
      "name": "测试客户A",
      "company": "上海测试企业A",
      "phone": "13800000011",
      "level": "普通",
      "totalOrders": 1,
      "totalAmount": 760,
      "createdAt": "2026-04-29T06:08:05.000Z",
      "updatedAt": "2026-04-29T06:08:05.000Z"
    }
  ]
}
```

### 2.2 新增客户

`POST /api/customers`

请求体：

```json
{
  "name": "测试客户A",
  "company": "上海测试企业A",
  "phone": "13800000011",
  "level": "普通"
}
```

字段说明：

- `name`: 客户名称
- `company`: 公司名称
- `phone`: 11 位手机号
- `level`: `VIP` / `普通` / `新客户`

成功响应：

```json
{
  "customer": {
    "id": "C021",
    "name": "测试客户A",
    "company": "上海测试企业A",
    "phone": "13800000011",
    "level": "普通",
    "totalOrders": 0,
    "totalAmount": 0,
    "createdAt": "2026-04-29T06:08:05.000Z",
    "updatedAt": "2026-04-29T06:08:05.000Z"
  }
}
```

失败示例：

```json
{
  "message": "该手机号已存在客户"
}
```

## 3. 订单管理

### 3.1 获取订单列表

`GET /api/orders`

说明：

- 查询订单列表
- 自动带出客户名称
- 自动带出订单明细

响应示例：

```json
{
  "orders": [
    {
      "id": 11,
      "orderNo": "ORD20260429140805280",
      "customerId": 21,
      "customerName": "测试客户A",
      "amount": 760,
      "status": "待付款",
      "dealDate": "2026-04-28",
      "itemCount": 1,
      "items": [
        {
          "id": 1,
          "productId": 8,
          "productCode": "IT008",
          "productName": "SSD",
          "quantity": 1,
          "unitPrice": 760,
          "subtotal": 760
        }
      ]
    }
  ]
}
```

### 3.2 创建订单

`POST /api/orders`

说明：

- 创建订单头 `order_t`
- 创建订单明细 `order_item_t`
- 自动扣减库存
- 自动写入库存流水 `stock_record_t`

请求体：

```json
{
  "customerId": 21,
  "dealDate": "2026-04-29",
  "status": "待付款",
  "items": [
    {
      "productId": 8,
      "quantity": 1
    }
  ]
}
```

字段说明：

- `customerId`: 客户主键 ID
- `dealDate`: 成交日期，格式 `YYYY-MM-DD`
- `status`: `待付款` / `已付款` / `已发货` / `已完成` / `已取消`
- `items`: 订单商品数组
  - `productId`: 商品主键 ID
  - `quantity`: 数量

成功响应：

```json
{
  "order": {
    "id": 11,
    "orderNo": "ORD20260429140805280",
    "customerId": 21,
    "customerName": "测试客户A",
    "amount": 760,
    "status": "待付款",
    "dealDate": "2026-04-28",
    "itemCount": 1,
    "items": [
      {
        "id": 1,
        "productId": 8,
        "productCode": "IT008",
        "productName": "SSD",
        "quantity": 1,
        "unitPrice": 760,
        "subtotal": 760
      }
    ]
  }
}
```

失败示例：

```json
{
  "message": "SSD 库存不足，当前仅剩 3个"
}
```

## 4. 库存管理

### 4.1 获取库存列表

`GET /api/inventory`

说明：

- 查询库存列表
- 当前 `status` 字段按数据库存储值返回
- 前端展示时：
  - `正常` -> `normal`
  - `库存不足` -> `low`

响应示例：

```json
{
  "inventory": [
    {
      "id": 8,
      "code": "IT008",
      "name": "SSD",
      "category": "存储设备",
      "unit": "个",
      "stock": 6,
      "safeStock": 15,
      "price": 760,
      "cost": 550,
      "status": "normal"
    }
  ]
}
```

### 4.2 入库 / 出库

`POST /api/inventory/movements`

说明：

- 手动入库或出库
- 更新 `inventory_t.current_stock`
- 更新 `inventory_t.status`
- 写入 `stock_record_t`

请求体：

```json
{
  "productId": 8,
  "type": "入库",
  "status": "正常",
  "quantity": 1,
  "operatorName": "管理员",
  "remark": "手动补货"
}
```

字段说明：

- `productId`: 商品主键 ID
- `type`: `入库` / `出库`
- `status`: `正常` / `库存不足`
- `quantity`: 数量
- `operatorName`: 操作人
- `remark`: 备注，可选

成功响应：

```json
{
  "inventory": {
    "id": 8,
    "code": "IT008",
    "name": "SSD",
    "category": "存储设备",
    "unit": "个",
    "stock": 6,
    "safeStock": 15,
    "price": 760,
    "cost": 550,
    "status": "normal"
  }
}
```

失败示例：

```json
{
  "message": "SSD 库存不足，当前仅剩 3个"
}
```

## 5. 财务管理

### 5.1 获取财务记录

`GET /api/finance`

说明：

- 查询财务记录
- 可关联客户
- 可关联订单

响应示例：

```json
{
  "records": [
    {
      "id": 1,
      "financeDate": "2026-04-28",
      "type": "收款",
      "counterparty": "测试客户A",
      "customerId": 21,
      "customerName": "测试客户A",
      "orderId": 11,
      "orderNo": "ORD20260429140805280",
      "amount": 5200,
      "paymentMethod": "银行转账",
      "status": "已确认",
      "remark": "接口测试收款"
    }
  ]
}
```

### 5.2 新增财务记录

`POST /api/finance`

说明：

- 创建收款或付款记录
- 支持关联客户
- 支持关联订单

请求体示例 1：收款

```json
{
  "type": "收款",
  "financeDate": "2026-04-29",
  "amount": 5200,
  "paymentMethod": "银行转账",
  "status": "已确认",
  "customerId": 21,
  "orderId": 11,
  "remark": "订单收款"
}
```

请求体示例 2：付款

```json
{
  "type": "付款",
  "financeDate": "2026-04-29",
  "amount": 300,
  "paymentMethod": "微信",
  "status": "已确认",
  "counterparty": "测试供应商",
  "remark": "采购付款"
}
```

字段说明：

- `type`: `收款` / `付款`
- `financeDate`: 日期，格式 `YYYY-MM-DD`
- `amount`: 金额
- `paymentMethod`: `银行转账` / `微信`
- `status`: `已确认` / `待确认`
- `customerId`: 客户主键 ID，可选
- `orderId`: 订单主键 ID，可选
- `counterparty`: 对方名称，可选
- `remark`: 备注，可选

成功响应：

```json
{
  "record": {
    "id": 2,
    "financeDate": "2026-04-28",
    "type": "付款",
    "counterparty": "测试供应商",
    "customerId": null,
    "customerName": null,
    "orderId": null,
    "orderNo": null,
    "amount": 300,
    "paymentMethod": "微信",
    "status": "已确认",
    "remark": "采购付款"
  }
}
```

## 6. 前端调用示例

### 6.1 获取经营概览

```ts
const res = await fetch('/api/dashboard/overview', { cache: 'no-store' });
const data = await res.json();
```

### 6.2 新增客户

```ts
await fetch('/api/customers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: '测试客户A',
    company: '上海测试企业A',
    phone: '13800000011',
    level: '普通'
  })
});
```

### 6.3 创建订单

```ts
await fetch('/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customerId: 21,
    dealDate: '2026-04-29',
    status: '待付款',
    items: [{ productId: 8, quantity: 1 }]
  })
});
```

### 6.4 入库 / 出库

```ts
await fetch('/api/inventory/movements', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productId: 8,
    type: '入库',
    status: '正常',
    quantity: 1,
    operatorName: '管理员',
    remark: '手动补货'
  })
});
```

### 6.5 新增财务记录

```ts
await fetch('/api/finance', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: '收款',
    financeDate: '2026-04-29',
    amount: 5200,
    paymentMethod: '银行转账',
    status: '已确认',
    customerId: 21,
    orderId: 11,
    remark: '订单收款'
  })
});
```

## 7. 当前已实现的业务规则

- 新增客户时，手机号不能重复
- 创建订单时：
  - 客户必须存在
  - 商品必须存在
  - 出库库存必须足够
  - 自动生成订单号
  - 自动生成订单明细
  - 自动扣减库存
  - 自动写入库存流水
- 库存入库/出库时：
  - 商品必须存在
  - 出库时库存必须足够
  - 状态由用户手动选择并保存
- 财务记录时：
  - 收款至少需要客户、订单或对方名称之一
  - 付款建议填写对方名称

## 8. 文档文件位置

当前文档文件：

[API_DOCUMENTATION.md](d:/xuweiqun/py_project/work_heima/erp_coze/API_DOCUMENTATION.md)
