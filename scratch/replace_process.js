const fs = require('fs');
let content = fs.readFileSync('app/page.tsx', 'utf8');

// We have 3 articles. Let's just find and replace the whole block of 3 articles.
const oldArticlesRegex = /<article className="rounded-lg border border-border bg-card p-6 transition hover:border-border\/80">[\s\S]*?<\/article>\s*<article className="rounded-lg border border-border bg-card p-6 transition hover:border-border\/80">[\s\S]*?<\/article>\s*<article className="rounded-lg border border-border bg-card p-6 transition hover:border-border\/80">[\s\S]*?<\/article>/;

const newArticles = `
              <article className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all duration-500 hover:-translate-y-2 hover:border-amber-200 hover:shadow-[0_20px_40px_-15px_rgba(245,158,11,0.15)] dark:hover:border-amber-800">
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 dark:via-white/5 to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-[200%]" />
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-start justify-between">
                    <div className="inline-flex rounded-xl bg-muted p-3 transition-colors duration-500 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30">
                      <ClipboardPaste className="h-6 w-6 text-foreground transition-colors duration-500 group-hover:text-amber-600 dark:group-hover:text-amber-400" />
                    </div>
                    <p className="font-mono text-[40px] leading-none font-black text-muted-foreground/20 transition-all duration-500 group-hover:text-amber-500/80 group-hover:-translate-x-2">01</p>
                  </div>
                  <div className="mt-8">
                    <h3 className="font-mono text-lg font-bold text-foreground transition-colors duration-500 group-hover:text-amber-600 dark:group-hover:text-amber-400">Paste anything</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground transition-colors duration-500 group-hover:text-foreground/80">
                      Full LeetCode page, GFG problem, random question — paste it raw. We extract what matters.
                    </p>
                  </div>
                </div>
              </article>
              <article className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all duration-500 hover:-translate-y-2 hover:border-amber-200 hover:shadow-[0_20px_40px_-15px_rgba(245,158,11,0.15)] dark:hover:border-amber-800">
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 dark:via-white/5 to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-[200%] delay-75" />
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-start justify-between">
                    <div className="inline-flex rounded-xl bg-muted p-3 transition-colors duration-500 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30">
                      <Brain className="h-6 w-6 text-foreground transition-colors duration-500 group-hover:text-amber-600 dark:group-hover:text-amber-400" />
                    </div>
                    <p className="font-mono text-[40px] leading-none font-black text-muted-foreground/20 transition-all duration-500 group-hover:text-amber-500/80 group-hover:-translate-x-2">02</p>
                  </div>
                  <div className="mt-8">
                    <h3 className="font-mono text-lg font-bold text-foreground transition-colors duration-500 group-hover:text-amber-600 dark:group-hover:text-amber-400">Think, don't memorize</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground transition-colors duration-500 group-hover:text-foreground/80">
                      AI guides you to think — hints, Socratic questions, pattern reveal only when you're ready.
                    </p>
                  </div>
                </div>
              </article>
              <article className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all duration-500 hover:-translate-y-2 hover:border-amber-200 hover:shadow-[0_20px_40px_-15px_rgba(245,158,11,0.15)] dark:hover:border-amber-800">
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 dark:via-white/5 to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-[200%] delay-150" />
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-start justify-between">
                    <div className="inline-flex rounded-xl bg-muted p-3 transition-colors duration-500 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30">
                      <Target className="h-6 w-6 text-foreground transition-colors duration-500 group-hover:text-amber-600 dark:group-hover:text-amber-400" />
                    </div>
                    <p className="font-mono text-[40px] leading-none font-black text-muted-foreground/20 transition-all duration-500 group-hover:text-amber-500/80 group-hover:-translate-x-2">03</p>
                  </div>
                  <div className="mt-8">
                    <h3 className="font-mono text-lg font-bold text-foreground transition-colors duration-500 group-hover:text-amber-600 dark:group-hover:text-amber-400">Remember it</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground transition-colors duration-500 group-hover:text-foreground/80">
                      Memory hook, interview recognition tips, similar problems — everything to make it stick.
                    </p>
                  </div>
                </div>
              </article>
`.trim();

const newContent = content.replace(oldArticlesRegex, newArticles);
fs.writeFileSync('app/page.tsx', newContent);
console.log('Successfully upgraded the 3 process cards!');
