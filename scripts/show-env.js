
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error("Missing vars");
    process.exit(1);
}

const content = `VITE_SUPABASE_URL=${url}\nVITE_SUPABASE_ANON_KEY=${key}\n`;

const targetPath = path.resolve(process.cwd(), 'nugsa-germany-bot', '.env.local');

fs.writeFileSync(targetPath, content);
console.log(`Wrote env vars to ${targetPath}`);
