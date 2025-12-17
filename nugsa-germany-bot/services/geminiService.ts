import { GoogleGenAI, Chat } from "@google/genai";
import { Message, FileDocument, ModelType } from '../types';

let chatSession: Chat | null = null;
let currentAi: GoogleGenAI | null = null;

const getAiClient = () => {
  if (!currentAi) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key is missing");
    }
    currentAi = new GoogleGenAI({ apiKey });
  }
  return currentAi;
};

// Format files into a system prompt that mimics RAG by loading context
const createSystemInstruction = (files: FileDocument[]): string => {
  if (files.length === 0) {
    return "You are a helpful AI assistant. Answer the user's questions to the best of your ability.";
  }

  const filesContext = files.map(f => `
--- START FILE: ${f.name} ---
${f.content}
--- END FILE: ${f.name} ---
`).join('\n');

  return `You are "NUGSA-Germany Bot", a warm and friendly assistant for the National Union of Ghanaian Student Associations in Germany.

Your goal is to help students navigate life in Germany by answering their questions clearly and simply, using ONLY the information provided in the context documents below.

CONTEXT DOCUMENTS:
${filesContext}

GUIDELINES:
1. **Be Friendly & Approachable**: Use a welcoming, conversational tone. Imagine you are a helpful student advisor talking to a friend.
2. **Keep it Simple**: Avoid complex jargon. Explain answers in plain, easy-to-understand English.
3. **Be Concise but Helpful**: Give direct answers. Use bullet points and bold text to make information easy to scan.
4. **Strict Adherence**: Base your answers strictly on the provided documents. Do not hallucinate or make up outside information.
5. **Unknown Information**: If the answer is not in the documents, kindly say: "I'm sorry, I don't have that specific information in my records. Please contact the NUGSA leadership team directly for assistance."
`;
};

export const initChat = (model: ModelType, files: FileDocument[]) => {
  const ai = getAiClient();
  const systemInstruction = createSystemInstruction(files);
  
  chatSession = ai.chats.create({
    model: model,
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.6, // Slightly higher for a more natural, friendly tone while remaining factual
    },
  });
};

export const sendMessageStream = async function* (message: string, files: FileDocument[]) {
  // If no chat session exists (or if we want to ensure latest context is used), we might check or re-init.
  // For this simple implementation, we assume initChat was called when files changed or app loaded.
  // However, to be robust, if chatSession is null, we init it.
  if (!chatSession) {
    initChat(ModelType.FLASH, files);
  }

  if (!chatSession) {
    throw new Error("Failed to initialize chat session");
  }

  const result = await chatSession.sendMessageStream({ message });

  for await (const chunk of result) {
    yield chunk.text;
  }
};

export const resetChat = () => {
  chatSession = null;
};