// src/services/conversationTreeService.js
import { v4 as uuidv4 } from 'uuid';

class ConversationTreeService {
  constructor() {
    this.storageKey = 'prism-conversation-trees';
    this.currentTreeId = null;
    this.initialize();
  }

  initialize() {
    // Load existing trees or create first one
    const trees = this.getAllTrees();
    if (Object.keys(trees).length === 0) {
      this.createNewTree();
    } else {
      // Set the most recent tree as current
      const sortedTrees = Object.values(trees).sort((a, b) => 
        new Date(b.lastModified) - new Date(a.lastModified)
      );
      this.currentTreeId = sortedTrees[0].id;
    }
  }

  // Create a new conversation tree
  createNewTree(title = 'New Conversation') {
    const treeId = uuidv4();
    const tree = {
      id: treeId,
      title,
      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      nodes: new Map(), // Will be serialized as array
      rootNodes: [], // IDs of root messages
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
  saveTree(tree) {
    const trees = this.getAllTrees();
    
    // Convert Map to array for serialization
    const serializedTree = {
      ...tree,
      nodes: Array.from(tree.nodes instanceof Map ? tree.nodes : []),
      lastModified: new Date().toISOString()
    };
    
    trees[tree.id] = serializedTree;
    localStorage.setItem(this.storageKey, JSON.stringify(trees));
  }

  // Get all trees from localStorage
  getAllTrees() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      const trees = stored ? JSON.parse(stored) : {};
      
      // Convert arrays back to Maps
      Object.keys(trees).forEach(treeId => {
        if (Array.isArray(trees[treeId].nodes)) {
          trees[treeId].nodes = new Map(trees[treeId].nodes);
        }
      });
      
      return trees;
    } catch (error) {
      console.error('Error loading conversation trees:', error);
      return {};
    }
  }

  // Get current tree
  getCurrentTree() {
    if (!this.currentTreeId) return null;
    const trees = this.getAllTrees();
    return trees[this.currentTreeId];
  }

  // Add a node to the current tree
  addNode(node, parentId = null) {
    const tree = this.getCurrentTree();
    if (!tree) return null;

    // Ensure node has required properties
    const completeNode = {
      ...node,
      id: node.id || uuidv4(),
      parentId,
      children: node.children || [],
      timestamp: node.timestamp || Date.now(),
      depth: 0
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

    this.saveTree(tree);
    return completeNode.id;
  }

  // Load a branch starting from a specific node
  loadBranch(nodeId, includeAncestors = true) {
    const tree = this.getCurrentTree();
    if (!tree || !tree.nodes.has(nodeId)) return [];

    const messages = [];
    
    // Get ancestors if requested
    if (includeAncestors) {
      const ancestors = this.getAncestors(nodeId);
      messages.push(...ancestors);
    }

    // Get the node itself
    const node = tree.nodes.get(nodeId);
    messages.push(node);

    // Get all descendants following the first child path
    const descendants = this.getDescendants(nodeId, 'first-child');
    messages.push(...descendants);

    return messages;
  }

  // Get all ancestors of a node
  getAncestors(nodeId) {
    const tree = this.getCurrentTree();
    if (!tree) return [];

    const ancestors = [];
    let currentId = nodeId;
    
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
  getDescendants(nodeId, strategy = 'all') {
    const tree = this.getCurrentTree();
    if (!tree) return [];

    const descendants = [];
    const queue = [nodeId];
    const visited = new Set();

    while (queue.length > 0) {
      const currentId = queue.shift();
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
  getBranches(nodeId) {
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
  switchTree(treeId) {
    const trees = this.getAllTrees();
    if (trees[treeId]) {
      this.currentTreeId = treeId;
      return true;
    }
    return false;
  }

  // Delete a tree
  deleteTree(treeId) {
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
  exportTree(treeId = null) {
    const targetTreeId = treeId || this.currentTreeId;
    const trees = this.getAllTrees();
    const tree = trees[targetTreeId];
    if (!tree) return null;

    const exportData = {
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
  importTree(treeData) {
    try {
      const tree = {
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
  getTreeStats(treeId = null) {
    const tree = treeId ? this.getAllTrees()[treeId] : this.getCurrentTree();
    if (!tree) return null;

    const nodes = Array.from(tree.nodes.values());
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
  findCommonAncestor(nodeId1, nodeId2) {
    const tree = this.getCurrentTree();
    if (!tree) return null;

    const ancestors1 = new Set([nodeId1, ...this.getAncestors(nodeId1).map(n => n.id)]);
    
    let current = nodeId2;
    while (current) {
      if (ancestors1.has(current)) return current;
      
      const node = tree.nodes.get(current);
      if (!node) break;
      current = node.parentId;
    }
    
    return null;
  }

  // Prune a branch (delete node and all descendants)
  pruneBranch(nodeId) {
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
  searchTrees(query) {
    const trees = this.getAllTrees();
    const results = [];

    Object.values(trees).forEach(tree => {
      const matches = [];
      
      tree.nodes.forEach((node, nodeId) => {
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