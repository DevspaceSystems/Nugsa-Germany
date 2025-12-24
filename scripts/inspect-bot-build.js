
const fs = require('fs');
const path = require('path');

const filePath = path.resolve('public/bot/index.js');

try {
    const content = fs.readFileSync(filePath, 'utf8');
    console.log("File size:", content.length);

    // Look for Supabase URL pattern
    const urlRegex = /https:\/\/[a-z0-9-]+\.supabase\.co/g;
    const matches = content.match(urlRegex);

    if (matches) {
        console.log("✅ Found Supabase URLs in build:");
        matches.forEach(m => console.log(" - " + m));
    } else {
        console.log("❌ No Supabase URL found in public/bot/index.js!");
    }

    // Look for the specific error message to confirm this is the file generating the error
    if (content.includes("I encountered an error")) {
        console.log("✅ Found Error Message string in build (File is likely valid)");
    }

} catch (e) {
    console.error("Error reading file:", e);
}
