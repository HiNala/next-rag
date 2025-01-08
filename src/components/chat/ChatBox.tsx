'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { MarkdownMessage } from './MarkdownMessage';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export default function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isChatActive, setIsChatActive] = useState(false);

  const scrollToBottom = useCallback(() => {
    if (isChatActive && messagesEndRef.current) {
      const container = messagesEndRef.current.parentElement;
      if (container) {
        const isNearBottom =
          container.scrollHeight - container.scrollTop - container.clientHeight < 100;
        if (isNearBottom) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }, [isChatActive]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (messages.length > 0 && !isChatActive) {
      setIsChatActive(true);
    }
  }, [messages, isChatActive]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Trim input and check for empty state
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    // Clear error state and prepare message
    setError(null);
    const userMessage: Message = {
      role: 'user',
      content: trimmedInput,
    };

    try {
      // Set loading state before any state updates
      setIsLoading(true);
      
      // Update messages with user input
      setMessages((prev) => [...prev, userMessage]);
      setInput('');

      // Get recent context
      const recentMessages = messages.slice(-3);

      // Make API request
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmedInput,
          context: recentMessages,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = data.error || 'Failed to get response';
        if (response.status === 401) {
          errorMessage = 'Chat is currently unavailable. Please try again later.';
        } else if (response.status === 429) {
          errorMessage = 'Too many requests. Please wait a moment and try again.';
        }
        throw new Error(errorMessage);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.message) {
        throw new Error('No response received');
      }

      // Update messages with assistant response
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.message,
        },
      ]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      
      // Only add error message to chat if the user message was added
      setMessages((prev) => {
        // Check if the last message was the user's message
        if (prev.length > 0 && prev[prev.length - 1].role === 'user') {
          return [
            ...prev,
            {
              role: 'assistant',
              content: 'I apologize, but I encountered an error. Please try again in a moment.',
            },
          ];
        }
        return prev;
      });
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
          <form onSubmit={handleSubmit}>
            <div className="chat-input-wrapper">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything..."
                className="chat-input"
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
              <MarkdownMessage key={index} content={message.content} role={message.role} />
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
            <div className="chat-input-wrapper">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything..."
                className="chat-input"
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
