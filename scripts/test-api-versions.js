
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const key = process.env.GEMINI_API_KEY;

if (!key) { console.log("NO_KEY"); process.exit(1); }

async function check(version, model) {
    const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${key}`;
    console.log(`\nTesting: ${url}`);

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: "Hi" }] }] })
        });

        console.log(`STATUS: ${res.status}`);
        if (res.ok) {
            console.log(">>> SUCCESS!");
        } else {
            const d = await res.json();
            console.log(`error code: ${d.error?.code}`);
            console.log(`error message: ${d.error?.message}`);
        }
    } catch (e) {
        console.log("Exception:", e.message);
    }
}

async function run() {
    console.log(`Key: ${key.substring(0, 5)}...${key.substring(key.length - 4)}`);
    await check('v1', 'gemini-pro');
    await check('v1beta', 'gemini-1.5-flash');
}

run();
