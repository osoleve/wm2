import { useState, useCallback } from 'react';
import chatService from '../services/chatService';
import prismService from '../services/prismService';
import { SYSTEM_PROMPT } from '../utils/systemPrompt';

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPrismEnabled, setIsPrismEnabled] = useState(false);

  const sendMessage = useCallback(async (content, model) => {
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
        const selectedPrisms = prismService.selectRandomPrisms(5, 10);
        console.log('Selected prisms:', selectedPrisms);
        
        // Generate responses from each prism perspective
        const prismResponses = await prismService.generatePrismResponses(
          content, 
          [...messages, userMessage], 
          model, 
          selectedPrisms
        );
        
        // Synthesize all perspectives into a final response
        aiResponse = await prismService.synthesizePrismResponses(
          content,
          prismResponses,
          SYSTEM_PROMPT,
          model
        );
      } else {
        // Standard mode: Direct response
        aiResponse = await chatService.sendMessage(conversationHistory, model);
      }
      
      setMessages(prev => [...prev, aiResponse]);
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
