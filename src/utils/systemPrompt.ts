// Fetch System prompt for Wittgenstein's Monster from prompts/wm.txt
let systemPromptCache: string | null = null;

export const getSystemPrompt = async (): Promise<string> => {
  if (systemPromptCache) {
    return systemPromptCache;
  }
  
  try {
    const response = await fetch('/prompts/wm.txt');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    systemPromptCache = await response.text();
    return systemPromptCache;
  } catch (error) {
    console.error('Failed to fetch system prompt:', error);
    return 'Failed to load system prompt';
  }
};

// For backwards compatibility, export a promise that resolves to the system prompt
export const SYSTEM_PROMPT_PROMISE = getSystemPrompt();

// Deprecated: Use getSystemPrompt() instead
export const SYSTEM_PROMPT = await getSystemPrompt();