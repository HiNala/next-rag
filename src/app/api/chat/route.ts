/**
 * This file contains the chat route handler.
 */

import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkRateLimit, checkAnonymousRateLimit, getAnonymousMessageCount } from '@/lib/rate-limit';
import {
  assistantPersonality,
  responsePatterns,
} from '@/config/assistant-personality';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

type ChatRole = 'user' | 'assistant' | 'system';

interface ChatMessage {
  role: ChatRole;
  content: string;
}

interface ChatRequest {
  message: string;
  context: ChatMessage[];
}

interface APIError extends Error {
  status?: number;
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Get a random greeting from the array
function getRandomGreeting(): string {
  const greetings = responsePatterns.greeting;
  if (Array.isArray(greetings)) {
    const randomIndex = Math.floor(Math.random() * greetings.length);
    return greetings[randomIndex].replace(/^#+\s*/, '');
  }
  return typeof greetings === 'string' 
    ? greetings.replace(/^#+\s*/, '')
    : 'Hi! How can I help you?';
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    let shouldCheckRateLimit = true;
    let anonymousId: string | undefined;

    // Handle anonymous users
    if (!session?.user?.id) {
      // Use IP address or a session cookie as anonymous identifier
      anonymousId = req.headers.get('x-forwarded-for') || 'anonymous';
      
      const isAllowed = await checkAnonymousRateLimit(anonymousId);
      if (!isAllowed) {
        const usage = await getAnonymousMessageCount(anonymousId);
        const resetTime = new Date(Date.now() + usage.resetIn);
        const resetTimeString = resetTime.toLocaleTimeString();
        
        return NextResponse.json(
          { 
            error: 'Message limit reached',
            showAuth: true,
            message: `You've reached the limit for anonymous messages. Sign up or sign in to continue chatting and get more messages per day! 🚀\n\nYour limit will reset at ${resetTimeString}.`
          },
          { status: 429 }
        );
      }
      
      shouldCheckRateLimit = false;
    }

    // Check rate limit for authenticated users
    if (shouldCheckRateLimit && session?.user?.id) {
      try {
        await checkRateLimit(
          session.user.id,
          session.user.role === 'admin' ? req.headers.get('authorization')?.split(' ')[1] : undefined
        );
      } catch (error) {
        if (error instanceof Error) {
          return NextResponse.json({ error: error.message }, { status: 429 });
        }
        return NextResponse.json({ error: 'Rate limit error' }, { status: 429 });
      }
    }

    const { message, context = [] } = (await req.json()) as ChatRequest;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key is not configured' }, { status: 401 });
    }

    // Convert context messages to OpenAI format
    const contextMessages: ChatCompletionMessageParam[] = context.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })) as ChatCompletionMessageParam[];

    // Prepare messages array with personality context and conversation history
    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: assistantPersonality,
      } as ChatCompletionMessageParam,
      ...(context.length === 0
        ? [
            {
              role: 'assistant',
              content: getRandomGreeting(),
            } as ChatCompletionMessageParam,
          ]
        : []),
      ...contextMessages,
      {
        role: 'user',
        content: message,
      } as ChatCompletionMessageParam,
    ];

    // Adjust API parameters based on personality traits
    const temperature = 0.7;
    const maxTokens = 500;
    const presencePenalty = 0.1;
    const frequencyPenalty = 0.1;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature,
      max_tokens: maxTokens,
      presence_penalty: presencePenalty,
      frequency_penalty: frequencyPenalty,
      top_p: 0.9,
      stream: true,
    });

    let reply = '';
    for await (const chunk of completion) {
      if (chunk.choices[0]?.delta?.content) {
        reply += chunk.choices[0].delta.content;
      }
    }

    if (!reply) {
      throw new Error('No reply from OpenAI');
    }

    return NextResponse.json({ message: reply });
  } catch (error) {
    console.error('Error in chat API:', error);

    const errorMessage =
      error instanceof Error
        ? error.message === 'No reply from OpenAI'
          ? responsePatterns.error
          : error.message
        : 'Internal server error';

    return NextResponse.json(
      { error: errorMessage },
      {
        status: (error instanceof Error && (error as APIError).status) || 500,
      }
    );
  }
}
