import { BusinessIntent } from './types';
import { Config, LLMClient } from 'coze-coding-dev-sdk';

// 意图识别关键词映射
const INTENT_KEYWORDS: Record<BusinessIntent, string[]> = {
  'query_customer': ['客户', '查客户', '查看客户', '搜索客户', '客户信息', '客户列表', '有几个客户'],
  'query_order': ['订单', '查订单', '查看订单', '订单列表', '订单详情', '订单号', '我的订单'],
  'query_inventory': ['库存', '查库存', '查看库存', '产品', '库存不足', '还有多少', '库存查询'],
  'query_finance': ['财务', '收款', '付款', '账', '账单', '收支', '财务记录', '财务报表'],
  'create_order': ['创建订单', '新建订单', '下单'],
  'add_customer': ['添加客户', '新建客户', '录入客户', '新增客户'],
  'stock_in': ['入库', '入库单', '采购入库', '入库记录'],
  'stock_out': ['出库', '出库单', '销售出库', '出库记录'],
  'payment_received': ['收款', '确认收款', '收到款'],
  'payment_paid': ['付款', '确认付款', '支出'],
  'generate_report': ['报表', '报告', '统计', '经营情况', '经营报表', '月报', '季报', '年度报告'],
  'anomaly_alert': ['异常', '提醒', '预警', '警报', '问题', '风险'],
  'general_chat': ['你好', 'hi', 'hello', '在吗', '帮忙', '请问'],
  'unknown': [],
};

// 辅助函数：从用户消息中提取实体
function extractEntities(message: string): {
  customerName?: string;
  orderNo?: string;
  productName?: string;
} {
  const result: { customerName?: string; orderNo?: string; productName?: string } = {};
  
  // 如果消息包含泛指词（列表、所有客户、所有订单等），不提取具体客户名
  const isGeneralQuery = /所有|列表|全部|所有客户|所有订单|全部客户|全部订单/.test(message);
  
  if (isGeneralQuery) {
    // 仍然尝试提取订单号和产品名
    const orderPatterns = [
      /(ORD\d+)/,
      /订单号[是为]?(.+?)(?:的|，|。|$)/,
    ];
    for (const pattern of orderPatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        result.orderNo = match[1].trim();
        break;
      }
    }

    const productPatterns = [
      /产品[是为]?(.+?)(?:的|，|库存|数量)/,
      /(?:笔记本电脑|鼠标|键盘|显示器|打印机|服务器|硬盘|U盘|投影仪|交换机)/,
    ];
    for (const pattern of productPatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        result.productName = match[1].trim();
        break;
      }
    }

    return result;
  }
  
  // 提取客户名称 - 使用更精确的模式
  const customerPatterns = [
    /叫(.+?)(?:的|订单|信息|客户)/,  // "客户叫张三的订单"
    /客户[为是]?(.+?)(?:的|订单|信息)/,  // "客户张三的订单" 或 "客户是张三的订单"
  ];
  
  // 只有在不包含泛指词时，才尝试提取客户名
  if (!isGeneralQuery) {
    // 先尝试精确模式
    for (const pattern of customerPatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        const name = match[1].trim();
        if (!/^(所有|列表|查看|搜索|找)/.test(name) && name.length >= 2) {
          result.customerName = name;
          break;
        }
      }
    }
    
    // 如果精确模式没匹配，尝试从 "xxx的订单" 模式中提取
    if (!result.customerName) {
      const orderMatch = message.match(/(.+?)的订单/);
      if (orderMatch && orderMatch[1]) {
        // 提取 "xxx的订单" 中 xxx 部分，然后去掉前面的动作词
        let name = orderMatch[1].trim();
        // 去掉前面的动作词（查看、搜索、找、我等）
        name = name.replace(/^(查看|搜索|找|我想|我要|我|请)/, '').trim();
        // 过滤掉整个名字就是这些词的名字
        const invalidNames = ['所有', '列表', '查看', '搜索', '找', '我', ''];
        const isValid = !invalidNames.includes(name) && name.length >= 2;
        if (isValid) {
          result.customerName = name;
        }
      }
    }
  }

  // 提取订单号
  const orderPatterns = [
    /(ORD\d+)/,
    /订单号[是为]?(.+?)(?:的|，|。|$)/,
  ];
  for (const pattern of orderPatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      result.orderNo = match[1].trim();
      break;
    }
  }

  // 提取产品名称
  const productPatterns = [
    /产品[是为]?(.+?)(?:的|，|库存|数量)/,
    /(.+?)还有多少/,
    /(?:笔记本电脑|鼠标|键盘|显示器|打印机|服务器|硬盘|U盘|投影仪|交换机)/,
  ];
  for (const pattern of productPatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      result.productName = match[1].trim();
      break;
    }
  }

  return result;
}

// 使用LLM进行意图识别
export class IntentRecognition {
  private client: LLMClient;
  private systemPrompt = `你是天商ERP系统的AI助手，负责理解用户的业务查询意图。

请根据用户的输入，判断他们的意图类型：

【意图类型】
1. query_customer - 查询客户信息（如：查看客户列表、搜索某个客户）
2. query_order - 查询订单信息（如：查看订单、某个客户的订单）
3. query_inventory - 查询库存信息（如：查看库存、某个产品库存）
4. query_finance - 查询财务信息（如：查看收款付款记录）
5. generate_report - 生成经营报表（如：查看报表、统计报告）
6. anomaly_alert - 系统异常提醒（如：检查异常、风险提醒）
7. general_chat - 闲聊/问候（如：你好、在吗）
8. unknown - 无法识别

【关键要求】
- 如果用户想看"报表"、"报告"、"统计"、"经营情况"，一定是 generate_report
- 如果用户提到"库存不足"、"提醒"、"预警"，结合具体产品，可能是 query_inventory
- 尽量从用户消息中提取关键实体（客户名、订单号、产品名）

请用JSON格式回复：
{"intent": "意图类型", "params": {"customerName": "客户名（如有）", "orderNo": "订单号（如有）", "productName": "产品名（如有）"}}`;

  constructor() {
    const config = new Config();
    this.client = new LLMClient(config);
  }

  async recognize(message: string): Promise<{ intent: BusinessIntent; params: { customerName?: string; orderNo?: string; productName?: string } }> {
    // 首先使用关键词匹配快速判断
    const fastMatch = this.fastMatchIntent(message);
    const params = extractEntities(message);
    
    if (fastMatch !== 'unknown') {
      return {
        intent: fastMatch,
        params,
      };
    }

    // 使用LLM进行精确识别
    try {
      const messages = [
        { role: 'system' as const, content: this.systemPrompt },
        { role: 'user' as const, content: `用户输入：${message}` },
      ];

      const response = await this.client.invoke(messages, {
        model: 'doubao-seed-2-0-mini-260215',
        temperature: 0.3,
      });

      // 解析LLM返回的JSON
      try {
        const result = JSON.parse(response.content);
        return {
          intent: (result.intent as BusinessIntent) || 'unknown',
          params: {
            ...params,
            ...result.params,
          },
        };
      } catch {
        // JSON解析失败，回退到关键词匹配
        return {
          intent: 'unknown',
          params,
        };
      }
    } catch {
      // 如果LLM调用失败，回退到关键词匹配
      return {
        intent: 'unknown',
        params,
      };
    }
  }

  // 快速关键词匹配
  private fastMatchIntent(message: string): BusinessIntent {
    for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
      for (const keyword of keywords) {
        if (message.includes(keyword)) {
          return intent as BusinessIntent;
        }
      }
    }
    return 'unknown';
  }

  // 生成回复内容
  async generateResponse(intent: BusinessIntent, params: { customerName?: string; orderNo?: string; productName?: string }, queryResult: string): Promise<string> {
    const greeting = '您好！';

    switch (intent) {
      case 'query_customer':
        return greeting + queryResult;
      case 'query_order':
        return greeting + queryResult;
      case 'query_inventory':
        return greeting + queryResult;
      case 'query_finance':
        return greeting + queryResult;
      case 'generate_report':
        return queryResult;
      case 'anomaly_alert':
        return queryResult;
      case 'general_chat':
        return '您好！我是天商ERP智能助手，可以帮您：\n- 查询客户、订单、库存信息\n- 生成经营报表\n- 提醒异常情况\n\n请告诉我您需要什么帮助？';
      default:
        return '抱歉，我不太理解您的意思。请尝试以下方式提问：\n- "查看客户列表"\n- "查看张三的订单"\n- "查看库存情况"\n- "生成经营报表"\n- "检查系统异常"';
    }
  }
}

export const intentRecognition = new IntentRecognition();
