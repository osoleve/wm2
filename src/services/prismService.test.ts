import { describe, it, expect, beforeEach, vi, Mock } from 'vitest'

// Mock the dependencies
vi.mock('./chatService', () => ({
  default: {
    sendMessage: vi.fn()
  }
}))

vi.mock('../utils/systemPrompt', () => ({
  getSystemPrompt: vi.fn(() => Promise.resolve('Test system prompt'))
}))

// Mock fetch for loading prism files
global.fetch = vi.fn()

import prismService from './prismService'
import chatService from './chatService'
import { getSystemPrompt } from '../utils/systemPrompt'

describe('PrismService', () => {
  const mockChatService = chatService as any
  const mockGetSystemPrompt = getSystemPrompt as Mock
  const mockFetch = global.fetch as Mock

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Default mock implementations
    mockChatService.sendMessage.mockResolvedValue({
      content: 'Test response'
    })
    
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('Mock prism prompt content\n\nPersona: Test persona\nEpistemic Stance: Test stance')
    })
  })

  describe('Prism Selection', () => {
    it('should select random prisms within specified range', () => {
      const selectedPrisms = prismService.selectRandomPrisms(3, 5)
      
      expect(selectedPrisms.length).toBeGreaterThanOrEqual(3)
      expect(selectedPrisms.length).toBeLessThanOrEqual(5)
      expect(Array.isArray(selectedPrisms)).toBe(true)
      
      // Should be unique selections
      const uniquePrisms = new Set(selectedPrisms)
      expect(uniquePrisms.size).toBe(selectedPrisms.length)
    })

    it('should handle edge cases for random selection', () => {
      const singlePrism = prismService.selectRandomPrisms(1, 1)
      expect(singlePrism.length).toBe(1)
      
      const largePrism = prismService.selectRandomPrisms(10, 15)
      expect(largePrism.length).toBeGreaterThanOrEqual(10)
      expect(largePrism.length).toBeLessThanOrEqual(15)
    })

    it('should select AI-driven prisms successfully', async () => {
      mockChatService.sendMessage.mockResolvedValue({
        content: '["Critical Race Theory", "Systems Theory", "Phenomenology"]'
      })
      
      const selectedPrisms = await prismService.selectAIPrisms(
        'Tell me about social justice',
        [],
        'gpt-4'
      )
      
      expect(selectedPrisms).toEqual(['Critical Race Theory', 'Systems Theory', 'Phenomenology'])
      expect(mockChatService.sendMessage).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            role: 'system',
            content: expect.stringContaining('Select between 5 and 8 theoretical lenses')
          })
        ]),
        'gpt-4'
      )
    })

    it('should fallback to random selection when AI response is invalid JSON', async () => {
      mockChatService.sendMessage.mockResolvedValue({
        content: 'Invalid JSON response'
      })
      
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      const selectedPrisms = await prismService.selectAIPrisms(
        'Test message',
        [],
        'gpt-4'
      )
      
      expect(selectedPrisms.length).toBeGreaterThanOrEqual(5)
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to parse AI prism selection'),
        expect.any(Error)
      )
      
      consoleSpy.mockRestore()
    })

    it('should fallback to random selection when no valid prisms returned', async () => {
      mockChatService.sendMessage.mockResolvedValue({
        content: '["Invalid Prism", "Another Invalid Prism"]'
      })
      
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      const selectedPrisms = await prismService.selectAIPrisms(
        'Test message',
        [],
        'gpt-4'
      )
      
      expect(selectedPrisms.length).toBeGreaterThanOrEqual(5)
      expect(consoleSpy).toHaveBeenCalledWith(
        'No valid prisms in AI selection, falling back to random selection'
      )
      
      consoleSpy.mockRestore()
    })

    it('should handle API errors in prism selection', async () => {
      mockChatService.sendMessage.mockRejectedValue(new Error('API Error'))
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const selectedPrisms = await prismService.selectAIPrisms(
        'Test message',
        [],
        'gpt-4'
      )
      
      expect(selectedPrisms.length).toBeGreaterThanOrEqual(5)
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error in AI prism selection'),
        expect.any(Error)
      )
      
      consoleSpy.mockRestore()
    })
  })

  describe('Prism Prompt Loading', () => {
    it('should load prism prompt successfully', async () => {
      const prompt = await prismService.loadPrismPrompt('Critical Race Theory')
      
      expect(mockFetch).toHaveBeenCalledWith('/prism/Critical Race Theory.txt')
      expect(prompt).toBe('Mock prism prompt content\n\nPersona: Test persona\nEpistemic Stance: Test stance')
    })

    it('should handle failed prism prompt loading', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404
      })
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const prompt = await prismService.loadPrismPrompt('Non-existent Theory')
      
      expect(prompt).toContain('You are a Non-existent Theory scholar')
      expect(prompt).toContain('Persona:')
      expect(prompt).toContain('Epistemic Stance:')
      expect(consoleSpy).toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })

    it('should handle network errors in prism loading', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const prompt = await prismService.loadPrismPrompt('Systems Theory')
      
      expect(prompt).toContain('You are a Systems Theory scholar')
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error loading prism Systems Theory'),
        expect.any(Error)
      )
      
      consoleSpy.mockRestore()
    })
  })

  describe('Prism Response Generation', () => {
    it('should generate responses from multiple prisms in parallel', async () => {
      const selectedPrisms = ['Critical Race Theory', 'Systems Theory']
      const conversationHistory = [
        { role: 'user' as const, content: 'Test question' }
      ]
      
      mockChatService.sendMessage
        .mockResolvedValueOnce({ content: 'Critical Race Theory response' })
        .mockResolvedValueOnce({ content: 'Systems Theory response' })
      
      const responses = await prismService.generatePrismResponses(
        'Test question',
        conversationHistory,
        'gpt-4',
        selectedPrisms
      )
      
      expect(responses).toHaveLength(2)
      expect(responses[0]).toEqual({
        perspective: 'Critical Race Theory',
        content: 'Critical Race Theory response'
      })
      expect(responses[1]).toEqual({
        perspective: 'Systems Theory',
        content: 'Systems Theory response'
      })
      
      expect(mockChatService.sendMessage).toHaveBeenCalledTimes(2)
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('should handle errors in individual prism response generation', async () => {
      const selectedPrisms = ['Valid Theory', 'Error Theory']
      const conversationHistory = [
        { role: 'user' as const, content: 'Test question' }
      ]
      
      mockChatService.sendMessage
        .mockResolvedValueOnce({ content: 'Valid response' })
        .mockRejectedValueOnce(new Error('API Error'))
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const responses = await prismService.generatePrismResponses(
        'Test question',
        conversationHistory,
        'gpt-4',
        selectedPrisms
      )
      
      expect(responses).toHaveLength(2)
      expect(responses[0].content).toBe('Valid response')
      expect(responses[1].content).toBe('[Error generating Error Theory perspective]')
      
      consoleSpy.mockRestore()
    })

    it('should filter out system messages from conversation history', async () => {
      const conversationHistory = [
        { role: 'system' as const, content: 'System prompt' },
        { role: 'user' as const, content: 'User message' },
        { role: 'assistant' as const, content: 'Assistant response' }
      ]
      
      // Mock fetch to return a theory-specific prompt
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('Test Theory specific prompt\n\nPersona: Test Theory scholar')
      })
      
      await prismService.generatePrismResponses(
        'Test question',
        conversationHistory,
        'gpt-4',
        ['Test Theory']
      )
      
      // Verify the call was made correctly - first arg should be conversation array
      const callArgs = mockChatService.sendMessage.mock.calls[0]
      const conversationArray = callArgs[0]
      
      // Should have prism system prompt + filtered history (no original system message)
      expect(conversationArray).toHaveLength(3) // prism system + user + assistant
      expect(conversationArray[0].role).toBe('system')
      expect(conversationArray[0].content).toContain('Test Theory')
      expect(conversationArray[1].content).toBe('User message')
      expect(conversationArray[2].content).toBe('Assistant response')
      
      // Verify model and options
      expect(callArgs[1]).toBe('gpt-4')
      expect(callArgs[2]).toEqual({ temperature: 0.9 })
    })
  })

  describe('Prism Response Synthesis', () => {
    it('should synthesize multiple prism responses', async () => {
      const prismResponses = [
        { perspective: 'Critical Race Theory', content: 'CRT perspective on the issue' },
        { perspective: 'Systems Theory', content: 'Systems perspective on the issue' }
      ]
      
      mockChatService.sendMessage.mockResolvedValue({
        content: 'Synthesized response combining both perspectives'
      })
      
      const response = await prismService.synthesizePrismResponses(
        'Test question',
        prismResponses,
        'Base system prompt',
        'gpt-4',
        []
      )
      
      expect(response.content).toBe('Synthesized response combining both perspectives')
      expect(mockChatService.sendMessage).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            role: 'system',
            content: expect.stringContaining('Base system prompt')
          }),
          expect.objectContaining({
            role: 'user',
            content: expect.stringContaining('Critical Race Theory Perspective')
          })
        ]),
        'gpt-4'
      )
    })

    it('should handle empty prism responses', async () => {
      await expect(
        prismService.synthesizePrismResponses(
          'Test question',
          [],
          'Base system prompt',
          'gpt-4',
          []
        )
      ).rejects.toThrow('No valid prism responses provided for synthesis')
    })

    it('should filter out invalid prism responses', async () => {
      const prismResponses = [
        { perspective: 'Valid Theory', content: 'Valid content' },
        { perspective: '', content: 'Invalid - no perspective' },
        { perspective: 'Another Valid', content: '' }, // Invalid - no content
        { perspective: 'Final Valid', content: 'Final valid content' }
      ]
      
      mockChatService.sendMessage.mockResolvedValue({
        content: 'Synthesized response'
      })
      
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      await prismService.synthesizePrismResponses(
        'Test question',
        prismResponses,
        'Base system prompt',
        'gpt-4',
        []
      )
      
      // Should only process valid responses
      expect(mockChatService.sendMessage).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            role: 'user',
            content: expect.stringContaining('Valid Theory Perspective')
          })
        ]),
        'gpt-4'
      )
      
      const callContent = mockChatService.sendMessage.mock.calls[0][0][1].content
      expect(callContent).toContain('Valid Theory Perspective')
      expect(callContent).toContain('Final Valid Perspective')
      expect(callContent).not.toContain('Invalid - no perspective')
      
      consoleSpy.mockRestore()
    })

    it('should filter prism messages from conversation history', async () => {
      const conversationHistory = [
        { role: 'user' as const, content: 'User question' },
        { role: 'assistant' as const, content: 'Regular response' },
        { role: 'assistant' as const, content: 'Prism response', isPrism: true },
        { role: 'system' as const, content: 'System message' }
      ]
      
      const prismResponses = [
        { perspective: 'Test Theory', content: 'Test content' }
      ]
      
      mockChatService.sendMessage.mockResolvedValue({ content: 'Synthesized' })
      
      await prismService.synthesizePrismResponses(
        'Test question',
        prismResponses,
        'Base prompt',
        'gpt-4',
        conversationHistory
      )
      
      const synthesisCall = mockChatService.sendMessage.mock.calls[0][0]
      
      // Verify the conversation structure: [system, ...filtered_history, perspectives_message]
      expect(synthesisCall).toHaveLength(4) // system + user + assistant + perspectives
      expect(synthesisCall[0].role).toBe('system')
      expect(synthesisCall[1].content).toBe('User question')
      expect(synthesisCall[2].content).toBe('Regular response')
      expect(synthesisCall[3].content).toContain('Test Theory Perspective')
    })
  })

  describe('Complete Prism Response Generation', () => {
    it('should generate complete prism response with AI selection', async () => {
      // Mock AI prism selection
      mockChatService.sendMessage
        .mockResolvedValueOnce({ content: '["Critical Race Theory", "Systems Theory"]' }) // AI selection
        .mockResolvedValueOnce({ content: 'CRT response' }) // First prism
        .mockResolvedValueOnce({ content: 'Systems response' }) // Second prism
        .mockResolvedValueOnce({ content: 'Final synthesis' }) // Synthesis
      
      const conversationHistory = [
        { role: 'user' as const, content: 'Test question' }
      ]
      
      const response = await prismService.generateCompletePrismResponse(
        'Test question about social justice',
        conversationHistory,
        'gpt-4',
        'claude-3',
        true
      )
      
      expect(response).toEqual({
        role: 'assistant',
        content: 'Final synthesis',
        isPrism: true,
        perspectives: [
          { perspective: 'Critical Race Theory', content: 'CRT response' },
          { perspective: 'Systems Theory', content: 'Systems response' }
        ],
        synthesis: 'Final synthesis'
      })
      
      expect(mockGetSystemPrompt).toHaveBeenCalled()
      expect(mockChatService.sendMessage).toHaveBeenCalledTimes(4)
    })

    it('should work without system prompt when disabled', async () => {
      mockChatService.sendMessage
        .mockResolvedValueOnce({ content: '["Phenomenology"]' })
        .mockResolvedValueOnce({ content: 'Phenomenology response' })
        .mockResolvedValueOnce({ content: 'Synthesis without system prompt' })
      
      const response = await prismService.generateCompletePrismResponse(
        'Test question',
        [],
        'gpt-4',
        'gpt-4',
        false
      )
      
      expect(response.content).toBe('Synthesis without system prompt')
      expect(mockGetSystemPrompt).not.toHaveBeenCalled()
    })

    it('should use prism model for synthesis when synthesis model not provided', async () => {
      mockChatService.sendMessage
        .mockResolvedValueOnce({ content: '["Test Theory"]' })
        .mockResolvedValueOnce({ content: 'Test response' })
        .mockResolvedValueOnce({ content: 'Synthesis with same model' })
      
      await prismService.generateCompletePrismResponse(
        'Test question',
        [],
        'claude-3'
      )
      
      // Last call should use the same model (claude-3) for synthesis
      const lastCall = mockChatService.sendMessage.mock.calls[2]
      expect(lastCall[1]).toBe('claude-3')
    })

    it('should handle errors in complete prism generation gracefully', async () => {
      mockChatService.sendMessage.mockRejectedValue(new Error('Complete failure'))
      
      await expect(
        prismService.generateCompletePrismResponse(
          'Test question',
          [],
          'gpt-4'
        )
      ).rejects.toThrow()
    })
  })

  describe('Integration Tests', () => {
    it('should perform end-to-end prism analysis', async () => {
      // Setup complete mock chain
      mockChatService.sendMessage
        .mockResolvedValueOnce({ content: '["Phenomenology", "Systems Theory"]' })
        .mockResolvedValueOnce({ content: 'Phenomenological analysis of the question' })
        .mockResolvedValueOnce({ content: 'Systems theoretical analysis of the question' })
        .mockResolvedValueOnce({ content: 'Comprehensive synthesis of both perspectives' })
      
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      const response = await prismService.generateCompletePrismResponse(
        'How does technology impact society?',
        [{ role: 'user', content: 'How does technology impact society?' }],
        'gpt-4',
        'claude-3',
        true
      )
      
      expect(response.role).toBe('assistant')
      expect(response.isPrism).toBe(true)
      expect(response.perspectives).toHaveLength(2)
      expect(response.perspectives[0].perspective).toBe('Phenomenology')
      expect(response.perspectives[1].perspective).toBe('Systems Theory')
      expect(response.content).toBe('Comprehensive synthesis of both perspectives')
      expect(response.synthesis).toBe('Comprehensive synthesis of both perspectives')
      
      consoleSpy.mockRestore()
    })

    it('should log detailed progress information', async () => {
      mockChatService.sendMessage
        .mockResolvedValueOnce({ content: '["Test Theory"]' })
        .mockResolvedValueOnce({ content: 'Test perspective content' })
        .mockResolvedValueOnce({ content: 'Test synthesis' })
      
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      await prismService.generateCompletePrismResponse(
        'Test question',
        [],
        'gpt-4'
      )
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('🤖 Using AI to select most relevant prisms')
      )
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('🚀 Generating prism perspectives in parallel')
      )
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('✅ All prism perspectives generated')
      )
      
      consoleSpy.mockRestore()
    })
  })

  describe('Error Handling Edge Cases', () => {
    it('should handle malformed JSON in AI selection gracefully', async () => {
      mockChatService.sendMessage.mockResolvedValue({
        content: '{"incomplete": json'
      })
      
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      const result = await prismService.selectAIPrisms('test', [], 'gpt-4')
      
      expect(result.length).toBeGreaterThan(0) // Should fall back to random
      expect(consoleSpy).toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })

    it('should handle null/undefined responses from chat service', async () => {
      mockChatService.sendMessage.mockResolvedValue({ content: null })
      
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      const result = await prismService.selectAIPrisms('test', [], 'gpt-4')
      
      expect(result.length).toBeGreaterThan(0)
      expect(consoleSpy).toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })

    it('should handle synthesis errors appropriately', async () => {
      const prismResponses = [
        { perspective: 'Test Theory', content: 'Test content' }
      ]
      
      mockChatService.sendMessage.mockRejectedValue(new Error('Synthesis failed'))
      
      await expect(
        prismService.synthesizePrismResponses(
          'Test question',
          prismResponses,
          'Base prompt',
          'gpt-4',
          []
        )
      ).rejects.toThrow('Synthesis failed')
    })
  })
})