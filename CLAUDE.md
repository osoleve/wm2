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
   - Typescript only
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
- Migrate to typescript
- System prompt toggle functionality