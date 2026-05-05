'use client';

import { useEffect, useRef, useState } from 'react';
import { Rocket, X } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface DifyChatProps {
  onClose: () => void;
}

export default function DifyChat({ onClose }: DifyChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '您好，我是 ERP 智能客服助手，有什么可以帮助您的吗？',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const message = input.trim();
    if (!message || loading) return;

    setMessages((prev) => [...prev, { role: 'user', content: message }]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/dify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      const data = (await response.json()) as { answer?: string; error?: string };

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

  return (
    <div className="fixed bottom-20 right-4 z-50 flex h-96 w-80 flex-col rounded-lg border border-gray-200 bg-white shadow-2xl">
      <div className="flex items-center justify-between rounded-t-lg bg-gradient-to-r from-orange-500 to-red-500 p-3 text-white">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
            <Rocket className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold">ERP 智能客服助手</div>
            <div className="text-xs opacity-80">天商 ERP 在线客服</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-3">
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
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

      <form onSubmit={handleSubmit} className="rounded-b-lg border-t border-gray-200 bg-white p-3">
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
