// src/components/Chatbot.tsx

'use client';

import { useState } from 'react';
import { Bot, Send, User, X } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/hunyuan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) throw new Error('网络请求失败');

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.Choices[0]?.Message?.Content || '抱歉，我无法回答这个问题。',
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chatbot Error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '发生错误，请稍后再试。' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition duration-200"
        aria-label="打开聊天机器人"
      >
        <Bot size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border dark:border-gray-700 flex flex-col h-[70vh] overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 bg-gray-100 dark:bg-gray-800 border-b dark:border-gray-700">
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">🎬 AI 影视助手</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-red-500 transition"
        >
          <X size={20} />
        </button>
      </div>

      {/* Message Area */}
      <div className="flex-1 px-4 py-3 overflow-y-auto space-y-4 bg-gray-50 dark:bg-gray-900">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
          >
            {msg.role === 'assistant' && (
              <Bot className="w-6 h-6 text-green-500 mt-1" />
            )}
            <div
              className={`max-w-[75%] px-4 py-2 rounded-xl shadow-sm text-sm leading-relaxed break-words ${msg.role === 'user'
                  ? 'bg-green-600 text-white rounded-br-none'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none'
                }`}
            >
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <User className="w-6 h-6 text-gray-400 mt-1" />
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-2 justify-start">
            <Bot className="w-6 h-6 text-green-500 mt-1" />
            <div className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 flex space-x-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-200" />
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-400" />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="px-4 py-3 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="问我任何关于影视的问题..."
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white p-2 rounded-lg hover:from-green-600 hover:to-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
