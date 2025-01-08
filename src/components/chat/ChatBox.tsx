'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { MarkdownMessage } from './MarkdownMessage';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isChatActive, setIsChatActive] = useState(false);

  const scrollToBottom = () => {
    if (isChatActive && messagesEndRef.current) {
      const container = messagesEndRef.current.parentElement;
      if (container) {
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
        if (isNearBottom) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isChatActive]);

  useEffect(() => {
    if (messages.length > 0 && !isChatActive) {
      setIsChatActive(true);
    }
  }, [messages, isChatActive]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setError(null);
    const userMessage: Message = {
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const recentMessages = messages.slice(-3);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          context: recentMessages
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        const errorMessage = data.error || 'Failed to get response';
        if (response.status === 401) {
          throw new Error('API key error. Please check your configuration.');
        } else if (response.status === 429) {
          throw new Error('Too many requests. Please try again later.');
        }
        throw new Error(errorMessage);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.message) {
        throw new Error('No response received');
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message
      }]);
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`chat-container ${isChatActive ? 'chat-active' : 'chat-initial'}`}
    >
      {!isChatActive ? (
        <div className="flex flex-col space-y-6 max-w-xl w-full">
          <h1 className="text-4xl font-medium text-foreground text-center">
            What do you want to know?
          </h1>
          <form onSubmit={handleSubmit} className="w-full">
            <div className="flex items-center gap-2 p-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything..."
                className="flex-1 px-4 py-2.5 bg-background border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-base"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                disabled={isLoading}
                size="lg"
                className="transition-transform hover:scale-105 active:scale-95"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowRightIcon className="h-5 w-5" />
                )}
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="message-list message-list-active">
            {messages.map((message, index) => (
              <MarkdownMessage
                key={index}
                content={message.content}
                role={message.role}
              />
            ))}
            {isLoading && (
              <div className="typing-indicator">
                <div className="typing-dot" style={{ animationDelay: '0s' }} />
                <div className="typing-dot" style={{ animationDelay: '0.2s' }} />
                <div className="typing-dot" style={{ animationDelay: '0.4s' }} />
              </div>
            )}
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm rounded-lg px-4 py-2 mt-2 animate-fade-in">
                {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="input-container input-active">
            <div className="flex items-center gap-2 p-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything..."
                className="flex-1 px-4 py-2.5 bg-background border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-base"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                disabled={isLoading}
                className="transition-transform hover:scale-105 active:scale-95"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowRightIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
} 