const fs = require('fs');
let content = fs.readFileSync('app/page.tsx', 'utf8');

// The block to insert for Card 1
const card1Insert = `
                    <div className="flex-1 w-full py-8 flex flex-col items-center justify-center">
                      <div className="w-full max-w-[200px] rounded-lg border border-border bg-background/50 p-3 shadow-sm transition-all duration-500 group-hover:scale-105 group-hover:shadow-md group-hover:border-amber-200/50">
                        <div className="flex items-center gap-1.5 mb-2">
                          <div className="h-2 w-2 rounded-full bg-red-400" />
                          <div className="h-2 w-2 rounded-full bg-amber-400" />
                          <div className="h-2 w-2 rounded-full bg-green-400" />
                        </div>
                        <div className="space-y-2">
                          <div className="h-2 w-3/4 rounded-full bg-muted-foreground/20" />
                          <div className="h-2 w-1/2 rounded-full bg-muted-foreground/20" />
                          <div className="h-2 w-5/6 rounded-full bg-muted-foreground/20" />
                        </div>
                      </div>
                    </div>
`;

// The block to insert for Card 2
const card2Insert = `
                    <div className="flex-1 w-full py-8 flex flex-col items-center justify-center gap-3">
                      <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[10px] font-bold text-amber-600 shadow-sm transition-transform duration-500 group-hover:-translate-y-1 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-400">
                        <Zap size={12} className="fill-amber-500 text-amber-500" />
                        <span>SLIDING WINDOW</span>
                      </div>
                      <div className="w-[85%] rounded-lg rounded-tr-sm bg-primary/5 p-3 border border-primary/10 shadow-sm transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1">
                        <p className="text-[10px] font-medium text-foreground">What happens to the window size if we find a repeating character?</p>
                      </div>
                    </div>
`;

// The block to insert for Card 3
const card3Insert = `
                    <div className="flex-1 w-full py-8 flex items-center justify-center">
                      <div className="relative flex w-[180px] items-center gap-4 rounded-xl border border-border bg-background/50 p-3 shadow-sm transition-all duration-500 group-hover:scale-105 group-hover:shadow-md group-hover:border-amber-200/50">
                        <div className="flex flex-col items-center justify-center rounded-lg bg-amber-100 p-2.5 dark:bg-amber-900/40">
                          <Timer size={16} className="text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-foreground">Next Review</p>
                          <p className="text-[9px] text-muted-foreground">in 3 days</p>
                        </div>
                        <div className="absolute -right-2 -top-2 rounded-full bg-green-500 p-1 text-white shadow-sm ring-2 ring-card transition-transform duration-500 group-hover:scale-110">
                          <CheckCircle2 size={10} className="fill-current" />
                        </div>
                      </div>
                    </div>
`;

// Find each card's target string
// Since we have three distinct `<div className="mt-8">` blocks within these articles, we can split by them.

let parts = content.split('<div className="mt-8">');

// parts[1] belongs to card 1
// parts[2] belongs to card 2
// parts[3] belongs to card 3

if (parts.length >= 4) {
  content = parts[0] + card1Insert + '<div className="mt-8">' +
            parts[1] + card2Insert + '<div className="mt-8">' +
            parts[2] + card3Insert + '<div className="mt-8">' +
            parts.slice(3).join('<div className="mt-8">');
            
  fs.writeFileSync('app/page.tsx', content);
  console.log('Successfully injected mini UI mockups!');
} else {
  console.log('Error: Could not find the expected number of mt-8 blocks.');
}
