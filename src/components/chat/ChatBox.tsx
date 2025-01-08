'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    <div className="chat-container">
      <div className="message-list">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message-bubble ${
              message.role === 'user' ? 'message-user' : 'message-assistant'
            }`}
          >
            {message.content}
          </div>
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

      <form onSubmit={handleSubmit} className="input-container">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
    </div>
  );
} 