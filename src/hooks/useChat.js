import { useState, useCallback } from 'react';
import chatService from '../services/chatService';
import prismService from '../services/prismService';
import loggingService from '../services/loggingService';
import { getSystemPrompt } from '../utils/systemPrompt';


export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPrismEnabled, setIsPrismEnabled] = useState(false);

  // Accept both chat and prism models
  const sendMessage = useCallback(async (content, model, prismModel, isSystemPromptEnabled) => {
    if (!content.trim()) return;

    const userMessage = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      let conversationHistory = [...messages, userMessage];
      
      if (isSystemPromptEnabled) {
        // Get system prompt asynchronously
        const systemPrompt = await getSystemPrompt();
        console.log('System prompt loaded:', systemPrompt.substring(0, 100) + '...');

        // Create conversation history with system prompt
        const systemMessage = { role: 'system', content: systemPrompt };
        conversationHistory = [systemMessage, ...conversationHistory];
      }
      
      console.log('Conversation history:', conversationHistory.map(m => ({ role: m.role, content: m.content?.substring(0, 50) + '...' })));

      let aiResponse;

      if (isPrismEnabled) {
        // Prism mode: Generate multi-perspective response
        aiResponse = await prismService.generateCompletePrismResponse(
          content,
          conversationHistory,
          prismModel || model, // Use prism model for prism steps
          model, // Use main chat model for synthesis
          isSystemPromptEnabled
        );
      } else {
        // Standard mode: Direct response
        aiResponse = await chatService.sendMessage(conversationHistory, model);
      }
      
      setMessages(prev => [...prev, aiResponse]);
      
      // Log the message exchange (with error handling)
      try {
        loggingService.logMessage(content, aiResponse, model, isPrismEnabled);
      } catch (loggingError) {
        console.error('Logging error (non-fatal):', loggingError);
      }
    } catch (err) {
      setError(err.message || 'Failed to send message');
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isPrismEnabled]);

  const regenerateMessage = useCallback(async (messageIndex, model, prismModel, isSystemPromptEnabled) => {
    const userMessage = messages[messageIndex - 1];
    if (!userMessage || userMessage.role !== 'user') return;

    const historyToRegenerate = messages.slice(0, messageIndex - 1);

    setIsLoading(true);
    setError(null);

    try {
      let conversationHistory = [...historyToRegenerate, userMessage];

      if (isSystemPromptEnabled) {
        const systemPrompt = await getSystemPrompt();
        const systemMessage = { role: 'system', content: systemPrompt };
        conversationHistory = [systemMessage, ...conversationHistory];
      }

      let aiResponse;

      if (isPrismEnabled) {
        aiResponse = await prismService.generateCompletePrismResponse(
          userMessage.content,
          conversationHistory,
          prismModel || model,
          model,
          isSystemPromptEnabled
        );
      } else {
        aiResponse = await chatService.sendMessage(conversationHistory, model);
      }

      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[messageIndex] = aiResponse;
        return newMessages;
      });

      try {
        loggingService.logMessage(userMessage.content, aiResponse, model, isPrismEnabled);
      } catch (loggingError) {
        console.error('Logging error (non-fatal):', loggingError);
      }
    } catch (err) {
      setError(err.message || 'Failed to regenerate message');
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
    togglePrism,
    regenerateMessage
  };
};
