
const fs = require('fs');
const path = require('path');

const envPath = path.resolve('.env');
const content = fs.readFileSync(envPath, 'utf8');

console.log("--- .env ANALYSIS ---");
const lines = content.split('\n');
lines.forEach((line, i) => {
    if (line.includes('GEMINI_API_KEY')) {
        console.log(`Line ${i + 1} RAW: ${JSON.stringify(line)}`);

        const parts = line.split('=');
        if (parts.length > 1) {
            const val = parts[1].trim();
            console.log(`Key Length: ${val.length}`);
            console.log(`First char code: ${val.charCodeAt(0)}`);
            console.log(`Last char code: ${val.charCodeAt(val.length - 1)}`);
            if (val.startsWith('"') || val.startsWith("'")) console.log("WARNING: Key starts with quote");
            if (val.endsWith('"') || val.endsWith("'")) console.log("WARNING: Key ends with quote");
        }
    }
});
