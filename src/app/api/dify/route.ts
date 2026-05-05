import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

const DIFY_HOST = 'http://192.168.218.150';
const DIFY_API_URL = `${DIFY_HOST}/v1/chat-messages`;
const DIFY_API_KEY = 'app-m98vgjZqGRVPueTyEvWhHaut';
const DIFY_USER = 'erp-user';
const DIFY_TIMEOUT_MS = 20000;

export async function POST(request: NextRequest) {
  try {
    const { message, conversation_id } = await request.json();

    if (!message || typeof message !== 'string') {
      return Response.json(
        { error: '消息不能为空', errorType: 'validation_error' },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DIFY_TIMEOUT_MS);

    try {
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
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Dify API Error:', errorText);

        const errorType =
          response.status === 401 || response.status === 403
            ? 'auth_error'
            : response.status >= 500
              ? 'upstream_server_error'
              : 'upstream_request_error';

        return Response.json(
          {
            error: `Dify服务调用失败: ${errorText}`,
            errorType,
          },
          { status: response.status }
        );
      }

      const data = await response.json();

      return Response.json({
        answer: data.answer || '抱歉，暂时无法回答。',
        conversation_id: data.conversation_id,
      });
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  } catch (error) {
    console.error('Dify API Error:', error);

    if (error instanceof Error && error.name === 'AbortError') {
      return Response.json(
        {
          error: 'Dify 响应超时，请稍后重试。',
          errorType: 'timeout_error',
        },
        { status: 504 }
      );
    }

    return Response.json(
      {
        error: '处理请求失败，请检查 Dify 服务是否可用。',
        errorType: 'network_error',
      },
      { status: 500 }
    );
  }
}
