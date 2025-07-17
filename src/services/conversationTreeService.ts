// src/services/conversationTreeService.ts
import { v4 as uuidv4 } from 'uuid';

interface TreeNode {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  parentId: string | null;
  children: string[];
  timestamp: number;
  depth: number;
  isEdited?: boolean;
  originalId?: string;
  versions?: Array<{
    id: string;
    content: string;
    timestamp: number;
  }>;
  isPrism?: boolean;
  perspectives?: Array<{
    perspective: string;
    content: string;
  }>;
  synthesis?: string;
}

interface TreeMetadata {
  totalNodes: number;
  maxDepth: number;
  branches: number;
}

interface ConversationTree {
  id: string;
  title: string;
  created: string;
  lastModified: string;
  nodes: Map<string, TreeNode>;
  rootNodes: string[];
  metadata: TreeMetadata;
  imported?: string;
}

interface BranchInfo {
  id: string;
  preview: string;
  timestamp: number | null;
  descendantCount: number;
}

interface TreeStats {
  totalMessages: number;
  userMessages: number;
  aiMessages: number;
  prismMessages: number;
  branches: number;
  maxDepth: number;
  created: string;
  lastModified: string;
}

interface SearchMatch {
  nodeId: string;
  content: string;
  role: string;
  timestamp: number;
}

interface SearchResult {
  treeId: string;
  title: string;
  matches: SearchMatch[];
  lastModified: string;
}

interface ExportData extends Omit<ConversationTree, 'nodes'> {
  nodes: [string, TreeNode][];
  exported: string;
  version: string;
}

class ConversationTreeService {
  private storageKey = 'prism-conversation-trees';
  private currentTreeId: string | null = null;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    // Load existing trees or create first one
    const trees = this.getAllTrees();
    if (Object.keys(trees).length === 0) {
      this.createNewTree();
    } else {
      // Set the most recent tree as current
      const sortedTrees = Object.values(trees).sort((a, b) => 
        new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
      );
      this.currentTreeId = sortedTrees[0].id;
    }
  }

  // Create a new conversation tree
  createNewTree(title: string = 'New Conversation'): string {
    const treeId = uuidv4();
    const tree: ConversationTree = {
      id: treeId,
      title,
      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      nodes: new Map(),
      rootNodes: [],
      metadata: {
        totalNodes: 0,
        maxDepth: 0,
        branches: 0
      }
    };
    
    this.currentTreeId = treeId;
    this.saveTree(tree);
    return treeId;
  }

  // Save tree to localStorage
  private saveTree(tree: ConversationTree): void {
    const trees = this.getAllTrees();
    
    // Convert Map to array for serialization
    const serializedTree = {
      ...tree,
      nodes: Array.from(tree.nodes instanceof Map ? tree.nodes : []),
      lastModified: new Date().toISOString()
    };
    
    trees[tree.id] = serializedTree as any;
    localStorage.setItem(this.storageKey, JSON.stringify(trees));
  }

  // Get all trees from localStorage
  getAllTrees(): Record<string, ConversationTree> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      const trees = stored ? JSON.parse(stored) : {};
      
      // Convert arrays back to Maps
      Object.keys(trees).forEach(treeId => {
        if (Array.isArray(trees[treeId].nodes)) {
          trees[treeId].nodes = new Map(trees[treeId].nodes);
        } else if (trees[treeId].nodes && typeof trees[treeId].nodes === 'object' && !(trees[treeId].nodes instanceof Map)) {
          // Handle case where nodes is stored as an object but needs to be a Map
          const nodeEntries = Object.entries(trees[treeId].nodes);
          trees[treeId].nodes = new Map(nodeEntries);
        }
      });
      
      return trees;
    } catch (error) {
      console.error('Error loading conversation trees:', error);
      return {};
    }
  }

  // Get current tree
  getCurrentTree(): ConversationTree | null {
    if (!this.currentTreeId) return null;
    const trees = this.getAllTrees();
    return trees[this.currentTreeId] || null;
  }

  // Add a node to the current tree
  addNode(node: Partial<TreeNode>, parentId: string | null = null): string | null {
    const tree = this.getCurrentTree();
    if (!tree) return null;

    // Ensure node has required properties
    const completeNode: TreeNode = {
      id: node.id || uuidv4(),
      role: node.role || 'user',
      content: node.content || '',
      parentId,
      children: node.children || [],
      timestamp: node.timestamp || Date.now(),
      depth: 0,
      ...node
    };

    // Calculate depth
    if (parentId) {
      const parent = tree.nodes.get(parentId);
      if (parent) {
        completeNode.depth = parent.depth + 1;
        
        // Update parent's children
        parent.children = [...(parent.children || []), completeNode.id];
        tree.nodes.set(parentId, parent);
        
        // Update max depth
        tree.metadata.maxDepth = Math.max(tree.metadata.maxDepth, completeNode.depth);
      }
    } else {
      // Root node
      tree.rootNodes.push(completeNode.id);
    }

    // Add node to tree
    tree.nodes.set(completeNode.id, completeNode);
    tree.metadata.totalNodes++;
    
    // Check for branches
    if (parentId) {
      const parent = tree.nodes.get(parentId);
      if (parent && parent.children.length > 1) {
        tree.metadata.branches++;
      }
    }

    // Update title based on first user message
    if (completeNode.role === 'user' && tree.metadata.totalNodes === 1) {
      const title = completeNode.content.length > 50 
        ? completeNode.content.substring(0, 50) + '...' 
        : completeNode.content;
      tree.title = title || 'New Conversation';
    }

    this.saveTree(tree);
    return completeNode.id;
  }

  // Load a branch starting from a specific node
  loadBranch(nodeId: string, includeAncestors: boolean = true): TreeNode[] {
    const tree = this.getCurrentTree();
    if (!tree || !tree.nodes.has(nodeId)) return [];

    const messages: TreeNode[] = [];
    
    // Get ancestors if requested
    if (includeAncestors) {
      const ancestors = this.getAncestors(nodeId);
      messages.push(...ancestors);
    }

    // Get the node itself
    const node = tree.nodes.get(nodeId);
    if (node) {
      messages.push(node);
    }

    // Get all descendants following the first child path
    const descendants = this.getDescendants(nodeId, 'first-child');
    messages.push(...descendants);

    return messages;
  }

  // Get all ancestors of a node
  getAncestors(nodeId: string): TreeNode[] {
    const tree = this.getCurrentTree();
    if (!tree) return [];

    const ancestors: TreeNode[] = [];
    let currentId: string | null = nodeId;
    
    while (currentId) {
      const node = tree.nodes.get(currentId);
      if (!node) break;
      
      if (node.parentId) {
        const parent = tree.nodes.get(node.parentId);
        if (parent) {
          ancestors.unshift(parent);
          currentId = parent.parentId;
        } else {
          break;
        }
      } else {
        break;
      }
    }
    
    return ancestors;
  }

  // Get descendants of a node
  getDescendants(nodeId: string, strategy: 'all' | 'first-child' = 'all'): TreeNode[] {
    const tree = this.getCurrentTree();
    if (!tree) return [];

    const descendants: TreeNode[] = [];
    const queue: string[] = [nodeId];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      const node = tree.nodes.get(currentId);
      if (!node || currentId === nodeId) {
        if (node && node.children) {
          if (strategy === 'first-child' && node.children.length > 0) {
            queue.push(node.children[0]);
          } else if (strategy === 'all') {
            queue.push(...node.children);
          }
        }
        continue;
      }

      descendants.push(node);
      
      if (node.children) {
        if (strategy === 'first-child' && node.children.length > 0) {
          queue.push(node.children[0]);
        } else if (strategy === 'all') {
          queue.push(...node.children);
        }
      }
    }

    return descendants;
  }

  // Get all branches from a node
  getBranches(nodeId: string): BranchInfo[] {
    const tree = this.getCurrentTree();
    if (!tree) return [];

    const node = tree.nodes.get(nodeId);
    if (!node || !node.children || node.children.length <= 1) return [];

    return node.children.map(childId => {
      const child = tree.nodes.get(childId);
      return {
        id: childId,
        preview: child ? child.content.substring(0, 100) + '...' : '',
        timestamp: child ? child.timestamp : null,
        descendantCount: this.getDescendants(childId).length
      };
    });
  }

  // Switch to a different tree
  switchTree(treeId: string): boolean {
    const trees = this.getAllTrees();
    if (trees[treeId]) {
      this.currentTreeId = treeId;
      return true;
    }
    return false;
  }

  // Delete a tree
  deleteTree(treeId: string): boolean {
    const trees = this.getAllTrees();
    if (trees[treeId]) {
      delete trees[treeId];
      localStorage.setItem(this.storageKey, JSON.stringify(trees));
      
      // If we deleted the current tree, switch to another
      if (this.currentTreeId === treeId) {
        const remainingTrees = Object.keys(trees);
        if (remainingTrees.length > 0) {
          this.currentTreeId = remainingTrees[0];
        } else {
          this.createNewTree();
        }
      }
      return true;
    }
    return false;
  }

  // Export tree data
  exportTree(treeId: string | null = null): ExportData | null {
    const targetTreeId = treeId || this.currentTreeId;
    if (!targetTreeId) return null;
    
    const trees = this.getAllTrees();
    const tree = trees[targetTreeId];
    if (!tree) return null;

    const exportData: ExportData = {
      ...tree,
      nodes: Array.from(tree.nodes),
      exported: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-tree-${tree.title.replace(/\s+/g, '-')}-${targetTreeId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return exportData;
  }

  // Import tree data
  importTree(treeData: any): string | null {
    try {
      const tree: ConversationTree = {
        ...treeData,
        id: treeData.id || uuidv4(),
        nodes: new Map(treeData.nodes),
        imported: new Date().toISOString()
      };

      this.saveTree(tree);
      this.currentTreeId = tree.id;
      return tree.id;
    } catch (error) {
      console.error('Error importing tree:', error);
      return null;
    }
  }

  // Get tree statistics
  getTreeStats(treeId: string | null = null): TreeStats | null {
    const tree = treeId ? this.getAllTrees()[treeId] : this.getCurrentTree();
    if (!tree) return null;

    // Ensure nodes is a Map
    const nodesMap = tree.nodes instanceof Map ? tree.nodes : new Map(tree.nodes);
    const nodes = Array.from(nodesMap.values()) as TreeNode[];
    const userMessages = nodes.filter(n => n.role === 'user').length;
    const aiMessages = nodes.filter(n => n.role === 'assistant').length;
    const prismMessages = nodes.filter(n => n.isPrism).length;

    return {
      totalMessages: nodes.length,
      userMessages,
      aiMessages,
      prismMessages,
      branches: tree.metadata.branches,
      maxDepth: tree.metadata.maxDepth,
      created: tree.created,
      lastModified: tree.lastModified
    };
  }

  // Find common ancestor of two nodes
  findCommonAncestor(nodeId1: string, nodeId2: string): string | null {
    const tree = this.getCurrentTree();
    if (!tree) return null;

    const ancestors1 = new Set([nodeId1, ...this.getAncestors(nodeId1).map(n => n.id)]);
    
    let current: string | null = nodeId2;
    while (current) {
      if (ancestors1.has(current)) return current;
      
      const node = tree.nodes.get(current);
      if (!node) break;
      current = node.parentId;
    }
    
    return null;
  }

  // Prune a branch (delete node and all descendants)
  pruneBranch(nodeId: string): boolean {
    const tree = this.getCurrentTree();
    if (!tree) return false;

    const node = tree.nodes.get(nodeId);
    if (!node) return false;

    // Get all descendants
    const toDelete = new Set([nodeId]);
    const descendants = this.getDescendants(nodeId);
    descendants.forEach(d => toDelete.add(d.id));

    // Update parent's children list
    if (node.parentId) {
      const parent = tree.nodes.get(node.parentId);
      if (parent) {
        parent.children = parent.children.filter(id => !toDelete.has(id));
        tree.nodes.set(node.parentId, parent);
      }
    } else {
      // Remove from root nodes
      tree.rootNodes = tree.rootNodes.filter(id => !toDelete.has(id));
    }

    // Delete all nodes
    toDelete.forEach(id => tree.nodes.delete(id));
    tree.metadata.totalNodes -= toDelete.size;

    this.saveTree(tree);
    return true;
  }

  // Search trees by content
  searchTrees(query: string): SearchResult[] {
    const trees = this.getAllTrees();
    const results: SearchResult[] = [];

    Object.values(trees).forEach(tree => {
      const matches: SearchMatch[] = [];
      
      // Ensure nodes is a Map
      const nodesMap = tree.nodes instanceof Map ? tree.nodes : new Map(tree.nodes);
      (nodesMap as Map<string, TreeNode>).forEach((node: TreeNode, nodeId: string) => {
        if (node.content && node.content.toLowerCase().includes(query.toLowerCase())) {
          matches.push({
            nodeId,
            content: node.content,
            role: node.role,
            timestamp: node.timestamp
          });
        }
      });

      if (matches.length > 0) {
        results.push({
          treeId: tree.id,
          title: tree.title,
          matches,
          lastModified: tree.lastModified
        });
      }
    });

    return results;
  }
}

export default new ConversationTreeService();