import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { assistantPersonality, personalityTraits, responsePatterns } from '@/config/assistant-personality';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  try {
    const { message, context = [] } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 401 }
      );
    }

    // Prepare messages array with personality context and conversation history
    const messages = [
      // Add personality context as system message
      {
        role: 'system',
        content: assistantPersonality
      },
      // Add initial greeting for first message if no context
      ...(context.length === 0 ? [{
        role: 'assistant',
        content: responsePatterns.greeting
      }] : []),
      // Add recent conversation context
      ...context.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      // Add current user message
      {
        role: 'user',
        content: message
      }
    ];

    // Adjust API parameters based on personality traits
    const temperature = 0.6 + (personalityTraits.enthusiasm * 0.2); // Range: 0.6-0.8
    const maxTokens = Math.floor(300 + (personalityTraits.detail * 400)); // Range: 300-700
    const presencePenalty = personalityTraits.creativity * 0.4; // Range: 0-0.4
    const frequencyPenalty = personalityTraits.formality * 0.4; // Range: 0-0.4

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      temperature: temperature,
      max_tokens: maxTokens,
      presence_penalty: presencePenalty,
      frequency_penalty: frequencyPenalty,
    });

    const reply = completion.choices[0]?.message?.content;

    if (!reply) {
      throw new Error('No reply from OpenAI');
    }

    return NextResponse.json({ message: reply });
  } catch (error: any) {
    console.error('Error in chat API:', error);
    
    // Use personality-appropriate error message
    const errorMessage = error.message === 'No reply from OpenAI' 
      ? responsePatterns.error 
      : error.message || 'Internal server error';

    return NextResponse.json(
      { error: errorMessage },
      { status: error.status || 500 }
    );
  }
} 