import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

const DIFY_API_URL =
  process.env.DIFY_API_URL?.trim() || 'https://api.dify.ai/v1/chat-messages';
const DIFY_API_KEY = process.env.DIFY_API_KEY?.trim() || '';
const DIFY_USER = process.env.DIFY_USER?.trim() || 'erp-user';

export async function POST(request: NextRequest) {
  try {
    const { message, conversation_id } = await request.json();

    if (!message || typeof message !== 'string') {
      return Response.json({ error: '消息不能为空' }, { status: 400 });
    }

    if (!DIFY_API_KEY) {
      return Response.json({ error: 'DIFY_API_KEY 未配置' }, { status: 500 });
    }

    const response = await fetch(DIFY_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${DIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {},
        query: message,
        user: DIFY_USER,
        response_mode: 'blocking',
        conversation_id: conversation_id || '',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Dify API Error:', errorText);
      return Response.json(
        { error: `Dify服务调用失败: ${errorText}` },
        { status: response.status }
      );
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
