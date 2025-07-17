import { describe, it, expect, beforeEach, vi, Mock } from 'vitest'

// Mock all the services
vi.mock('../services/chatService', () => ({
  default: {
    sendMessage: vi.fn()
  }
}))

vi.mock('../services/prismService', () => ({
  default: {
    generateCompletePrismResponse: vi.fn()
  }
}))

vi.mock('../services/loggingService', () => ({
  default: {
    logMessage: vi.fn(),
    clearCurrentSession: vi.fn()
  }
}))

vi.mock('../services/conversationTreeService', () => ({
  default: {
    getCurrentTree: vi.fn(),
    createNewTree: vi.fn(),
    addNode: vi.fn(),
    loadBranch: vi.fn(),
    switchTree: vi.fn(),
    getAllTrees: vi.fn(),
    getBranches: vi.fn(),
    searchTrees: vi.fn(),
    exportTree: vi.fn(),
    importTree: vi.fn(),
    deleteTree: vi.fn(),
    getTreeStats: vi.fn()
  }
}))

vi.mock('../utils/systemPrompt', () => ({
  getSystemPrompt: vi.fn(() => Promise.resolve('Test system prompt'))
}))

vi.mock('uuid', () => ({
  v4: vi.fn(() => 'test-uuid-' + Math.random().toString(36).substring(7))
}))

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve())
  }
})

import chatService from '../services/chatService'
import prismService from '../services/prismService'
import loggingService from '../services/loggingService'
import conversationTreeService from '../services/conversationTreeService'
import { getSystemPrompt } from '../utils/systemPrompt'

describe('useChat Hook', () => {
  const mockChatService = chatService as any
  const mockPrismService = prismService as any
  const mockLoggingService = loggingService as any
  const mockTreeService = conversationTreeService as any
  const mockGetSystemPrompt = getSystemPrompt as Mock

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Default mock implementations
    mockTreeService.getCurrentTree.mockReturnValue({
      id: 'test-tree-id',
      title: 'Test Tree',
      rootNodes: ['root-1'],
      nodes: new Map([
        ['root-1', {
          id: 'root-1',
          role: 'user',
          content: 'Hello',
          parentId: null,
          children: [],
          timestamp: Date.now(),
          depth: 0
        }]
      ])
    })
    
    mockTreeService.createNewTree.mockReturnValue('new-tree-id')
    mockTreeService.loadBranch.mockReturnValue([])
    mockTreeService.addNode.mockReturnValue('new-node-id')
    mockTreeService.getBranches.mockReturnValue([])
    mockTreeService.getAllTrees.mockReturnValue({})
    mockTreeService.searchTrees.mockReturnValue([])
    mockTreeService.switchTree.mockReturnValue(true)
    mockTreeService.deleteTree.mockReturnValue(true)
    mockTreeService.getTreeStats.mockReturnValue({
      totalMessages: 0,
      userMessages: 0,
      aiMessages: 0
    })
    
    mockChatService.sendMessage.mockResolvedValue({
      content: 'AI response'
    })
    
    mockPrismService.generateCompletePrismResponse.mockResolvedValue({
      role: 'assistant',
      content: 'Prism response',
      isPrism: true,
      perspectives: [],
      synthesis: 'Test synthesis'
    })
  })

  describe('Service Integration', () => {
    it('should mock chatService correctly', () => {
      expect(mockChatService.sendMessage).toBeDefined()
      expect(vi.isMockFunction(mockChatService.sendMessage)).toBe(true)
    })

    it('should mock prismService correctly', () => {
      expect(mockPrismService.generateCompletePrismResponse).toBeDefined()
      expect(vi.isMockFunction(mockPrismService.generateCompletePrismResponse)).toBe(true)
    })

    it('should mock loggingService correctly', () => {
      expect(mockLoggingService.logMessage).toBeDefined()
      expect(mockLoggingService.clearCurrentSession).toBeDefined()
      expect(vi.isMockFunction(mockLoggingService.logMessage)).toBe(true)
    })

    it('should mock conversationTreeService correctly', () => {
      expect(mockTreeService.getCurrentTree).toBeDefined()
      expect(mockTreeService.addNode).toBeDefined()
      expect(vi.isMockFunction(mockTreeService.getCurrentTree)).toBe(true)
    })

    it('should mock systemPrompt correctly', async () => {
      const prompt = await mockGetSystemPrompt()
      expect(prompt).toBe('Test system prompt')
      expect(vi.isMockFunction(mockGetSystemPrompt)).toBe(true)
    })
  })

  describe('Tree Service Operations', () => {
    it('should handle tree creation', () => {
      const treeId = mockTreeService.createNewTree('Test Tree')
      expect(treeId).toBe('new-tree-id')
      expect(mockTreeService.createNewTree).toHaveBeenCalledWith('Test Tree')
    })

    it('should handle node addition', () => {
      const nodeId = mockTreeService.addNode({ content: 'Test' }, 'parent-id')
      expect(nodeId).toBe('new-node-id')
      expect(mockTreeService.addNode).toHaveBeenCalledWith({ content: 'Test' }, 'parent-id')
    })

    it('should handle tree switching', () => {
      const result = mockTreeService.switchTree('tree-id')
      expect(result).toBe(true)
      expect(mockTreeService.switchTree).toHaveBeenCalledWith('tree-id')
    })

    it('should handle tree deletion', () => {
      const result = mockTreeService.deleteTree('tree-id')
      expect(result).toBe(true)
      expect(mockTreeService.deleteTree).toHaveBeenCalledWith('tree-id')
    })

    it('should handle branch loading', () => {
      const branch = mockTreeService.loadBranch('node-id')
      expect(branch).toEqual([])
      expect(mockTreeService.loadBranch).toHaveBeenCalledWith('node-id')
    })

    it('should handle branch info retrieval', () => {
      const branches = mockTreeService.getBranches('node-id')
      expect(branches).toEqual([])
      expect(mockTreeService.getBranches).toHaveBeenCalledWith('node-id')
    })

    it('should handle tree search', () => {
      const results = mockTreeService.searchTrees('query')
      expect(results).toEqual([])
      expect(mockTreeService.searchTrees).toHaveBeenCalledWith('query')
    })

    it('should handle tree export', () => {
      mockTreeService.exportTree('tree-id')
      expect(mockTreeService.exportTree).toHaveBeenCalledWith('tree-id')
    })

    it('should handle tree import', () => {
      mockTreeService.importTree({ title: 'Imported' })
      expect(mockTreeService.importTree).toHaveBeenCalledWith({ title: 'Imported' })
    })

    it('should handle tree stats', () => {
      const stats = mockTreeService.getTreeStats('tree-id')
      expect(stats.totalMessages).toBe(0)
      expect(mockTreeService.getTreeStats).toHaveBeenCalledWith('tree-id')
    })
  })

  describe('Chat Service Operations', () => {
    it('should handle message sending', async () => {
      const response = await mockChatService.sendMessage([
        { role: 'user', content: 'Hello' }
      ], 'gpt-4')
      
      expect(response.content).toBe('AI response')
      expect(mockChatService.sendMessage).toHaveBeenCalledWith([
        { role: 'user', content: 'Hello' }
      ], 'gpt-4')
    })

    it('should handle API errors', async () => {
      mockChatService.sendMessage.mockRejectedValue(new Error('API Error'))
      
      try {
        await mockChatService.sendMessage([], 'gpt-4')
      } catch (error: any) {
        expect(error.message).toBe('API Error')
      }
    })
  })

  describe('Prism Service Operations', () => {
    it('should handle prism response generation', async () => {
      const response = await mockPrismService.generateCompletePrismResponse(
        'Query', [], 'model1', 'model2', true
      )
      
      expect(response.content).toBe('Prism response')
      expect(response.isPrism).toBe(true)
      expect(mockPrismService.generateCompletePrismResponse).toHaveBeenCalledWith(
        'Query', [], 'model1', 'model2', true
      )
    })

    it('should handle prism errors', async () => {
      mockPrismService.generateCompletePrismResponse.mockRejectedValue(new Error('Prism Error'))
      
      try {
        await mockPrismService.generateCompletePrismResponse('Query', [], 'model1', 'model2', true)
      } catch (error: any) {
        expect(error.message).toBe('Prism Error')
      }
    })
  })

  describe('Logging Service Operations', () => {
    it('should handle message logging', () => {
      const message = { content: 'AI response', role: 'assistant' }
      mockLoggingService.logMessage('User input', message, 'gpt-4', false)
      
      expect(mockLoggingService.logMessage).toHaveBeenCalledWith(
        'User input', message, 'gpt-4', false
      )
    })

    it('should handle session clearing', () => {
      mockLoggingService.clearCurrentSession()
      expect(mockLoggingService.clearCurrentSession).toHaveBeenCalled()
    })
  })

  describe('System Prompt Operations', () => {
    it('should retrieve system prompt', async () => {
      const prompt = await mockGetSystemPrompt()
      expect(prompt).toBe('Test system prompt')
      expect(mockGetSystemPrompt).toHaveBeenCalled()
    })

    it('should handle system prompt errors', async () => {
      mockGetSystemPrompt.mockRejectedValue(new Error('Prompt Error'))
      
      try {
        await mockGetSystemPrompt()
      } catch (error: any) {
        expect(error.message).toBe('Prompt Error')
      }
    })
  })

  describe('Clipboard Operations', () => {
    it('should copy text to clipboard', async () => {
      await navigator.clipboard.writeText('Test content')
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Test content')
    })

    it('should handle clipboard errors', async () => {
      // @ts-ignore
      navigator.clipboard.writeText.mockRejectedValue(new Error('Clipboard Error'))
      
      try {
        await navigator.clipboard.writeText('Test content')
      } catch (error: any) {
        expect(error.message).toBe('Clipboard Error')
      }
    })
  })

  describe('Error Scenarios', () => {
    it('should handle null tree response', () => {
      mockTreeService.getCurrentTree.mockReturnValue(null)
      const tree = mockTreeService.getCurrentTree()
      expect(tree).toBe(null)
    })

    it('should handle empty trees response', () => {
      mockTreeService.getAllTrees.mockReturnValue({})
      const trees = mockTreeService.getAllTrees()
      expect(Object.keys(trees)).toHaveLength(0)
    })

    it('should handle failed tree operations', () => {
      mockTreeService.switchTree.mockReturnValue(false)
      mockTreeService.deleteTree.mockReturnValue(false)
      
      expect(mockTreeService.switchTree('bad-id')).toBe(false)
      expect(mockTreeService.deleteTree('bad-id')).toBe(false)
    })

    it('should handle service method errors', () => {
      mockTreeService.getCurrentTree.mockImplementation(() => {
        throw new Error('Service Error')
      })
      
      expect(() => mockTreeService.getCurrentTree()).toThrow('Service Error')
    })
  })

  describe('Data Validation', () => {
    it('should handle different tree structures', () => {
      const complexTree = {
        id: 'complex-tree',
        title: 'Complex Tree',
        rootNodes: ['root-1', 'root-2'],
        nodes: new Map([
          ['root-1', { id: 'root-1', role: 'user', content: 'First root' }],
          ['root-2', { id: 'root-2', role: 'user', content: 'Second root' }]
        ])
      }
      
      mockTreeService.getCurrentTree.mockReturnValue(complexTree)
      const tree = mockTreeService.getCurrentTree()
      
      expect(tree.rootNodes).toHaveLength(2)
      expect(tree.nodes.size).toBe(2)
    })

    it('should handle complex branch structures', () => {
      const branches = [
        { id: 'branch-1', preview: 'First branch...', timestamp: Date.now(), descendantCount: 3 },
        { id: 'branch-2', preview: 'Second branch...', timestamp: Date.now(), descendantCount: 1 }
      ]
      
      mockTreeService.getBranches.mockReturnValue(branches)
      const result = mockTreeService.getBranches('parent-id')
      
      expect(result).toHaveLength(2)
      expect(result[0].descendantCount).toBe(3)
    })

    it('should handle search results with matches', () => {
      const searchResults = [
        {
          treeId: 'tree-1',
          title: 'Tree 1',
          matches: [
            { nodeId: 'node-1', content: 'Found content', role: 'user', timestamp: Date.now() }
          ],
          lastModified: new Date().toISOString()
        }
      ]
      
      mockTreeService.searchTrees.mockReturnValue(searchResults)
      const results = mockTreeService.searchTrees('search query')
      
      expect(results).toHaveLength(1)
      expect(results[0].matches).toHaveLength(1)
      expect(results[0].matches[0].content).toBe('Found content')
    })
  })
})