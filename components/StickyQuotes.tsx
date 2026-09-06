"use client";

import { getDailyQuotes } from "@/lib/quotes";

const STICKY_COLORS = [
  { bg: "#fef9c3", text: "#713f12", pin: "#ca8a04" },
  { bg: "#dcfce7", text: "#14532d", pin: "#16a34a" },
  { bg: "#dbeafe", text: "#1e3a5f", pin: "#2563eb" },
  { bg: "#fce7f3", text: "#831843", pin: "#db2777" },
];

const ROTATIONS = [-2.5, 1.8, -1.2, 2.8];

export default function StickyQuotes() {
  const quotes = getDailyQuotes();

  return (
    <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-8 px-4">
      {quotes.map((quote, i) => (
        <div
          key={i}
          style={{
            backgroundColor: STICKY_COLORS[i].bg,
            color: STICKY_COLORS[i].text,
            transform: `rotate(${ROTATIONS[i]}deg)`,
            boxShadow: "3px 3px 0px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)",
          }}
          className="w-56 cursor-default rounded-sm p-5 transition-all duration-200 hover:rotate-0 hover:scale-105"
        >
          <div
            className="mx-auto -mt-1 mb-4 h-2.5 w-2.5 rounded-full opacity-70"
            style={{ backgroundColor: STICKY_COLORS[i].pin }}
          />

          <div
            className="mb-2 font-serif text-3xl leading-none opacity-20"
            style={{ color: STICKY_COLORS[i].text }}
          >
            &quot;
          </div>

          <p
            className="mb-4 text-sm font-medium leading-relaxed"
            style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "12.5px" }}
          >
            {quote.text}
          </p>

          <div
            className="mt-2 border-t pt-2 text-right text-xs opacity-50"
            style={{ borderColor: `${STICKY_COLORS[i].text}30` }}
          >
            - {quote.author}
          </div>
        </div>
      ))}
    </div>
  );
}
