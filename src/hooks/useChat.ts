// src/hooks/useChat.ts
import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import chatService from '../services/chatService';
import prismService from '../services/prismService';
import loggingService from '../services/loggingService';
import conversationTreeService from '../services/conversationTreeService';
import { getSystemPrompt } from '../utils/systemPrompt';

interface MessageVersion {
  id: string;
  content: string;
  timestamp: number;
  isCurrent?: boolean;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  parentId: string | null;
  children: string[];
  isEdited?: boolean;
  originalId?: string;
  versions?: MessageVersion[];
  isPrism?: boolean;
  perspectives?: Array<{
    perspective: string;
    content: string;
  }>;
  synthesis?: string;
}

interface BranchInfo {
  hasBranches: boolean;
  branchCount?: number;
  currentBranchIndex?: number;
  siblings?: string[];
  isSiblingBranch?: boolean;
}

interface TreeInfo {
  id: string;
  title: string;
  created: string;
  lastModified: string;
  stats: any;
}

interface SearchResult {
  treeId: string;
  title: string;
  matches: Array<{
    nodeId: string;
    content: string;
    role: string;
    timestamp: number;
  }>;
  lastModified: string;
}

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isPrismEnabled, setIsPrismEnabled] = useState<boolean>(false);
  const [currentTreeId, setCurrentTreeId] = useState<string | null>(null);

  // Initialize from saved tree on mount
  useEffect(() => {
    const tree = conversationTreeService.getCurrentTree();
    if (tree) {
      if (tree.rootNodes.length > 0) {
        // Load the first root node's branch by default
        const firstRootNode = tree.rootNodes[0];
        const branch = conversationTreeService.loadBranch(firstRootNode);
        setMessages(branch);
      } else {
        // Load empty conversation
        setMessages([]);
      }
      setCurrentTreeId(tree.id);
    }
  }, []);

  // Save messages to tree whenever they change
  useEffect(() => {
    if (messages.length > 0 && currentTreeId) {
      // Tree is automatically saved by conversationTreeService when nodes are added
    }
  }, [messages, currentTreeId]);

  const sendMessage = useCallback(async (
    content: string, 
    model: string, 
    prismModel?: string, 
    isSystemPromptEnabled?: boolean
  ) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = { 
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
      let conversationHistory: ChatMessage[] = [...messages, userMessage];
      
      if (isSystemPromptEnabled) {
        const systemPrompt = await getSystemPrompt();
        const systemMessage: ChatMessage = { 
          id: uuidv4(),
          role: 'system', 
          content: systemPrompt,
          timestamp: Date.now(),
          parentId: null,
          children: []
        };
        conversationHistory = [systemMessage, ...conversationHistory];
      }

      let aiResponse: ChatMessage;

      if (isPrismEnabled) {
        const prismResponse = await prismService.generateCompletePrismResponse(
          content,
          conversationHistory,
          prismModel || model,
          model,
          isSystemPromptEnabled
        );
        aiResponse = {
          id: uuidv4(),
          role: prismResponse.role,
          content: prismResponse.content,
          timestamp: Date.now(),
          parentId: userMessage.id,
          children: [],
          isPrism: prismResponse.isPrism,
          perspectives: prismResponse.perspectives,
          synthesis: prismResponse.synthesis
        };
      } else {
        const response = await chatService.sendMessage(
          conversationHistory.map(msg => ({
            role: msg.role,
            content: msg.content
          })), 
          model
        );
        
        aiResponse = {
          id: uuidv4(),
          role: 'assistant',
          content: response.content || 'No response received',
          timestamp: Date.now(),
          parentId: userMessage.id,
          children: []
        };
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
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isPrismEnabled, currentTreeId]);

  const newChat = useCallback(() => {
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
  const editMessage = useCallback(async (messageId: string, newContent: string): Promise<string | undefined> => {
    const originalMessage = messages.find(m => m.id === messageId);
    if (!originalMessage) return;

    // Get the message index
    const messageIndex = messages.findIndex(m => m.id === messageId);
    const messagesToKeep = messages.slice(0, messageIndex);
    
    // Create edited version
    const editedMessage: ChatMessage = {
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
        const systemMessage: ChatMessage = { 
          id: uuidv4(),
          role: 'system', 
          content: systemPrompt,
          timestamp: Date.now(),
          parentId: null,
          children: []
        };
        const fullHistory = [systemMessage, ...conversationHistory];
        
        let aiResponse: ChatMessage;
        
        if (isPrismEnabled) {
          const prismResponse = await prismService.generateCompletePrismResponse(
            newContent,
            fullHistory,
            'moonshotai/kimi-k2-instruct',
            'moonshotai/kimi-k2-instruct',
            true
          );
          aiResponse = {
            id: uuidv4(),
            role: prismResponse.role,
            content: prismResponse.content,
            timestamp: Date.now(),
            parentId: editedMessage.id,
            children: [],
            isPrism: prismResponse.isPrism,
            perspectives: prismResponse.perspectives,
            synthesis: prismResponse.synthesis
          };
        } else {
          const response = await chatService.sendMessage(
            fullHistory.map(msg => ({
              role: msg.role,
              content: msg.content
            })), 
            'moonshotai/kimi-k2-instruct'
          );
          
          aiResponse = {
            id: uuidv4(),
            role: 'assistant',
            content: response.content || 'No response received',
            timestamp: Date.now(),
            parentId: editedMessage.id,
            children: []
          };
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
        
      } catch (err: any) {
        setError(err.message || 'Failed to generate response');
        console.error('Edit response error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    
    return editedMessage.id;
  }, [messages, isPrismEnabled]);

  // Navigate to a specific branch
  const navigateToBranch = useCallback((messageId: string) => {
    const branch = conversationTreeService.loadBranch(messageId);
    setMessages(branch);
  }, []);

  // Get branch navigation info
  const getBranchInfo = useCallback((messageId: string): BranchInfo => {
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
  const loadTree = useCallback((treeId: string) => {
    if (conversationTreeService.switchTree(treeId)) {
      const tree = conversationTreeService.getCurrentTree();
      if (tree) {
        if (tree.rootNodes.length > 0) {
          const firstRootNode = tree.rootNodes[0];
          const branch = conversationTreeService.loadBranch(firstRootNode);
          setMessages(branch);
        } else {
          // Load empty conversation
          setMessages([]);
        }
        setCurrentTreeId(treeId);
        setError(null); // Clear any existing errors
      }
    }
  }, []);

  // Get all available trees
  const getAllTrees = useCallback((): TreeInfo[] => {
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
  const searchTrees = useCallback((query: string): SearchResult[] => {
    return conversationTreeService.searchTrees(query);
  }, []);

  // Export current tree
  const exportTree = useCallback((treeId?: string | null) => {
    conversationTreeService.exportTree(treeId || currentTreeId);
  }, [currentTreeId]);

  // Import a tree
  const importTree = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result === 'string') {
          const treeData = JSON.parse(result);
          const newTreeId = conversationTreeService.importTree(treeData);
          if (newTreeId) {
            loadTree(newTreeId);
          }
        }
      } catch (error) {
        console.error('Error importing tree:', error);
        setError('Failed to import conversation tree');
      }
    };
    reader.readAsText(file);
  }, [loadTree]);

  // Other methods remain the same but simplified since tree handles persistence
  const regenerateMessage = useCallback(async (messageId: string) => {
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
      const systemMessage: ChatMessage = { 
        id: uuidv4(),
        role: 'system', 
        content: systemPrompt,
        timestamp: Date.now(),
        parentId: null,
        children: []
      };
      conversationHistory = [systemMessage, ...conversationHistory];
      
      let aiResponse: ChatMessage;
      
      if (isPrismEnabled) {
        const prismResponse = await prismService.generateCompletePrismResponse(
          parentMessage.content,
          conversationHistory,
          'moonshotai/kimi-k2-instruct',
          'moonshotai/kimi-k2-instruct',
          true
        );
        aiResponse = {
          id: uuidv4(),
          role: prismResponse.role,
          content: prismResponse.content,
          timestamp: Date.now(),
          parentId: parentMessage.id,
          children: [],
          isPrism: prismResponse.isPrism,
          perspectives: prismResponse.perspectives,
          synthesis: prismResponse.synthesis
        };
      } else {
        const response = await chatService.sendMessage(
          conversationHistory.map(msg => ({
            role: msg.role,
            content: msg.content
          })), 
          'moonshotai/kimi-k2-instruct'
        );
        
        aiResponse = {
          id: uuidv4(),
          role: 'assistant',
          content: response.content || 'No response received',
          timestamp: Date.now(),
          parentId: parentMessage.id,
          children: []
        };
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
      
    } catch (err: any) {
      setError(err.message || 'Failed to regenerate message');
      console.error('Regeneration error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isPrismEnabled]);

  const copyMessage = useCallback(async (messageId: string): Promise<boolean> => {
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

  const getMessageVersions = useCallback((messageId: string): MessageVersion[] => {
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

  const switchToVersion = useCallback(async (messageId: string, versionId: string) => {
    // Similar to edit, but restores a previous version
    const message = messages.find(m => m.id === messageId);
    if (!message || !message.versions) return;
    
    const version = message.versions.find(v => v.id === versionId);
    if (!version) return;
    
    // Use edit functionality to create new branch with old content
    return editMessage(messageId, version.content);
  }, [messages, editMessage]);

  // Delete a tree
  const deleteTree = useCallback((treeId: string): boolean => {
    return conversationTreeService.deleteTree(treeId);
  }, []);

  // Save current conversation with a custom title
  const saveConversation = useCallback((title: string) => {
    const tree = conversationTreeService.getCurrentTree();
    if (tree) {
      const trees = conversationTreeService.getAllTrees();
      const updatedTree = {
        ...tree,
        title,
        lastModified: new Date().toISOString()
      };
      trees[tree.id] = updatedTree;
      localStorage.setItem('prism-conversation-trees', JSON.stringify(
        Object.fromEntries(
          Object.entries(trees).map(([id, t]) => [
            id, 
            {
              ...t,
              nodes: Array.from(t.nodes instanceof Map ? t.nodes : new Map(t.nodes))
            }
          ])
        )
      ));
    }
  }, []);

  // Create a new conversation
  const createNewConversation = useCallback((title: string = 'New Conversation') => {
    const newTreeId = conversationTreeService.createNewTree(title);
    setMessages([]);
    setCurrentTreeId(newTreeId);
    setError(null);
    return newTreeId;
  }, []);

  return {
    messages,
    isLoading,
    error,
    isPrismEnabled,
    sendMessage,
    newChat,
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
    currentTreeId,
    saveConversation,
    createNewConversation
  };
};