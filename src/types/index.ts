export type MessageRole = 'user' | 'assistant' | 'system';

export interface Version {
  id: string;
  content: string;
  timestamp: number;
  isCurrent?: boolean;
}

export interface PrismResponse {
  lens: string;
  perspective: string;
  timestamp: number;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  parentId: string | null;
  children: string[];
  isEdited?: boolean;
  originalId?: string;
  versions?: Version[];
  isPrism?: boolean;
  prismResponses?: PrismResponse[];
}

export interface TreeNode extends Message {
  depth: number;
}

export interface TreeMetadata {
  totalNodes: number;
  maxDepth: number;
  branches: number;
}

export interface ConversationTree {
  id: string;
  title: string;
  created: string;
  lastModified: string;
  nodes: Map<string, TreeNode>;
  rootNodes: string[];
  metadata: TreeMetadata;
}

export type BranchInfo = 
  | { hasBranches: false }
  | {
      hasBranches: true;
      branchCount: number;
      currentBranchIndex: number;
      siblings: string[];
    };

export interface TreeStats {
  totalMessages: number;
  userMessages: number;
  aiMessages: number;
  prismMessages: number;
  branches: number;
  maxDepth: number;
  created: string;
  lastModified: string;
}

export interface SearchMatch {
  nodeId: string;
  content: string;
  role: string;
  timestamp: number;
}

export interface SearchResult {
  treeId: string;
  title: string;
  matches: SearchMatch[];
  lastModified: string;
}

export interface TreeExport {
  id: string;
  title: string;
  created: string;
  lastModified: string;
  nodes: [string, TreeNode][];
  rootNodes: string[];
  metadata: TreeMetadata;
  exported: string;
  version: string;
  imported?: string;
}

export interface ChatServiceResponse {
  id?: string;
  role: 'assistant';
  content: string;
  timestamp?: number;
  parentId?: string;
  children?: string[];
  isPrism?: boolean;
  prismResponses?: PrismResponse[];
}

export interface ChatHookState {
  messages: Map<string, Message>;
  activePath: string[];
  currentModel: string;
  models: string[];
  isLoading: boolean;
  error: string | null;
  showSystemPrompt: boolean;
  isPrismMode: boolean;
}

export interface ChatHookActions {
  sendMessage: (content: string) => Promise<void>;
  updateMessage: (id: string, newContent: string) => void;
  deleteMessage: (id: string) => void;
  setCurrentModel: (model: string) => void;
  toggleSystemPrompt: () => void;
  togglePrismMode: () => void;
  regenerateMessage: (messageId: string) => Promise<void>;
  navigateToBranch: (messageId: string) => void;
  clearMessages: () => void;
}

export interface PrismPerspective {
  perspective: string;
  content: string;
}

export interface MessageWithPrism extends Message {
  synthesis?: string;
  perspectives?: PrismPerspective[];
}

export interface Model {
  id: string;
  name: string;
  context_length?: number;
}

export type Provider = 'openrouter' | 'groq';