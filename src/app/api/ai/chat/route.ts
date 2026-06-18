import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const DEFAULT_AI_SERVICE_URL = 'http://127.0.0.1:8001';
const AI_CHAT_TIMEOUT_MS = 30000;

type AiServiceResponse = {
  answer?: string;
  trace_id?: string;
  latency_ms?: number;
  tools?: Array<{
    name: string;
    status: 'success' | 'error';
    latency_ms?: number;
    summary?: string;
  }>;
  sources?: Array<{
    title: string;
    type: 'database' | 'knowledge';
    reference?: string;
  }>;
  error?: string;
};

function getAiChatUrl() {
  const baseUrl = (process.env.AI_SERVICE_URL ?? DEFAULT_AI_SERVICE_URL).replace(/\/$/, '');
  return `${baseUrl}/chat`;
}

export async function POST(request: NextRequest) {
  const startedAt = Date.now();

  try {
    const body = await request.json();
    const { message, tenant_id = 'demo_tenant', user_role = 'manager' } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_CHAT_TIMEOUT_MS);

    try {
      const response = await fetch(getAiChatUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          tenant_id,
          user_role,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = (await response.json().catch(() => ({}))) as AiServiceResponse;

      if (!response.ok) {
        return NextResponse.json(
          {
            error: data.error ?? 'AI service request failed',
            trace_id: data.trace_id,
            latency_ms: Date.now() - startedAt,
          },
          { status: response.status }
        );
      }

      return NextResponse.json({
        answer: data.answer ?? '',
        trace_id: data.trace_id,
        latency_ms: data.latency_ms ?? Date.now() - startedAt,
        tools: data.tools ?? [],
        sources: data.sources ?? [],
      });
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === 'AbortError';

    return NextResponse.json(
      {
        error: isTimeout
          ? 'AI service response timed out'
          : 'AI service is unavailable. Start ai_service or check AI_SERVICE_URL.',
        latency_ms: Date.now() - startedAt,
      },
      { status: isTimeout ? 504 : 503 }
    );
  }
}
