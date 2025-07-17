# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Wittgenstein's Monster (W.M.) - AI Chat Application

A React-based AI chat application with a unique "Prism" mode that analyzes questions through 498 different theoretical perspectives.

## Development Commands

```bash
# Development with API (recommended)
npm run dev:netlify

# UI-only development
npm run dev

# Build for production
npm run build

# TypeScript type checking
npm run type-check

# TypeScript type checking with watch mode
npm run type-check:watch

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Architecture Overview

### Core Technologies
- React 19.1.0 with TypeScript and functional components/hooks
- Vite 7.0.4 for build tooling
- CSS Modules with CSS custom properties
- Netlify Functions for API proxying
- TypeScript with strict configuration

### Core Architecture Patterns

1. **Message Tree System** - Advanced conversation management
   - Map-based data structure for O(1) message lookups  
   - Branching conversations: edit any message to create alternate paths
   - Version history: every edit creates a new version with timestamps
   - Tree navigation: seamlessly move between conversation branches
   - UUID-based message identification for precise tracking

2. **Prism Mode** - Multi-perspective AI analysis (unique feature)
   - AI-driven perspective selection from 498 theoretical frameworks
   - Parallel processing of 5-8 most relevant perspectives per query
   - Synthesis generation combining multiple viewpoints
   - Individual perspective tabs for detailed exploration
   - Perspective files stored in `public/prism/` (do not modify)

3. **Dual API Architecture**
   - OpenRouter API: Multiple models (GPT-4, Claude, Llama variants)
   - GROQ SDK: High-performance inference with Kimi K2 default
   - Runtime provider switching with fallback strategies
   - Streaming response handling with error recovery

4. **State Management Pattern**
   - Custom `useChat` hook centralizes all conversation state
   - Local storage persistence with automatic save/load
   - Tree structure maintained in Map for efficient operations
   - Event-driven updates trigger UI re-renders

### Key Development Considerations

1. **Environment Setup**
   - API Keys required: `VITE_OPENROUTER_API_KEY`, `VITE_GROQ_API_KEY`
   - Use `npm run dev:netlify` for full API functionality
   - Character limit: 16,384 per message

2. **TypeScript Configuration**
   - Strict mode enabled with comprehensive linting
   - Path aliases: `@/*` maps to `src/*`
   - Use `npm run type-check` before commits
   - Migration from JavaScript to TypeScript in progress

3. **CSS Architecture & Theming**
   - Enhanced sage/amber color palette with rich depth
   - CSS custom properties for dynamic theming
   - Mobile-first responsive design (320px to 4K)
   - Glass morphism effects with backdrop-filter
   - 60fps animation performance target

4. **Prism Mode Workflow** (Critical Understanding)
   - Never modify files in `public/prism/` - these are curated theoretical perspectives
   - Prism processing: AI selects → parallel generates → synthesizes → displays
   - Perspective selection happens in `prismService` using AI reasoning
   - Each query triggers new perspective selection (not cached)

## Data Flow Architecture

### Message Processing Pipeline
1. **Input** → ChatInput component captures user message
2. **Tree Update** → Message added to conversation tree structure  
3. **API Routing** → Request routed to OpenRouter or GROQ based on model selection
4. **Prism Analysis** (if enabled) → AI selects perspectives → parallel processing → synthesis
5. **Response Storage** → AI response stored in tree with relationships
6. **UI Update** → React state updates trigger re-render of message components

### Conversation Tree Management
- **Node Structure**: Each message is a node with parent/child relationships
- **Branch Creation**: Editing any message creates a new branch from that point
- **Path Tracking**: Active conversation path maintained for current view
- **Persistence**: Entire tree serialized to localStorage automatically

## Component Architecture

```
App.tsx
└── Chat.tsx (Main container with header/model selection)
    ├── ChatMessages.tsx (Tree traversal and message rendering)
    │   └── Message.tsx (Individual message with edit/regenerate controls)
    │       ├── PrismTabs.tsx (Perspective display)
    │       └── VersionHistory.tsx (Edit history modal)
    ├── ChatInput.tsx (Input with model/provider selection)
    ├── PrismToggle.tsx (Enable/disable multi-perspective mode)
    ├── SystemPromptToggle.tsx (System prompt visibility)
    └── BranchNavigation.tsx (Tree navigation controls)
```

## Key Files to Understand

- `src/hooks/useChat.ts` - Central state management and tree operations
- `src/services/chatService.ts` - API integration with error handling  
- `src/services/prismService.ts` - Multi-perspective analysis workflow
- `src/components/ChatMessages.tsx` - Tree traversal and rendering logic
- `public/prism/` - 498 theoretical perspective files (read-only)