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

// Create a proper DOM environment for React Testing Library
const createMockElement = (tagName: string) => {
  const element = {
    tagName: tagName.toUpperCase(),
    setAttribute: vi.fn(),
    getAttribute: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    click: vi.fn(),
    focus: vi.fn(),
    blur: vi.fn(),
    scrollIntoView: vi.fn(),
    appendChild: vi.fn(),
    removeChild: vi.fn(),
    innerHTML: '',
    textContent: '',
    className: '',
    id: '',
    style: {},
    href: '',
    download: '',
    children: [],
    parentNode: null,
    querySelector: vi.fn(),
    querySelectorAll: vi.fn(() => []),
    contains: vi.fn(() => false),
    getBoundingClientRect: vi.fn(() => ({
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      width: 0,
      height: 0
    }))
  }
  return element
}

const mockBody = createMockElement('body')

// Enhanced document mock for React Testing Library
Object.defineProperty(global, 'document', {
  value: {
    createElement: vi.fn(createMockElement),
    createTextNode: vi.fn((text: string) => ({ textContent: text, nodeValue: text })),
    body: mockBody,
    documentElement: createMockElement('html'),
    getElementById: vi.fn(),
    querySelector: vi.fn(),
    querySelectorAll: vi.fn(() => []),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    createEvent: vi.fn(() => ({
      initEvent: vi.fn(),
      preventDefault: vi.fn(),
      stopPropagation: vi.fn()
    }))
  }
})

// Reset localStorage before each test
beforeEach(() => {
  localStorageMock.clear()
})