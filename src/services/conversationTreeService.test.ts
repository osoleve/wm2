import { describe, it, expect, beforeEach, vi } from 'vitest'
import conversationTreeService from './conversationTreeService'

// Mock uuid
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'test-uuid-' + Math.random().toString(36).substring(7))
}))

describe('conversationTreeService', () => {
  beforeEach(() => {
    // Clear localStorage and reset service state
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('Tree Creation and Management', () => {
    it('should create a new tree and set it as current', () => {
      const treeId = conversationTreeService.createNewTree('Test Tree')
      const tree = conversationTreeService.getCurrentTree()
      
      expect(treeId).toBeDefined()
      expect(tree).toBeDefined()
      expect(tree!.title).toBe('Test Tree')
      expect(tree!.nodes).toBeInstanceOf(Map)
      expect(tree!.nodes.size).toBe(0)
      expect(tree!.rootNodes).toEqual([])
    })

    it('should get all trees', () => {
      conversationTreeService.createNewTree('Tree 1')
      conversationTreeService.createNewTree('Tree 2')
      
      const trees = conversationTreeService.getAllTrees()
      const treeArray = Object.values(trees)
      
      expect(treeArray.length).toBe(2)
      expect(treeArray.some(t => t.title === 'Tree 1')).toBe(true)
      expect(treeArray.some(t => t.title === 'Tree 2')).toBe(true)
    })

    it('should switch between trees', () => {
      const tree1Id = conversationTreeService.createNewTree('Tree 1')
      conversationTreeService.createNewTree('Tree 2')
      
      // Should be on tree 2 now
      expect(conversationTreeService.getCurrentTree()!.title).toBe('Tree 2')
      
      // Switch to tree 1
      const switched = conversationTreeService.switchTree(tree1Id)
      expect(switched).toBe(true)
      expect(conversationTreeService.getCurrentTree()!.title).toBe('Tree 1')
    })

    it('should delete a tree', () => {
      // The service creates a default tree on initialization, so we need to account for that
      conversationTreeService.createNewTree('Test Tree')
      
      const trees = conversationTreeService.getAllTrees()
      const treeIds = Object.keys(trees)
      const testTreeId = treeIds.find(id => trees[id].title === 'Test Tree')!
      
      const deleted = conversationTreeService.deleteTree(testTreeId)
      expect(deleted).toBe(true)
      
      const updatedTrees = conversationTreeService.getAllTrees()
      expect(updatedTrees[testTreeId]).toBeUndefined()
    })
  })

  describe('Node Operations', () => {
    beforeEach(() => {
      conversationTreeService.createNewTree('Test Tree')
    })

    it('should add a root node', () => {
      const message = {
        id: 'msg-1',
        role: 'user' as const,
        content: 'Hello world',
        parentId: null,
        children: [],
        timestamp: Date.now(),
        depth: 0
      }
      
      conversationTreeService.addNode(message, null)
      
      const tree = conversationTreeService.getCurrentTree()!
      expect(tree.nodes.size).toBe(1)
      expect(tree.nodes.get('msg-1')!.content).toBe('Hello world')
      expect(tree.rootNodes).toContain('msg-1')
    })

    it('should add child nodes', () => {
      const rootMessage = {
        id: 'msg-1',
        role: 'user' as const,
        content: 'Hello',
        parentId: null,
        children: [],
        timestamp: Date.now(),
        depth: 0
      }
      
      const childMessage = {
        id: 'msg-2',
        role: 'assistant' as const,
        content: 'Hi there!',
        parentId: 'msg-1',
        children: [],
        timestamp: Date.now(),
        depth: 1
      }
      
      conversationTreeService.addNode(rootMessage, null)
      conversationTreeService.addNode(childMessage, 'msg-1')
      
      const tree = conversationTreeService.getCurrentTree()!
      expect(tree.nodes.size).toBe(2)
      
      const root = tree.nodes.get('msg-1')!
      const child = tree.nodes.get('msg-2')!
      
      expect(root.children).toContain('msg-2')
      expect(child.parentId).toBe('msg-1')
    })
  })

  describe('Branch Navigation', () => {
    beforeEach(() => {
      conversationTreeService.createNewTree('Test Tree')
      
      // Create a tree structure
      const root = {
        id: 'root',
        role: 'user' as const,
        content: 'Root message',
        parentId: null,
        children: [],
        timestamp: Date.now(),
        depth: 0
      }
      
      const child1 = {
        id: 'child1',
        role: 'assistant' as const,
        content: 'Child 1',
        parentId: 'root',
        children: [],
        timestamp: Date.now(),
        depth: 1
      }
      
      const child2 = {
        id: 'child2',
        role: 'assistant' as const,
        content: 'Child 2',
        parentId: 'root',
        children: [],
        timestamp: Date.now(),
        depth: 1
      }
      
      conversationTreeService.addNode(root, null)
      conversationTreeService.addNode(child1, 'root')
      conversationTreeService.addNode(child2, 'root')
    })

    it('should get branches from a message', () => {
      const branches = conversationTreeService.getBranches('root')
      
      expect(branches.length).toBe(2)
      expect(branches.some(b => b.id === 'child1')).toBe(true)
      expect(branches.some(b => b.id === 'child2')).toBe(true)
    })

    it('should load a branch', () => {
      const branch = conversationTreeService.loadBranch('child1')
      
      expect(branch).toBeDefined()
      expect(branch.length).toBeGreaterThan(0)
      expect(branch.some(msg => msg.id === 'root')).toBe(true)
      expect(branch.some(msg => msg.id === 'child1')).toBe(true)
    })
  })

  describe('Search Functionality', () => {
    beforeEach(() => {
      conversationTreeService.createNewTree('Test Tree')
      
      const message1 = {
        id: 'msg1',
        role: 'user' as const,
        content: 'Hello world',
        parentId: null,
        children: [],
        timestamp: Date.now(),
        depth: 0
      }
      
      const message2 = {
        id: 'msg2',
        role: 'user' as const,
        content: 'How are you?',
        parentId: null,
        children: [],
        timestamp: Date.now(),
        depth: 0
      }
      
      conversationTreeService.addNode(message1, null)
      conversationTreeService.addNode(message2, null)
    })

    it('should search across trees', () => {
      const results = conversationTreeService.searchTrees('world')
      
      expect(results.length).toBe(1)
      expect(results[0].matches.length).toBe(1)
      expect(results[0].matches[0].content).toBe('Hello world')
    })

    it('should perform case-insensitive search', () => {
      const results = conversationTreeService.searchTrees('WORLD')
      
      expect(results.length).toBe(1)
      expect(results[0].matches[0].content).toBe('Hello world')
    })
  })

  describe('Import/Export', () => {
    beforeEach(() => {
      conversationTreeService.createNewTree('Test Tree')
      
      const message = {
        id: 'msg1',
        role: 'user' as const,
        content: 'Test message',
        parentId: null,
        children: [],
        timestamp: Date.now(),
        depth: 0
      }
      
      conversationTreeService.addNode(message, null)
    })

    it('should export tree data', () => {
      const exported = conversationTreeService.exportTree()
      
      expect(exported).toBeDefined()
      expect(exported!.title).toBe('Test Tree')
      expect(exported!.nodes.length).toBe(1)
      // nodes is in [key, value] format from Map.entries()
      expect(exported!.nodes[0][1].content).toBe('Test message')
    })

    it('should import tree data', () => {
      const nodeData = {
        id: 'imported-msg',
        role: 'user' as const,
        content: 'Imported message',
        parentId: null,
        children: [],
        timestamp: Date.now(),
        depth: 0
      }
      
      const exportData = {
        title: 'Imported Tree',
        nodes: [['imported-msg', nodeData]], // Map entries format
        rootNodes: ['imported-msg'],
        metadata: {
          totalNodes: 1,
          maxDepth: 0,
          branches: 1
        }
      }
      
      const treeId = conversationTreeService.importTree(exportData)
      
      expect(treeId).toBeDefined()
      
      // Switch to imported tree
      conversationTreeService.switchTree(treeId!)
      const tree = conversationTreeService.getCurrentTree()
      
      expect(tree!.title).toBe('Imported Tree')
      expect(tree!.nodes.size).toBe(1)
      expect(tree!.nodes.get('imported-msg')!.content).toBe('Imported message')
    })
  })

  describe('Tree Statistics', () => {
    beforeEach(() => {
      conversationTreeService.createNewTree('Test Tree')
      
      const userMsg = {
        id: 'user1',
        role: 'user' as const,
        content: 'User message',
        parentId: null,
        children: [],
        timestamp: Date.now(),
        depth: 0
      }
      
      const aiMsg = {
        id: 'ai1',
        role: 'assistant' as const,
        content: 'AI response',
        parentId: 'user1',
        children: [],
        timestamp: Date.now(),
        depth: 1
      }
      
      conversationTreeService.addNode(userMsg, null)
      conversationTreeService.addNode(aiMsg, 'user1')
    })

    it('should get tree statistics', () => {
      const stats = conversationTreeService.getTreeStats()
      
      expect(stats).toBeDefined()
      expect(stats!.totalMessages).toBe(2)
      expect(stats!.userMessages).toBe(1)
      expect(stats!.aiMessages).toBe(1)
      expect(stats!.maxDepth).toBe(1)
    })
  })

  describe('Error Handling', () => {
    it('should handle switching to non-existent tree', () => {
      const switched = conversationTreeService.switchTree('non-existent')
      expect(switched).toBe(false)
    })

    it('should handle deleting non-existent tree', () => {
      const deleted = conversationTreeService.deleteTree('non-existent')
      expect(deleted).toBe(false)
    })

    it('should return null for export of non-existent tree', () => {
      // Clear all trees first
      const trees = conversationTreeService.getAllTrees()
      Object.keys(trees).forEach(id => conversationTreeService.deleteTree(id))
      
      const exported = conversationTreeService.exportTree()
      expect(exported).toBeNull()
    })
  })
})