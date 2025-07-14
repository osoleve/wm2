// OpenRouter API service using Netlify Functions
class ChatService {
  constructor() {
    // Use Netlify function instead of direct API calls
    this.apiUrl = '/.netlify/functions/chat';
    this.isDevelopment = import.meta.env.DEV;
  }

  async sendMessage(messages, model = "openai/gpt-4.1") {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages,
          model: model
        })
      });

      if (!response.ok) {
        if (response.status === 404 && this.isDevelopment) {
          throw new Error('Development server detected. Please run "npm run dev:netlify" instead of "npm run dev" to enable chat functionality.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Get available models (optional feature)
  async getAvailableModels() {
    // Til I can figure out how to only list models from certain providers
    if (this.isDevelopment) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models');
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching models:', error);
      throw error;
    }
  } else {
    return [
      { id: 'moonshotai/kimi-k2', name: 'Kimi K2' },
      { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B Instruct' },
      { id: 'meta-llama/llama-3.1-8b-instruct', name: 'Llama 3 8B Instruct' },
      { id: 'openai/gpt-4.1', name: 'GPT-4.1' },
      { id: 'openai/gpt-4.1-mini', name: 'GPT-4.1 Mini' },
      { id: 'openai/gpt-4.1-nano', name: 'GPT-4.1 Nano' },
      { id: 'anthropic/claude-3.5-haiku:beta', name: 'Claude 3.5 Haiku Beta' },
      { id: 'meta-llama/llama-4-scout-17b-16e-instruct', name: 'Llama 4 Scout 17b16e' },
      { id: 'meta-llama/llama-4-maverick-17b-128e-instruct', name: 'Llama 4 Maverick 17b128e' }
    ];
  }
  }
}

export default new ChatService();
