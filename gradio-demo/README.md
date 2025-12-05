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

## API Providers

### HuggingFace Inference API (Default - Free!)

The demo uses HuggingFace's free Inference API by default. No API key required!

- **Default model**: `Qwen/Qwen2.5-72B-Instruct`
- **Optional**: Set `HF_TOKEN` for higher rate limits
- Works out of the box on HuggingFace Spaces

### OpenRouter (Optional)

For access to GPT-4, Claude, and other premium models:
- Set `OPENROUTER_API_KEY` in your Space secrets

### GROQ (Optional)

For high-performance inference:
- Set `GROQ_API_KEY` in your Space secrets

## Deployment to HuggingFace Spaces

1. Create a new Space on HuggingFace (select Gradio SDK)
2. Upload the contents of this directory
3. The Space will work immediately with HuggingFace's free inference
4. (Optional) Add API keys for other providers in Space settings

## Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run the app (uses HuggingFace free inference by default)
python app.py

# Or with your own API keys for other providers
export OPENROUTER_API_KEY="your-key-here"
export GROQ_API_KEY="your-key-here"
python app.py
```

## Custom Models

You can specify a custom model in the UI:

- **HuggingFace**: Any model on HF Hub with chat support, e.g., `mistralai/Mistral-7B-Instruct-v0.3`
- **OpenRouter**: Any OpenRouter model, e.g., `anthropic/claude-sonnet-4`
- **GROQ**: Any GROQ model, e.g., `llama3-70b-8192`

## Credits

Part of the Wittgenstein's Monster (W.M.) AI chat application.
