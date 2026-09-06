// Generate a professional algorithm visualization SVG
export function generateAlgorithmSVG(algorithmType: string): string {
  if (!algorithmType) return getDefaultViz();
  
  const normalized = algorithmType.toLowerCase().trim();

  const baseStyles = `<defs><style>.box{stroke:#333;stroke-width:2;rx:4}.val{font-family:monospace;font-size:14px;font-weight:bold;fill:#1a1814}.idx{font-family:monospace;font-size:11px;fill:#8b7d6b}.step-label{font-family:monospace;font-size:12px;fill:#fff;font-weight:bold}.title{font-family:monospace;font-size:16px;font-weight:bold;fill:#1a1814}.desc{font-family:monospace;font-size:12px;fill:#6b6560}.active{fill:#4a9eff}.inactive{fill:#e8d5c4}.pointer{stroke:#4a9eff;stroke-width:2;fill:none}</style><marker id="arrowblue" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><polygon points="0 0, 10 3, 0 6" fill="#4a9eff"/></marker></defs>`;

  const twoPointerViz = `<svg viewBox="0 0 900 500" xmlns="http://www.w3.org/2000/svg">${baseStyles}<text class="title" x="20" y="30">Two Pointers Algorithm</text><text class="desc" x="20" y="70">Array: [2, 7, 11, 15]</text><rect class="box active" x="20" y="85" width="45" height="45"/><text class="val" x="42.5" y="115" text-anchor="middle">2</text><text class="idx" x="42.5" y="135" text-anchor="middle">0</text><rect class="box inactive" x="80" y="85" width="45" height="45"/><text class="val" x="102.5" y="115" text-anchor="middle">7</text><text class="idx" x="102.5" y="135" text-anchor="middle">1</text><rect class="box inactive" x="140" y="85" width="45" height="45"/><text class="val" x="162.5" y="115" text-anchor="middle">11</text><text class="idx" x="162.5" y="135" text-anchor="middle">2</text><rect class="box active" x="200" y="85" width="45" height="45"/><text class="val" x="222.5" y="115" text-anchor="middle">15</text><text class="idx" x="222.5" y="135" text-anchor="middle">3</text><text class="desc" x="20" y="180">Step 1: Compare ends: 2 + 15 = 17</text><text class="desc" x="20" y="220">Step 2: Sum too high, move right pointer</text><text class="desc" x="20" y="260">Step 3: Compare: 2 + 11 = 13 (still high)</text><text class="desc" x="20" y="300">Step 4: Compare: 2 + 7 = 9 ✓ FOUND</text><rect class="box" x="20" y="340" width="180" height="50" fill="#4a9eff" rx="4"/><text class="step-label" x="110" y="370" text-anchor="middle">Return [0, 1]</text></svg>`;

  const hashMapViz = `<svg viewBox="0 0 900 500" xmlns="http://www.w3.org/2000/svg">${baseStyles}<text class="title" x="20" y="30">HashMap Algorithm</text><text class="desc" x="20" y="70">Array: [2, 7, 11, 15]</text><rect class="box active" x="20" y="85" width="45" height="45"/><text class="val" x="42.5" y="115" text-anchor="middle">2</text><text class="idx" x="42.5" y="135" text-anchor="middle">0</text><rect class="box inactive" x="80" y="85" width="45" height="45"/><text class="val" x="102.5" y="115" text-anchor="middle">7</text><text class="idx" x="102.5" y="135" text-anchor="middle">1</text><rect class="box inactive" x="140" y="85" width="45" height="45"/><text class="val" x="162.5" y="115" text-anchor="middle">11</text><text class="idx" x="162.5" y="135" text-anchor="middle">2</text><rect class="box inactive" x="200" y="85" width="45" height="45"/><text class="val" x="222.5" y="115" text-anchor="middle">15</text><text class="idx" x="222.5" y="135" text-anchor="middle">3</text><text class="desc" x="20" y="180">Step 1: Initialize empty Map {}</text><text class="desc" x="20" y="220">Step 2: Process 2, need=7 → Map{2:0}</text><text class="desc" x="20" y="260">Step 3: Process 7, need=2 → Found!</text><text class="desc" x="20" y="300">Step 4: Return indices [0, 1]</text><rect class="box" x="20" y="340" width="180" height="50" fill="#4a9eff" rx="4"/><text class="step-label" x="110" y="370" text-anchor="middle">Indices: [0, 1]</text></svg>`;

  const dpViz = `<svg viewBox="0 0 900 500" xmlns="http://www.w3.org/2000/svg">${baseStyles}<text class="title" x="20" y="30">Dynamic Programming Table</text><text class="desc" x="20" y="70">Building DP table for n=5:</text><rect class="box inactive" x="20" y="85" width="45" height="45"/><text class="val" x="42.5" y="115" text-anchor="middle">1</text><text class="idx" x="42.5" y="135" text-anchor="middle">0</text><rect class="box inactive" x="80" y="85" width="45" height="45"/><text class="val" x="102.5" y="115" text-anchor="middle">1</text><text class="idx" x="102.5" y="135" text-anchor="middle">1</text><rect class="box active" x="140" y="85" width="45" height="45"/><text class="val" x="162.5" y="115" text-anchor="middle">2</text><text class="idx" x="162.5" y="135" text-anchor="middle">2</text><rect class="box inactive" x="200" y="85" width="45" height="45"/><text class="val" x="222.5" y="115" text-anchor="middle">3</text><text class="idx" x="222.5" y="135" text-anchor="middle">3</text><rect class="box inactive" x="260" y="85" width="45" height="45"/><text class="val" x="282.5" y="115" text-anchor="middle">5</text><text class="idx" x="282.5" y="135" text-anchor="middle">4</text><text class="desc" x="20" y="180">Step 1: Base dp[0]=1, dp[1]=1</text><text class="desc" x="20" y="220">Step 2: dp[i] = dp[i-1] + dp[i-2]</text><text class="desc" x="20" y="260">Step 3: Fill table left to right</text><text class="desc" x="20" y="300">Step 4: Answer at dp[n-1]</text><rect class="box" x="20" y="340" width="180" height="50" fill="#4a9eff" rx="4"/><text class="step-label" x="110" y="370" text-anchor="middle">Result: 5</text></svg>`;

  const visualizations: Record<string, string> = {
    "two pointers": twoPointerViz,
    "two pointer": twoPointerViz,
    "hashmap": hashMapViz,
    "hash map": hashMapViz,
    "dynamic programming": dpViz,
    "bfs": getDefaultViz(),
    "dfs": getDefaultViz(),
  };

  // Check exact match first
  if (visualizations[normalized]) return visualizations[normalized];
  
  // Check if pattern contains key words
  for (const [key, viz] of Object.entries(visualizations)) {
    if (normalized.includes(key) || key.includes(normalized.split(" ")[0])) {
      return viz;
    }
  }

  return getDefaultViz();
}

function getDefaultViz(): string {
  return `<svg viewBox="0 0 900 500" xmlns="http://www.w3.org/2000/svg"><defs><style>.box{stroke:#333;stroke-width:2;rx:4}.val{font-family:monospace;font-size:14px;font-weight:bold;fill:#1a1814}.title{font-family:monospace;font-size:16px;font-weight:bold;fill:#1a1814}.desc{font-family:monospace;font-size:12px;fill:#6b6560}.active{fill:#4a9eff}.inactive{fill:#e8d5c4}</style></defs><text class="title" x="20" y="30">Algorithm Visualization</text><rect class="box inactive" x="20" y="80" width="45" height="45"/><text class="val" x="42.5" y="110" text-anchor="middle">1</text><rect class="box inactive" x="80" y="80" width="45" height="45"/><text class="val" x="102.5" y="110" text-anchor="middle">2</text><rect class="box active" x="140" y="80" width="45" height="45"/><text class="val" x="162.5" y="110" text-anchor="middle">3</text><rect class="box inactive" x="200" y="80" width="45" height="45"/><text class="val" x="222.5" y="110" text-anchor="middle">4</text><rect class="box inactive" x="260" y="80" width="45" height="45"/><text class="val" x="282.5" y="110" text-anchor="middle">5</text><text class="desc" x="20" y="170">Step 1: Initialize data structure</text><text class="desc" x="20" y="210">Step 2: Process first element</text><text class="desc" x="20" y="250">Step 3: Continue iteration</text><text class="desc" x="20" y="290">Step 4: Optimize and finalize</text><rect class="box" x="20" y="340" width="180" height="50" fill="#4a9eff" rx="4"/><text style="font-family:monospace;font-size:12px;fill:#fff;font-weight:bold" x="110" y="370" text-anchor="middle">Ready for input</text></svg>`;
}
