const fs = require('fs');
let content = fs.readFileSync('app/page.tsx', 'utf8');

const regex = /<div className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary hover:shadow-sm">([\s\S]*?)<\/div>\s*<\/div>/g;

// Wait, the regex needs to capture the closing div of the card itself, not the container!
// It's safer to just split and replace exactly what we want.
// The cards always start with `<div className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary hover:shadow-sm">`
// And we want to replace that exact opening tag and inject the inner structure.

// Wait, the new structure needs to wrap the inside.
// Actually, let's just do a simple replacement of the opening tag and the closing tag if we can map them.
// Let's use `multi_replace_file_content` for this if possible, or just a smarter regex.
// Regex for the exact block:
const cardRegex = /<div className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary hover:shadow-sm">([\s\S]*?)<\/div>\s*<\/div>/g; // Wait, there is a nested div for the icon...
