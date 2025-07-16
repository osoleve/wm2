# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a React chat application that integrates with OpenRouter and GROQ APIs for multi-model AI conversations with a unique "Prism" mode for multi-perspective analysis.

## Tech Stack
- **React 19.1.0** with functional components and hooks
- **Vite** for fast development and building
- **OpenAI SDK** configured for OpenRouter API
- **GROQ SDK** for alternative model provider
- **Modern ES6+** JavaScript (no TypeScript)
- **CSS Modules** with CSS custom properties for theming
- **Netlify Functions** for serverless API proxying
- **Netlify** for deployment

## Project Structure
- `/src/components/` - React components for the chat interface
  - `Chat.jsx` - Main chat container with header and controls
  - `ChatMessages.jsx` - Message list display
  - `ChatInput.jsx` - Message input with model selection
  - `Message.jsx` - Individual message display with Prism tabs
  - `PrismToggle.jsx` - Toggle for multi-perspective mode
  - `LoggingDashboard.jsx` - Session history and analytics
- `/src/hooks/` - Custom React hooks
  - `useChat.js` - Main chat state management
  - `useLogging.js` - Session logging hook
- `/src/services/` - Service layer
  - `chatService.js` - API integration for OpenRouter/GROQ
  - `prismService.js` - Multi-perspective analysis logic
  - `loggingService.js` - Local storage session management
- `/src/utils/` - Utility functions
  - `systemPrompt.js` - System prompt loading
- `/netlify/functions/` - Serverless functions
  - `chat.js` - OpenRouter API proxy
  - `groq.js` - GROQ API proxy
- `/public/prism/` - 498 theoretical lens prompt files
- `/public/prompts/` - System prompts

## Key Features
- **Multi-Model Support**: Switch between OpenRouter and GROQ providers
- **Prism Mode**: Analyze questions through 5-10 AI-selected theoretical lenses
- **Conversation Branching**: Edit messages and regenerate responses with branch navigation
- **Session Logging**: Local storage of chat history with analytics
- **Responsive Design**: Mobile-first with dark theme
- **Model Selection**: Choose from various AI models for chat and Prism analysis
- **System Prompt Toggle**: Enable/disable custom system prompts

## Code Style Guidelines
- Use **functional components** with hooks exclusively
- **No TypeScript** - pure JavaScript only
- Follow **React 19** patterns and best practices
- Use **async/await** for asynchronous operations
- Implement proper **error boundaries** and error handling
- Use **CSS custom properties** for theming
- Follow **BEM-like** naming for CSS classes
- Keep components **focused and single-purpose**

## State Management Patterns
- Use **useState** for local component state
- Use **useCallback** for memoized functions
- Use **useEffect** carefully with proper dependencies
- Prefer **lifting state up** over complex state management
- Use **Map** objects for efficient lookups in conversation trees

## API Integration
- All API calls go through Netlify Functions
- Never expose API keys in client code
- Handle both OpenRouter and GROQ response formats
- Implement proper error handling with user-friendly messages
- Support streaming responses where applicable

## Prism Mode Implementation
- AI selects 5-10 relevant theoretical perspectives
- Each perspective generates a response in parallel
- Responses are synthesized into a final answer
- UI shows tabs for individual perspectives
- System prompt is only used for synthesis, not perspectives

## Message Controls (To Be Implemented)
When implementing message controls:
- Add unique IDs to all messages
- Support parent-child relationships for branching
- Track active conversation path
- Show branch navigation UI at branch points
- Implement edit modal for user messages
- Add regenerate button for AI responses
- Include copy-to-clipboard for all messages
- Ensure mobile-friendly control placement

## Development Guidelines
- Run with `npm run dev:netlify` for full functionality
- Use `npm run dev` only for UI development
- Test with both providers (OpenRouter and GROQ)
- Ensure responsive design from 320px to 4K
- Handle loading and error states gracefully
- Maintain 60fps animations
- Follow accessibility best practices
- Check browser console for helpful debug logs

## CSS Architecture
- Use CSS custom properties defined in `:root`
- Follow the established color palette (sage/amber theme)
- Maintain consistent spacing and sizing
- Use CSS Grid and Flexbox for layouts
- Implement smooth transitions and animations
- Support both light and dark themes (dark by default)

## Testing Approach
- Manual testing across different devices
- Test all user flows and edge cases
- Verify API error handling
- Check conversation branching logic
- Ensure proper state persistence
- Validate Prism mode with various queries

## Performance Considerations
- Lazy load the logging dashboard
- Virtualize long message lists if needed
- Debounce text input for large messages
- Optimize re-renders with React.memo where appropriate
- Use production builds for performance testing

## Security Best Practices
- Never commit API keys
- Sanitize user input before display
- Use environment variables via Netlify
- Implement rate limiting in serverless functions
- Validate all API responses