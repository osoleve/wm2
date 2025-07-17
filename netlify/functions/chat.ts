import OpenAI from 'openai';
import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.URL,
    "X-Title": "Wittgenstein's Monster",
  }
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
  // Handle CORS preflight
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
    const { messages, model = "openai/gpt-4.1" }: ChatRequest = JSON.parse(event.body || '{}');

    // Log the incoming messages for debugging
    console.log('Incoming messages:', JSON.stringify(messages, null, 2));
    console.log('Model:', model);

    // Filter out custom properties that might cause issues
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

    // Log the response for debugging
    console.log('OpenRouter response:', JSON.stringify(completion.choices[0].message, null, 2));

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
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: 'Failed to get response', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
    };
  }
};