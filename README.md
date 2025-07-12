# React Chat App with OpenRouter

A modern chat application built with React and Vite that integrates with OpenRouter API using the OpenAI SDK. This app allows you to chat with various AI models through a beautiful, responsive interface.

## Features

- 🤖 Multiple AI model support (GPT-3.5, GPT-4, Claude, Llama, etc.)
- 💬 Real-time chat interface with message history
- 🎨 Modern, responsive design with smooth animations
- ⚡ Fast development with Vite
- 🔄 Loading states and error handling
- 📱 Mobile-friendly interface

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- OpenRouter API key (get one at [openrouter.ai](https://openrouter.ai/keys))

### Installation

1. Clone the repository or use this as a template
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables:
   ```bash
   cp .env.example .env
   ```
   
4. Edit `.env` and add your OpenRouter API key:
   ```
   VITE_OPENROUTER_API_KEY=your_actual_api_key_here
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Available Models

The app comes pre-configured with several popular models:
- OpenAI GPT-3.5 Turbo
- OpenAI GPT-4
- Anthropic Claude 3 Haiku
- Meta Llama 3 8B

You can easily add more models by editing the `models` array in `src/components/ChatInput.jsx`.

## Project Structure

```
src/
├── components/          # React components
│   ├── Chat.jsx        # Main chat container
│   ├── ChatInput.jsx   # Message input component
│   ├── ChatMessages.jsx # Messages display
│   └── Message.jsx     # Individual message component
├── hooks/              # Custom React hooks
│   └── useChat.js      # Chat state management
├── services/           # API services
│   └── chatService.js  # OpenRouter API integration
└── App.jsx            # Main app component
```

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Technologies Used

- **React** - UI library
- **Vite** - Build tool and dev server
- **OpenAI SDK** - For OpenRouter API integration
- **CSS Modules** - Component styling

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the [MIT License](LICENSE).
