
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @deno-types="https://esm.sh/@google/generative-ai@0.21.0"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface FileDocument {
    name: string;
    content: string;
}

const createSystemInstruction = (files: FileDocument[]): string => {
    if (!files || files.length === 0) {
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

serve(async (req) => {
    // 1. Handle CORS Pre-flight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // 2. Parse Request
        const { messages, files } = await req.json();
        const apiKey = Deno.env.get('GEMINI_API_KEY');

        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not set' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
            });
        }

        // 3. Initialize Gemini SDK
        const genAI = new GoogleGenerativeAI(apiKey);

        // 4. Configure Model and System Instruction
        const systemInstruction = createSystemInstruction(files);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: systemInstruction
        });

        // 5. Transform Messages for SDK
        // SDK expects: { role: 'user' | 'model', parts: [{ text: string }] }
        const contents = messages.map((m: any) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
        }));

        console.log('Generating content with model: gemini-1.5-flash-002');
        console.log('Message count:', contents.length);

        // 6. Generate Stream
        const result = await model.generateContentStream({ contents });

        // 7. Create ReadableStream for Response (SSE Format)
        const encoder = new TextEncoder();
        const readableStream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of result.stream) {
                        const text = chunk.text();
                        if (text) {
                            // Match the exact format expected by the frontend (Gemini API style)
                            // "data: " + JSON string containing candidates array
                            const data = {
                                candidates: [{
                                    content: {
                                        parts: [{ text: text }]
                                    }
                                }]
                            };
                            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
                        }
                    }
                    controller.close();
                } catch (streamError) {
                    console.error('Stream error:', streamError);
                    controller.error(streamError);
                }
            }
        });

        // 8. Return Response
        return new Response(readableStream, {
            headers: {
                ...corsHeaders,
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });

    } catch (error: any) {
        console.error('Edge Function error:', error);

        // Return JSON error
        return new Response(JSON.stringify({
            error: error.message || 'An error occurred processing your request',
            details: error
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});
