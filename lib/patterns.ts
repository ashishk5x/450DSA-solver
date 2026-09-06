export type Pattern = {
  slug: string
  name: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  category: string
  description: string
  whenToUse: string
  keySignals: string[]
  howToThink: string[]
  commonMistakes: string[]
  practiceProblems: { name: string; platform: string; difficulty: string }[]
}

export const ALL_PATTERN_NAMES = [
  "Two Pointers",
  "Sliding Window",
  "Binary Search",
  "Hash Map",
  "Prefix Sum",
  "Kadane's Algorithm",
  "Stack",
  "Monotonic Stack",
  "Queue / Deque",
  "Linked List",
  "Tree DFS",
  "Tree BFS",
  "Graph BFS",
  "Graph DFS",
  "Dynamic Programming",
  "Greedy",
  "Backtracking",
  "Intervals",
  "Matrix Traversal",
  "Divide and Conquer",
  "Heap / Priority Queue",
  "Union-Find",
  "Topological Sort",
  "Trie",
  "Bit Manipulation",
]

export const PATTERNS: Pattern[] = [
  {
    slug: "two-pointers",
    name: "Two Pointers",
    difficulty: "Beginner",
    category: "Array",
    description:
      "Use two indices that move toward each other or in the same direction to find pairs, subarrays, or partitions in sorted or linear data structures.",
    whenToUse:
      "When you need to find pairs in a sorted array, remove duplicates in-place, partition data, or compare elements from both ends.",
    keySignals: [
      "\"sorted array\"",
      "\"find a pair that sums to\"",
      "\"remove duplicates\"",
      "\"in-place\"",
      "\"two elements\"",
      "\"container with most water\"",
    ],
    howToThink: [
      "Ask: Is the input sorted, or can I sort it without losing information?",
      "Place one pointer at the start, one at the end (or two at the start for same-direction).",
      "Define what makes you move left pointer right vs right pointer left.",
      "Each step eliminates possibilities — that's why it's O(n) instead of O(n²).",
    ],
    commonMistakes: [
      "Forgetting to handle duplicate values when skipping",
      "Not considering that the array must be sorted for opposite-direction pointers",
      "Off-by-one errors at boundaries",
    ],
    practiceProblems: [
      { name: "Two Sum II (Sorted)", platform: "LeetCode #167", difficulty: "Medium" },
      { name: "3Sum", platform: "LeetCode #15", difficulty: "Medium" },
      { name: "Container With Most Water", platform: "LeetCode #11", difficulty: "Medium" },
      { name: "Remove Duplicates from Sorted Array", platform: "LeetCode #26", difficulty: "Easy" },
    ],
  },
  {
    slug: "sliding-window",
    name: "Sliding Window",
    difficulty: "Beginner",
    category: "Array",
    description:
      "Maintain a window (subarray/substring) that slides across the data. Expand the right boundary to add elements, shrink the left boundary to remove — tracking a running condition.",
    whenToUse:
      "When the problem asks about contiguous subarrays or substrings with a constraint (max sum, at most k distinct, longest without repeating).",
    keySignals: [
      "\"contiguous subarray\"",
      "\"substring\"",
      "\"window\"",
      "\"maximum/minimum sum of k\"",
      "\"at most k distinct\"",
      "\"longest\"",
    ],
    howToThink: [
      "What is your window tracking? (sum, count, set of chars, frequency map)",
      "When do you expand the window? (usually always, by moving right pointer)",
      "When do you shrink it? (when constraint is violated)",
      "What do you record at each valid state? (max length, min length, count)",
    ],
    commonMistakes: [
      "Not knowing when to use fixed-size vs variable-size window",
      "Forgetting to update the window state when shrinking",
      "Off-by-one error in window size calculation (right - left + 1)",
    ],
    practiceProblems: [
      { name: "Maximum Sum Subarray of Size K", platform: "GFG", difficulty: "Easy" },
      { name: "Longest Substring Without Repeating", platform: "LeetCode #3", difficulty: "Medium" },
      { name: "Minimum Window Substring", platform: "LeetCode #76", difficulty: "Hard" },
      { name: "Fruit Into Baskets", platform: "LeetCode #904", difficulty: "Medium" },
    ],
  },
  {
    slug: "binary-search",
    name: "Binary Search",
    difficulty: "Beginner",
    category: "Search",
    description:
      "Divide the search space in half each step. Works on sorted data or any space where you can determine which half contains the answer.",
    whenToUse:
      "When searching in sorted data, finding boundaries (first/last occurrence), or optimizing over a monotonic function (binary search on answer).",
    keySignals: [
      "\"sorted array\"",
      "\"find the position\"",
      "\"first/last occurrence\"",
      "\"minimum maximum\"",
      "\"search in rotated\"",
      "\"kth smallest\"",
    ],
    howToThink: [
      "Define your search space: what are low and high?",
      "What does mid represent? An index? A candidate answer?",
      "Based on the condition at mid, which half do you eliminate?",
      "What's your termination condition? Where is the answer when low meets high?",
    ],
    commonMistakes: [
      "Wrong mid calculation causing infinite loop (use low + (high - low) / 2)",
      "Not handling the boundary correctly — should you include mid or exclude it?",
      "Applying binary search when the space isn't monotonic",
    ],
    practiceProblems: [
      { name: "Binary Search", platform: "LeetCode #704", difficulty: "Easy" },
      { name: "Find First and Last Position", platform: "LeetCode #34", difficulty: "Medium" },
      { name: "Search in Rotated Sorted Array", platform: "LeetCode #33", difficulty: "Medium" },
      { name: "Koko Eating Bananas", platform: "LeetCode #875", difficulty: "Medium" },
    ],
  },
  {
    slug: "hash-map",
    name: "Hash Map",
    difficulty: "Beginner",
    category: "Data Structure",
    description:
      "Use a hash map (dictionary) for O(1) lookups, counting frequencies, or mapping relationships between elements.",
    whenToUse:
      "When you need fast lookups, frequency counting, grouping by some key, or checking if you've seen something before.",
    keySignals: [
      "\"find if exists\"",
      "\"count occurrences\"",
      "\"two sum\"",
      "\"group anagrams\"",
      "\"frequency\"",
      "\"complement\"",
    ],
    howToThink: [
      "What are you storing as key? What as value?",
      "Are you counting frequencies? Use key=element, value=count.",
      "Are you looking for complements? Store what you've seen so far.",
      "Could a hash set (just keys) be enough instead of a full map?",
    ],
    commonMistakes: [
      "Using O(n) search inside a loop when a hashmap would make it O(1)",
      "Not considering hash collisions in theory (rare in practice)",
      "Forgetting that hash maps use extra O(n) space",
    ],
    practiceProblems: [
      { name: "Two Sum", platform: "LeetCode #1", difficulty: "Easy" },
      { name: "Group Anagrams", platform: "LeetCode #49", difficulty: "Medium" },
      { name: "Top K Frequent Elements", platform: "LeetCode #347", difficulty: "Medium" },
      { name: "Longest Consecutive Sequence", platform: "LeetCode #128", difficulty: "Medium" },
    ],
  },
  {
    slug: "stack",
    name: "Stack",
    difficulty: "Beginner",
    category: "Data Structure",
    description:
      "LIFO structure. Push and pop from the top. Used whenever you need to track nested structures, undo operations, or match pairs.",
    whenToUse:
      "Matching parentheses, expression evaluation, undo/back operations, or any problem with nested/recursive structure.",
    keySignals: [
      "\"valid parentheses\"",
      "\"matching brackets\"",
      "\"expression evaluation\"",
      "\"nested\"",
      "\"most recent\"",
      "\"undo\"",
    ],
    howToThink: [
      "What am I pushing? When am I popping?",
      "Is the stack tracking open brackets, indices, or values?",
      "When something new comes in, should I pop everything violating a condition?",
      "What's left in the stack at the end? That often holds the answer.",
    ],
    commonMistakes: [
      "Popping from an empty stack — always check isEmpty first",
      "Pushing the wrong thing (push index when you need position, not value)",
      "Not processing remaining items in the stack after the loop",
    ],
    practiceProblems: [
      { name: "Valid Parentheses", platform: "LeetCode #20", difficulty: "Easy" },
      { name: "Daily Temperatures", platform: "LeetCode #739", difficulty: "Medium" },
      { name: "Evaluate Reverse Polish Notation", platform: "LeetCode #150", difficulty: "Medium" },
      { name: "Decode String", platform: "LeetCode #394", difficulty: "Medium" },
    ],
  },
  {
    slug: "monotonic-stack",
    name: "Monotonic Stack",
    difficulty: "Intermediate",
    category: "Data Structure",
    description:
      "A stack that maintains elements in increasing or decreasing order. Elements that violate the order are popped before the new element is pushed.",
    whenToUse:
      "Finding the next/previous greater or smaller element, stock span problems, largest rectangle in histogram.",
    keySignals: [
      "\"next greater element\"",
      "\"previous smaller\"",
      "\"stock span\"",
      "\"largest rectangle\"",
      "\"trapping rain water\"",
    ],
    howToThink: [
      "Should the stack be increasing or decreasing from bottom to top?",
      "When I pop, what information am I computing? (distance, area, span)",
      "Am I storing indices or values? (Usually indices, since you can always get values from indices)",
      "What happens at the end when items remain in the stack?",
    ],
    commonMistakes: [
      "Choosing the wrong monotonic order (increasing vs decreasing)",
      "Not using indices — you almost always need indices, not values",
      "Forgetting to process remaining elements after the main loop",
    ],
    practiceProblems: [
      { name: "Next Greater Element I", platform: "LeetCode #496", difficulty: "Easy" },
      { name: "Daily Temperatures", platform: "LeetCode #739", difficulty: "Medium" },
      { name: "Largest Rectangle in Histogram", platform: "LeetCode #84", difficulty: "Hard" },
      { name: "Trapping Rain Water", platform: "LeetCode #42", difficulty: "Hard" },
    ],
  },
  {
    slug: "linked-list",
    name: "Linked List",
    difficulty: "Beginner",
    category: "Data Structure",
    description:
      "Sequential nodes connected by pointers. Commonly uses slow/fast pointer technique for cycle detection, finding middle, and merging.",
    whenToUse:
      "Cycle detection, finding midpoint, reversing, merging sorted lists, or any problem explicitly using linked list nodes.",
    keySignals: [
      "\"linked list\"",
      "\"ListNode\"",
      "\"cycle\"",
      "\"reverse\"",
      "\"merge two sorted\"",
      "\"remove nth from end\"",
    ],
    howToThink: [
      "Do I need a dummy head node to simplify edge cases?",
      "Am I modifying pointers (reverse, merge) or just traversing (find middle, detect cycle)?",
      "Slow/fast pointer: slow moves 1 step, fast moves 2 — they meet if there's a cycle.",
      "Draw it out. Pointer manipulation is visual — sketching saves debugging time.",
    ],
    commonMistakes: [
      "Losing reference to the head — save it before modifying",
      "Not handling edge cases: empty list, single node",
      "Creating cycles accidentally when rearranging pointers",
    ],
    practiceProblems: [
      { name: "Reverse Linked List", platform: "LeetCode #206", difficulty: "Easy" },
      { name: "Linked List Cycle", platform: "LeetCode #141", difficulty: "Easy" },
      { name: "Merge Two Sorted Lists", platform: "LeetCode #21", difficulty: "Easy" },
      { name: "Remove Nth Node From End", platform: "LeetCode #19", difficulty: "Medium" },
    ],
  },
  {
    slug: "tree-dfs",
    name: "Tree DFS",
    difficulty: "Intermediate",
    category: "Tree",
    description:
      "Explore tree depth-first using recursion or an explicit stack. Includes preorder, inorder, and postorder traversals.",
    whenToUse:
      "When you need to explore all paths, compute heights, check subtree properties, or process nodes in a specific order.",
    keySignals: [
      "\"binary tree\"",
      "\"path sum\"",
      "\"max depth\"",
      "\"validate BST\"",
      "\"lowest common ancestor\"",
      "\"subtree\"",
    ],
    howToThink: [
      "What information does a node need from its children? (height, sum, validity)",
      "Should I process the node before children (preorder), between (inorder), or after (postorder)?",
      "What's my base case? Usually: if node is null, return default value.",
      "Am I building the answer top-down (passing info to children) or bottom-up (returning info from children)?",
    ],
    commonMistakes: [
      "Not returning a value from the recursive call",
      "Confusing preorder, inorder, and postorder — know which one you need",
      "Not handling the null/leaf base case correctly",
    ],
    practiceProblems: [
      { name: "Maximum Depth of Binary Tree", platform: "LeetCode #104", difficulty: "Easy" },
      { name: "Path Sum", platform: "LeetCode #112", difficulty: "Easy" },
      { name: "Validate Binary Search Tree", platform: "LeetCode #98", difficulty: "Medium" },
      { name: "Lowest Common Ancestor", platform: "LeetCode #236", difficulty: "Medium" },
    ],
  },
  {
    slug: "tree-bfs",
    name: "Tree BFS",
    difficulty: "Intermediate",
    category: "Tree",
    description:
      "Level-by-level traversal using a queue. Process all nodes at one depth before moving to the next.",
    whenToUse:
      "Level order traversal, finding minimum depth, right-side view, or any problem requiring level-by-level processing.",
    keySignals: [
      "\"level order\"",
      "\"minimum depth\"",
      "\"right side view\"",
      "\"zigzag\"",
      "\"connect next pointers\"",
      "\"average of levels\"",
    ],
    howToThink: [
      "Use a queue. Start by enqueuing the root.",
      "At each level, record the queue size — that's how many nodes are at this level.",
      "Process exactly that many nodes, enqueuing their children.",
      "After the inner loop, you've completed one level.",
    ],
    commonMistakes: [
      "Not capturing queue size at the start of each level — the queue changes during processing",
      "Forgetting to check for null children before enqueuing",
      "Using DFS when BFS is more natural (and vice versa)",
    ],
    practiceProblems: [
      { name: "Level Order Traversal", platform: "LeetCode #102", difficulty: "Medium" },
      { name: "Minimum Depth of Binary Tree", platform: "LeetCode #111", difficulty: "Easy" },
      { name: "Right Side View", platform: "LeetCode #199", difficulty: "Medium" },
      { name: "Zigzag Level Order", platform: "LeetCode #103", difficulty: "Medium" },
    ],
  },
  {
    slug: "graph-bfs",
    name: "Graph BFS",
    difficulty: "Intermediate",
    category: "Graph",
    description:
      "Explore graph level-by-level from a source. Guarantees shortest path in unweighted graphs. Uses a queue and visited set.",
    whenToUse:
      "Shortest path in unweighted graph, level-by-level exploration, connected components, or multi-source BFS.",
    keySignals: [
      "\"shortest path\"",
      "\"minimum steps\"",
      "\"nearest\"",
      "\"grid\"",
      "\"rotten oranges\"",
      "\"word ladder\"",
    ],
    howToThink: [
      "Build the adjacency list or identify neighbors (for grids: up/down/left/right).",
      "Use a queue + visited set. Enqueue the start node(s).",
      "Process level by level — each level is one \"step\" or \"distance\".",
      "For multi-source BFS, enqueue ALL start nodes at once.",
    ],
    commonMistakes: [
      "Forgetting the visited set — infinite loop on cycles",
      "Marking visited when popping instead of when enqueuing (causes duplicates)",
      "Not building the graph correctly from edge list input",
    ],
    practiceProblems: [
      { name: "Number of Islands", platform: "LeetCode #200", difficulty: "Medium" },
      { name: "Rotting Oranges", platform: "LeetCode #994", difficulty: "Medium" },
      { name: "Word Ladder", platform: "LeetCode #127", difficulty: "Hard" },
      { name: "01 Matrix", platform: "LeetCode #542", difficulty: "Medium" },
    ],
  },
  {
    slug: "graph-dfs",
    name: "Graph DFS",
    difficulty: "Intermediate",
    category: "Graph",
    description:
      "Explore as deep as possible along each branch before backtracking. Uses recursion or explicit stack with a visited set.",
    whenToUse:
      "Detecting cycles, finding connected components, path existence, flood fill, or problems requiring full exploration.",
    keySignals: [
      "\"connected components\"",
      "\"cycle detection\"",
      "\"path exists\"",
      "\"flood fill\"",
      "\"island perimeter\"",
      "\"all paths\"",
    ],
    howToThink: [
      "Build the graph (adjacency list) and maintain a visited set.",
      "For each unvisited node, start a DFS — each call explores one connected component.",
      "Mark as visited BEFORE recursing into neighbors.",
      "For cycle detection: use a \"currently visiting\" state (in recursion stack) vs \"fully visited\".",
    ],
    commonMistakes: [
      "Forgetting to mark nodes as visited before recursive calls",
      "Using BFS when DFS is needed (e.g., cycle detection in directed graphs)",
      "Stack overflow on very deep graphs — consider iterative DFS",
    ],
    practiceProblems: [
      { name: "Number of Islands", platform: "LeetCode #200", difficulty: "Medium" },
      { name: "Clone Graph", platform: "LeetCode #133", difficulty: "Medium" },
      { name: "Course Schedule", platform: "LeetCode #207", difficulty: "Medium" },
      { name: "Pacific Atlantic Water Flow", platform: "LeetCode #417", difficulty: "Medium" },
    ],
  },
  {
    slug: "dynamic-programming",
    name: "Dynamic Programming",
    difficulty: "Advanced",
    category: "Optimization",
    description:
      "Break a problem into overlapping subproblems. Solve each subproblem once and store the result — build up to the final answer.",
    whenToUse:
      "When the problem has optimal substructure (optimal solution uses optimal solutions to subproblems) and overlapping subproblems.",
    keySignals: [
      "\"minimum cost\"",
      "\"maximum profit\"",
      "\"number of ways\"",
      "\"can you reach\"",
      "\"longest subsequence\"",
      "\"knapsack\"",
    ],
    howToThink: [
      "Define the state: dp[i] means what? (min cost to reach i, number of ways to make sum i, etc.)",
      "Find the recurrence: how does dp[i] depend on smaller subproblems?",
      "Identify the base case(s): dp[0] = ?",
      "Decide direction: top-down (memoization) or bottom-up (tabulation)?",
    ],
    commonMistakes: [
      "Wrong state definition — if your recurrence doesn't work, your state is probably wrong",
      "Not enough dimensions in state (sometimes dp[i][j] is needed, not just dp[i])",
      "Off-by-one errors in loop bounds and base cases",
    ],
    practiceProblems: [
      { name: "Climbing Stairs", platform: "LeetCode #70", difficulty: "Easy" },
      { name: "House Robber", platform: "LeetCode #198", difficulty: "Medium" },
      { name: "Longest Common Subsequence", platform: "LeetCode #1143", difficulty: "Medium" },
      { name: "Coin Change", platform: "LeetCode #322", difficulty: "Medium" },
    ],
  },
  {
    slug: "greedy",
    name: "Greedy",
    difficulty: "Intermediate",
    category: "Optimization",
    description:
      "Make the locally optimal choice at each step. Works when local optimality leads to global optimality — no backtracking needed.",
    whenToUse:
      "Interval scheduling, activity selection, when choosing the best option now doesn't prevent future optimal choices.",
    keySignals: [
      "\"minimum number of\"",
      "\"maximum number of\"",
      "\"intervals\"",
      "\"schedule\"",
      "\"jump game\"",
      "\"assign cookies\"",
    ],
    howToThink: [
      "What's the greedy choice? (smallest, largest, earliest deadline, etc.)",
      "Does making this choice now hurt future choices? If not, greedy works.",
      "Can you prove it? Try to find a counterexample. If you can't, trust your greedy intuition.",
      "Often requires sorting first — by end time, deadline, or ratio.",
    ],
    commonMistakes: [
      "Applying greedy when DP is needed — always verify greedy works for the specific problem",
      "Not sorting correctly — wrong sort order ruins the entire algorithm",
      "Not considering edge cases with ties",
    ],
    practiceProblems: [
      { name: "Jump Game", platform: "LeetCode #55", difficulty: "Medium" },
      { name: "Non-overlapping Intervals", platform: "LeetCode #435", difficulty: "Medium" },
      { name: "Assign Cookies", platform: "LeetCode #455", difficulty: "Easy" },
      { name: "Gas Station", platform: "LeetCode #134", difficulty: "Medium" },
    ],
  },
  {
    slug: "backtracking",
    name: "Backtracking",
    difficulty: "Advanced",
    category: "Exhaustive Search",
    description:
      "Build candidates incrementally and abandon (backtrack) as soon as you determine a candidate cannot lead to a valid solution. Systematic way to try all possibilities.",
    whenToUse:
      "Generating permutations, combinations, subsets, solving constraint-satisfaction problems like N-Queens or Sudoku.",
    keySignals: [
      "\"all permutations\"",
      "\"all combinations\"",
      "\"generate all\"",
      "\"subsets\"",
      "\"N-Queens\"",
      "\"Sudoku\"",
    ],
    howToThink: [
      "What choices do I make at each step? (which element to include, which cell to fill)",
      "When do I backtrack? (constraint violated, or all options at this level explored)",
      "Am I avoiding duplicates? (sort + skip if same as previous, or use a visited set)",
      "Draw the decision tree — each branch is a choice, each leaf is a complete candidate.",
    ],
    commonMistakes: [
      "Not undoing the choice before trying the next option (forgetting to backtrack)",
      "Generating duplicates — not handling repeated elements correctly",
      "Exponential time but not pruning early — always add constraints to prune branches",
    ],
    practiceProblems: [
      { name: "Subsets", platform: "LeetCode #78", difficulty: "Medium" },
      { name: "Permutations", platform: "LeetCode #46", difficulty: "Medium" },
      { name: "Combination Sum", platform: "LeetCode #39", difficulty: "Medium" },
      { name: "N-Queens", platform: "LeetCode #51", difficulty: "Hard" },
    ],
  },
  {
    slug: "heap",
    name: "Heap / Priority Queue",
    difficulty: "Intermediate",
    category: "Data Structure",
    description:
      "A data structure that efficiently supports insert and extract-min/max operations. Always gives you the smallest or largest element in O(log n).",
    whenToUse:
      "Finding kth largest/smallest, merging k sorted lists, scheduling with priorities, or anytime you repeatedly need the min/max.",
    keySignals: [
      "\"kth largest\"",
      "\"kth smallest\"",
      "\"merge k sorted\"",
      "\"top k\"",
      "\"median from stream\"",
      "\"priority\"",
    ],
    howToThink: [
      "Do I need the smallest (min-heap) or largest (max-heap)?",
      "What do I store in the heap? (value, tuple of (value, index), etc.)",
      "Am I keeping the heap size fixed (k elements) or variable?",
      "For kth largest: use a min-heap of size k. The top is your answer.",
    ],
    commonMistakes: [
      "Using the wrong heap type (min vs max)",
      "Not understanding that most languages default to min-heap",
      "Building a heap from scratch instead of using the built-in",
    ],
    practiceProblems: [
      { name: "Kth Largest Element", platform: "LeetCode #215", difficulty: "Medium" },
      { name: "Merge K Sorted Lists", platform: "LeetCode #23", difficulty: "Hard" },
      { name: "Top K Frequent Elements", platform: "LeetCode #347", difficulty: "Medium" },
      { name: "Find Median from Data Stream", platform: "LeetCode #295", difficulty: "Hard" },
    ],
  },
  {
    slug: "union-find",
    name: "Union-Find",
    difficulty: "Advanced",
    category: "Graph",
    description:
      "Tracks a set of elements partitioned into disjoint subsets. Supports two operations: union (merge two sets) and find (determine which set an element belongs to).",
    whenToUse:
      "Detecting connected components dynamically, cycle detection in undirected graphs, grouping equivalent elements.",
    keySignals: [
      "\"connected components\"",
      "\"union\"",
      "\"group\"",
      "\"equivalent\"",
      "\"redundant connection\"",
      "\"accounts merge\"",
    ],
    howToThink: [
      "Initialize each element as its own parent (self-loop).",
      "Find: follow parent pointers to root. Use path compression.",
      "Union: connect the root of one set to the root of another. Use rank/size.",
      "After all unions, elements with the same root are in the same group.",
    ],
    commonMistakes: [
      "Not using path compression — makes find O(n) instead of near O(1)",
      "Not using union by rank/size — tree becomes skewed",
      "Using union-find when BFS/DFS would be simpler",
    ],
    practiceProblems: [
      { name: "Number of Provinces", platform: "LeetCode #547", difficulty: "Medium" },
      { name: "Redundant Connection", platform: "LeetCode #684", difficulty: "Medium" },
      { name: "Accounts Merge", platform: "LeetCode #721", difficulty: "Medium" },
      { name: "Number of Connected Components", platform: "LeetCode #323", difficulty: "Medium" },
    ],
  },
  {
    slug: "topological-sort",
    name: "Topological Sort",
    difficulty: "Advanced",
    category: "Graph",
    description:
      "Linear ordering of vertices in a directed acyclic graph (DAG) such that every edge u→v means u comes before v. Uses BFS (Kahn's) or DFS.",
    whenToUse:
      "Task scheduling with dependencies, course prerequisites, build order, or any problem with directed dependencies.",
    keySignals: [
      "\"prerequisites\"",
      "\"course schedule\"",
      "\"order of tasks\"",
      "\"dependency\"",
      "\"build order\"",
      "\"DAG\"",
    ],
    howToThink: [
      "Build the graph and compute in-degrees of all nodes.",
      "Start with all nodes that have in-degree 0 (no dependencies).",
      "Process them, reduce in-degree of neighbors. If a neighbor reaches 0, add it to queue.",
      "If you process all nodes, a valid order exists. If not, there's a cycle.",
    ],
    commonMistakes: [
      "Not detecting cycles — if processed count < total nodes, there's a cycle",
      "Wrong in-degree computation — count incoming edges, not outgoing",
      "Confusing directed vs undirected graph requirements",
    ],
    practiceProblems: [
      { name: "Course Schedule", platform: "LeetCode #207", difficulty: "Medium" },
      { name: "Course Schedule II", platform: "LeetCode #210", difficulty: "Medium" },
      { name: "Alien Dictionary", platform: "LeetCode #269", difficulty: "Hard" },
      { name: "Parallel Courses", platform: "LeetCode #1136", difficulty: "Medium" },
    ],
  },
  {
    slug: "trie",
    name: "Trie",
    difficulty: "Advanced",
    category: "Data Structure",
    description:
      "A tree-like data structure for storing strings, where each node represents a character. Enables fast prefix-based lookups and autocomplete.",
    whenToUse:
      "Prefix search, autocomplete, spell checking, word search, or when you need to efficiently search among a dictionary of words.",
    keySignals: [
      "\"prefix\"",
      "\"autocomplete\"",
      "\"word search\"",
      "\"dictionary\"",
      "\"starts with\"",
      "\"search word with wildcards\"",
    ],
    howToThink: [
      "Each node has up to 26 children (for lowercase English letters).",
      "Insert: walk the trie, creating nodes for characters that don't exist.",
      "Search: walk the trie — if you reach the end and isWord is true, the word exists.",
      "Prefix search: like search, but don't check isWord — reaching the end is enough.",
    ],
    commonMistakes: [
      "Forgetting the isWord/isEnd flag — needed to distinguish prefixes from complete words",
      "Not handling deletion correctly (mark isWord as false, but don't delete nodes)",
      "Using a Trie when a HashSet would be simpler and sufficient",
    ],
    practiceProblems: [
      { name: "Implement Trie", platform: "LeetCode #208", difficulty: "Medium" },
      { name: "Word Search II", platform: "LeetCode #212", difficulty: "Hard" },
      { name: "Design Add and Search Words", platform: "LeetCode #211", difficulty: "Medium" },
      { name: "Replace Words", platform: "LeetCode #648", difficulty: "Medium" },
    ],
  },
  {
    slug: "bit-manipulation",
    name: "Bit Manipulation",
    difficulty: "Intermediate",
    category: "Math",
    description:
      "Use bitwise operators (AND, OR, XOR, shift) to solve problems in O(1) space or optimize solutions that work on binary representations.",
    whenToUse:
      "Finding single/missing numbers, power of 2 checks, counting bits, or problems where the solution can be expressed in terms of individual bits.",
    keySignals: [
      "\"single number\"",
      "\"power of two\"",
      "\"binary representation\"",
      "\"XOR\"",
      "\"bit\"",
      "\"without using extra space\"",
    ],
    howToThink: [
      "XOR properties: a ^ a = 0, a ^ 0 = a. XOR of all elements cancels out duplicates.",
      "AND with (n-1) removes the lowest set bit: n & (n-1).",
      "Left shift (<<) is multiply by 2, right shift (>>) is divide by 2.",
      "Think of each bit position independently — can you solve for each bit and combine?",
    ],
    commonMistakes: [
      "Confusing bitwise AND (&) with logical AND (&&)",
      "Not considering negative numbers and sign bit",
      "Overcomplicating when a simpler math solution exists",
    ],
    practiceProblems: [
      { name: "Single Number", platform: "LeetCode #136", difficulty: "Easy" },
      { name: "Number of 1 Bits", platform: "LeetCode #191", difficulty: "Easy" },
      { name: "Counting Bits", platform: "LeetCode #338", difficulty: "Easy" },
      { name: "Missing Number", platform: "LeetCode #268", difficulty: "Easy" },
    ],
  },
  {
    slug: "queue-deque",
    name: "Queue / Deque",
    difficulty: "Beginner",
    category: "Data Structure",
    description:
      "FIFO structure (queue) or double-ended queue (deque). Queue for BFS and processing in order. Deque for sliding window maximum/minimum.",
    whenToUse:
      "BFS traversal, processing in order, sliding window maximum, or when you need efficient add/remove from both ends.",
    keySignals: [
      "\"BFS\"",
      "\"process in order\"",
      "\"sliding window maximum\"",
      "\"recent calls\"",
      "\"first in first out\"",
    ],
    howToThink: [
      "Queue: process the oldest item first. Used naturally with BFS.",
      "Deque: maintain a decreasing/increasing order for sliding window problems.",
      "For sliding window max: deque stores indices, front = current max, pop from back if new element is larger.",
      "Always think: am I processing in order (queue) or maintaining an order (deque)?",
    ],
    commonMistakes: [
      "Using a regular queue for sliding window problems (need deque for O(1) from both ends)",
      "Not removing expired elements from the front of deque (check if front index is outside window)",
      "Confusing when to use a stack vs queue vs deque",
    ],
    practiceProblems: [
      { name: "Sliding Window Maximum", platform: "LeetCode #239", difficulty: "Hard" },
      { name: "Number of Recent Calls", platform: "LeetCode #933", difficulty: "Easy" },
      { name: "Design Circular Queue", platform: "LeetCode #622", difficulty: "Medium" },
      { name: "Moving Average from Data Stream", platform: "LeetCode #346", difficulty: "Easy" },
    ],
  },
  {
    slug: "prefix-sum",
    name: "Prefix Sum",
    difficulty: "Beginner",
    category: "Array",
    description:
      "Precompute cumulative sums so that any subarray sum can be calculated in O(1). Transform range-sum queries from O(n) to O(1).",
    whenToUse:
      "When you need to compute sums of subarrays/ranges repeatedly, count subarrays with a given sum, or handle range update queries.",
    keySignals: [
      "\"subarray sum equals k\"",
      "\"range sum query\"",
      "\"cumulative sum\"",
      "\"sum between indices\"",
      "\"contiguous subarray sum\"",
      "\"number of subarrays\"",
    ],
    howToThink: [
      "Build prefix array: prefix[i] = sum of elements from index 0 to i.",
      "Sum of subarray [l, r] = prefix[r] - prefix[l-1].",
      "For 'count subarrays with sum k': use a hash map of prefix sums seen so far.",
      "If prefix[j] - prefix[i] = k, then subarray (i, j] has sum k.",
    ],
    commonMistakes: [
      "Off-by-one: prefix[0] should be 0, representing an empty prefix",
      "Not using a hash map when counting — brute force is O(n²), prefix sum + map is O(n)",
      "Forgetting to initialize the map with {0: 1} to handle subarrays starting from index 0",
    ],
    practiceProblems: [
      { name: "Subarray Sum Equals K", platform: "LeetCode #560", difficulty: "Medium" },
      { name: "Range Sum Query - Immutable", platform: "LeetCode #303", difficulty: "Easy" },
      { name: "Contiguous Array", platform: "LeetCode #525", difficulty: "Medium" },
      { name: "Product of Array Except Self", platform: "LeetCode #238", difficulty: "Medium" },
    ],
  },
  {
    slug: "intervals",
    name: "Intervals",
    difficulty: "Intermediate",
    category: "Array",
    description:
      "Problems involving ranges [start, end]. Core operations: sorting by start/end, merging overlapping intervals, detecting conflicts, and inserting new intervals.",
    whenToUse:
      "Meeting room scheduling, merging overlapping ranges, inserting intervals, finding gaps, or detecting conflicts between time ranges.",
    keySignals: [
      "\"merge intervals\"",
      "\"meeting rooms\"",
      "\"overlapping\"",
      "\"insert interval\"",
      "\"non-overlapping\"",
      "\"schedule\"",
    ],
    howToThink: [
      "Almost always sort by start time first.",
      "Two intervals overlap if: a.start < b.end AND b.start < a.end.",
      "When merging: compare current interval's start with previous interval's end.",
      "For meeting rooms: sort by start, use a min-heap tracking end times to find overlaps.",
    ],
    commonMistakes: [
      "Not sorting first — intervals must be sorted for merge/sweep algorithms",
      "Wrong overlap condition — be careful with inclusive vs exclusive boundaries",
      "Not handling edge cases: empty list, single interval, fully contained intervals",
    ],
    practiceProblems: [
      { name: "Merge Intervals", platform: "LeetCode #56", difficulty: "Medium" },
      { name: "Insert Interval", platform: "LeetCode #57", difficulty: "Medium" },
      { name: "Non-overlapping Intervals", platform: "LeetCode #435", difficulty: "Medium" },
      { name: "Meeting Rooms II", platform: "LeetCode #253", difficulty: "Medium" },
    ],
  },
  {
    slug: "matrix-traversal",
    name: "Matrix Traversal",
    difficulty: "Intermediate",
    category: "Array",
    description:
      "Navigate 2D grids — spiral order, diagonal traversal, rotation, searching in sorted matrices. Often combined with BFS/DFS for island-type problems.",
    whenToUse:
      "Grid-based problems: spiral traversal, matrix rotation, searching in row-column sorted matrices, or any problem operating on a 2D grid.",
    keySignals: [
      "\"matrix\"",
      "\"grid\"",
      "\"spiral order\"",
      "\"rotate image\"",
      "\"search 2D matrix\"",
      "\"diagonal\"",
    ],
    howToThink: [
      "Identify the traversal pattern: row-by-row, column-by-column, spiral, or diagonal.",
      "For spiral: maintain 4 boundaries (top, bottom, left, right) and shrink after each pass.",
      "For rotation: transpose + reverse, or use the 4-way swap formula.",
      "For search in sorted matrix: start from top-right corner — go left if too big, down if too small.",
    ],
    commonMistakes: [
      "Confusing rows and columns — matrix[row][col], not matrix[x][y]",
      "Not updating boundaries correctly in spiral traversal",
      "Forgetting visited tracking when combining with BFS/DFS on grids",
    ],
    practiceProblems: [
      { name: "Spiral Matrix", platform: "LeetCode #54", difficulty: "Medium" },
      { name: "Rotate Image", platform: "LeetCode #48", difficulty: "Medium" },
      { name: "Search a 2D Matrix", platform: "LeetCode #74", difficulty: "Medium" },
      { name: "Set Matrix Zeroes", platform: "LeetCode #73", difficulty: "Medium" },
    ],
  },
  {
    slug: "divide-and-conquer",
    name: "Divide and Conquer",
    difficulty: "Advanced",
    category: "Optimization",
    description:
      "Split the problem into smaller subproblems, solve each independently, then combine results. Unlike DP, subproblems don\u2019t overlap.",
    whenToUse:
      "Merge sort variants, finding kth element, closest pair of points, or any problem where splitting input in half leads to a solution.",
    keySignals: [
      "\"merge sort\"",
      "\"count inversions\"",
      "\"closest pair\"",
      "\"median of two sorted\"",
      "\"majority element\"",
      "\"quick select\"",
    ],
    howToThink: [
      "How do I split the problem? (usually in half — left and right)",
      "Can I solve each half independently?",
      "How do I combine the results from both halves?",
      "What\u2019s the base case? (usually array of size 0 or 1)",
    ],
    commonMistakes: [
      "Not identifying the correct merge/combine step — this is where the real work happens",
      "Using divide and conquer when a simpler O(n) scan would work",
      "Incorrect base case leading to infinite recursion",
    ],
    practiceProblems: [
      { name: "Merge Sort (Sort an Array)", platform: "LeetCode #912", difficulty: "Medium" },
      { name: "Count of Inversions", platform: "GFG", difficulty: "Medium" },
      { name: "Median of Two Sorted Arrays", platform: "LeetCode #4", difficulty: "Hard" },
      { name: "Majority Element", platform: "LeetCode #169", difficulty: "Easy" },
    ],
  },
  {
    slug: "kadanes-algorithm",
    name: "Kadane's Algorithm",
    difficulty: "Beginner",
    category: "Array",
    description:
      "Find the maximum (or minimum) sum contiguous subarray in O(n). Maintain a running sum — if it drops below zero, reset. Track the global maximum throughout.",
    whenToUse:
      "Maximum subarray sum, maximum product subarray, or any problem asking for the best contiguous subarray by some metric.",
    keySignals: [
      "\"maximum subarray\"",
      "\"largest sum contiguous\"",
      "\"maximum product\"",
      "\"best time to buy and sell stock\"",
      "\"contiguous subarray\"",
    ],
    howToThink: [
      "Maintain currentSum: add current element. If currentSum < 0, reset to 0.",
      "At each step, update globalMax = max(globalMax, currentSum).",
      "Why it works: any subarray with a negative prefix is suboptimal — drop it.",
      "For max product: track both maxProduct and minProduct (negatives can become max when multiplied).",
    ],
    commonMistakes: [
      "Not handling all-negative arrays — initialize globalMax to the first element, not 0",
      "Forgetting the product variant needs both min and max tracking",
      "Confusing this with prefix sum — Kadane\u2019s is a DP approach, not cumulative sums",
    ],
    practiceProblems: [
      { name: "Maximum Subarray", platform: "LeetCode #53", difficulty: "Medium" },
      { name: "Maximum Product Subarray", platform: "LeetCode #152", difficulty: "Medium" },
      { name: "Best Time to Buy and Sell Stock", platform: "LeetCode #121", difficulty: "Easy" },
      { name: "Maximum Sum Circular Subarray", platform: "LeetCode #918", difficulty: "Medium" },
    ],
  },
]
