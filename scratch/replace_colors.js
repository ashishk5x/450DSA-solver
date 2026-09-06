const fs = require('fs');
const file = 'app/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace hex with semantic variables
content = content.replaceAll('bg-[#faf8f3]', 'bg-background');
content = content.replaceAll('bg-[#ffffff]', 'bg-card');
content = content.replaceAll('bg-[#f5f2eb]', 'bg-secondary');
content = content.replaceAll('bg-[#f0ede6]', 'bg-muted');
content = content.replaceAll('bg-[#1a1814]', 'bg-primary');
content = content.replaceAll('bg-[#2d2926]', 'bg-primary/90');

content = content.replaceAll('text-[#1a1814]', 'text-foreground');
content = content.replaceAll('text-[#faf8f3]', 'text-primary-foreground');
content = content.replaceAll('text-[#6b6560]', 'text-muted-foreground');
content = content.replaceAll('text-[#a89f96]', 'text-muted-foreground/70');

content = content.replaceAll('border-[#e8e2d9]', 'border-border');
content = content.replaceAll('border-[#d4cdc4]', 'border-border/80');
content = content.replaceAll('border-[#1a1814]', 'border-primary');

// Specific replacements for hovers
content = content.replaceAll('hover:bg-[#f0ede6]', 'hover:bg-muted');
content = content.replaceAll('hover:bg-[#2d2926]', 'hover:bg-primary/90');
content = content.replaceAll('hover:text-[#1a1814]', 'hover:text-foreground');
content = content.replaceAll('hover:border-[#1a1814]', 'hover:border-primary');
content = content.replaceAll('hover:border-[#d4cdc4]', 'hover:border-border/80');

fs.writeFileSync(file, content);
console.log("Done replacing colors in page.tsx");
