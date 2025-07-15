# UI Improvements Implementation Guide

## 1. Fix Header Spacing on Mobile

### Update `src/components/ChatMessages.css`

```css
@media (max-width: 768px) {
  .chat-messages {
    padding: 0.75rem;
    gap: 0.75rem;
    padding-top: 75px; /* Match header height + small buffer */
    margin-top: 0; /* Reset any margin */
  }
}
```

### Update `src/components/Chat.css`

```css
@media (max-width: 768px) {
  .chat-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary));
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
}
```

## 2. Enhance the Empty State

### Update `src/components/ChatMessages.jsx`

Add example prompts and animated background:

```jsx
const examplePrompts = [
  "Analyze the implications of AI consciousness from multiple philosophical perspectives",
  "What are the different schools of thought on climate change solutions?",
  "Compare Eastern and Western approaches to mindfulness and meditation",
  "Explore the concept of justice through various ethical frameworks"
];

// In the empty state section:
{messages.length === 0 ? (
  <div className="empty-state">
    <div className="empty-state-background">
      <div className="floating-orb orb-1"></div>
      <div className="floating-orb orb-2"></div>
      <div className="floating-orb orb-3"></div>
    </div>
    
    <div className="empty-state-content">
      <h3>
        The <span className="highlight2">limits</span> of your <span className="highlight">language</span>
        <br />are 
        the <span className="highlight2">limits</span> of your <span className="highlight">world</span>
      </h3>
      
      <p className="tagline">
        Enable Prism mode to explore questions through multiple theoretical lenses
      </p>
      
      <div className="example-prompts">
        <p className="prompts-label">Try asking:</p>
        {examplePrompts.map((prompt, index) => (
          <button
            key={index}
            className="example-prompt"
            onClick={() => onSendMessage(prompt, selectedModel)}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  </div>
) : (
  // ... existing messages
)}
```

### Update `src/components/ChatMessages.css`

```css
.empty-state {
  position: relative;
  overflow: hidden;
}

.empty-state-background {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.floating-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.1;
  animation: float 20s infinite ease-in-out;
}

.orb-1 {
  width: 300px;
  height: 300px;
  background: var(--gradient-sage);
  top: -150px;
  left: -150px;
  animation-delay: 0s;
}

.orb-2 {
  width: 200px;
  height: 200px;
  background: var(--gradient-amber);
  bottom: -100px;
  right: -100px;
  animation-delay: 7s;
}

.orb-3 {
  width: 250px;
  height: 250px;
  background: var(--gradient-sage);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: 14s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -30px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

.empty-state-content {
  position: relative;
  z-index: 1;
}

.tagline {
  color: var(--text-secondary);
  font-size: 1rem;
  margin: 1.5rem 0 2rem;
  opacity: 0.9;
  font-style: italic;
}

.example-prompts {
  margin-top: 2rem;
}

.prompts-label {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 500;
}

.example-prompt {
  display: block;
  width: 100%;
  max-width: 500px;
  margin: 0.75rem auto;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, rgba(42, 40, 38, 0.6), rgba(36, 35, 33, 0.6));
  border: 1px solid var(--border-light);
  border-radius: 1rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.example-prompt:hover {
  background: linear-gradient(135deg, rgba(143, 166, 142, 0.1), rgba(143, 166, 142, 0.05));
  border-color: var(--accent-color);
  color: var(--text-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(143, 166, 142, 0.15);
}
```

## 3. Improve the Prism Toggle

### Update `src/components/PrismToggle.jsx`

```jsx
import React, { useState } from 'react';
import './PrismToggle.css';

const PrismToggle = ({ isPrismEnabled, onToggle, isLoading }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleToggle = () => {
    onToggle();
    setHasInteracted(true);
    setShowTooltip(false);
  };

  const handleMouseEnter = () => {
    if (!hasInteracted) {
      setShowTooltip(true);
    }
  };

  return (
    <div className="prism-toggle-container">
      <div 
        className="prism-toggle-wrapper"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <button
          onClick={handleToggle}
          className={`prism-toggle-button ${isPrismEnabled ? 'enabled' : 'disabled'}`}
          disabled={isLoading}
        >
          <div className="toggle-track">
            <div className="toggle-labels">
              <span className="label-off">Single</span>
              <span className="label-on">Prism</span>
            </div>
            <div className="toggle-thumb">
              {isPrismEnabled ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L4 9V15L12 22L20 15V9L12 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 2L12 22M4 9L12 15L20 9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.6"
                  />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="3" fill="currentColor"/>
                </svg>
              )}
            </div>
          </div>
        </button>
        
        {showTooltip && (
          <div className="prism-tooltip">
            <div className="tooltip-arrow"></div>
            Prism mode analyzes your question through multiple theoretical perspectives for deeper insights
          </div>
        )}
      </div>
      
      <div className="prism-status">
        {isPrismEnabled ? (
          <>
            <span className="status-text">Multi-perspective analysis</span>
            {isLoading && (
              <div className="prism-loading">
                <div className="loading-bar"></div>
              </div>
            )}
          </>
        ) : (
          <span className="status-text">Standard chat mode</span>
        )}
      </div>
    </div>
  );
};
```

### Update `src/components/PrismToggle.css`

```css
.prism-toggle-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.prism-toggle-wrapper {
  position: relative;
}

.prism-toggle-button {
  width: 120px;
  height: 48px;
  padding: 4px;
  border-radius: 24px;
  border: 2px solid var(--border-light);
  background: var(--bg-tertiary);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
}

.prism-toggle-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.prism-toggle-button.enabled {
  background: var(--gradient-amber);
  border-color: var(--tab-highlight);
  box-shadow: 0 0 20px rgba(230, 184, 125, 0.3);
}

.toggle-track {
  width: 100%;
  height: 100%;
  position: relative;
}

.toggle-labels {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  pointer-events: none;
}

.label-off,
.label-on {
  font-size: 0.75rem;
  font-weight: 600;
  transition: opacity 0.3s ease;
}

.label-off {
  color: var(--text-secondary);
  opacity: 1;
}

.label-on {
  color: var(--bg-primary);
  opacity: 0;
}

.prism-toggle-button.enabled .label-off {
  opacity: 0;
}

.prism-toggle-button.enabled .label-on {
  opacity: 1;
}

.toggle-thumb {
  position: absolute;
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 20px;
  top: 0;
  left: 0;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.prism-toggle-button.enabled .toggle-thumb {
  left: calc(100% - 40px);
  background: var(--bg-primary);
  color: var(--tab-highlight);
}

.prism-toggle-button.disabled .toggle-thumb {
  color: var(--accent-color);
}

/* Tooltip */
.prism-tooltip {
  position: absolute;
  bottom: calc(100% + 12px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-primary);
  color: var(--text-primary);
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  white-space: nowrap;
  max-width: 250px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-light);
  animation: tooltipFade 0.3s ease;
  z-index: 1000;
}

.tooltip-arrow {
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 12px;
  height: 12px;
  background: var(--bg-primary);
  border-right: 1px solid var(--border-light);
  border-bottom: 1px solid var(--border-light);
  transform: translateX(-50%) rotate(45deg);
}

@keyframes tooltipFade {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.prism-status {
  text-align: center;
}

.status-text {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-style: italic;
}

.prism-loading {
  width: 100px;
  height: 2px;
  background: var(--bg-tertiary);
  border-radius: 1px;
  overflow: hidden;
  margin: 0.25rem auto 0;
}

.loading-bar {
  height: 100%;
  background: var(--gradient-amber);
  animation: loadingSlide 1.5s ease-in-out infinite;
}

@keyframes loadingSlide {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(200%);
  }
}
```

## 5. Refine the Mobile Menu

### Update `src/components/Chat.jsx`

Add model indicator and improve menu:

```jsx
// Add this after the header controls
{isMobileMenuOpen && (
  <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)}>
    <div className="mobile-menu-panel" onClick={(e) => e.stopPropagation()}>
      <div className="mobile-menu-header">
        <h3>Model Settings</h3>
        <button 
          className="mobile-menu-close"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
      
      <div className="mobile-menu-content">
        <div className="model-section">
          <label className="model-label">
            Chat Model
          </label>
          <select 
            value={selectedModel} 
            onChange={(e) => {
              setSelectedModel(e.target.value);
              // Add haptic feedback if available
              if (window.navigator.vibrate) {
                window.navigator.vibrate(10);
              }
            }}
            className="model-select-mobile"
          >
            {models.map(model => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>
        
        {isPrismEnabled && (
          <div className="model-section">
            <label className="model-label">
              Prism Analysis Model
            </label>
            <select 
              value={selectedPrismModel} 
              onChange={(e) => {
                setSelectedPrismModel(e.target.value);
                if (window.navigator.vibrate) {
                  window.navigator.vibrate(10);
                }
              }}
              className="model-select-mobile"
            >
              {models.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div className="mobile-prism-section">
          <PrismToggle 
            isPrismEnabled={isPrismEnabled}
            onToggle={togglePrism}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  </div>
)}

// Replace the mobile menu button with this:
<button 
  className="mobile-model-indicator"
  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
>
  <span className="model-name">
    {models.find(m => m.id === selectedModel)?.name.split(' ')[0] || 'Model'}
  </span>
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 9l6 6 6-6"/>
  </svg>
</button>
```

### Update `src/components/Chat.css`

```css
/* Mobile Model Indicator */
.mobile-model-indicator {
  display: none;
  background: var(--bg-input);
  border: 1px solid var(--border-light);
  border-radius: 20px;
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  align-items: center;
  gap: 0.5rem;
}

.mobile-model-indicator:active {
  transform: scale(0.95);
}

.model-name {
  font-weight: 500;
}

/* Mobile Menu Overlay */
.mobile-menu-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  z-index: 1001;
  display: flex;
  justify-content: flex-end;
  animation: fadeIn 0.2s ease;
}

.mobile-menu-panel {
  width: 85%;
  max-width: 320px;
  height: 100%;
  background: var(--bg-secondary);
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.3);
  transform: translateX(0);
  animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.mobile-menu-header {
  padding: 1.25rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-tertiary);
}

.mobile-menu-content {
  padding: 1.25rem;
  flex: 1;
}

.model-section {
  margin-bottom: 1.5rem;
}

.model-label {
  display: block;
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.model-select-mobile {
  width: 100%;
  padding: 0.875rem;
  border: 1px solid var(--border-light);
  border-radius: 0.75rem;
  background: var(--bg-input);
  color: var(--text-primary);
  font-size: 1rem;
}

.mobile-prism-section {
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

@media (max-width: 768px) {
  .mobile-model-indicator {
    display: flex;
  }
  
  .mobile-menu-button {
    display: none;
  }
}
```

## 6. Polish the Input Area

### Update `src/components/ChatInput.jsx`

Add character counter and auto-resize:

```jsx
const ChatInput = ({ onSendMessage, isLoading, /* ... other props */ }) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);
  const maxLength = 4000;

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      setMessage(newValue);
    }
  };

  return (
    <div className={`chat-input-container ${isPrismEnabled ? 'prism-enabled' : ''} ${isFocused ? 'focused' : ''}`}>
      {/* ... existing header content ... */}
      
      <form onSubmit={handleSubmit} className="chat-form">
        <div className="input-wrapper">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={isPrismEnabled ? "Ask a question for multi-perspective analysis..." : "Type your message here..."}
            className="message-input"
            rows={1}
            disabled={isLoading}
          />
          
          {message.length > 0 && (
            <div className="input-indicators">
              <span className={`char-counter ${message.length > maxLength * 0.9 ? 'warning' : ''}`}>
                {message.length}/{maxLength}
              </span>
            </div>
          )}
          
          <button 
            type="submit" 
            className={`send-button ${message.trim() ? 'ready' : ''}`}
            disabled={!message.trim() || isLoading}
          >
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
```

### Update `src/components/ChatInput.css`

```css
.chat-input-container.focused {
  background: linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary));
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.1);
}

.input-wrapper {
  position: relative;
}

.message-input {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  resize: none;
  overflow-y: auto;
}

.input-indicators {
  position: absolute;
  bottom: 0.5rem;
  right: 4rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.char-counter {
  font-size: 0.75rem;
  color: var(--text-muted);
  transition: color 0.3s ease;
}

.char-counter.warning {
  color: var(--tab-highlight);
  font-weight: 500;
}

.send-button {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.send-button.ready {
  animation: readyPulse 2s ease-in-out infinite;
}

@keyframes readyPulse {
  0%, 100% {
    box-shadow: 0 2px 12px rgba(143, 166, 142, 0.3);
  }
  50% {
    box-shadow: 0 2px 20px rgba(143, 166, 142, 0.5);
  }
}

/* Auto-resize animation */
.message-input:focus {
  box-shadow: 0 0 0 2px rgba(143, 166, 142, 0.2), 
              inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Keyboard shortcut hint */
.chat-form::after {
  content: "↵ Send • ⇧↵ New line";
  position: absolute;
  bottom: -20px;
  right: 0;
  font-size: 0.75rem;
  color: var(--text-muted);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.chat-input-container.focused .chat-form::after {
  opacity: 0.5;
}

@media (max-width: 768px) {
  .input-indicators {
    right: 3rem;
    bottom: 0.375rem;
  }
  
  .char-counter {
    font-size: 0.6875rem;
  }
  
  .chat-form::after {
    display: none;
  }
}
```