import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import chatService from './chatService'

// Mock global fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock import.meta.env
const mockImportMeta = {
  env: { DEV: false }
}

// Mock the import.meta object
Object.defineProperty(global, 'import', {
  value: {
    meta: mockImportMeta
  },
  writable: true
})

describe('ChatService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset to default provider
    chatService.setProvider('openrouter')
    // Reset development mode
    mockImportMeta.env.DEV = false
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Provider Management', () => {
    it('should set and get provider correctly', () => {
      expect(chatService.getProvider()).toBe('openrouter')
      
      chatService.setProvider('groq')
      expect(chatService.getProvider()).toBe('groq')
      
      chatService.setProvider('openrouter')
      expect(chatService.getProvider()).toBe('openrouter')
    })

    it('should default to openrouter provider', () => {
      expect(chatService.getProvider()).toBe('openrouter')
    })
  })

  describe('sendMessage - OpenRouter Provider', () => {
    beforeEach(() => {
      chatService.setProvider('openrouter')
    })

    it('should send message successfully with default parameters', async () => {
      const mockResponse = {
        role: 'assistant',
        content: 'Hello! How can I help you?',
        id: 'msg-123'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const messages = [{ role: 'user' as const, content: 'Hello' }]
      const result = await chatService.sendMessage(messages)

      expect(mockFetch).toHaveBeenCalledWith('/.netlify/functions/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages,
          model: 'openai/gpt-4.1'
        })
      })

      expect(result).toEqual(mockResponse)
    })

    it('should send message with custom model and options', async () => {
      const mockResponse = {
        role: 'assistant',
        content: 'Custom response',
        id: 'msg-456'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const messages = [{ role: 'user' as const, content: 'Hello' }]
      const model = 'anthropic/claude-3.5-haiku'
      const options = { temperature: 0.7, max_tokens: 1000 }

      const result = await chatService.sendMessage(messages, model, options)

      expect(mockFetch).toHaveBeenCalledWith('/.netlify/functions/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages,
          model,
          temperature: 0.7,
          max_tokens: 1000
        })
      })

      expect(result).toEqual(mockResponse)
    })

    it('should handle HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      })

      const messages = [{ role: 'user' as const, content: 'Hello' }]

      await expect(chatService.sendMessage(messages)).rejects.toThrow('HTTP error! status: 500')
    })

    it('should handle development server error (404)', async () => {
      mockImportMeta.env.DEV = true
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      })

      const messages = [{ role: 'user' as const, content: 'Hello' }]

      await expect(chatService.sendMessage(messages)).rejects.toThrow(
        'Development server detected. Please run "npm run dev:netlify" instead of "npm run dev" to enable chat functionality.'
      )
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const messages = [{ role: 'user' as const, content: 'Hello' }]

      await expect(chatService.sendMessage(messages)).rejects.toThrow('Network error')
    })

    it('should handle JSON parsing errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      })

      const messages = [{ role: 'user' as const, content: 'Hello' }]

      await expect(chatService.sendMessage(messages)).rejects.toThrow('Invalid JSON')
    })
  })

  describe('sendMessage - GROQ Provider', () => {
    beforeEach(() => {
      chatService.setProvider('groq')
    })

    it('should use GROQ API endpoint when provider is groq', async () => {
      const mockResponse = {
        role: 'assistant',
        content: 'GROQ response',
        id: 'groq-123'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const messages = [{ role: 'user' as const, content: 'Hello' }]
      const result = await chatService.sendMessage(messages)

      expect(mockFetch).toHaveBeenCalledWith('/.netlify/functions/groq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages,
          model: 'openai/gpt-4.1'
        })
      })

      expect(result).toEqual(mockResponse)
    })

    it('should handle GROQ-specific models', async () => {
      const mockResponse = {
        role: 'assistant',
        content: 'Kimi response',
        id: 'kimi-123'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const messages = [{ role: 'user' as const, content: 'Hello' }]
      const model = 'moonshotai/kimi-k2-instruct'

      await chatService.sendMessage(messages, model)

      expect(mockFetch).toHaveBeenCalledWith('/.netlify/functions/groq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages,
          model
        })
      })
    })
  })

  describe('getAvailableModels - OpenRouter Provider', () => {
    beforeEach(() => {
      chatService.setProvider('openrouter')
    })

    it('should return static models in production mode', async () => {
      mockImportMeta.env.DEV = false

      const models = await chatService.getAvailableModels()

      expect(models).toEqual([
        { id: 'moonshotai/kimi-k2', name: 'Kimi K2' },
        { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B Instruct' },
        { id: 'meta-llama/llama-3.1-8b-instruct', name: 'Llama 3 8B Instruct' },
        { id: 'openai/gpt-4.1', name: 'GPT-4.1' },
        { id: 'openai/gpt-4.1-mini', name: 'GPT-4.1 Mini' },
        { id: 'openai/gpt-4.1-nano', name: 'GPT-4.1 Nano' },
        { id: 'anthropic/claude-3.5-haiku', name: 'Claude 3.5 Haiku' },
        { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4' },
        { id: 'anthropic/claude-opus-4', name: 'Claude Opus 4' },
        { id: 'meta-llama/llama-4-scout-17b-16e-instruct', name: 'Llama 4 Scout 17b16e' },
        { id: 'meta-llama/llama-4-maverick-17b-128e-instruct', name: 'Llama 4 Maverick 17b128e' }
      ])

      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should fetch models from OpenRouter API in development mode', async () => {
      mockImportMeta.env.DEV = true

      const mockApiResponse = {
        data: [
          { id: 'test/model-1', name: 'Test Model 1', context_length: 4096 },
          { id: 'test/model-2', context_length: 8192 }
        ]
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponse)
      })

      const models = await chatService.getAvailableModels()

      expect(mockFetch).toHaveBeenCalledWith('https://openrouter.ai/api/v1/models')

      expect(models).toEqual([
        { id: 'test/model-1', name: 'Test Model 1', context_length: 4096 },
        { id: 'test/model-2', name: 'model-2', context_length: 8192 }
      ])
    })

    it('should fallback to static models on API error in development', async () => {
      mockImportMeta.env.DEV = true

      mockFetch.mockRejectedValueOnce(new Error('API Error'))

      await expect(chatService.getAvailableModels()).rejects.toThrow('API Error')
    })

    it('should extract model name from ID when name is missing', async () => {
      mockImportMeta.env.DEV = true

      const mockApiResponse = {
        data: [
          { id: 'provider/model-name', context_length: 4096 }
        ]
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponse)
      })

      const models = await chatService.getAvailableModels()

      expect(models[0].name).toBe('model-name')
    })
  })

  describe('getAvailableModels - GROQ Provider', () => {
    beforeEach(() => {
      chatService.setProvider('groq')
    })

    it('should fetch GROQ models successfully', async () => {
      const mockApiResponse = {
        data: [
          { id: 'llama3-70b-8192', name: 'Llama 3 70B', context_length: 8192 },
          { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', context_length: 32768 }
        ]
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponse)
      })

      const models = await chatService.getAvailableModels()

      expect(mockFetch).toHaveBeenCalledWith('/.netlify/functions/groq-models')

      expect(models).toEqual([
        { id: 'llama3-70b-8192', name: 'Llama 3 70B', context_length: 8192 },
        { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', context_length: 32768 }
      ])
    })

    it('should return fallback GROQ models on API error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('GROQ API Error'))

      const models = await chatService.getAvailableModels()

      expect(models).toEqual([
        { id: 'moonshotai/kimi-k2-instruct', name: 'Kimi K2', context_length: 200000 },
        { id: 'llama3-70b-8192', name: 'Llama 3 70B', context_length: 8192 },
        { id: 'llama3-8b-8192', name: 'Llama 3 8B', context_length: 8192 },
        { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', context_length: 32768 },
        { id: 'gemma-7b-it', name: 'Gemma 7B IT', context_length: 8192 },
        { id: 'gemma2-9b-it', name: 'Gemma 2 9B IT', context_length: 8192 }
      ])
    })

    it('should handle HTTP errors for GROQ models', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      })

      const models = await chatService.getAvailableModels()

      expect(models).toEqual([
        { id: 'moonshotai/kimi-k2-instruct', name: 'Kimi K2', context_length: 200000 },
        { id: 'llama3-70b-8192', name: 'Llama 3 70B', context_length: 8192 },
        { id: 'llama3-8b-8192', name: 'Llama 3 8B', context_length: 8192 },
        { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', context_length: 32768 },
        { id: 'gemma-7b-it', name: 'Gemma 7B IT', context_length: 8192 },
        { id: 'gemma2-9b-it', name: 'Gemma 2 9B IT', context_length: 8192 }
      ])
    })

    it('should handle missing data in GROQ response', async () => {
      const mockApiResponse = {}

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponse)
      })

      const models = await chatService.getAvailableModels()

      expect(models).toEqual([])
    })

    it('should extract model name from ID for GROQ models when name is missing', async () => {
      const mockApiResponse = {
        data: [
          { id: 'provider/groq-model', context_length: 4096 }
        ]
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponse)
      })

      const models = await chatService.getAvailableModels()

      expect(models[0].name).toBe('groq-model')
    })
  })

  describe('Message Validation', () => {
    it('should handle empty messages array', async () => {
      const mockResponse = {
        role: 'assistant',
        content: 'Empty response',
        id: 'empty-123'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await chatService.sendMessage([])

      expect(mockFetch).toHaveBeenCalledWith('/.netlify/functions/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [],
          model: 'openai/gpt-4.1'
        })
      })

      expect(result).toEqual(mockResponse)
    })

    it('should handle multiple messages', async () => {
      const mockResponse = {
        role: 'assistant',
        content: 'Multi-turn response',
        id: 'multi-123'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const messages = [
        { role: 'user' as const, content: 'Hello' },
        { role: 'assistant' as const, content: 'Hi there!' },
        { role: 'user' as const, content: 'How are you?' }
      ]

      const result = await chatService.sendMessage(messages)

      expect(mockFetch).toHaveBeenCalledWith('/.netlify/functions/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages,
          model: 'openai/gpt-4.1'
        })
      })

      expect(result).toEqual(mockResponse)
    })

    it('should handle system messages', async () => {
      const mockResponse = {
        role: 'assistant',
        content: 'System prompt response',
        id: 'system-123'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const messages = [
        { role: 'system' as const, content: 'You are a helpful assistant.' },
        { role: 'user' as const, content: 'Hello' }
      ]

      const result = await chatService.sendMessage(messages)

      expect(mockFetch).toHaveBeenCalledWith('/.netlify/functions/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages,
          model: 'openai/gpt-4.1'
        })
      })

      expect(result).toEqual(mockResponse)
    })
  })

  describe('Options Handling', () => {
    it('should merge custom options correctly', async () => {
      const mockResponse = {
        role: 'assistant',
        content: 'Options response',
        id: 'options-123'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const messages = [{ role: 'user' as const, content: 'Hello' }]
      const options = {
        temperature: 0.8,
        top_p: 0.9,
        max_tokens: 2000,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      }

      await chatService.sendMessage(messages, 'openai/gpt-4.1', options)

      expect(mockFetch).toHaveBeenCalledWith('/.netlify/functions/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages,
          model: 'openai/gpt-4.1',
          temperature: 0.8,
          top_p: 0.9,
          max_tokens: 2000,
          frequency_penalty: 0.1,
          presence_penalty: 0.1
        })
      })
    })

    it('should handle undefined options', async () => {
      const mockResponse = {
        role: 'assistant',
        content: 'Undefined options response',
        id: 'undefined-123'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const messages = [{ role: 'user' as const, content: 'Hello' }]

      await chatService.sendMessage(messages, 'openai/gpt-4.1', undefined)

      expect(mockFetch).toHaveBeenCalledWith('/.netlify/functions/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages,
          model: 'openai/gpt-4.1'
        })
      })
    })
  })

  describe('Response Handling', () => {
    it('should handle response with usage information', async () => {
      const mockResponse = {
        role: 'assistant',
        content: 'Response with usage',
        id: 'usage-123',
        usage: {
          prompt_tokens: 10,
          completion_tokens: 20,
          total_tokens: 30
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const messages = [{ role: 'user' as const, content: 'Hello' }]
      const result = await chatService.sendMessage(messages)

      expect(result).toEqual(mockResponse)
      expect(result.usage).toBeDefined()
      expect(result.usage?.total_tokens).toBe(30)
    })

    it('should handle response without optional fields', async () => {
      const mockResponse = {
        role: 'assistant',
        content: 'Minimal response'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const messages = [{ role: 'user' as const, content: 'Hello' }]
      const result = await chatService.sendMessage(messages)

      expect(result).toEqual(mockResponse)
      expect(result.id).toBeUndefined()
      expect(result.usage).toBeUndefined()
    })
  })
})