
const fs = require('fs');
const path = require('path');

const envPath = path.resolve('.env');

try {
    const content = fs.readFileSync(envPath, 'utf8');

    console.log("--- .env ANALYSIS ---");
    const lines = content.split('\n');
    lines.forEach((line, i) => {
        if (line.includes('GEMINI_API_KEY')) {
            console.log(`Line ${i + 1} RAW: ${JSON.stringify(line)}`);

            // basic parse
            const parts = line.split('=');
            if (parts.length > 1) {
                // Manually trim only CR/LF to see if user added spaces
                let val = parts.slice(1).join('=');
                val = val.replace(/\r$/, '');

                console.log(`Value starts with: '${val.substring(0, 1)}'`);
                console.log(`Value ends with: '${val.substring(val.length - 1)}'`);
                console.log(`Value Char Codes: ${val.split('').map(c => c.charCodeAt(0)).join(',')}`);
            }
        }
    });
} catch (e) {
    console.error(e);
}
