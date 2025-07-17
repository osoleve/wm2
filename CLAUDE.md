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

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Architecture Overview

### Core Technologies
- React 19.1.0 with functional components and hooks
- Vite for build tooling
- CSS Modules with CSS custom properties
- Netlify Functions for API proxying
- Pure JavaScript (no TypeScript)

### Key Components

1. **Chat System** (`src/components/`)
   - `Chat.jsx` - Main container with header
   - `ChatMessages.jsx` - Message list with branching support
   - `ChatInput.jsx` - Input with model selection
   - `Message.jsx` - Individual messages with edit/regenerate controls

2. **Prism Mode** - Unique multi-perspective analysis
   - `PrismToggle.jsx` - Enable/disable Prism mode
   - `PrismTabs.jsx` - View individual perspectives
   - `prismService.js` - Parallel processing of 5-10 theoretical lenses
   - 498 perspective files in `public/prism/`

3. **State Management** (`src/hooks/useChat.js`)
   - Message tree structure using Map for efficient lookups
   - Conversation branching with active path tracking
   - Version history for all message edits
   - Local storage persistence

4. **API Integration** (`src/services/chatService.js`)
   - OpenRouter API (multiple models: GPT-4, Claude, Llama)
   - GROQ SDK integration
   - Streaming responses
   - Error handling and retry logic

### Message Management Features
- **Branching**: Edit messages to create alternate conversation paths
- **Version History**: Track all edits with timestamps
- **Navigation**: Move between conversation branches
- **Unique IDs**: Every message has a UUID

### Development Notes

1. **API Keys**: Environment variables required
   - `VITE_OPENROUTER_API_KEY`
   - `VITE_GROQ_API_KEY`

2. **Character Limit**: 16,384 per message

3. **CSS Architecture**: 
   - Mobile-first responsive design (320px to 4K)
   - Dark theme with sage/amber palette
   - 60fps animation target

4. **Code Style**:
   - Functional components only
   - No TypeScript - pure JavaScript
   - CSS Modules for component styling
   - Avoid inline styles

5. **Testing**: No test framework configured yet

## File Structure

```
src/
├── components/     # UI components
├── hooks/         # Custom React hooks
├── services/      # API and business logic
└── utils/         # Utilities

netlify/functions/ # Serverless API proxies
public/prism/      # 498 theoretical perspective text files, ignore
```

## Recent Changes
- Enhanced message state control system
- Version management features
- Increased character limit from default
- System prompt toggle functionality