import Groq from 'groq-sdk';
import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
}

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { messages, model = "moonshotai/kimi-k2-instruct" }: ChatRequest = JSON.parse(event.body || '{}');
    console.log('GROQ Incoming messages:', JSON.stringify(messages, null, 2));
    console.log('GROQ Model:', model);

    // Filter out custom properties that GROQ doesn't support
    const cleanMessages: ChatMessage[] = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const completion = await client.chat.completions.create({
      model: model,
      messages: cleanMessages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    console.log('GROQ response:', JSON.stringify(completion.choices[0].message, null, 2));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: JSON.stringify(completion.choices[0].message),
    };
  } catch (error) {
    console.error('GROQ Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: 'Failed to get response from GROQ', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
    };
  }
};