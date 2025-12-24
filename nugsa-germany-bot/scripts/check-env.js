/**
 * Check if environment variables are properly loaded in the nugsa-germany-bot project
 * This helps diagnose frontend configuration issues without exposing secrets
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Checking nugsa-germany-bot environment configuration...\n');

// Check .env.local file
const envLocalPath = path.join(__dirname, '..', '.env.local');

console.log('1. Checking .env.local file:');
console.log(`   Path: ${envLocalPath}`);

if (fs.existsSync(envLocalPath)) {
    console.log('   ✓ .env.local file exists');

    const content = fs.readFileSync(envLocalPath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));

    console.log(`   ✓ Found ${lines.length} environment variable(s)\n`);

    // Check for required variables
    const requiredVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
    const foundVars = {};

    lines.forEach(line => {
        const [key] = line.split('=');
        const trimmedKey = key.trim();
        if (requiredVars.includes(trimmedKey)) {
            foundVars[trimmedKey] = true;
        }
    });

    console.log('2. Required variables check:');
    requiredVars.forEach(varName => {
        if (foundVars[varName]) {
            console.log(`   ✓ ${varName} is set`);
        } else {
            console.log(`   ✗ ${varName} is MISSING`);
        }
    });

    console.log('\n3. Variable format check:');
    lines.forEach(line => {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=').trim();
        const trimmedKey = key.trim();

        if (requiredVars.includes(trimmedKey)) {
            // Check format without revealing the actual value
            if (trimmedKey === 'VITE_SUPABASE_URL') {
                if (value.startsWith('http')) {
                    console.log(`   ✓ ${trimmedKey} appears to be a valid URL`);
                } else {
                    console.log(`   ✗ ${trimmedKey} doesn't look like a URL (should start with http)`);
                }
            } else if (trimmedKey === 'VITE_SUPABASE_ANON_KEY') {
                if (value.length > 20) {
                    console.log(`   ✓ ${trimmedKey} appears to be a valid key (length: ${value.length})`);
                } else {
                    console.log(`   ✗ ${trimmedKey} seems too short (length: ${value.length})`);
                }
            }
        }
    });

    // Check if all required vars are present
    const allPresent = requiredVars.every(v => foundVars[v]);

    if (allPresent) {
        console.log('\n✅ All required environment variables are configured!');
    } else {
        console.log('\n❌ Some required environment variables are missing!');
        console.log('\n💡 To fix:');
        console.log('   1. Create/edit nugsa-germany-bot/.env.local');
        console.log('   2. Add the following variables:');
        console.log('      VITE_SUPABASE_URL=your_supabase_url');
        console.log('      VITE_SUPABASE_ANON_KEY=your_supabase_anon_key');
    }

} else {
    console.log('   ✗ .env.local file NOT FOUND');
    console.log('\n❌ Configuration file is missing!');
    console.log('\n💡 To fix:');
    console.log('   1. Create nugsa-germany-bot/.env.local');
    console.log('   2. Add the following variables:');
    console.log('      VITE_SUPABASE_URL=your_supabase_url');
    console.log('      VITE_SUPABASE_ANON_KEY=your_supabase_anon_key');
    console.log('   3. Get these values from your Supabase project dashboard');
}

console.log('\n4. Checking .gitignore:');
const gitignorePath = path.join(__dirname, '..', '.gitignore');
if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
    if (gitignoreContent.includes('.env.local') || gitignoreContent.includes('.env*.local')) {
        console.log('   ✓ .env.local is properly ignored by git (secure)');
    } else {
        console.log('   ⚠️  .env.local might not be in .gitignore (security risk!)');
    }
} else {
    console.log('   ⚠️  No .gitignore found');
}

console.log('\n' + '='.repeat(60));
