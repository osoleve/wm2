import OpenAI from 'openai';

// OpenRouter API service using OpenAI SDK
class ChatService {
  constructor() {
    // Debug logging for deployment
    console.log('API Key exists:', !!import.meta.env.VITE_OPENROUTER_API_KEY);
    console.log('Current origin:', window.location.origin);
    
    this.client = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
      defaultHeaders: {
        "HTTP-Referer": window.location.origin, // To identify your app
        "X-Title": "React Chat App", // Optional: your app name
      }
    });
  }

  async sendMessage(messages, model = "openai/gpt-3.5-turbo") {
    try {
      const completion = await this.client.chat.completions.create({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      });

      return completion.choices[0].message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Get available models (optional feature)
  async getAvailableModels() {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'React Chat App',
        },
      });
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching models:', error);
      throw error;
    }
  }
}

export default new ChatService();
