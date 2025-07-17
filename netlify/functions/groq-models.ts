import Groq from 'groq-sdk';
import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

interface Model {
  id: string;
  name: string;
  context_length: number;
  created?: number;
}

interface GroqModel {
  id: string;
  context_window?: number;
  created?: number;
}

interface ModelsResponse {
  data: GroqModel[];
}

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'GET') {
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
    const models: ModelsResponse = await client.models.list();
    
    // Filter and format GROQ models
    const formattedModels: Model[] = models.data.map(model => ({
      id: model.id,
      name: model.id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      context_length: model.context_window || 8192,
      created: model.created
    }));

    console.log('GROQ models fetched:', formattedModels.length);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
      body: JSON.stringify({ data: formattedModels }),
    };
  } catch (error) {
    console.error('GROQ Models Error:', error);
    
    // Return fallback models if API fails - with Kimi K2 as default
    const fallbackModels: Model[] = [
      { id: 'moonshotai/kimi-k2', name: 'Kimi K2', context_length: 200000 },
      { id: 'llama3-70b-8192', name: 'Llama 3 70B', context_length: 8192 },
      { id: 'llama3-8b-8192', name: 'Llama 3 8B', context_length: 8192 },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', context_length: 32768 },
      { id: 'gemma-7b-it', name: 'Gemma 7B IT', context_length: 8192 },
      { id: 'gemma2-9b-it', name: 'Gemma 2 9B IT', context_length: 8192 }
    ];

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        data: fallbackModels,
        fallback: true,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};