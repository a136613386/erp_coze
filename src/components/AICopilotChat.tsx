'use client';

import { useEffect, useRef, useState } from 'react';
import { Bot, Database, FileText, RefreshCw, Send, X } from 'lucide-react';

import { cn } from '@/lib/utils';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  traceId?: string;
  latencyMs?: number;
  tools?: ToolCall[];
  sources?: SourceReference[];
};

type ToolCall = {
  name: string;
  status: 'success' | 'error';
  latency_ms?: number;
  summary?: string;
};

type SourceReference = {
  title: string;
  type: 'database' | 'knowledge';
  reference?: string;
};

type AiChatResponse = {
  answer?: string;
  trace_id?: string;
  latency_ms?: number;
  tools?: ToolCall[];
  sources?: SourceReference[];
  error?: string;
};

type AICopilotChatProps = {
  onClose: () => void;
};

const QUICK_QUESTIONS = [
  '分析当前经营概览',
  '检查库存风险',
  '分析待收款风险',
  '说明最近订单对库存的影响',
];

export default function AICopilotChat({ onClose }: AICopilotChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: '我是 ERP Copilot，可以基于业务数据和知识库分析经营、库存和回款风险。',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (rawMessage: string) => {
    const message = rawMessage.trim();
    if (!message || loading) return;

    setMessages((prev) => [...prev, { role: 'user', content: message }]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          tenant_id: 'demo_tenant',
          user_role: 'manager',
        }),
      });

      const data = (await response.json()) as AiChatResponse;
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer || data.error || 'AI 服务暂时没有返回内容。',
          traceId: data.trace_id,
          latencyMs: data.latency_ms,
          tools: data.tools ?? [],
          sources: data.sources ?? [],
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'AI 服务不可用，请确认 Python ai_service 已启动。',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await sendMessage(input);
  };

  const handleReset = () => {
    setMessages([
      {
        role: 'assistant',
        content: '已开启新会话。请选择一个经营问题，或直接输入要分析的 ERP 业务场景。',
      },
    ]);
  };

  return (
    <div className="fixed bottom-20 right-4 z-50 flex h-[36rem] w-[28rem] max-w-[calc(100vw-2rem)] flex-col rounded-lg border border-slate-200 bg-white shadow-2xl">
      <div className="flex items-center justify-between rounded-t-lg bg-slate-900 p-3 text-white">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold">ERP RAG Copilot</div>
            <div className="text-xs text-slate-300">工具调用 / RAG 引用 / Trace 可审计</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
            title="新建会话"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
            title="关闭"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="border-b border-slate-200 bg-white px-3 py-2">
        <div className="grid grid-cols-2 gap-2">
          {QUICK_QUESTIONS.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => void sendMessage(question)}
              disabled={loading}
              className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-3">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            <div
              className={cn(
                'max-w-[86%] rounded-lg px-3 py-2 text-sm leading-6',
                message.role === 'user'
                  ? 'bg-cyan-600 text-white'
                  : 'border border-slate-200 bg-white text-slate-800'
              )}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>

              {message.role === 'assistant' && Boolean(message.tools?.length) && (
                <div className="mt-3 space-y-1 border-t border-slate-100 pt-2">
                  {message.tools?.map((tool) => (
                    <div key={`${tool.name}-${tool.latency_ms}`} className="flex items-start gap-2 text-xs text-slate-600">
                      <Database className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>
                        {tool.name} · {tool.status}
                        {typeof tool.latency_ms === 'number' ? ` · ${tool.latency_ms}ms` : ''}
                        {tool.summary ? ` · ${tool.summary}` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {message.role === 'assistant' && Boolean(message.sources?.length) && (
                <div className="mt-2 space-y-1">
                  {message.sources?.map((source) => (
                    <div key={`${source.type}-${source.title}`} className="flex items-start gap-2 text-xs text-slate-600">
                      <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>
                        {source.title}
                        {source.reference ? ` · ${source.reference}` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {message.role === 'assistant' && (message.traceId || message.latencyMs) && (
                <div className="mt-2 border-t border-slate-100 pt-2 font-mono text-[11px] text-slate-400">
                  {message.traceId ? `trace_id=${message.traceId}` : ''}
                  {message.traceId && message.latencyMs ? ' · ' : ''}
                  {message.latencyMs ? `${message.latencyMs}ms` : ''}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">
              <span className="animate-pulse">分析中...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="输入经营、库存、回款或制度问题..."
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-9 w-10 items-center justify-center rounded-md bg-cyan-600 text-white transition-colors hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
            title="发送"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
