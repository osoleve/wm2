import '@testing-library/jest-dom'
import { vi, beforeEach } from 'vitest'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index: number) => {
      const keys = Object.keys(store)
      return keys[index] || null
    }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock DOM APIs for testing
global.URL = {
  createObjectURL: vi.fn(() => 'blob:mock-url'),
  revokeObjectURL: vi.fn()
} as any

global.Blob = class MockBlob {
  constructor(public content: any[], public options?: any) {}
} as any

// Mock more DOM APIs for React
Object.defineProperty(global, 'HTMLElement', {
  value: class MockHTMLElement {
    setAttribute = vi.fn()
    getAttribute = vi.fn()
    style = {}
  }
})

// Mock window methods
Object.defineProperty(global, 'window', {
  value: {
    ...global.window,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }
})

// Comprehensive document mock
const mockBody = {
  appendChild: vi.fn(),
  removeChild: vi.fn(),
}

Object.defineProperty(global, 'document', {
  value: {
    createElement: vi.fn((tagName: string) => {
      const element = {
        tagName: tagName.toUpperCase(),
        setAttribute: vi.fn(),
        getAttribute: vi.fn(),
        style: {},
        click: vi.fn(),
        href: '',
        download: '',
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      }
      return element
    }),
    body: mockBody
  }
})

// Reset localStorage before each test
beforeEach(() => {
  localStorageMock.clear()
})