// Fetch System prompt for Wittgenstein's Monster from prompts/wm.txt
export const SYSTEM_PROMPT = await fetch('/prompts/wm.txt').then(response => response.text()).catch(error => {
  console.error('Failed to fetch system prompt:', error);
  return 'Failed to load system prompt';
});