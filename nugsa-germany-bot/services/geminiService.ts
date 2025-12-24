import { Message, FileDocument, ModelType } from '../types';

let chatHistory: { role: 'user' | 'model', text: string }[] = [];

// Get Supabase credentials from environment variables defined in Vite
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || (import.meta as any).env?.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

export const initChat = (model: ModelType, files: FileDocument[]) => {
  chatHistory = [];
};

export const sendMessageStream = async function* (message: string, files: FileDocument[]) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase configuration is missing in .env.local");
  }

  // Add user message to history
  chatHistory.push({ role: 'user', text: message });

  const response = await fetch(`${SUPABASE_URL}/functions/v1/chatbot-proxy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({
      messages: chatHistory,
      files: files
    })
  });

  if (!response.ok) {
    let errorMessage = "Failed to connect to AI proxy";
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch (e) {
      // Fallback if not JSON
    }
    throw new Error(errorMessage);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let fullResponse = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    let boundary = buffer.indexOf('\n\n');
    while (boundary !== -1) {
      const chunk = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);

      if (chunk.startsWith('data: ')) {
        const jsonStr = chunk.slice(6);

        try {
          const data = JSON.parse(jsonStr);
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            fullResponse += text;
            yield text;
          }
        } catch (e) {
          // Ignore partial JSON or [DONE] marker if used
        }
      }
      boundary = buffer.indexOf('\n\n');
    }
  }

  // Add model response to history
  chatHistory.push({ role: 'model', text: fullResponse });
};

export const resetChat = () => {
  chatHistory = [];
};