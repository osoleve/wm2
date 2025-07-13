import { useState, useCallback } from 'react';
import chatService from '../services/chatService';
import prismService from '../services/prismService';
import loggingService from '../services/loggingService';
import { SYSTEM_PROMPT } from '../utils/systemPrompt';


export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPrismEnabled, setIsPrismEnabled] = useState(false);

  // Accept both chat and prism models
  const sendMessage = useCallback(async (content, model, prismModel) => {
    if (!content.trim()) return;

    const userMessage = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Create conversation history with system prompt
      const systemMessage = { role: 'system', content: SYSTEM_PROMPT };
      const conversationHistory = [systemMessage, ...messages, userMessage];

      let aiResponse;

      if (isPrismEnabled) {
        // Prism mode: Generate multi-perspective response
        aiResponse = await prismService.generateCompletePrismResponse(
          content,
          conversationHistory,
          prismModel || model, // Use prism model for prism steps
          model // Use main chat model for synthesis
        );
      } else {
        // Standard mode: Direct response
        aiResponse = await chatService.sendMessage(conversationHistory, model);
      }
      
      setMessages(prev => [...prev, aiResponse]);
      
      // Log the message exchange
      loggingService.logMessage(content, aiResponse, model, isPrismEnabled);
    } catch (err) {
      setError(err.message || 'Failed to send message');
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isPrismEnabled]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    // Start a new session when clearing chat
    loggingService.clearCurrentSession();
  }, []);

  const togglePrism = useCallback(() => {
    setIsPrismEnabled(prev => !prev);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    isPrismEnabled,
    togglePrism
  };
};
