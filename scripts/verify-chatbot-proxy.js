
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("❌ Error: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env file.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testChatbotProxy() {
    console.log(`Testing Chatbot Proxy at: ${SUPABASE_URL}/functions/v1/chatbot-proxy`);

    const payload = {
        messages: [
            { role: "user", text: "Hello" }
        ],
        files: []
    };

    try {
        // Invoke the function
        const { data, error } = await supabase.functions.invoke('chatbot-proxy', {
            body: payload,
        });

        if (error) {
            console.error("❌ Function Invocation Error Object:", error);
            try {
                // The error object typically has a 'context' property with the response
                if (error.context && typeof error.context.json === 'function') {
                    const errBody = await error.context.json();
                    console.error("❌ DETAILED SERVER ERROR BODY:", JSON.stringify(errBody, null, 2));
                } else if (error instanceof Response) {
                    const errBody = await error.json();
                    console.error("❌ DETAILED RESPONSE ERROR:", JSON.stringify(errBody, null, 2));
                }
            } catch (e) {
                console.log("Could not parse error body:", e);
            }
            return;
        }

        console.log("✅ Success! Response received.");
        if (data && typeof data.text === 'function') {
            const text = await data.text();
            console.log("Response Body Preview:", text.substring(0, 500));
        } else {
            console.log("Response Data:", data);
        }

    } catch (err) {
        console.error("❌ Unexpected script error:", err);
    }
}

testChatbotProxy();
