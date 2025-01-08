/**
 * This file contains the chat route handler.
 */

import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import {
  assistantPersonality,
  personalityTraits,
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

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Get a random greeting from the array
function getRandomGreeting(): string {
  const greetings = responsePatterns.greeting;
  if (Array.isArray(greetings)) {
    const randomIndex = Math.floor(Math.random() * greetings.length);
    return greetings[randomIndex];
  }
  return typeof greetings === 'string' ? greetings : 'Hi! How can I help you?';
}

export async function POST(req: Request) {
  try {
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
    const temperature = 0.65 + personalityTraits.enthusiasm * 0.2; // Range: 0.65-0.85
    const maxTokens = Math.floor(600 + personalityTraits.detail * 600); // Range: 600-1200, balanced for both concise and detailed responses
    const presencePenalty = personalityTraits.creativity * 0.35; // Range: 0-0.35, balanced for variety
    const frequencyPenalty = personalityTraits.formality * 0.35; // Range: 0-0.35, balanced for natural flow

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using GPT-4o Mini model
      messages,
      temperature,
      max_tokens: maxTokens,
      presence_penalty: presencePenalty,
      frequency_penalty: frequencyPenalty,
      top_p: 0.9,
    });

    const reply = completion.choices[0]?.message?.content;

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
      { status: (error instanceof Error && 'status' in error ? error.status : 500) as number }
    );
  }
}
