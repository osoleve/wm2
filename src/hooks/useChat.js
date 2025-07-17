// src/hooks/useChat.js
import { useState, useCallback, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'https://jspm.dev/uuid@9.0.1';
import chatService from '../services/chatService';
import prismService from '../services/prismService';
import loggingService from '../services/loggingService';
import conversationTreeService from '../services/conversationTreeService';
import { getSystemPrompt } from '../utils/systemPrompt';

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPrismEnabled, setIsPrismEnabled] = useState(false);
  const [currentTreeId, setCurrentTreeId] = useState(null);

  // Initialize from saved tree on mount
  useEffect(() => {
    const tree = conversationTreeService.getCurrentTree();
    if (tree && tree.rootNodes.length > 0) {
      // Load the first root node's branch by default
      const firstRootNode = tree.rootNodes[0];
      const branch = conversationTreeService.loadBranch(firstRootNode);
      setMessages(branch);
      setCurrentTreeId(tree.id);
    }
  }, []);

  // Save messages to tree whenever they change
  useEffect(() => {
    if (messages.length > 0 && currentTreeId) {
      // Tree is automatically saved by conversationTreeService when nodes are added
    }
  }, [messages, currentTreeId]);

  const sendMessage = useCallback(async (content, model, prismModel, isSystemPromptEnabled) => {
    if (!content.trim()) return;

    const userMessage = { 
      id: uuidv4(),
      role: 'user', 
      content,
      timestamp: Date.now(),
      parentId: messages.length > 0 ? messages[messages.length - 1].id : null,
      children: []
    };
    
    // Add to tree
    conversationTreeService.addNode(userMessage, userMessage.parentId);
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      let conversationHistory = [...messages, userMessage];
      
      if (isSystemPromptEnabled) {
        const systemPrompt = await getSystemPrompt();
        const systemMessage = { role: 'system', content: systemPrompt };
        conversationHistory = [systemMessage, ...conversationHistory];
      }

      let aiResponse;

      if (isPrismEnabled) {
        aiResponse = await prismService.generateCompletePrismResponse(
          content,
          conversationHistory,
          prismModel || model,
          model,
          isSystemPromptEnabled
        );
      } else {
        aiResponse = await chatService.sendMessage(conversationHistory, model);
      }
      
      // Ensure AI response has proper structure
      if (!aiResponse.id) {
        aiResponse.id = uuidv4();
      }
      aiResponse.timestamp = Date.now();
      aiResponse.parentId = userMessage.id;
      aiResponse.children = [];
      
      // Add AI response to tree
      conversationTreeService.addNode(aiResponse, aiResponse.parentId);
      
      setMessages(prev => [...prev, aiResponse]);
      
      // Log the message exchange
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
  }, [messages, isPrismEnabled, currentTreeId]);

  const clearChat = useCallback(() => {
    // Create a new tree instead of clearing the current one
    const newTreeId = conversationTreeService.createNewTree();
    setMessages([]);
    setCurrentTreeId(newTreeId);
    setError(null);
    loggingService.clearCurrentSession();
  }, []);

  const togglePrism = useCallback(() => {
    setIsPrismEnabled(prev => !prev);
  }, []);

  // Edit a message and create a new branch
  const editMessage = useCallback(async (messageId, newContent) => {
    const originalMessage = messages.find(m => m.id === messageId);
    if (!originalMessage) return;

    // Get the message index
    const messageIndex = messages.findIndex(m => m.id === messageId);
    const messagesToKeep = messages.slice(0, messageIndex);
    
    // Create edited version
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

    // Add edited message to tree
    conversationTreeService.addNode(editedMessage, editedMessage.parentId);
    
    // Update messages
    setMessages([...messagesToKeep, editedMessage]);

    // If this is a user message, trigger a new AI response
    if (originalMessage.role === 'user') {
      setIsLoading(true);
      setError(null);
      
      try {
        const conversationHistory = [...messagesToKeep, editedMessage];
        const systemPrompt = await getSystemPrompt();
        const systemMessage = { role: 'system', content: systemPrompt };
        const fullHistory = [systemMessage, ...conversationHistory];
        
        let aiResponse;
        
        if (isPrismEnabled) {
          aiResponse = await prismService.generateCompletePrismResponse(
            newContent,
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
        aiResponse.parentId = editedMessage.id;
        aiResponse.children = [];
        
        // Add AI response to tree
        conversationTreeService.addNode(aiResponse, aiResponse.parentId);
        
        setMessages(prev => [...prev, aiResponse]);
        
        // Log the exchange
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
  }, [messages, isPrismEnabled]);

  // Navigate to a specific branch
  const navigateToBranch = useCallback((messageId) => {
    const branch = conversationTreeService.loadBranch(messageId);
    setMessages(branch);
  }, []);

  // Get branch navigation info
  const getBranchInfo = useCallback((messageId) => {
    const branches = conversationTreeService.getBranches(messageId);
    
    if (branches.length === 0) {
      // Check parent for branches
      const message = messages.find(m => m.id === messageId);
      if (message && message.parentId) {
        const parentBranches = conversationTreeService.getBranches(message.parentId);
        if (parentBranches.length > 1) {
          const currentIndex = parentBranches.findIndex(b => b.id === messageId);
          return {
            hasBranches: true,
            branchCount: parentBranches.length,
            currentBranchIndex: currentIndex,
            siblings: parentBranches.map(b => b.id),
            isSiblingBranch: true
          };
        }
      }
      return { hasBranches: false };
    }

    return {
      hasBranches: true,
      branchCount: branches.length,
      currentBranchIndex: 0,
      siblings: branches.map(b => b.id),
      isSiblingBranch: false
    };
  }, [messages]);

  // Load a different conversation tree
  const loadTree = useCallback((treeId) => {
    if (conversationTreeService.switchTree(treeId)) {
      const tree = conversationTreeService.getCurrentTree();
      if (tree && tree.rootNodes.length > 0) {
        const firstRootNode = tree.rootNodes[0];
        const branch = conversationTreeService.loadBranch(firstRootNode);
        setMessages(branch);
        setCurrentTreeId(treeId);
      }
    }
  }, []);

  // Get all available trees
  const getAllTrees = useCallback(() => {
    const trees = conversationTreeService.getAllTrees();
    return Object.values(trees).map(tree => ({
      id: tree.id,
      title: tree.title,
      created: tree.created,
      lastModified: tree.lastModified,
      stats: conversationTreeService.getTreeStats(tree.id)
    }));
  }, []);

  // Search across all trees
  const searchTrees = useCallback((query) => {
    return conversationTreeService.searchTrees(query);
  }, []);

  // Export current tree
  const exportTree = useCallback((treeId = null) => {
    conversationTreeService.exportTree(treeId || currentTreeId);
  }, [currentTreeId]);

  // Import a tree
  const importTree = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const treeData = JSON.parse(e.target.result);
        const newTreeId = conversationTreeService.importTree(treeData);
        if (newTreeId) {
          loadTree(newTreeId);
        }
      } catch (error) {
        console.error('Error importing tree:', error);
        setError('Failed to import conversation tree');
      }
    };
    reader.readAsText(file);
  }, [loadTree]);

  // Other methods remain the same but simplified since tree handles persistence
  const regenerateMessage = useCallback(async (messageId) => {
    const messageIndex = messages.findIndex(m => m.id === messageId);
    const message = messages[messageIndex];
    
    if (!message || message.role !== 'assistant') return;

    const messagesToKeep = messages.slice(0, messageIndex);
    setMessages(messagesToKeep);
    
    const parentMessage = messagesToKeep[messagesToKeep.length - 1];
    if (!parentMessage || parentMessage.role !== 'user') return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      let conversationHistory = messagesToKeep;
      const systemPrompt = await getSystemPrompt();
      const systemMessage = { role: 'system', content: systemPrompt };
      conversationHistory = [systemMessage, ...conversationHistory];
      
      let aiResponse;
      
      if (isPrismEnabled) {
        aiResponse = await prismService.generateCompletePrismResponse(
          parentMessage.content,
          conversationHistory,
          'moonshotai/kimi-k2-instruct',
          'moonshotai/kimi-k2-instruct',
          true
        );
      } else {
        aiResponse = await chatService.sendMessage(conversationHistory, 'moonshotai/kimi-k2-instruct');
      }
      
      if (!aiResponse.id) {
        aiResponse.id = uuidv4();
      }
      aiResponse.timestamp = Date.now();
      aiResponse.parentId = parentMessage.id;
      aiResponse.children = [];
      aiResponse.versions = [...(message.versions || []), {
        id: message.id,
        content: message.content,
        timestamp: message.timestamp
      }];
      
      // Add regenerated response to tree
      conversationTreeService.addNode(aiResponse, aiResponse.parentId);
      
      setMessages(prev => [...prev, aiResponse]);
      
    } catch (err) {
      setError(err.message || 'Failed to regenerate message');
      console.error('Regeneration error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isPrismEnabled]);

  const copyMessage = useCallback(async (messageId) => {
    const message = messages.find(m => m.id === messageId);
    if (!message) return false;
    
    try {
      await navigator.clipboard.writeText(message.content);
      return true;
    } catch (err) {
      console.error('Failed to copy message:', err);
      return false;
    }
  }, [messages]);

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

  const switchToVersion = useCallback(async (messageId, versionId) => {
    // Similar to edit, but restores a previous version
    const message = messages.find(m => m.id === messageId);
    if (!message || !message.versions) return;
    
    const version = message.versions.find(v => v.id === versionId);
    if (!version) return;
    
    // Use edit functionality to create new branch with old content
    return editMessage(messageId, version.content);
  }, [messages, editMessage]);

  // Delete a tree
  const deleteTree = useCallback((treeId) => {
    return conversationTreeService.deleteTree(treeId);
  }, []);

  return {
    messages,
    isLoading,
    error,
    isPrismEnabled,
    sendMessage,
    clearChat,
    togglePrism,
    editMessage,
    regenerateMessage,
    navigateToBranch,
    getBranchInfo,
    copyMessage,
    getMessageVersions,
    switchToVersion,
    // New tree-specific methods
    loadTree,
    getAllTrees,
    searchTrees,
    exportTree,
    importTree,
    deleteTree,
    currentTreeId
  };
};