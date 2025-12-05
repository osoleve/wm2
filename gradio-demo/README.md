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

**Powered by HuggingFace Inference API** (free!) - works out of the box with no configuration.

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

## Deployment

1. Create a new Space on HuggingFace (select Gradio SDK)
2. Upload the contents of this directory
3. Done! Works immediately with no API keys needed

Optional: Set `HF_TOKEN` as a secret for higher rate limits.

## Local Development

```bash
pip install -r requirements.txt
python app.py
```

## Custom Models

You can specify any HuggingFace model with chat support in the Model field, e.g.:
- `mistralai/Mistral-7B-Instruct-v0.3`
- `meta-llama/Meta-Llama-3-8B-Instruct`

## Credits

Part of the Wittgenstein's Monster (W.M.) AI chat application.
