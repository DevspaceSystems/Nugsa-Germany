/**
 * Test script to verify the Supabase Edge Function is working correctly
 * This tests the chatbot-proxy Edge Function independently of the frontend
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file
const envPath = path.join(__dirname, '..', '.env');
let SUPABASE_URL = '';
let SUPABASE_ANON_KEY = '';

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const lines = envContent.split('\n');

    lines.forEach(line => {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=').trim();

        if (key.trim() === 'VITE_SUPABASE_URL') {
            SUPABASE_URL = value;
        } else if (key.trim() === 'VITE_SUPABASE_ANON_KEY') {
            SUPABASE_ANON_KEY = value;
        }
    });
}

console.log('🔍 Testing Supabase Edge Function...\n');
console.log('Configuration:');
console.log(`  Supabase URL: ${SUPABASE_URL ? '✓ Found' : '✗ Missing'}`);
console.log(`  Anon Key: ${SUPABASE_ANON_KEY ? '✓ Found' : '✗ Missing'}`);
console.log('');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Missing Supabase configuration in .env file');
    console.error('   Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set');
    process.exit(1);
}

// Test payload
const testPayload = {
    messages: [
        { role: 'user', text: 'What is NUGSA?' }
    ],
    files: [
        {
            name: 'Test Context.txt',
            content: 'NUGSA stands for National Union of Ghanaian Student Associations in Germany.'
        }
    ]
};

const edgeFunctionUrl = `${SUPABASE_URL}/functions/v1/chatbot-proxy`;

console.log(`📡 Sending request to: ${edgeFunctionUrl}\n`);

async function testEdgeFunction() {
    try {
        const response = await fetch(edgeFunctionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify(testPayload)
        });

        console.log(`Response Status: ${response.status} ${response.statusText}`);
        console.log(`Content-Type: ${response.headers.get('content-type')}`);
        console.log('');

        if (!response.ok) {
            console.error('❌ Edge Function returned an error');
            const errorText = await response.text();
            console.error('Error Response:', errorText);

            try {
                const errorJson = JSON.parse(errorText);
                console.error('\nParsed Error:', JSON.stringify(errorJson, null, 2));
            } catch (e) {
                // Not JSON
            }

            return;
        }

        // Check if it's a streaming response
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('text/event-stream')) {
            console.log('✓ Streaming response detected');
            console.log('\n📨 Streaming response:\n');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let fullResponse = '';

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
                                process.stdout.write(text);
                            }
                        } catch (e) {
                            // Ignore parse errors
                        }
                    }
                    boundary = buffer.indexOf('\n\n');
                }
            }

            console.log('\n\n✅ Edge Function test completed successfully!');
            console.log(`\nFull Response (${fullResponse.length} characters):`);
            console.log(fullResponse);

        } else {
            // Non-streaming response
            const responseText = await response.text();
            console.log('Response:', responseText);
        }

    } catch (error) {
        console.error('❌ Test failed with error:');
        console.error(error.message);

        if (error.cause) {
            console.error('\nCause:', error.cause);
        }

        // Common issues
        console.log('\n💡 Common issues:');
        console.log('  1. Edge Function not deployed: Run `supabase functions deploy chatbot-proxy`');
        console.log('  2. GEMINI_API_KEY not set in Supabase: Check Supabase Dashboard → Edge Functions → Secrets');
        console.log('  3. Network/CORS issues: Check if Supabase project is accessible');
        console.log('  4. Invalid API key: Verify the Gemini API key in Supabase secrets');
    }
}

testEdgeFunction();
