// OpenRouter API service using Netlify Functions
class ChatService {
  constructor() {
    // Use Netlify function instead of direct API calls
    this.apiUrl = '/.netlify/functions/chat';
  }

  async sendMessage(messages, model = "openai/gpt-3.5-turbo") {
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
