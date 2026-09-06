import { useEffect, useMemo, useState } from "react";

const lines = [
  "> parsing problem statement...",
  "> extracting core logic...",
  "> detecting algorithm pattern...",
  "> generating visualization...",
  "> finding similar problems...",
  "> building memory hook...",
];

export function LoadingTerminal() {
  const [visibleCount, setVisibleCount] = useState(1);

  useEffect(() => {
    if (visibleCount >= lines.length) return;
    const timer = setTimeout(() => setVisibleCount((prev) => prev + 1), 700);
    return () => clearTimeout(timer);
  }, [visibleCount]);

  const shownLines = useMemo(() => lines.slice(0, visibleCount), [visibleCount]);
  const complete = visibleCount >= lines.length;

  return (
    <section className="rounded-lg border border-border bg-muted p-6 font-mono">
      <div className="space-y-2">
        {shownLines.map((line, index) => (
          <p key={line} className="text-[13px] text-foreground">
            {line}
            {index === shownLines.length - 1 && !complete && (
              <span className="ml-1 inline-block animate-pulse">▊</span>
            )}
          </p>
        ))}
        {complete && <p className="pt-1 text-[13px] text-muted-foreground">✓ analysis complete</p>}
      </div>
      <style jsx>{`
        .animate-pulse {
          animation: blink 1s step-end infinite;
        }
        @keyframes blink {
          50% {
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
}
