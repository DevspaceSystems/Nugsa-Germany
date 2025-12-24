
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const url = `${process.env.VITE_SUPABASE_URL}/functions/v1/chatbot-proxy`;
const key = process.env.VITE_SUPABASE_ANON_KEY;

console.log("Testing OPTIONS request to:", url);

async function checkCors() {
    try {
        const res = await fetch(url, {
            method: 'OPTIONS',
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`
            }
        });

        console.log("Status:", res.status, res.statusText);
        console.log("Headers:");
        res.headers.forEach((val, key) => console.log(`  ${key}: ${val}`));

    } catch (e) {
        console.error("Fetch error:", e);
    }
}

checkCors();
