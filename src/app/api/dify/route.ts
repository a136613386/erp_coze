import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

const DIFY_HOST = process.env.DIFY_HOST || 'http://192.168.11.61';
const DIFY_API_URL = process.env.DIFY_API_URL || `${DIFY_HOST}/v1/workflows/run`;
const DIFY_API_KEY = process.env.DIFY_API_KEY || '';
const DIFY_USER = process.env.DIFY_USER || 'erp-user';
const DIFY_INPUT_KEY = process.env.DIFY_INPUT_KEY || 'query';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return Response.json({ error: '消息不能为空' }, { status: 400 });
    }

    if (!DIFY_API_KEY) {
      return Response.json({ error: 'Dify API Key 未配置' }, { status: 500 });
    }

    const response = await fetch(DIFY_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${DIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {
          [DIFY_INPUT_KEY]: message,
        },
        user: DIFY_USER,
        response_mode: 'blocking',
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
    const outputs = data.data?.outputs || {};
    const answer =
      outputs.output ||
      outputs.text ||
      Object.values(outputs).find(value => typeof value === 'string' && value.trim()) ||
      '抱歉，暂时无法回答';

    return Response.json({
      answer,
      workflow_run_id: data.workflow_run_id,
    });
  } catch (error) {
    console.error('Dify API Error:', error);
    return Response.json({ error: '处理请求失败' }, { status: 500 });
  }
}
