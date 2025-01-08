import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Validate API key presence
if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API Key');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { message, context } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Validate context format
    if (context && !Array.isArray(context)) {
      return NextResponse.json(
        { error: 'Context must be an array' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant. Provide clear and concise responses.',
        },
        ...(context || []),
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = completion.choices[0]?.message?.content;
    
    if (!reply) {
      throw new Error('No response generated');
    }

    return NextResponse.json({ message: reply });
  } catch (error: any) {
    console.error('OpenAI API Error:', error);
    
    // Handle specific error types
    if (error.code === 'invalid_api_key' || error.message?.includes('API key')) {
      return NextResponse.json(
        { error: 'API key error. Please check your configuration.' },
        { status: 401 }
      );
    }

    if (error.code === 'rate_limit_exceeded') {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: error.status || 500 }
    );
  }
} 