import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import Message from './Message';
import { MessageWithPrism, Version, BranchInfo, PrismResponse } from '../types';
import './ChatMessages.css';

interface ChatMessagesProps {
  messages: MessageWithPrism[];
  isLoading: boolean;
  onSendMessage?: (message: string, model: string) => void;
  selectedModel: string;
  isPrismMode: boolean;
  prismResponses?: PrismResponse[]; // unused
  onEditMessage: (messageId: string, newContent: string) => void;
  onRegenerateMessage: (messageId: string) => void;
  onCopyMessage: (messageId: string) => Promise<boolean>;
  onNavigateBranch: (messageId: string) => void;
  getBranchInfo?: (messageId: string) => BranchInfo | null;
  getMessageVersions?: (messageId: string) => Version[];
  onSwitchToVersion: (messageId: string, versionId: string) => void;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ 
  messages, 
  isLoading, 
  onSendMessage, 
  selectedModel,
  isPrismMode: _isPrismMode, // unused
  prismResponses: _prismResponses, // unused
  onEditMessage,
  onRegenerateMessage,
  onCopyMessage,
  onNavigateBranch,
  getBranchInfo,
  getMessageVersions,
  onSwitchToVersion
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  
  // Virtual scrolling state
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  
  // Virtual scrolling constants
  const ESTIMATED_MESSAGE_HEIGHT = 150; // Average message height
  const BUFFER_SIZE = 5; // Number of messages to render outside viewport
  const ENABLE_VIRTUAL_SCROLLING_THRESHOLD = 50; // Enable when > 50 messages

  const examplePrompts: string[] = [
    "How do we deal with food stamp fraud without harming the vulnerable?",
    "What are the implications of LLMs on entrenched interests in the US?",
  ];

  // Determine if virtual scrolling should be enabled
  const useVirtualScrolling = useMemo(() => {
    return messages.length > ENABLE_VIRTUAL_SCROLLING_THRESHOLD;
  }, [messages.length]);

  // Calculate visible range for virtual scrolling
  const visibleRange = useMemo(() => {
    if (!useVirtualScrolling) {
      return { start: 0, end: messages.length };
    }

    const startIndex = Math.max(0, Math.floor(scrollTop / ESTIMATED_MESSAGE_HEIGHT) - BUFFER_SIZE);
    const endIndex = Math.min(
      messages.length,
      Math.ceil((scrollTop + containerHeight) / ESTIMATED_MESSAGE_HEIGHT) + BUFFER_SIZE
    );

    return { start: startIndex, end: endIndex };
  }, [useVirtualScrolling, scrollTop, containerHeight, messages.length]);

  // Calculate total height for virtual scrolling
  const totalHeight = useMemo(() => {
    return useVirtualScrolling ? messages.length * ESTIMATED_MESSAGE_HEIGHT : 0;
  }, [useVirtualScrolling, messages.length]);

  // Get visible messages
  const visibleMessages = useMemo(() => {
    if (!useVirtualScrolling) {
      return messages.map((message, index) => ({ message, index }));
    }

    return messages
      .slice(visibleRange.start, visibleRange.end)
      .map((message, relativeIndex) => ({
        message,
        index: visibleRange.start + relativeIndex
      }));
  }, [messages, useVirtualScrolling, visibleRange]);

  // Handle scroll events for virtual scrolling
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setScrollTop(target.scrollTop);
  }, []);

  // Update container height
  useEffect(() => {
    const updateHeight = () => {
      if (chatMessagesRef.current) {
        setContainerHeight(chatMessagesRef.current.clientHeight);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const scrollToBottom = (): void => {
    if (messagesEndRef.current && chatMessagesRef.current) {
      // Use scrollTop instead of scrollIntoView to prevent height expansion
      const container = chatMessagesRef.current;
      container.scrollTop = container.scrollHeight;
    }
  };

  const isNearBottom = (): boolean => {
    if (!chatMessagesRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = chatMessagesRef.current;
    return scrollHeight - scrollTop - clientHeight < 100; // Within 100px of bottom
  };

  useEffect(() => {
    if (messages.length === 0) {
      // Reset scroll position and force layout recalculation when switching to empty state
      if (chatMessagesRef.current) {
        chatMessagesRef.current.scrollTop = 0;
        // Force reflow to ensure proper height calculation
        chatMessagesRef.current.style.height = 'auto';
        chatMessagesRef.current.offsetHeight; // Trigger reflow
        chatMessagesRef.current.style.height = '';
      }
    } else if (messages.length > 0) {
      // Only auto-scroll if user was already near the bottom or if the last message is from assistant
      const lastMessage = messages[messages.length - 1];
      const shouldScroll = lastMessage.role === 'assistant' || isNearBottom();
      
      if (shouldScroll) {
        // Use requestAnimationFrame for smooth, consistent scroll timing
        requestAnimationFrame(() => {
          scrollToBottom();
        });
      }
    }
  }, [messages]);

  // Handle scrolling when loading state changes
  useEffect(() => {
    if (isLoading && messages.length > 0) {
      // When loading starts, scroll to bottom if user was near bottom
      if (isNearBottom()) {
        // Use requestAnimationFrame for smoother scroll timing
        requestAnimationFrame(() => {
          scrollToBottom();
        });
      }
    }
  }, [isLoading]);

  return (
    <div 
      ref={chatMessagesRef}
      className={`chat-messages ambient-light ${messages.length === 0 ? 'empty' : ''}`}
      onScroll={useVirtualScrolling ? handleScroll : undefined}
      style={{
        ...(useVirtualScrolling && {
          overflowY: 'auto',
          position: 'relative'
        })
      }}
    >
      {messages.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-background">
            <div className="floating-orb orb-1"></div>
            <div className="floating-orb orb-2"></div>
            <div className="floating-orb orb-3"></div>
          </div>
          
          <div className="empty-state-content">
            <h2>
              The <span className="highlight2">limits</span> of your <span className="highlight">language</span>
              <br />are 
              the <span className="highlight2">limits</span> of your <span className="highlight">world</span>
            </h2>
            
            <p className="tagline">
              Enable Prism mode to gain new perspectives
            </p>
            
            <div className="example-prompts">
              <p className="prompts-label">Try asking:</p>
              {examplePrompts.map((prompt, index) => (
                <button
                  key={index}
                  className="example-prompt"
                  onClick={() => onSendMessage && onSendMessage(prompt, selectedModel)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {useVirtualScrolling && (
            // Virtual scrolling container
            <div style={{ height: totalHeight, position: 'relative' }}>
              {/* Spacer for items before visible range */}
              <div style={{ height: visibleRange.start * ESTIMATED_MESSAGE_HEIGHT }} />
              
              {/* Render visible messages */}
              {visibleMessages.map(({ message, index }) => (
                <div
                  key={message.id || index}
                  style={{
                    position: 'relative',
                    minHeight: ESTIMATED_MESSAGE_HEIGHT
                  }}
                >
                  <Message
                    message={message}
                    isUser={message.role === 'user'}
                    isLast={index === messages.length - 1}
                    onEdit={onEditMessage}
                    onRegenerate={onRegenerateMessage}
                    onCopy={onCopyMessage}
                    onNavigateBranch={onNavigateBranch}
                    getBranchInfo={getBranchInfo}
                    getMessageVersions={getMessageVersions}
                    onSwitchToVersion={onSwitchToVersion}
                    isPrismMode={message.isPrism || false}
                  />
                </div>
              ))}
              
              {/* Spacer for items after visible range */}
              <div style={{ height: (messages.length - visibleRange.end) * ESTIMATED_MESSAGE_HEIGHT }} />
            </div>
          )}
          
          {!useVirtualScrolling && (
            // Regular rendering for smaller message lists
            <>
              {messages.map((message, index) => (
                <Message
                  key={message.id || index}
                  message={message}
                  isUser={message.role === 'user'}
                  isLast={index === messages.length - 1}
                  onEdit={onEditMessage}
                  onRegenerate={onRegenerateMessage}
                  onCopy={onCopyMessage}
                  onNavigateBranch={onNavigateBranch}
                  getBranchInfo={getBranchInfo}
                  getMessageVersions={getMessageVersions}
                  onSwitchToVersion={onSwitchToVersion}
                  isPrismMode={message.isPrism || false}
                />
              ))}
            </>
          )}
          
          {isLoading && (
            <div className="typing-indicator">
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div className="typing-text"></div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};

export default ChatMessages;