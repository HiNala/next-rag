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

// Additional formatting reminder for each query
const formattingReminder = `
Format your response with clear structure and spacing:

1. Headers and Sections:
   - Use ## for main headers
   - Add two line breaks after each header
   - Start sections with a brief introduction

2. Spacing and Paragraphs:
   - Add empty lines between paragraphs
   - Use double line breaks between sections
   - Keep paragraphs short (2-3 sentences)

3. Lists and Points:
   - Add line breaks before and after lists
   - End each bullet point with punctuation
   - Use sub-bullets for related details
   - Add a line break after each major point

4. Emphasis and Formatting:
   - Bold (**) key terms and important concepts
   - Use horizontal rules (---) between major sections
   - Create clear visual hierarchy with spacing

Remember: Each section should be visually distinct with proper spacing.
`;

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
      {
        role: 'system',
        content: formattingReminder,
      } as ChatCompletionMessageParam,
      ...(context.length === 0
        ? [
            {
              role: 'assistant',
              content: responsePatterns.greeting,
            } as ChatCompletionMessageParam,
          ]
        : []),
      ...contextMessages,
      {
        role: 'user',
        content:
          message +
          '\n\nPlease format your response clearly using markdown, with proper spacing and structure.',
      } as ChatCompletionMessageParam,
    ];

    // Adjust API parameters based on personality traits
    const temperature = 0.7 + personalityTraits.enthusiasm * 0.2; // Range: 0.7-0.9
    const maxTokens = Math.floor(400 + personalityTraits.detail * 400); // Range: 400-800
    const presencePenalty = personalityTraits.creativity * 0.4; // Range: 0-0.4
    const frequencyPenalty = personalityTraits.formality * 0.4; // Range: 0-0.4

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
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
