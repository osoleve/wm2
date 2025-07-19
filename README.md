# Wittgenstein's Monster (W.M.)

A React-based AI chat application with a unique "Prism" mode that analyzes questions through 498 different theoretical perspectives.

## Features

- **Multi-Model AI Chat**: Support for OpenRouter (GPT-4, Claude, Llama) and GROQ APIs
- **Prism Mode**: Unique multi-perspective analysis using 498 theoretical frameworks
- **Conversation Trees**: Branching conversations with edit history and version control
- **Real-time Streaming**: Live response streaming with error recovery
- **Responsive Design**: Mobile-first design from 320px to 4K displays

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   # Create .env file with your API keys
   VITE_OPENROUTER_API_KEY=your_openrouter_key
   VITE_GROQ_API_KEY=your_groq_key
   ```

3. **Start development server**:
   ```bash
   npm run dev:netlify
   ```

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

# Testing
npm test              # Run tests in watch mode
npm run test:run      # Run tests once
npm run test:coverage # Run tests with coverage
```

## Architecture

### Core Technologies
- React 19.1.0 with TypeScript
- Vite 7.0.4 for build tooling
- CSS Modules with custom properties
- Netlify Functions for API proxying

### Key Features

**Message Tree System**: Advanced conversation management with branching paths, edit history, and UUID-based tracking.

**Prism Mode**: AI-driven perspective selection from 498 theoretical frameworks with parallel processing and synthesis generation.

**Dual API Architecture**: Runtime switching between OpenRouter and GROQ providers with fallback strategies.

## Project Structure

```
src/
├── components/          # React components
│   ├── Chat.tsx        # Main chat container
│   ├── ChatMessages.tsx # Message rendering
│   └── Message.tsx     # Individual messages
├── hooks/
│   └── useChat.ts      # Central state management
├── services/           # API and data services
│   ├── chatService.ts  # API integration
│   ├── prismService.ts # Multi-perspective analysis
│   └── conversationTreeService.ts # Tree persistence
└── types/              # TypeScript definitions

public/prism/           # 498 theoretical perspectives (read-only)
netlify/functions/      # API proxy functions
```

## Contributing

1. Use `npm run type-check` before commits
2. Follow existing TypeScript patterns
3. Test components with `npm test`
4. Never modify files in `public/prism/`

## Environment Setup

- Requires Node.js and npm
- API keys needed for full functionality
- Use `npm run dev:netlify` for complete development environment
- Character limit: 16,384 per message
