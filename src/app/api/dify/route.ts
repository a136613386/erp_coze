import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

// Dify 配置（请替换为您的实际配置）
const DIFY_API_URL = process.env.DIFY_API_URL || 'https://api.dify.ai/v1/chat-messages';
const DIFY_API_KEY = process.env.DIFY_API_KEY || 'your-dify-api-key';
const DIFY_USER = 'erp-user';

export async function POST(request: NextRequest) {
  try {
    const { message, conversation_id } = await request.json();
    
    if (!message || typeof message !== 'string') {
      return Response.json({ error: '消息不能为空' }, { status: 400 });
    }

    const response = await fetch(DIFY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {},
        query: message,
        user: DIFY_USER,
        response_mode: 'blocking', // 或 'streaming'
        conversation_id: conversation_id || '',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Dify API Error:', errorText);
      return Response.json({ error: 'Dify服务调用失败' }, { status: response.status });
    }

    const data = await response.json();
    
    return Response.json({
      answer: data.answer || '抱歉，暂时无法回答',
      conversation_id: data.conversation_id,
    });

  } catch (error) {
    console.error('Dify API Error:', error);
    return Response.json({ error: '处理请求失败' }, { status: 500 });
  }
}
