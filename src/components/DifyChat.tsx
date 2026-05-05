'use client';

import { useEffect, useRef, useState } from 'react';
import { RefreshCw, Rocket, X } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface DifyResponse {
  answer?: string;
  error?: string;
  errorType?: string;
  conversation_id?: string;
}

interface DifyChatProps {
  onClose: () => void;
}

const QUICK_QUESTIONS = [
  '查看最近订单',
  '查看库存预警',
  '查询客户列表',
];

const STORAGE_KEY = 'tianshang-erp-dify-conversation-id';

export default function DifyChat({ onClose }: DifyChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '您好，我是天商 ERP 智能客服助手，有什么可以帮助您的吗？',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState('');
  const [lastQuestion, setLastQuestion] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedConversationId = window.localStorage.getItem(STORAGE_KEY);
    if (savedConversationId) {
      setConversationId(savedConversationId);
    }
  }, []);

  useEffect(() => {
    if (conversationId) {
      window.localStorage.setItem(STORAGE_KEY, conversationId);
      return;
    }

    window.localStorage.removeItem(STORAGE_KEY);
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (rawMessage: string) => {
    const message = rawMessage.trim();
    if (!message || loading) return;

    setMessages((prev) => [...prev, { role: 'user', content: message }]);
    setInput('');
    setLastQuestion(message);
    setLoading(true);

    try {
      const response = await fetch('/api/dify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          conversation_id: conversationId,
        }),
      });

      const data = (await response.json()) as DifyResponse;

      if (data.conversation_id) {
        setConversationId(data.conversation_id);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer || data.error || '抱歉，暂时无法回答。',
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '抱歉，服务暂时不可用，请稍后重试。',
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

  const handleResetConversation = () => {
    setConversationId('');
    setMessages([
      {
        role: 'assistant',
        content: '已为您开启新会话。请告诉我您想查询什么业务信息。',
      },
    ]);
  };

  return (
    <div className="fixed bottom-20 right-4 z-50 flex h-[32rem] w-96 max-w-[calc(100vw-2rem)] flex-col rounded-lg border border-gray-200 bg-white shadow-2xl">
      <div className="flex items-center justify-between rounded-t-lg bg-gradient-to-r from-orange-500 to-red-500 p-3 text-white">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
            <Rocket className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold">天商 ERP 智能客服助手</div>
            <div className="text-xs opacity-80">
              {conversationId ? '已连接历史会话' : '天商 ERP 在线客服'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetConversation}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
            title="新建会话"
            type="button"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="border-b border-gray-200 bg-white px-3 py-2">
        <div className="flex flex-wrap gap-2">
          {QUICK_QUESTIONS.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => void sendMessage(question)}
              disabled={loading}
              className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs text-orange-700 transition-colors hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-3">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-6 ${
                message.role === 'user'
                  ? 'bg-orange-500 text-white'
                  : 'border border-gray-200 bg-white text-gray-800'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500">
              <span className="animate-pulse">思考中...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 bg-white px-3 py-2 text-xs text-gray-500">
        {lastQuestion ? `上次提问：${lastQuestion}` : '可连续追问，系统会保留当前会话上下文。'}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-gray-200 bg-white p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="输入问题..."
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            发送
          </button>
        </div>
      </form>
    </div>
  );
}
