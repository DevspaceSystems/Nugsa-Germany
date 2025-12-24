
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const key = process.env.GEMINI_API_KEY;

if (!key) { console.log("NO_KEY"); process.exit(1); }

async function check(model) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: "Hi" }] }] })
        });

        if (res.ok) {
            console.log(`>>> SUCCESS: ${model}`);
            return true;
        } else {
            const d = await res.json();
            console.log(`FAIL: ${model} (${res.status}) - ${d.error?.message?.substring(0, 50)}`);
        }
    } catch (e) {
        console.log(`ERR: ${model} - ${e.message}`);
    }
    return false;
}

async function run() {
    console.log(`Checking Key: ${key.substring(0, 4)}...`);

    // Try the most likely ones first
    if (await check('gemini-1.5-flash')) return;
    if (await check('gemini-1.5-flash-001')) return;
    if (await check('gemini-pro')) return;
    if (await check('gemini-1.0-pro')) return;

    console.log(">>> ALL MODELS FAILED.");
}

run();
