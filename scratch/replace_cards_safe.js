const fs = require('fs');
let content = fs.readFileSync('app/page.tsx', 'utf8');

const targetOpen = '<div className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary hover:shadow-sm">';
const replacementOpen = `
<div className="group relative overflow-hidden rounded-xl bg-border p-[1px] transition-all hover:shadow-md">
  <div className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#f59e0b_0%,#8b5cf6_33%,#3b82f6_66%,#f59e0b_100%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
  <div className="relative h-full w-full rounded-xl bg-card p-6">
`.trim();

// Because we wrap the contents, we need to add an extra closing </div> at the end of each card.
// We can do this by finding the exact blocks.
const cards = [
  "Think First Prompts",
  "Pattern Detection",
  "Progressive Hints",
  "Memory Hooks",
  "Similar Problems",
  "Quick Check Quiz"
];

for (const cardTitle of cards) {
  // Find the opening tag before this title
  const titleIndex = content.indexOf(`>${cardTitle}</h3>`);
  if (titleIndex === -1) continue;
  
  const openTagIndex = content.lastIndexOf(targetOpen, titleIndex);
  if (openTagIndex === -1) continue;
  
  // Find the closing </p> of this card
  const pCloseIndex = content.indexOf('</p>', titleIndex) + 4;
  
  // The closing div of the card is the next </div>
  const divCloseIndex = content.indexOf('</div>', pCloseIndex);
  
  // Now replace the opening tag and closing tag for this specific block
  const beforeOpen = content.substring(0, openTagIndex);
  const between = content.substring(openTagIndex + targetOpen.length, divCloseIndex);
  const afterClose = content.substring(divCloseIndex + 6); // length of '</div>'
  
  content = beforeOpen + replacementOpen + between + '</div>\n              </div>' + afterClose;
}

fs.writeFileSync('app/page.tsx', content);
console.log('Successfully upgraded all 6 cards!');
