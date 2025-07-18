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
  private pendingSaves = new Map<string, ConversationTree>();
  private saveTimeoutId: number | null = null;
  private readonly SAVE_DEBOUNCE_MS = 500;

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
    // Force immediate save for new tree creation (critical operation)
    this.forceSave(tree);
    return treeId;
  }

  // Queue tree for debounced save
  private saveTree(tree: ConversationTree): void {
    // Ensure tree.nodes is a Map before queuing
    let nodesMap: Map<string, TreeNode>;
    if (tree.nodes instanceof Map) {
      nodesMap = tree.nodes;
    } else if (Array.isArray(tree.nodes)) {
      nodesMap = new Map(tree.nodes);
    } else if (tree.nodes && typeof tree.nodes === 'object') {
      const entries = Object.entries(tree.nodes) as [string, TreeNode][];
      console.log(`Converting object with ${entries.length} entries to Map for tree ${tree.id}`);
      nodesMap = new Map(entries);
    } else {
      console.log(`Creating empty Map for tree ${tree.id} - nodes was:`, typeof tree.nodes, tree.nodes);
      nodesMap = new Map();
    }
    
    // Update the tree's actual nodes reference to be the Map
    tree.nodes = nodesMap;
    tree.lastModified = new Date().toISOString();
    
    // Add to pending saves
    this.pendingSaves.set(tree.id, tree);
    
    // Debounce the actual save operation
    this.debouncedSave();
  }

  // Debounced save implementation
  private debouncedSave(): void {
    if (this.saveTimeoutId !== null) {
      clearTimeout(this.saveTimeoutId);
    }
    
    this.saveTimeoutId = window.setTimeout(() => {
      this.flushPendingSaves();
      this.saveTimeoutId = null;
    }, this.SAVE_DEBOUNCE_MS);
  }

  // Flush all pending saves to localStorage
  private flushPendingSaves(): void {
    if (this.pendingSaves.size === 0) return;

    try {
      // Use requestIdleCallback for non-blocking save when available
      const saveOperation = () => {
        // Get fresh trees to avoid mutating cached data
        const stored = localStorage.getItem(this.storageKey);
        const trees = stored ? JSON.parse(stored) : {};
        
        // Batch update all pending trees
        this.pendingSaves.forEach((tree, treeId) => {
          const serializedTree = {
            ...tree,
            nodes: Array.from(tree.nodes.entries())
          };
          
          console.log(`BATCHED SAVE: Tree ${treeId} with ${tree.nodes.size} nodes`);
          trees[treeId] = serializedTree as any;
        });
        
        // Single localStorage write for all batched updates
        localStorage.setItem(this.storageKey, JSON.stringify(trees));
        console.log(`FLUSHED: ${this.pendingSaves.size} trees to localStorage`);
        
        // Clear pending saves
        this.pendingSaves.clear();
      };

      // Use requestIdleCallback if available, otherwise immediate execution
      if ('requestIdleCallback' in window) {
        requestIdleCallback(saveOperation, { timeout: 1000 });
      } else {
        saveOperation();
      }
    } catch (error) {
      console.error('Error flushing pending saves:', error);
      this.pendingSaves.clear();
    }
  }

  // Force immediate save (for critical operations)
  private forceSave(tree?: ConversationTree): void {
    if (tree) {
      this.pendingSaves.set(tree.id, tree);
    }
    
    if (this.saveTimeoutId !== null) {
      clearTimeout(this.saveTimeoutId);
      this.saveTimeoutId = null;
    }
    
    this.flushPendingSaves();
  }

  // Get all trees from localStorage
  getAllTrees(): Record<string, ConversationTree> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      const trees = stored ? JSON.parse(stored) : {};
      
      // Convert arrays back to Maps
      Object.keys(trees).forEach(treeId => {
        const tree = trees[treeId];
        
        // Convert nodes to Map
        if (Array.isArray(tree.nodes)) {
          console.log(`LOADING: Tree ${treeId} from localStorage array with ${tree.nodes.length} entries`);
          tree.nodes = new Map(tree.nodes);
        } else if (tree.nodes && typeof tree.nodes === 'object' && !(tree.nodes instanceof Map)) {
          // Handle case where nodes is stored as an object but needs to be a Map
          const nodeEntries = Object.entries(tree.nodes);
          console.log(`LOADING: Tree ${treeId} from localStorage object with ${nodeEntries.length} entries`);
          tree.nodes = new Map(nodeEntries);
        } else if (!tree.nodes) {
          // Handle case where nodes is null/undefined
          console.log(`LOADING: Tree ${treeId} has null/undefined nodes, creating empty Map`);
          tree.nodes = new Map();
        }
        
        // Verify the conversion worked
        if (!(tree.nodes instanceof Map)) {
          console.error(`CONVERSION FAILED: Tree ${treeId} nodes is still not a Map:`, typeof tree.nodes, tree.nodes);
          tree.nodes = new Map();
        }
        
        // Validate and fix rootNodes array only once after loading
        if (tree.nodes && tree.nodes.size > 0) {
          const validRootNodes = tree.rootNodes.filter((rootId: string) => tree.nodes.has(rootId));
          if (validRootNodes.length !== tree.rootNodes.length) {
            console.log(`WARNING: Tree ${treeId} has invalid root nodes. Reconstructing...`);
            
            // If no valid root nodes, try to reconstruct by finding nodes without parents
            if (validRootNodes.length === 0) {
              const actualRootNodes: string[] = [];
              tree.nodes.forEach((node: TreeNode, nodeId: string) => {
                if (!node.parentId) {
                  actualRootNodes.push(nodeId);
                }
              });
              tree.rootNodes = actualRootNodes;
              console.log(`Reconstructed root nodes for tree ${treeId}:`, actualRootNodes);
            } else {
              tree.rootNodes = validRootNodes;
            }
          }
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
    const tree = trees[this.currentTreeId];
    if (!tree) return null;
    
    // Ensure the tree's nodes is always a Map
    if (!(tree.nodes instanceof Map)) {
      if (Array.isArray(tree.nodes)) {
        tree.nodes = new Map(tree.nodes);
      } else if (tree.nodes && typeof tree.nodes === 'object') {
        tree.nodes = new Map(Object.entries(tree.nodes));
      } else {
        tree.nodes = new Map();
      }
    }
    
    return tree;
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

    // Ensure tree.nodes is a Map
    if (!(tree.nodes instanceof Map)) {
      if (Array.isArray(tree.nodes)) {
        tree.nodes = new Map(tree.nodes);
      } else if (tree.nodes && typeof tree.nodes === 'object') {
        tree.nodes = new Map(Object.entries(tree.nodes));
      } else {
        tree.nodes = new Map();
      }
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
    
    if (!tree) {
      console.log('ERROR: No current tree found');
      return [];
    }
    
    if (!tree.nodes.has(nodeId)) {
      console.log(`ERROR: Node ${nodeId} not found in tree ${tree.id}. Available nodes:`, Array.from(tree.nodes.keys()));
      return [];
    }

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

    console.log(`Loaded branch from ${nodeId}: ${messages.length} messages`);
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
    console.log(`Switching to tree: ${treeId}`);
    const trees = this.getAllTrees();
    console.log('Available trees:', Object.keys(trees));
    
    if (trees[treeId]) {
      const targetTree = trees[treeId];
      console.log(`Target tree ${treeId} - nodes size:`, targetTree.nodes?.size, 'metadata totalNodes:', targetTree.metadata?.totalNodes);
      
      // Check for data inconsistency
      if (targetTree.metadata?.totalNodes > 0 && targetTree.nodes?.size === 0) {
        console.warn(`DATA INCONSISTENCY: Tree ${treeId} metadata says ${targetTree.metadata.totalNodes} nodes but Map has ${targetTree.nodes.size} nodes`);
        console.warn(`Root nodes:`, targetTree.rootNodes);
      }
      
      this.currentTreeId = treeId;
      const switchedTree = this.getCurrentTree();
      console.log('After switch - current tree:', switchedTree?.id, 'nodes size:', switchedTree?.nodes.size);
      return true;
    }
    console.log('ERROR: Tree not found in available trees');
    return false;
  }

  // Delete a tree
  deleteTree(treeId: string): boolean {
    const trees = this.getAllTrees();
    if (trees[treeId]) {
      delete trees[treeId];
      
      // Force immediate save for deletion
      const allTrees = Object.fromEntries(
        Object.entries(trees).map(([id, t]) => [
          id,
          {
            ...t,
            nodes: Array.from(t.nodes instanceof Map ? t.nodes : new Map(t.nodes))
          }
        ])
      );
      localStorage.setItem(this.storageKey, JSON.stringify(allTrees));
      
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