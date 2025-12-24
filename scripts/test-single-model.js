
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env'), debug: false });
// Suppress dotenv warning if possible, or just ignore it.

async function run() {
    let key = process.env.GEMINI_API_KEY;
    // Fallback logic
    if (!key) {
        try {
            const content = fs.readFileSync(path.resolve('nugsa-germany-bot', '.env.local'), 'utf8');
            const match = content.match(/GEMINI_API_KEY=(.*)/);
            if (match) key = match[1].trim();
        } catch (e) { }
    }

    if (!key) { console.log("NO_KEY"); return; }


    console.log(`USING KEY: ${key.substring(0, 10)}...`);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: "Hi" }] }] })
        });
        const data = await res.json();

        console.log(`STATUS: ${res.status}`);
        if (!res.ok) {
            console.log("FULL ERROR:", JSON.stringify(data, null, 2));
        } else {
            console.log("SUCCESS");
        }
    } catch (e) {
        console.log("FETCH_ERR: " + e.message);
    }
}
run();
