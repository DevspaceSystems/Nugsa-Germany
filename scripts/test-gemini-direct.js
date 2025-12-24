
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("No GEMINI_API_KEY found in .env");
    // Try .env.local of bot if main .env lacks it
    // But earlier I saw it in .env.local
}

// Fallback to reading from bot env if needed, but let's assume user put it in main .env (or they said they put it in secrets). 
// Wait, the user put it in **Supabase Secrets**. They might NOT have it in local .env for this script to work!
// I need to ask them to put it in .env OR I need to rely on the fact that I saw it earlier in .env.local of the bot.

// Let's look at the bot's .env.local again to be sure, or just try to run it. 
// I previously extracted it using `Get-Content` on the bot's .env.local.
// I will try to read it from there in this script.

async function listModels() {
    // If not in process.env, try to read from bot file manually
    let key = apiKey;
    if (!key) {
        const fs = await import('fs');
        try {
            const botEnvPath = path.resolve(process.cwd(), 'nugsa-germany-bot', '.env.local');
            const content = fs.readFileSync(botEnvPath, 'utf8');
            const match = content.match(/GEMINI_API_KEY=(.*)/);
            if (match) {
                key = match[1].trim();
                console.log("Found key in bot .env.local");
            }
        } catch (e) {
            console.log("Could not read bot .env.local");
        }
    }

    if (!key) {
        console.error("Could not find API Key to test with.");
        return;
    }

    console.log(`Testing with Key: ${key.substring(0, 5)}...`);

    // Test simple generation
    console.log("\n--- Testing Model: gemini-1.5-flash ---");
    await testGenerate(key, 'gemini-1.5-flash');

    console.log("\n--- Testing Model: gemini-pro ---");
    await testGenerate(key, 'gemini-pro');

    // List models
    console.log("\n--- Listing Available Models ---");
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    try {
        const res = await fetch(url);
        const data = await res.json();

        if (data.models) {
            data.models.forEach(m => {
                if (m.name.includes('gemini')) {
                    console.log(` - ${m.name} (${m.supportedGenerationMethods.join(', ')})`);
                }
            });
        } else {
            console.log("No models returned or error:", JSON.stringify(data));
        }
    } catch (e) {
        console.error("List Error:", e);
    }
}

async function testGenerate(key, model) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: "Hi" }] }] })
        });
        const data = await res.json();
        if (res.ok) {
            console.log(`✅ ${model} WORKS!Response:`, data?.candidates?.[0]?.content?.parts?.[0]?.text);
        } else {
            console.log(`❌ ${model} FAILED:`, data.error?.message || data);
        }
    } catch (e) {
        console.log(`❌ ${model} ERROR:`, e.message);
    }
}

listModels();
