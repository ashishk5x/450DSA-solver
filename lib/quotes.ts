export const ALL_QUOTES = [
  { text: "Every problem is just a pattern you haven't seen yet.", author: "Unknown" },
  { text: "An hour of deliberate practice beats ten hours of passive reading.", author: "Anders Ericsson" },
  { text: "The only way to learn a new programming language is by writing programs in it.", author: "Dennis Ritchie" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { text: "Consistency is more important than intensity. Show up every day.", author: "Unknown" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Don't practice until you get it right. Practice until you can't get it wrong.", author: "Unknown" },
  { text: "Small progress is still progress. One problem a day changes everything.", author: "Unknown" },
  { text: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House" },
  { text: "The best time to start was yesterday. The second best time is now.", author: "Unknown" },
  { text: "Debugging is twice as hard as writing the code in the first place.", author: "Brian Kernighan" },
  { text: "Your only competition is who you were yesterday.", author: "Unknown" },
  { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
  { text: "Fall seven times, stand up eight. Keep solving.", author: "Japanese Proverb" },
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { text: "It's not about having time. It's about making time.", author: "Unknown" },
  { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
  { text: "The computer was born to solve problems that did not exist before.", author: "Bill Gates" },
  { text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", author: "Martin Fowler" },
  { text: "First, think. Then code.", author: "Unknown" },
  { text: "Programs must be written for people to read, and only incidentally for machines to execute.", author: "Harold Abelson" },
  { text: "The most disastrous thing that you can ever learn is your first programming language.", author: "Alan Kay" },
  { text: "One of the best programming skills you can have is knowing when to walk away for a while.", author: "Oscar Godson" },
  { text: "The best error message is the one that never shows up.", author: "Thomas Fuchs" },
  { text: "Weeks of coding can save you hours of planning.", author: "Unknown" },
  { text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
  { text: "Without requirements or design, programming is the art of adding bugs to an empty text file.", author: "Louis Srygley" },
  { text: "Before software can be reusable it first has to be usable.", author: "Ralph Johnson" },
  { text: "The function of good software is to make the complex appear to be simple.", author: "Grady Booch" },
  { text: "Measuring programming progress by lines of code is like measuring aircraft building progress by weight.", author: "Bill Gates" },
  { text: "Interviews don't measure ability. They measure preparation. So prepare.", author: "Unknown" },
  { text: "The difference between a good programmer and a great one is pattern recognition.", author: "Unknown" },
  { text: "LeetCode is a gym. Show up daily, even when you don't feel like it.", author: "Unknown" },
  { text: "If you can't explain it simply, you don't understand it well enough.", author: "Albert Einstein" },
  { text: "Every expert was once a beginner who refused to quit.", author: "Unknown" },
  { text: "Don't memorize solutions. Internalize patterns.", author: "Unknown" },
  { text: "The best investment you can make is in your own skills.", author: "Warren Buffett" },
  { text: "Code never lies, comments sometimes do.", author: "Ron Jeffries" },
  { text: "Slow is smooth, smooth is fast.", author: "Navy SEALs" },
  { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
]

export function getDailyQuotes() {
  const seed = new Date().toDateString()
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i)
    hash |= 0
  }
  const picked: typeof ALL_QUOTES = []
  const used = new Set<number>()
  let h = Math.abs(hash)
  while (picked.length < 4) {
    const idx = h % ALL_QUOTES.length
    if (!used.has(idx)) {
      used.add(idx)
      picked.push(ALL_QUOTES[idx])
    }
    h = Math.floor(h / 2) + 7
    if (h === 0) h = 13
  }
  return picked
}