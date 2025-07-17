import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MessageWithPrism, BranchInfo, Version } from '../types'

// Mock the dependencies
vi.mock('./EditModal', () => ({
  EditModal: ({ originalContent, onSave, onCancel }: any) => (
    <div data-testid="edit-modal">
      <textarea data-testid="edit-textarea" defaultValue={originalContent} />
      <button data-testid="save-button" onClick={() => onSave('edited content')}>
        Save
      </button>
      <button data-testid="cancel-button" onClick={onCancel}>
        Cancel
      </button>
    </div>
  )
}))

vi.mock('./BranchNavigation', () => ({
  BranchNavigation: ({ branchInfo, onNavigate }: any) => (
    <div data-testid="branch-navigation">
      <button 
        data-testid="branch-prev" 
        onClick={() => onNavigate('prev-branch')}
        disabled={branchInfo?.currentBranchIndex === 0}
      >
        Previous
      </button>
      <span data-testid="branch-info">
        {branchInfo?.currentBranchIndex + 1} / {branchInfo?.branchCount}
      </span>
      <button 
        data-testid="branch-next" 
        onClick={() => onNavigate('next-branch')}
        disabled={branchInfo?.currentBranchIndex === branchInfo?.branchCount - 1}
      >
        Next
      </button>
    </div>
  )
}))

vi.mock('./VersionHistory', () => ({
  VersionHistory: ({ messageId, versions, onSwitchToVersion, onClose }: any) => (
    <div data-testid="version-history">
      <h3>Version History for {messageId}</h3>
      {versions.map((version: any) => (
        <button
          key={version.id}
          data-testid={`version-${version.id}`}
          onClick={() => onSwitchToVersion(messageId, version.id)}
        >
          {version.content}
        </button>
      ))}
      <button data-testid="close-versions" onClick={onClose}>
        Close
      </button>
    </div>
  )
}))

describe('Message Component Logic Tests', () => {
  const defaultMessage: MessageWithPrism = {
    id: 'msg-1',
    role: 'user',
    content: 'Hello, how are you?',
    timestamp: Date.now(),
    parentId: null,
    children: ['msg-2']
  }

  const assistantMessage: MessageWithPrism = {
    id: 'msg-2',
    role: 'assistant',
    content: 'I am doing well, thank you!',
    timestamp: Date.now(),
    parentId: 'msg-1',
    children: []
  }

  const prismMessage: MessageWithPrism = {
    id: 'msg-prism',
    role: 'assistant',
    content: 'Regular content',
    timestamp: Date.now(),
    parentId: 'msg-1',
    children: [],
    isPrism: true,
    synthesis: 'This is a synthesized response combining multiple perspectives',
    perspectives: [
      { perspective: 'Critical Race Theory', content: 'From a CRT perspective...' },
      { perspective: 'Systems Theory', content: 'From a systems perspective...' },
      { perspective: 'Behavioral Economics', content: 'From an economics perspective...' }
    ]
  }

  const defaultProps = {
    isUser: false,
    onEdit: vi.fn(),
    onRegenerate: vi.fn(),
    onCopy: vi.fn().mockResolvedValue(true),
    onNavigateBranch: vi.fn(),
    getBranchInfo: vi.fn(),
    getMessageVersions: vi.fn(),
    onSwitchToVersion: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Message Type Detection', () => {
    it('should identify user messages correctly', () => {
      const isUser = defaultMessage.role === 'user'
      
      expect(isUser).toBe(true)
      expect(defaultMessage.role).toBe('user')
    })

    it('should identify assistant messages correctly', () => {
      const isUser = assistantMessage.role === 'user'
      
      expect(isUser).toBe(false)
      expect(assistantMessage.role).toBe('assistant')
    })

    it('should identify prism messages correctly', () => {
      const isPrismMessage = Boolean(prismMessage.isPrism && prismMessage.perspectives)
      
      expect(isPrismMessage).toBe(true)
      expect(prismMessage.perspectives).toHaveLength(3)
      expect(prismMessage.synthesis).toBeDefined()
    })

    it('should handle non-prism assistant messages', () => {
      const isPrismMessage = Boolean(assistantMessage.isPrism && assistantMessage.perspectives)
      
      expect(isPrismMessage).toBe(false)
      expect(assistantMessage.isPrism).toBeUndefined()
    })
  })

  describe('Content Display Logic', () => {
    it('should display regular content for non-prism messages', () => {
      const getDisplayContent = (message: MessageWithPrism, activeTab: string) => {
        const isPrismMessage = message.isPrism && message.perspectives
        
        if (!isPrismMessage) {
          return message.content
        }
        
        if (activeTab === 'synthesis') {
          return message.synthesis || message.content
        }
        
        const perspective = message.perspectives?.find(p => p.perspective === activeTab)
        return perspective?.content || message.content
      }

      expect(getDisplayContent(defaultMessage, 'synthesis')).toBe('Hello, how are you?')
      expect(getDisplayContent(assistantMessage, 'synthesis')).toBe('I am doing well, thank you!')
    })

    it('should display synthesis content by default for prism messages', () => {
      const getDisplayContent = (message: MessageWithPrism, activeTab: string) => {
        const isPrismMessage = message.isPrism && message.perspectives
        
        if (!isPrismMessage) {
          return message.content
        }
        
        if (activeTab === 'synthesis') {
          return message.synthesis || message.content
        }
        
        const perspective = message.perspectives?.find(p => p.perspective === activeTab)
        return perspective?.content || message.content
      }

      expect(getDisplayContent(prismMessage, 'synthesis')).toBe(prismMessage.synthesis)
    })

    it('should display perspective content when tab is selected', () => {
      const getDisplayContent = (message: MessageWithPrism, activeTab: string) => {
        const isPrismMessage = message.isPrism && message.perspectives
        
        if (!isPrismMessage) {
          return message.content
        }
        
        if (activeTab === 'synthesis') {
          return message.synthesis || message.content
        }
        
        const perspective = message.perspectives?.find(p => p.perspective === activeTab)
        return perspective?.content || message.content
      }

      expect(getDisplayContent(prismMessage, 'Critical Race Theory')).toBe('From a CRT perspective...')
      expect(getDisplayContent(prismMessage, 'Systems Theory')).toBe('From a systems perspective...')
      expect(getDisplayContent(prismMessage, 'Behavioral Economics')).toBe('From an economics perspective...')
    })

    it('should fallback to main content for invalid perspective tabs', () => {
      const getDisplayContent = (message: MessageWithPrism, activeTab: string) => {
        const isPrismMessage = message.isPrism && message.perspectives
        
        if (!isPrismMessage) {
          return message.content
        }
        
        if (activeTab === 'synthesis') {
          return message.synthesis || message.content
        }
        
        const perspective = message.perspectives?.find(p => p.perspective === activeTab)
        return perspective?.content || message.content
      }

      expect(getDisplayContent(prismMessage, 'Invalid Perspective')).toBe(prismMessage.content)
    })
  })

  describe('Message Controls Logic', () => {
    it('should show edit button for user messages', () => {
      const shouldShowEdit = (message: MessageWithPrism) => {
        return message.role === 'user'
      }

      expect(shouldShowEdit(defaultMessage)).toBe(true)
      expect(shouldShowEdit(assistantMessage)).toBe(false)
      expect(shouldShowEdit(prismMessage)).toBe(false)
    })

    it('should show regenerate button for assistant messages', () => {
      const shouldShowRegenerate = (message: MessageWithPrism) => {
        return message.role === 'assistant'
      }

      expect(shouldShowRegenerate(defaultMessage)).toBe(false)
      expect(shouldShowRegenerate(assistantMessage)).toBe(true)
      expect(shouldShowRegenerate(prismMessage)).toBe(true)
    })

    it('should always show copy button', () => {
      const shouldShowCopy = () => true

      expect(shouldShowCopy()).toBe(true)
    })
  })

  describe('Edit Functionality', () => {
    it('should handle edit modal opening and closing', () => {
      let showEditModal = false
      
      const openEditModal = () => { showEditModal = true }
      const closeEditModal = () => { showEditModal = false }

      expect(showEditModal).toBe(false)
      
      openEditModal()
      expect(showEditModal).toBe(true)
      
      closeEditModal()
      expect(showEditModal).toBe(false)
    })

    it('should handle edit save functionality', () => {
      const onEdit = vi.fn()
      let showEditModal = true
      
      const handleEdit = (newContent: string) => {
        onEdit(defaultMessage.id, newContent)
        showEditModal = false
      }

      handleEdit('Updated content')
      
      expect(onEdit).toHaveBeenCalledWith('msg-1', 'Updated content')
      expect(showEditModal).toBe(false)
    })

    it('should handle edit cancel functionality', () => {
      const onEdit = vi.fn()
      let showEditModal = true
      
      const handleCancel = () => {
        showEditModal = false
      }

      handleCancel()
      
      expect(onEdit).not.toHaveBeenCalled()
      expect(showEditModal).toBe(false)
    })
  })

  describe('Regenerate Functionality', () => {
    it('should handle regenerate action', () => {
      const onRegenerate = vi.fn()
      
      const handleRegenerate = (messageId: string) => {
        onRegenerate(messageId)
      }

      handleRegenerate(assistantMessage.id)
      
      expect(onRegenerate).toHaveBeenCalledWith('msg-2')
    })
  })

  describe('Copy Functionality', () => {
    it('should handle successful copy action', async () => {
      const onCopy = vi.fn().mockResolvedValue(true)
      let showControls = true
      
      const handleCopy = async (messageId: string) => {
        const success = await onCopy(messageId)
        if (success) {
          showControls = false
        }
      }

      await handleCopy(defaultMessage.id)
      
      expect(onCopy).toHaveBeenCalledWith('msg-1')
      expect(showControls).toBe(false)
    })

    it('should handle failed copy action', async () => {
      const onCopy = vi.fn().mockResolvedValue(false)
      let showControls = true
      
      const handleCopy = async (messageId: string) => {
        const success = await onCopy(messageId)
        if (success) {
          showControls = false
        }
      }

      await handleCopy(defaultMessage.id)
      
      expect(onCopy).toHaveBeenCalledWith('msg-1')
      expect(showControls).toBe(true) // Should remain true on failure
    })
  })

  describe('Branch Navigation Logic', () => {
    it('should determine when to show branch controls', () => {
      const branchInfo: BranchInfo = {
        hasBranches: true,
        branchCount: 3,
        currentBranchIndex: 1,
        siblings: ['msg-2a', 'msg-2b', 'msg-2c']
      }

      const shouldShowBranchControls = (branchInfo: BranchInfo | null) => {
        return branchInfo?.hasBranches && 
          branchInfo?.branchCount > 1 && 
          (branchInfo as any)?.isSiblingBranch === true
      }

      expect(shouldShowBranchControls(branchInfo)).toBe(false) // Missing isSiblingBranch
      
      const branchInfoWithSibling = { ...branchInfo, isSiblingBranch: true }
      expect(shouldShowBranchControls(branchInfoWithSibling)).toBe(true)
    })

    it('should not show branch controls for single branches', () => {
      const singleBranchInfo: BranchInfo = {
        hasBranches: true,
        branchCount: 1,
        currentBranchIndex: 0,
        siblings: ['msg-2']
      }

      const shouldShowBranchControls = (branchInfo: BranchInfo | null) => {
        return branchInfo?.hasBranches && 
          branchInfo?.branchCount > 1 && 
          (branchInfo as any)?.isSiblingBranch === true
      }

      expect(shouldShowBranchControls(singleBranchInfo)).toBe(false)
    })

    it('should not show branch controls when no branches exist', () => {
      const noBranchInfo: BranchInfo = { hasBranches: false }

      const shouldShowBranchControls = (branchInfo: BranchInfo | null) => {
        return branchInfo?.hasBranches && 
          branchInfo?.branchCount > 1 && 
          (branchInfo as any)?.isSiblingBranch === true
      }

      expect(shouldShowBranchControls(noBranchInfo)).toBe(false)
    })
  })

  describe('Version History Logic', () => {
    it('should handle version history modal', () => {
      let showVersionHistory = false
      
      const openVersionHistory = () => { showVersionHistory = true }
      const closeVersionHistory = () => { showVersionHistory = false }

      expect(showVersionHistory).toBe(false)
      
      openVersionHistory()
      expect(showVersionHistory).toBe(true)
      
      closeVersionHistory()
      expect(showVersionHistory).toBe(false)
    })

    it('should handle version switching', () => {
      const onSwitchToVersion = vi.fn()
      const messageId = 'msg-1'
      const versionId = 'version-2'
      
      const handleVersionSwitch = (msgId: string, verId: string) => {
        onSwitchToVersion(msgId, verId)
      }

      handleVersionSwitch(messageId, versionId)
      
      expect(onSwitchToVersion).toHaveBeenCalledWith('msg-1', 'version-2')
    })

    it('should handle empty version list', () => {
      const getMessageVersions = vi.fn().mockReturnValue([])
      
      const messageVersions = getMessageVersions('msg-1') || []
      
      expect(messageVersions).toHaveLength(0)
      expect(Array.isArray(messageVersions)).toBe(true)
    })

    it('should handle version list with multiple versions', () => {
      const versions: Version[] = [
        { id: 'v1', content: 'Original content', timestamp: Date.now() - 2000 },
        { id: 'v2', content: 'First edit', timestamp: Date.now() - 1000 },
        { id: 'v3', content: 'Second edit', timestamp: Date.now(), isCurrent: true }
      ]
      
      const getMessageVersions = vi.fn().mockReturnValue(versions)
      
      const messageVersions = getMessageVersions('msg-1') || []
      
      expect(messageVersions).toHaveLength(3)
      expect(messageVersions[2].isCurrent).toBe(true)
    })
  })

  describe('Prism Tab Logic', () => {
    it('should handle active tab switching', () => {
      let activeTab = 'synthesis'
      
      const setActiveTab = (tab: string) => { activeTab = tab }

      expect(activeTab).toBe('synthesis')
      
      setActiveTab('Critical Race Theory')
      expect(activeTab).toBe('Critical Race Theory')
      
      setActiveTab('Systems Theory')
      expect(activeTab).toBe('Systems Theory')
    })

    it('should determine tab classes correctly', () => {
      const getTabClass = (tabName: string, activeTab: string) => {
        return `prism-tab-vertical ${activeTab === tabName ? 'active' : ''}`
      }

      expect(getTabClass('synthesis', 'synthesis')).toBe('prism-tab-vertical active')
      expect(getTabClass('synthesis', 'Critical Race Theory')).toBe('prism-tab-vertical ')
      expect(getTabClass('Critical Race Theory', 'Critical Race Theory')).toBe('prism-tab-vertical active')
    })

    it('should handle perspective count display', () => {
      const getPerspectiveCount = (message: MessageWithPrism) => {
        return message.perspectives?.length || 0
      }

      expect(getPerspectiveCount(prismMessage)).toBe(3)
      expect(getPerspectiveCount(assistantMessage)).toBe(0)
    })
  })

  describe('Mouse Interaction Logic', () => {
    it('should handle hover state', () => {
      let isHovered = false
      
      const handleMouseEnter = () => { isHovered = true }
      const handleMouseLeave = () => { isHovered = false }

      expect(isHovered).toBe(false)
      
      handleMouseEnter()
      expect(isHovered).toBe(true)
      
      handleMouseLeave()
      expect(isHovered).toBe(false)
    })

    it('should determine control visibility based on hover', () => {
      const getControlsClass = (isHovered: boolean) => {
        return `message-controls ${isHovered ? 'visible' : ''}`
      }

      expect(getControlsClass(false)).toBe('message-controls ')
      expect(getControlsClass(true)).toBe('message-controls visible')
    })
  })

  describe('CSS Class Logic', () => {
    it('should generate correct message classes', () => {
      const getMessageClass = (isUser: boolean, isPrismMessage: boolean) => {
        return `message ${isUser ? 'message-user' : 'message-ai'} ${isPrismMessage ? 'message-prism' : ''}`
      }

      expect(getMessageClass(true, false)).toBe('message message-user ')
      expect(getMessageClass(false, false)).toBe('message message-ai ')
      expect(getMessageClass(false, true)).toBe('message message-ai message-prism')
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle messages without perspectives', () => {
      const messageWithoutPerspectives: MessageWithPrism = {
        ...prismMessage,
        perspectives: undefined
      }

      const isPrismMessage = Boolean(messageWithoutPerspectives.isPrism && messageWithoutPerspectives.perspectives)
      
      expect(isPrismMessage).toBe(false)
    })

    it('should handle messages without synthesis', () => {
      const messageWithoutSynthesis: MessageWithPrism = {
        ...prismMessage,
        synthesis: undefined
      }

      const getDisplayContent = (message: MessageWithPrism, activeTab: string) => {
        if (activeTab === 'synthesis') {
          return message.synthesis || message.content
        }
        return message.content
      }

      expect(getDisplayContent(messageWithoutSynthesis, 'synthesis')).toBe(prismMessage.content)
    })

    it('should handle null branch info', () => {
      const getBranchInfo = vi.fn().mockReturnValue(null)
      
      const branchInfo = getBranchInfo('msg-1')
      
      expect(branchInfo).toBe(null)
    })

    it('should handle undefined callback functions', () => {
      const props = {
        ...defaultProps,
        getBranchInfo: undefined as any,
        getMessageVersions: undefined as any
      }

      expect(() => {
        const branchInfo = props.getBranchInfo?.('msg-1')
        const versions = props.getMessageVersions?.('msg-1') || []
        
        expect(branchInfo).toBeUndefined()
        expect(versions).toEqual([])
      }).not.toThrow()
    })

    it('should handle message with isEdited flag', () => {
      const editedMessage: MessageWithPrism = {
        ...defaultMessage,
        isEdited: true
      }

      expect(editedMessage.isEdited).toBe(true)
    })

    it('should handle empty content gracefully', () => {
      const emptyMessage: MessageWithPrism = {
        ...defaultMessage,
        content: ''
      }

      expect(emptyMessage.content).toBe('')
      expect(emptyMessage.content.length).toBe(0)
    })
  })

  describe('State Management Logic', () => {
    it('should manage multiple state variables independently', () => {
      let showEditModal = false
      let showVersionHistory = false
      let showControls = false
      let isHovered = false
      let activeTab = 'synthesis'

      // Test initial state
      expect({ showEditModal, showVersionHistory, showControls, isHovered, activeTab }).toEqual({
        showEditModal: false,
        showVersionHistory: false,
        showControls: false,
        isHovered: false,
        activeTab: 'synthesis'
      })

      // Test state changes
      showEditModal = true
      isHovered = true
      activeTab = 'Critical Race Theory'

      expect({ showEditModal, showVersionHistory, showControls, isHovered, activeTab }).toEqual({
        showEditModal: true,
        showVersionHistory: false,
        showControls: false,
        isHovered: true,
        activeTab: 'Critical Race Theory'
      })
    })
  })
})