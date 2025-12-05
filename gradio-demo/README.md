---
title: Prism - Multi-Perspective Analysis
emoji: "diamond_shape_with_a_dot_inside"
colorFrom: amber
colorTo: stone
sdk: gradio
sdk_version: 4.44.0
app_file: app.py
pinned: false
license: mit
---

# Prism - Multi-Perspective AI Analysis

Prism analyzes questions through multiple theoretical lenses simultaneously, providing a richer, more nuanced understanding than any single perspective could offer.

## How It Works

1. **Ask a Question**: Enter any question or topic you want to explore
2. **AI Lens Selection**: The AI selects 5-8 relevant theoretical frameworks from 498 available lenses
3. **Parallel Analysis**: Each selected lens generates its own perspective on your question
4. **Synthesis**: All perspectives are synthesized into a coherent, multi-dimensional response
5. **Exploration**: Expand the accordion to explore individual lens responses

## Available Lenses

The 498 theoretical lenses span many disciplines:

- **Philosophy**: Phenomenology, Existentialism, Pragmatism, Continental Philosophy...
- **Critical Theory**: Critical Race Theory, Feminist Theory, Queer Theory, Postcolonial Theory...
- **Social Sciences**: Systems Theory, Network Theory, Institutional Analysis...
- **Cultural Studies**: Cultural Materialism, Media Theory, Visual Culture Studies...
- **Economics**: Behavioral Economics, Keynesian Economics, Complexity Economics...
- **Psychology**: Cognitive Theory, Attachment Theory, Positive Psychology...
- And many more...

## Setup

### Environment Variables

Set these secrets in your Space settings:

- `OPENROUTER_API_KEY`: Your OpenRouter API key (for GPT-4, Claude, Llama, etc.)
- `GROQ_API_KEY`: Your GROQ API key (for high-performance inference)

At least one API key is required for the demo to function.

### Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
export OPENROUTER_API_KEY="your-key-here"
# or
export GROQ_API_KEY="your-key-here"

# Run the app
python app.py
```

## Credits

Part of the Wittgenstein's Monster (W.M.) AI chat application.
