'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, User, X } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello，Here's Hunyuan Uibo，What can I do for you？" },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

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

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.Choices[0]?.Message?.Content || '抱歉，我无法回答这个问题。',
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chatbot Error:', error);
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: '发生错误，请稍后再试。',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // 自动滚动到底部
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <>
      {/* 圆形四色按钮 */}
      {!isOpen && (

        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-[100px] right-6 z-50 p-4 rounded-full shadow-lg transition hover:scale-110 bg-gradient-to-br from-blue-500 via-red-400 to-green-400 text-white"
          aria-label="打开聊天机器人"
        >
          <Bot className="w-6 h-6 text-white drop-shadow" />
        </button>

      )}

      {/* 聊天框 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-[100px] right-6 z-50 w-[90vw] max-w-sm h-[70vh] flex flex-col rounded-3xl shadow-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 overflow-hidden"
          >
            {/* 顶部 */}
            <div className="flex justify-between items-center px-5 py-4 border-b dark:border-neutral-700 bg-white dark:bg-neutral-900">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Hunyuan Uibo</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-red-500 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* 消息区域 */}
            <div
              ref={chatRef}
              className="flex-1 px-4 py-4 overflow-y-auto space-y-4 bg-neutral-50 dark:bg-neutral-900"
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {/* 头像 */}
                  {msg.role === 'assistant' && (
                    <div className="relative">
                      <Bot className="w-7 h-7 text-blue-600" />
                    </div>
                  )}
                  {/* 气泡 */}
                  <div
                    className={`px-4 py-2 text-sm rounded-3xl max-w-[75%] leading-snug ${msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-gray-200 dark:bg-neutral-800 text-gray-900 dark:text-gray-200 rounded-bl-sm'
                      }`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === 'user' && <User className="w-7 h-7 text-gray-400" />}
                </div>
              ))}

              {/* AI 思考动画 */}
              {isLoading && (
                <div className="flex items-end gap-2">
                  <div className="relative w-7 h-7">
                    <span className="absolute inset-0 rounded-full bg-blue-400 opacity-75 animate-ping"></span>
                    <Bot className="w-7 h-7 text-blue-600 relative z-10" />
                  </div>
                  <div className="px-4 py-2 text-sm rounded-3xl bg-gray-200 dark:bg-neutral-800 text-gray-900 dark:text-gray-200 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-150" />
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-300" />
                  </div>
                </div>
              )}
            </div>

            {/* 输入框区域 */}
            <div className="px-4 py-3 border-t border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="说点什么..."
                  className="flex-1 px-4 py-2 text-sm rounded-full bg-gray-100 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
