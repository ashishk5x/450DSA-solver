const fs = require('fs');
let content = fs.readFileSync('app/page.tsx', 'utf8');

// Replace the background of the icon wrapper
const targetWrapper = 'className="mb-4 inline-flex rounded-lg bg-primary p-2.5"';
const replacementWrapper = 'className="mb-4 inline-flex rounded-lg bg-amber-100 dark:bg-amber-900/30 p-2.5 transition-colors group-hover:bg-amber-200 dark:group-hover:bg-amber-800/50"';

content = content.replaceAll(targetWrapper, replacementWrapper);

// Replace the icon colors
const targetIconColor = 'className="h-5 w-5 text-primary-foreground"';
const replacementIconColor = 'className="h-5 w-5 text-amber-700 dark:text-amber-400"';

content = content.replaceAll(targetIconColor, replacementIconColor);

fs.writeFileSync('app/page.tsx', content);
console.log('Successfully updated the feature card icons to the warm amber theme!');
