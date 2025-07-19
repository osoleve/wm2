# AGENTS.md

This file provides guidance to AI agents and assistants when working with code in this repository.

## Wittgenstein's Monster (W.M.) - AI Chat Application

A React-based AI chat application with a unique "Prism" mode that analyzes questions through 498 different theoretical perspectives.

## Key Commands for Development

```bash
# Development with API (recommended)
npm run dev:netlify

# Build for production
npm run build

# TypeScript type checking
npm run type-check

# Run tests
npm test

# Lint code
npm run lint
```

## Architecture Overview

### Core Technologies
- React 19.1.0 with TypeScript
- Vite 7.0.4 for build tooling
- CSS Modules with custom properties
- Netlify Functions for API proxying

### Key Features

1. **Message Tree System**
   - Branching conversations with version history
   - Edit any message to create alternate conversation paths
   - Efficient Map-based storage for quick lookups

2. **Prism Mode** (Unique Feature)
   - Analyzes questions through multiple theoretical perspectives
   - AI selects 5-8 relevant perspectives from 498 available
   - Parallel processing with synthesized results

3. **Dual API Architecture**
   - OpenRouter: Access to GPT-4, Claude, Llama models
   - GROQ: High-performance inference with Kimi K2
   - Runtime provider switching

## Critical Guidelines for AI Agents

### Do's
- ✅ Use TypeScript for all new code
- ✅ Follow existing code patterns and conventions
- ✅ Run type checking before completing tasks
- ✅ Test your changes thoroughly
- ✅ Preserve the message tree structure
- ✅ Use environment variables for API keys
- ✅ Follow the functional component pattern

### Don'ts
- ❌ Never modify files in `public/prism/` directory
- ❌ Never expose API keys in client code
- ❌ Never break the conversation tree structure
- ❌ Never use class components (use functional only)
- ❌ Never commit without running lint and type-check

## Key Files and Their Purpose

### Core State Management
- `src/hooks/useChat.ts` - Central conversation state
- `src/services/conversationTreeService.ts` - Tree persistence

### API Integration
- `src/services/chatService.ts` - AI model communication
- `src/services/prismService.ts` - Multi-perspective analysis
- `netlify/functions/` - API proxy functions

### UI Components
- `src/components/Chat.tsx` - Main container
- `src/components/ChatMessages.tsx` - Message rendering
- `src/components/Message.tsx` - Individual messages
- `src/components/PrismTabs.tsx` - Perspective display

## Working with the Codebase

### Adding New Features
1. Understand the existing patterns first
2. Use TypeScript with proper types
3. Follow the established component structure
4. Test your changes thoroughly
5. Ensure mobile responsiveness

### Modifying Existing Code
1. Read the surrounding context
2. Maintain consistency with existing patterns
3. Preserve all functionality
4. Update tests if needed
5. Check for TypeScript errors

### API Integration
- All external API calls must go through Netlify Functions
- Never expose API keys in frontend code
- Handle errors gracefully with user-friendly messages
- Implement proper loading states

## Performance Considerations
- Character limit: 16,384 per message
- Target 60fps for animations
- Mobile-first responsive design
- Use Map objects for efficient lookups
- Implement proper memoization where needed

## Testing Requirements
- Write tests for new functionality
- Use Vitest and Testing Library
- Focus on behavior, not implementation
- Mock external dependencies
- Ensure accessibility compliance

## Common Tasks

### Adding a New AI Model
1. Update model options in chatService
2. Add provider configuration if needed
3. Update UI model selector
4. Test streaming responses
5. Handle model-specific quirks

### Enhancing Prism Mode
1. Perspective files are read-only (don't modify)
2. Improve selection algorithm in prismService
3. Optimize parallel processing
4. Enhance synthesis quality
5. Maintain UI responsiveness

### Improving Conversation Trees
1. Preserve parent/child relationships
2. Maintain UUID consistency
3. Handle edge cases (orphaned nodes)
4. Optimize tree traversal
5. Ensure proper persistence

## Environment Setup
Required environment variables:
- `VITE_OPENROUTER_API_KEY`
- `VITE_GROQ_API_KEY`

Use `.env.local` for local development.

## Debugging Tips
- Check browser console for errors
- Verify API responses in Network tab
- Use React DevTools for state inspection
- Check localStorage for persistence issues
- Monitor performance with Chrome DevTools

## Code Style
- Functional components only
- Async/await for asynchronous code
- CSS custom properties for theming
- BEM-like naming for CSS classes
- Comprehensive TypeScript types

## Security Considerations
- Never commit API keys
- Sanitize user inputs
- Validate API responses
- Handle authentication properly
- Follow OWASP guidelines

Remember: The goal is to maintain and enhance a sophisticated AI chat application while preserving its unique features and architectural integrity.