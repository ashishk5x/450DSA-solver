const fs = require('fs');
let content = fs.readFileSync('app/page.tsx', 'utf8');

// Fix 1: Remove Code2 import
content = content.replace(/\bCode2,\s*/g, '');

// Fix 2: Unescaped entities around lines 154-156
// The errors say: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.
// Let's find "you're" and "don't" inside the text blocks that might be unescaped.
content = content.replaceAll("you're", "you&apos;re");
content = content.replaceAll("don't", "don&apos;t");
content = content.replaceAll("won't", "won&apos;t");

fs.writeFileSync('app/page.tsx', content);
console.log('Successfully fixed page.tsx for build errors!');
