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

# Testing
npm test              # Run tests in watch mode
npm run test:run      # Run tests once
npm run test:ui       # Run tests with UI
npm run test:coverage # Run tests with coverage report

# Run specific test files
npm test -- src/components/Message.test.tsx
npm test -- src/services/chatService.test.ts

# Run tests matching pattern
npm test -- --grep "should handle"
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

2. **TypeScript Status**
   - Fully migrated to TypeScript with strict mode enabled
   - Comprehensive linting with path aliases: `@/*` maps to `src/*`
   - Use `npm run type-check` before commits
   - **Completed**: All core files now use TypeScript (.ts/.tsx)
   - All test files use TypeScript with Vitest and Testing Library

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

## Critical Implementation Details

### Message Tree System (Core Data Structure)
- **useChat.ts** manages conversation state using Map data structure
- Each message has UUID, parent/child relationships, version history
- Branching: editing any message creates new conversation path
- Tree navigation allows switching between conversation branches
- Automatic localStorage persistence of entire conversation tree

### Prism Mode Pipeline (Unique Feature)
1. **prismService.ts**: AI selects 5-8 relevant theoretical perspectives 
2. **Parallel Processing**: Each perspective generates response independently
3. **Synthesis**: AI combines perspectives into coherent final response
4. **UI Display**: PrismTabs.tsx shows synthesis + individual perspective tabs
5. **Perspective Files**: `public/prism/` contains 498 curated prompts (read-only)

### API Architecture
- **Dual Providers**: OpenRouter (multiple models) + GROQ (high-performance)
- **Runtime Switching**: Users can change providers/models mid-conversation
- **Netlify Functions**: All API calls proxied through serverless functions
- **Error Recovery**: Automatic fallbacks and user-friendly error messages

## Key Files to Understand

- `src/hooks/useChat.ts` - **Central state management** and tree operations
- `src/services/chatService.ts` - **API integration** with error handling and provider switching
- `src/services/prismService.ts` - **Multi-perspective analysis** workflow and AI perspective selection
- `src/components/ChatMessages.tsx` - **Tree traversal** and message rendering logic
- `public/prism/` - **498 theoretical perspective** files (read-only, never modify)
- `netlify/functions/` - **API proxy functions** for OpenRouter and GROQ

## Testing Strategy

- Vitest with Testing Library for component and service testing
- **Logic-focused testing**: Tests component behavior, not DOM rendering
- Comprehensive mocking for external dependencies (APIs, localStorage)
- Test files use `.test.tsx` extension and located alongside source files
- **Current Coverage**: 
  - Services: chatService.ts, prismService.ts (API integration, error handling)
  - Components: ChatInput, ChatMessages, Message, PrismTabs, BranchNavigation, PrismToggle, SystemPromptToggle
  - Focus on state management, user interactions, edge cases, accessibility

## Code Style Guidelines (from Copilot Instructions)

- **Functional components** with hooks exclusively
- **Full TypeScript** implementation with strict typing
- Follow **React 19** patterns and best practices
- Use **async/await** for asynchronous operations
- **CSS custom properties** for theming with BEM-like naming
- **Map objects** for efficient lookups in conversation trees
- All API calls go through Netlify Functions (never expose API keys)
- **60fps animation performance target** with mobile-first responsive design

## Important Development Constraints

### Required Environment Variables
- `VITE_OPENROUTER_API_KEY` - OpenRouter API access
- `VITE_GROQ_API_KEY` - GROQ API access
- Use `npm run dev:netlify` (not `npm run dev`) for full API functionality

### Critical "Do Not Modify" Areas
- **`public/prism/` directory** - Contains 498 curated theoretical perspective prompts
- **Conversation tree structure** - Preserve parent/child relationships and UUID system
- **API proxy pattern** - All external API calls must go through Netlify Functions

### Performance Requirements
- **Character limit**: 16,384 per message (enforced in ChatInput)
- **Mobile-first**: Responsive design from 320px to 4K
- **60fps animations** with smooth transitions and glass morphism effects
- **Map-based lookups** for O(1) message retrieval in conversation trees