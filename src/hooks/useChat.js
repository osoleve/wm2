import { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'https://jspm.dev/uuid@9.0.1';
import chatService from '../services/chatService';
import prismService from '../services/prismService';
import loggingService from '../services/loggingService';
import { getSystemPrompt } from '../utils/systemPrompt';


export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [conversationTree, setConversationTree] = useState(new Map());
  const [activePath, setActivePath] = useState([]);
  const [branchPoints, setBranchPoints] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPrismEnabled, setIsPrismEnabled] = useState(false);

  // Accept both chat and prism models
  const sendMessage = useCallback(async (content, model, prismModel, isSystemPromptEnabled) => {
    if (!content.trim()) return;

    const userMessage = { 
      id: uuidv4(),
      role: 'user', 
      content,
      timestamp: Date.now(),
      parentId: null,
      children: []
    };
    
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
      
      // Ensure AI response has proper structure
      if (!aiResponse.id) {
        aiResponse.id = uuidv4();
      }
      aiResponse.timestamp = Date.now();
      aiResponse.parentId = userMessage.id;
      aiResponse.children = [];
      
      setMessages(prev => [...prev, aiResponse]);
      
      // Update conversation tree
      setConversationTree(prev => {
        const newTree = new Map(prev);
        newTree.set(userMessage.id, userMessage);
        newTree.set(aiResponse.id, aiResponse);
        
        // Link parent-child relationship
        userMessage.children = [aiResponse.id];
        newTree.set(userMessage.id, userMessage);
        
        return newTree;
      });
      
      // Update active path
      setActivePath(prev => [...prev, userMessage.id, aiResponse.id]);
      
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

  const clearChat = useCallback(() => {
    setMessages([]);
    setConversationTree(new Map());
    setActivePath([]);
    setBranchPoints(new Set());
    setError(null);
    // Start a new session when clearing chat
    loggingService.clearCurrentSession();
  }, []);

  const togglePrism = useCallback(() => {
    setIsPrismEnabled(prev => !prev);
  }, []);

  // Add a new message with parent-child relationship
  const addMessage = useCallback((content, role = 'user', parentId = null) => {
    const newMessage = {
      id: uuidv4(),
      content,
      role,
      timestamp: Date.now(),
      parentId,
      children: []
    };

    setMessages(prev => [...prev, newMessage]);
    
    // Update conversation tree
    setConversationTree(prev => {
      const newTree = new Map(prev);
      newTree.set(newMessage.id, newMessage);
      
      if (parentId) {
        const parent = newTree.get(parentId);
        if (parent) {
          parent.children = [...(parent.children || []), newMessage.id];
          newTree.set(parentId, parent);
        }
      }
      
      return newTree;
    });

    // Update active path
    if (parentId) {
      setActivePath(prev => [...prev.filter(id => id !== parentId), parentId, newMessage.id]);
    } else {
      setActivePath(prev => [...prev, newMessage.id]);
    }

    return newMessage.id;
  }, []);

  // Edit a message and create a new branch
  const editMessage = useCallback(async (messageId, newContent) => {
    const originalMessage = messages.find(m => m.id === messageId);
    if (!originalMessage) return;

    // Remove all messages after the edited message (including AI responses)
    const messageIndex = messages.findIndex(m => m.id === messageId);
    const messagesToKeep = messages.slice(0, messageIndex);
    
    // Create edited version with new ID but keep it in the same position
    const editedMessage = {
      id: uuidv4(),
      content: newContent,
      role: originalMessage.role,
      timestamp: Date.now(),
      parentId: originalMessage.parentId,
      children: [],
      isEdited: true,
      originalId: messageId,
      versions: [...(originalMessage.versions || []), {
        id: originalMessage.id,
        content: originalMessage.content,
        timestamp: originalMessage.timestamp
      }]
    };

    // Update messages to include the edited message
    setMessages([...messagesToKeep, editedMessage]);
    
    // Update conversation tree
    setConversationTree(prev => {
      const newTree = new Map(prev);
      
      // Remove all messages after the edited one from the tree
      const toRemove = messages.slice(messageIndex + 1);
      toRemove.forEach(msg => newTree.delete(msg.id));
      
      // Add the edited message to the tree
      newTree.set(editedMessage.id, editedMessage);
      
      // Update parent's children if it exists
      if (originalMessage.parentId) {
        const parent = newTree.get(originalMessage.parentId);
        if (parent) {
          parent.children = parent.children.filter(id => id !== messageId);
          parent.children.push(editedMessage.id);
          newTree.set(originalMessage.parentId, parent);
        }
      }
      
      // Remove the original message
      newTree.delete(messageId);
      
      return newTree;
    });

    // Mark as branch point
    setBranchPoints(prev => new Set(prev).add(originalMessage.parentId || 'root'));
    
    // If this is a user message, trigger a new AI response
    if (originalMessage.role === 'user') {
      setIsLoading(true);
      setError(null);
      
      try {
        // Build conversation history up to this point
        const conversationHistory = [...messagesToKeep, editedMessage];
        
        // Add system prompt
        const systemPrompt = await getSystemPrompt();
        const systemMessage = { role: 'system', content: systemPrompt };
        const fullHistory = [systemMessage, ...conversationHistory];
        
        let aiResponse;
        
        if (isPrismEnabled) {
          aiResponse = await prismService.generateCompletePrismResponse(
            newContent,
            fullHistory,
            'moonshotai/kimi-k2-instruct', // Default prism model
            'moonshotai/kimi-k2-instruct', // Default main model
            true
          );
        } else {
          aiResponse = await chatService.sendMessage(fullHistory, 'moonshotai/kimi-k2-instruct');
        }
        
        // Ensure AI response has proper structure
        if (!aiResponse.id) {
          aiResponse.id = uuidv4();
        }
        aiResponse.timestamp = Date.now();
        aiResponse.parentId = editedMessage.id;
        aiResponse.children = [];
        
        setMessages(prev => [...prev, aiResponse]);
        
        // Update conversation tree
        setConversationTree(prev => {
          const newTree = new Map(prev);
          newTree.set(aiResponse.id, aiResponse);
          
          // Update parent's children
          const parent = newTree.get(editedMessage.id);
          if (parent) {
            parent.children = [aiResponse.id];
            newTree.set(editedMessage.id, parent);
          }
          
          return newTree;
        });
        
        // Log the message exchange
        try {
          loggingService.logMessage(newContent, aiResponse, 'moonshotai/kimi-k2-instruct', isPrismEnabled);
        } catch (loggingError) {
          console.error('Logging error (non-fatal):', loggingError);
        }
        
      } catch (err) {
        setError(err.message || 'Failed to generate response');
        console.error('Edit response error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    
    return editedMessage.id;
  }, [messages, conversationTree, isPrismEnabled]);

  // Regenerate AI response for a message
  const regenerateMessage = useCallback(async (messageId) => {
    const messageIndex = messages.findIndex(m => m.id === messageId);
    const message = messages[messageIndex];
    
    if (!message || message.role !== 'assistant') return;

    // Store the current version before regenerating
    const currentVersion = {
      id: message.id,
      content: message.content,
      timestamp: message.timestamp,
      ...(message.perspectives && { perspectives: message.perspectives }),
      ...(message.synthesis && { synthesis: message.synthesis })
    };

    // Remove this message and all subsequent messages
    const messagesToKeep = messages.slice(0, messageIndex);
    setMessages(messagesToKeep);
    
    // Find the parent user message
    const parentMessage = messagesToKeep[messagesToKeep.length - 1];
    if (!parentMessage || parentMessage.role !== 'user') return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Build conversation history
      let conversationHistory = messagesToKeep;
      
      // Add system prompt
      const systemPrompt = await getSystemPrompt();
      const systemMessage = { role: 'system', content: systemPrompt };
      conversationHistory = [systemMessage, ...conversationHistory];
      
      let aiResponse;
      
      if (isPrismEnabled) {
        aiResponse = await prismService.generateCompletePrismResponse(
          parentMessage.content,
          conversationHistory,
          'moonshotai/kimi-k2-instruct', // Default prism model
          'moonshotai/kimi-k2-instruct', // Default main model
          true
        );
      } else {
        aiResponse = await chatService.sendMessage(conversationHistory, 'moonshotai/kimi-k2-instruct');
      }
      
      // Ensure AI response has proper structure and include version history
      if (!aiResponse.id) {
        aiResponse.id = uuidv4();
      }
      aiResponse.timestamp = Date.now();
      aiResponse.parentId = parentMessage.id;
      aiResponse.children = [];
      aiResponse.versions = [...(message.versions || []), currentVersion];
      
      setMessages(prev => [...prev, aiResponse]);
      
      // Update conversation tree
      setConversationTree(prev => {
        const newTree = new Map(prev);
        
        // Remove old versions from tree
        const toRemove = messages.slice(messageIndex);
        toRemove.forEach(msg => newTree.delete(msg.id));
        
        // Add new response
        newTree.set(aiResponse.id, aiResponse);
        
        // Update parent's children
        const parent = newTree.get(parentMessage.id);
        if (parent) {
          parent.children = [aiResponse.id];
          newTree.set(parentMessage.id, parent);
        }
        
        return newTree;
      });
      
      // Mark as branch point
      setBranchPoints(prev => new Set(prev).add(parentMessage.id));
      
    } catch (err) {
      setError(err.message || 'Failed to regenerate message');
      console.error('Regeneration error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isPrismEnabled]);

  // Navigate to a specific branch
  const navigateToBranch = useCallback((messageId) => {
    const path = [];
    let currentId = messageId;
    
    while (currentId) {
      const message = conversationTree.get(currentId);
      if (message) {
        path.unshift(currentId);
        currentId = message.parentId;
      } else {
        break;
      }
    }
    
    setActivePath(path);
    
    // Filter messages to show only this branch
    const visibleMessages = new Set();
    const queue = [messageId];
    
    while (queue.length > 0) {
      const currentId = queue.shift();
      visibleMessages.add(currentId);
      
      const message = conversationTree.get(currentId);
      if (message?.children) {
        message.children.forEach(childId => queue.push(childId));
      }
    }
    
    setMessages(prev => prev.filter(msg => visibleMessages.has(msg.id)));
  }, [conversationTree]);

  // Get branch navigation info
  const getBranchInfo = useCallback((messageId) => {
    const message = conversationTree.get(messageId);
    if (!message) return null;
    
    const parent = message.parentId ? conversationTree.get(message.parentId) : null;
    const siblings = parent ? parent.children : [];
    
    return {
      hasBranches: siblings.length > 1,
      branchCount: siblings.length,
      currentBranchIndex: siblings.indexOf(messageId),
      isBranchPoint: branchPoints.has(messageId),
      siblings
    };
  }, [conversationTree, branchPoints]);

  // Copy message content to clipboard
  const copyMessage = useCallback(async (messageId) => {
    const message = messages.find(m => m.id === messageId) || conversationTree.get(messageId);
    if (!message) return false;
    
    try {
      await navigator.clipboard.writeText(message.content);
      return true;
    } catch (err) {
      console.error('Failed to copy message:', err);
      return false;
    }
  }, [messages, conversationTree]);

  // Get message version history
  const getMessageVersions = useCallback((messageId) => {
    const message = messages.find(m => m.id === messageId);
    if (!message) return [];
    
    const versions = message.versions || [];
    return [
      ...versions,
      {
        id: message.id,
        content: message.content,
        timestamp: message.timestamp,
        isCurrent: true
      }
    ];
  }, [messages]);

  // Switch to a specific message version
  const switchToVersion = useCallback(async (messageId, versionId) => {
    const message = messages.find(m => m.id === messageId);
    if (!message || !message.versions) return;
    
    const version = message.versions.find(v => v.id === versionId);
    if (!version) return;
    
    const messageIndex = messages.findIndex(m => m.id === messageId);
    
    // Store current version in history
    const currentVersion = {
      id: message.id,
      content: message.content,
      timestamp: message.timestamp,
      ...(message.perspectives && { perspectives: message.perspectives }),
      ...(message.synthesis && { synthesis: message.synthesis })
    };
    
    // Create new message with selected version content
    const restoredMessage = {
      ...message,
      id: uuidv4(),
      content: version.content,
      timestamp: Date.now(),
      versions: [
        ...message.versions.filter(v => v.id !== versionId),
        currentVersion
      ]
    };
    
    // Update messages array
    const newMessages = [...messages];
    newMessages[messageIndex] = restoredMessage;
    
    // Remove all subsequent messages
    const messagesToKeep = newMessages.slice(0, messageIndex + 1);
    setMessages(messagesToKeep);
    
    // If this is a user message, trigger new AI response
    if (message.role === 'user') {
      setIsLoading(true);
      setError(null);
      
      try {
        const conversationHistory = messagesToKeep;
        const systemPrompt = await getSystemPrompt();
        const systemMessage = { role: 'system', content: systemPrompt };
        const fullHistory = [systemMessage, ...conversationHistory];
        
        let aiResponse;
        
        if (isPrismEnabled) {
          aiResponse = await prismService.generateCompletePrismResponse(
            version.content,
            fullHistory,
            'moonshotai/kimi-k2-instruct',
            'moonshotai/kimi-k2-instruct',
            true
          );
        } else {
          aiResponse = await chatService.sendMessage(fullHistory, 'moonshotai/kimi-k2-instruct');
        }
        
        if (!aiResponse.id) {
          aiResponse.id = uuidv4();
        }
        aiResponse.timestamp = Date.now();
        aiResponse.parentId = restoredMessage.id;
        aiResponse.children = [];
        
        setMessages(prev => [...prev, aiResponse]);
        
      } catch (err) {
        setError(err.message || 'Failed to generate response');
        console.error('Version switch error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    
    return restoredMessage.id;
  }, [messages, isPrismEnabled]);

  return {
    messages,
    conversationTree,
    activePath,
    branchPoints,
    isLoading,
    error,
    isPrismEnabled,
    sendMessage,
    clearChat,
    togglePrism,
    addMessage,
    editMessage,
    regenerateMessage,
    navigateToBranch,
    getBranchInfo,
    copyMessage,
    getMessageVersions,
    switchToVersion
  };
};
