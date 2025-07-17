// src/services/exportService.ts
import conversationTreeService from './conversationTreeService';

interface ExportOptions {
  format: 'json' | 'markdown' | 'text';
  includeMetadata?: boolean;
  includePrismData?: boolean;
  includeTimestamps?: boolean;
  treeId?: string;
}

interface ConversationNode {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  isPrism?: boolean;
  perspectives?: Array<{
    perspective: string;
    content: string;
  }>;
  synthesis?: string;
}

class ExportService {
  exportConversation(options: ExportOptions): void {
    const tree = options.treeId 
      ? conversationTreeService.getAllTrees()[options.treeId]
      : conversationTreeService.getCurrentTree();
    
    if (!tree) {
      console.error('No conversation tree found');
      return;
    }

    // Ensure nodes is a Map
    const nodesMap = tree.nodes instanceof Map ? tree.nodes : new Map(tree.nodes);
    const nodes = Array.from(nodesMap.values()) as ConversationNode[];
    const sortedNodes = this.sortNodesByConversationFlow(nodes);

    let content: string;
    let filename: string;
    let mimeType: string;

    switch (options.format) {
      case 'json':
        content = this.exportAsJson(tree, sortedNodes, options);
        filename = `conversation-${tree.title.replace(/\s+/g, '-')}-${Date.now()}.json`;
        mimeType = 'application/json';
        break;
      case 'markdown':
        content = this.exportAsMarkdown(tree, sortedNodes, options);
        filename = `conversation-${tree.title.replace(/\s+/g, '-')}-${Date.now()}.md`;
        mimeType = 'text/markdown';
        break;
      case 'text':
        content = this.exportAsText(tree, sortedNodes, options);
        filename = `conversation-${tree.title.replace(/\s+/g, '-')}-${Date.now()}.txt`;
        mimeType = 'text/plain';
        break;
      default:
        throw new Error('Unsupported export format');
    }

    this.downloadFile(content, filename, mimeType);
  }

  private sortNodesByConversationFlow(nodes: ConversationNode[]): ConversationNode[] {
    // Sort by timestamp to maintain conversation flow
    return nodes.sort((a, b) => a.timestamp - b.timestamp);
  }

  private exportAsJson(tree: any, nodes: ConversationNode[], options: ExportOptions): string {
    const exportData: any = {
      title: tree.title,
      exported: new Date().toISOString(),
      format: 'json',
      messages: nodes.map(node => ({
        id: node.id,
        role: node.role,
        content: node.content,
        ...(options.includeTimestamps && { timestamp: node.timestamp }),
        ...(options.includePrismData && node.isPrism && {
          isPrism: true,
          perspectives: node.perspectives,
          synthesis: node.synthesis
        })
      }))
    };

    if (options.includeMetadata) {
      exportData.metadata = {
        treeId: tree.id,
        created: tree.created,
        lastModified: tree.lastModified,
        stats: conversationTreeService.getTreeStats(tree.id)
      };
    }

    return JSON.stringify(exportData, null, 2);
  }

  private exportAsMarkdown(tree: any, nodes: ConversationNode[], options: ExportOptions): string {
    let content = `# ${tree.title}\n\n`;

    if (options.includeMetadata) {
      content += `**Exported:** ${new Date().toISOString()}\n`;
      content += `**Created:** ${tree.created}\n`;
      content += `**Last Modified:** ${tree.lastModified}\n\n`;
    }

    content += `---\n\n`;

    nodes.forEach((node, index) => {
      if (node.role === 'system') return; // Skip system messages in markdown

      const roleIcon = node.role === 'user' ? '👤' : '🤖';
      const roleTitle = node.role === 'user' ? 'User' : 'Assistant';
      
      content += `## ${roleIcon} ${roleTitle}`;
      
      if (options.includeTimestamps) {
        content += ` *(${new Date(node.timestamp).toLocaleString()})*`;
      }
      
      if (node.isPrism && options.includePrismData) {
        content += ` *[Prism Mode]*`;
      }
      
      content += `\n\n`;

      if (node.isPrism && options.includePrismData && node.perspectives) {
        content += `### Synthesis\n\n${node.synthesis || node.content}\n\n`;
        content += `### Perspectives\n\n`;
        
        node.perspectives.forEach((perspective) => {
          content += `#### ${perspective.perspective}\n\n${perspective.content}\n\n`;
        });
      } else {
        content += `${node.content}\n\n`;
      }

      if (index < nodes.length - 1) {
        content += `---\n\n`;
      }
    });

    return content;
  }

  private exportAsText(tree: any, nodes: ConversationNode[], options: ExportOptions): string {
    let content = `${tree.title}\n${'='.repeat(tree.title.length)}\n\n`;

    if (options.includeMetadata) {
      content += `Exported: ${new Date().toISOString()}\n`;
      content += `Created: ${tree.created}\n`;
      content += `Last Modified: ${tree.lastModified}\n\n`;
    }

    nodes.forEach((node, index) => {
      if (node.role === 'system') return; // Skip system messages in text

      const rolePrefix = node.role === 'user' ? '[USER]' : '[ASSISTANT]';
      
      content += `${rolePrefix}`;
      
      if (options.includeTimestamps) {
        content += ` (${new Date(node.timestamp).toLocaleString()})`;
      }
      
      if (node.isPrism && options.includePrismData) {
        content += ` [PRISM MODE]`;
      }
      
      content += `\n`;

      if (node.isPrism && options.includePrismData && node.perspectives) {
        content += `\nSYNTHESIS:\n${node.synthesis || node.content}\n\n`;
        content += `PERSPECTIVES:\n`;
        
        node.perspectives.forEach((perspective) => {
          content += `\n${perspective.perspective}:\n${perspective.content}\n`;
        });
      } else {
        content += `${node.content}\n`;
      }

      if (index < nodes.length - 1) {
        content += `\n${'-'.repeat(50)}\n\n`;
      }
    });

    return content;
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Get available export formats
  getAvailableFormats(): Array<{id: string, name: string, description: string}> {
    return [
      {
        id: 'json',
        name: 'JSON',
        description: 'Complete conversation data with metadata'
      },
      {
        id: 'markdown',
        name: 'Markdown',
        description: 'Formatted conversation for documentation'
      },
      {
        id: 'text',
        name: 'Plain Text',
        description: 'Simple text format for easy reading'
      }
    ];
  }
}

export default new ExportService();