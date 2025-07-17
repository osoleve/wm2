import React, { useRef, useEffect } from 'react';
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

  const examplePrompts: string[] = [
    "How do we deal with food stamp fraud without harming the vulnerable?",
    "What are the implications of LLMs on entrenched interests in the US?",
  ];

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="chat-messages ambient-light">
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
        messages.map((message, index) => (
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
        ))
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
    </div>
  );
};

export default ChatMessages;