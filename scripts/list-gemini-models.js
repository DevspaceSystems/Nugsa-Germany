/**
 * Check which Gemini models are available with your API key
 * This helps diagnose model availability issues
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file
const envPath = path.join(__dirname, '..', '.env');
let GEMINI_API_KEY = '';

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const lines = envContent.split('\n');

    lines.forEach(line => {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=').trim();

        if (key.trim() === 'GEMINI_API_KEY') {
            GEMINI_API_KEY = value;
        }
    });
}

console.log('🔍 Checking available Gemini models...\n');

if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in .env file');
    console.error('   Please add: GEMINI_API_KEY=your_key_here');
    process.exit(1);
}

console.log(`✓ API Key found (length: ${GEMINI_API_KEY.length})\n`);

async function listModels() {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`
        );

        if (!response.ok) {
            console.error(`❌ API Error: ${response.status} ${response.statusText}`);
            const errorText = await response.text();
            console.error('Response:', errorText);
            return;
        }

        const data = await response.json();

        console.log('📋 Available Models:\n');

        if (data.models && data.models.length > 0) {
            // Filter for models that support generateContent
            const contentModels = data.models.filter(model =>
                model.supportedGenerationMethods?.includes('generateContent')
            );

            console.log(`Found ${contentModels.length} models that support generateContent:\n`);

            contentModels.forEach(model => {
                console.log(`✓ ${model.name}`);
                console.log(`  Display Name: ${model.displayName}`);
                console.log(`  Description: ${model.description}`);
                console.log(`  Methods: ${model.supportedGenerationMethods.join(', ')}`);
                console.log('');
            });

            console.log('\n💡 Recommended models for your chatbot:');
            const recommended = contentModels.filter(m =>
                m.name.includes('gemini') &&
                (m.name.includes('flash') || m.name.includes('pro'))
            );

            recommended.forEach(model => {
                console.log(`  • ${model.name.replace('models/', '')}`);
            });

        } else {
            console.log('❌ No models found');
        }

    } catch (error) {
        console.error('❌ Error fetching models:');
        console.error(error.message);
    }
}

listModels();
