// OpenRouter API service using Netlify Functions

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ModelInfo {
  id: string;
  name: string;
  context_length?: number;
}

interface ChatOptions {
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  [key: string]: any;
}

interface ChatResponse {
  role: 'assistant';
  content: string;
  id?: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

type Provider = 'openrouter' | 'groq';

class ChatService {
  private provider: Provider = 'openrouter';
  private readonly apiUrl = '/.netlify/functions/chat';
  private readonly groqApiUrl = '/.netlify/functions/groq';

  /**
   * Send a message to the chat provider.
   */
  async sendMessage(
    messages: ChatMessage[], 
    model: string = "openai/gpt-4.1", 
    options: ChatOptions = {}
  ): Promise<ChatResponse> {
    try {
      const body = {
        messages: messages,
        model: model,
        ...options // Spread sampling params (e.g., temperature, top_p, etc.)
      };
      const url = this.provider === 'groq' ? this.groqApiUrl : this.apiUrl;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  setProvider(provider: Provider): void {
    this.provider = provider;
  }

  getProvider(): Provider {
    return this.provider;
  }

  // Get available models (optional feature)
  async getAvailableModels(): Promise<ModelInfo[]> {
    // Return models for the selected provider
    if (this.provider === 'groq') {
      try {
        const response = await fetch('/.netlify/functions/groq-models');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const availableModels = data.data || [];
        
        return availableModels.map((model: any) => ({
          id: model.id,
          name: model.name || model.id.split('/').pop(),
          context_length: model.context_length
        }));
      } catch (error) {
        console.error('Error fetching GROQ models:', error);
        // Fallback GROQ models - use actual GROQ model as default
        return [
          { id: 'moonshotai/kimi-k2-instruct', name: 'Kimi K2', context_length: 200000 },
          { id: 'llama3-70b-8192', name: 'Llama 3 70B', context_length: 8192 },
          { id: 'llama3-8b-8192', name: 'Llama 3 8B', context_length: 8192 },
          { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', context_length: 32768 },
          { id: 'gemma-7b-it', name: 'Gemma 7B IT', context_length: 8192 },
          { id: 'gemma2-9b-it', name: 'Gemma 2 9B IT', context_length: 8192 }
        ];
      }
    }
    // OpenRouter (default)
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models');
      const models: ModelInfo[] = [
        { id: 'moonshotai/kimi-k2', name: 'Kimi K2' },
        { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B Instruct' },
        { id: 'meta-llama/llama-3.1-8b-instruct', name: 'Llama 3 8B Instruct' },
        { id: 'openai/gpt-4.1', name: 'GPT-4.1' },
        { id: 'openai/gpt-4.1-mini', name: 'GPT-4.1 Mini' },
        { id: 'openai/gpt-4.1-nano', name: 'GPT-4.1 Nano' },
        { id: 'anthropic/claude-3.5-haiku', name: 'Claude 3.5 Haiku' },
        { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4' },
        { id: 'anthropic/claude-opus-4', name: 'Claude Opus 4' },
        { id: 'meta-llama/llama-4-scout-17b-16e-instruct', name: 'Llama 4 Scout 17b16e' },
        { id: 'meta-llama/llama-4-maverick-17b-128e-instruct', name: 'Llama 4 Maverick 17b128e' }
      ];
      const data = await response.json();
      const availableModels = data.data || models;
      return availableModels.map((model: any) => ({
        id: model.id,
        name: model.name || model.id.split('/').pop(),
        context_length: model.context_length
      }));
    } catch (error) {
      console.error('Error fetching models:', error);
      // Fallback to static model list
      return [
        { id: 'moonshotai/kimi-k2', name: 'Kimi K2' },
        { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B Instruct' },
        { id: 'meta-llama/llama-3.1-8b-instruct', name: 'Llama 3 8B Instruct' },
        { id: 'openai/gpt-4.1', name: 'GPT-4.1' },
        { id: 'openai/gpt-4.1-mini', name: 'GPT-4.1 Mini' },
        { id: 'openai/gpt-4.1-nano', name: 'GPT-4.1 Nano' },
        { id: 'anthropic/claude-3.5-haiku', name: 'Claude 3.5 Haiku' },
        { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4' },
        { id: 'anthropic/claude-opus-4', name: 'Claude Opus 4' },
        { id: 'meta-llama/llama-4-scout-17b-16e-instruct', name: 'Llama 4 Scout 17b16e' },
        { id: 'meta-llama/llama-4-maverick-17b-128e-instruct', name: 'Llama 4 Maverick 17b128e' }
      ];
    }
  }
}

export default new ChatService();