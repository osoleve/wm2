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
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models');
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching models:', error);
      throw error;
    }
  }
}

export default new ChatService();
