const fs = require('fs');
let content = fs.readFileSync('app/dashboard/page.tsx', 'utf8');

content = content.replace(
  'className="text-sm font-medium text-muted-foreground"',
  'className="text-sm font-medium text-foreground/80"'
);

content = content.replace(
  'className="flex items-center gap-1.5 text-[10px] text-green-400/70"',
  'className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-500 dark:text-emerald-400"'
);

fs.writeFileSync('app/dashboard/page.tsx', content);
console.log('Fixed font colors');
