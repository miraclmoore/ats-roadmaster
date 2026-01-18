'use client';

import { PageHeader } from '@/components/layout/page-header';
import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIDispatcherPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "10-4 good buddy! Roadie here on Channel 19. I'm your AI co-pilot ready to help you find the most profitable routes, save on fuel, and keep those wheels turning. What's your 20?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickPrompts = [
    'What are my money-making routes?',
    'Help me save on fuel costs',
    'Show me the numbers',
    'What should I haul next?',
  ];

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response || 'Sorry, I encountered an error. Please try again.',
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '❌ Sorry, I encountered an error. Please try again later.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <PageHeader
        title="Roadie - Channel 19"
        description="Your AI co-pilot on the CB - 10-4 good buddy!"
      />

      {/* CB Radio Container */}
      <div className="flex-1 bg-card rounded-lg border-2 border-border flex flex-col overflow-hidden relative">
        {/* CB Radio Top Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[rgb(var(--profit))]" />

        {/* Channel Display Header */}
        <div className="bg-secondary border-b-2 border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[rgb(var(--profit))] animate-pulse shadow-lg shadow-[rgb(var(--profit))]" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Channel 19 • Active</span>
          </div>
          <div className="text-xs text-muted-foreground font-mono">AI DISPATCHER</div>
        </div>
        {/* Messages - CB Radio Transmission Style */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-background">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                {/* CB Radio Handle/Name */}
                <div className="flex items-center gap-2 mb-1">
                  {message.role === 'assistant' && (
                    <>
                      <div className="w-2 h-2 rounded-full bg-[rgb(var(--profit))]" />
                      <span className="text-xs font-bold text-[rgb(var(--profit))] uppercase tracking-wider">Roadie</span>
                    </>
                  )}
                  {message.role === 'user' && (
                    <>
                      <span className="text-xs font-bold text-primary uppercase tracking-wider ml-auto">You</span>
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </>
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`rounded-lg px-4 py-3 border-2 ${
                    message.role === 'user'
                      ? 'bg-primary bg-opacity-20 border-primary text-foreground'
                      : 'bg-secondary border-border text-foreground'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[85%]">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-[rgb(var(--profit))]" />
                  <span className="text-xs font-bold text-[rgb(var(--profit))] uppercase tracking-wider">Roadie</span>
                </div>
                <div className="bg-secondary border-2 border-border rounded-lg px-4 py-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-[rgb(var(--profit))] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-[rgb(var(--profit))] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-[rgb(var(--profit))] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts - CB Channel Presets */}
        {messages.length === 1 && (
          <div className="px-6 py-4 border-t-2 border-border bg-secondary">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Quick Channels:</p>
            <div className="grid grid-cols-2 gap-2">
              {quickPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleSend(prompt)}
                  className="text-left px-4 py-3 text-sm bg-card hover:bg-primary hover:bg-opacity-20 border-2 border-border hover:border-primary rounded transition-all font-semibold text-foreground"
                >
                  <span className="text-xs text-primary font-bold">CH {index + 1}</span>
                  <br />
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input - CB Radio Mic */}
        <div className="p-4 border-t-2 border-border bg-secondary">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Breaker breaker, what's your question...?"
              className="flex-1 px-4 py-3 bg-card border-2 border-border rounded text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none font-medium"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="px-8 py-3 bg-[rgb(var(--profit))] hover:bg-[rgb(var(--profit))] hover:opacity-90 disabled:bg-muted disabled:cursor-not-allowed text-background font-bold rounded transition-all uppercase tracking-wide border-2 border-transparent hover:border-[rgb(var(--profit))] disabled:border-border"
            >
              {isLoading ? 'Transmitting...' : '10-4'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
