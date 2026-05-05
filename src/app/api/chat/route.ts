import { NextRequest } from 'next/server';
import { intentRecognition } from '@/lib/intentRecognition';
import { queryService } from '@/lib/businessQuery';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    if (!message || typeof message !== 'string') {
      return Response.json({ error: '消息不能为空' }, { status: 400 });
    }

    // 1. 意图识别
    const { intent, params } = await intentRecognition.recognize(message);
    
    // 2. 执行业务查询
    const queryResult = await queryService.executeQuery(intent, {
      name: params.customerName,
      orderNo: params.orderNo,
      productName: params.productName,
    });

    // 3. 生成回复
    const responseContent = await intentRecognition.generateResponse(intent, params, queryResult);

    // 4. 通过LLM优化回复格式（可选，使用流式返回）
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // 直接发送已处理好的回复
        controller.enqueue(encoder.encode(responseContent));
        controller.close();
      },
    });


    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return Response.json({ error: '处理请求失败' }, { status: 500 });
  }
}
