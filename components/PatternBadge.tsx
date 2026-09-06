import { Badge } from "@/components/ui/badge";
import {
  ArrowLeftRight,
  Brain,
  Calculator,
  Database,
  GitBranch,
  Layers,
  Link,
  RotateCcw,
  Search,
  TrendingUp,
  Zap,
} from "lucide-react";

type PatternBadgeProps = {
  pattern: string;
  className?: string;
};

export function PatternBadge({ pattern, className }: PatternBadgeProps) {
  const Icon = getPatternIcon(pattern);

  return (
    <Badge
      className={`inline-flex items-center gap-2 border border-border bg-muted px-3 py-1 font-mono text-xs text-foreground hover:bg-muted ${className ?? ""}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {pattern}
    </Badge>
  );
}

function getPatternIcon(pattern: string) {
  switch (pattern) {
    case "Sliding Window":
      return Layers;
    case "Two Pointers":
      return ArrowLeftRight;
    case "Dynamic Programming":
      return TrendingUp;
    case "BFS":
    case "DFS":
      return GitBranch;
    case "HashMap":
    case "HashSet":
      return Database;
    case "Binary Search":
      return Search;
    case "Union Find":
      return Link;
    case "Backtracking":
      return RotateCcw;
    case "Greedy":
      return Zap;
    case "Prefix Sum":
      return Calculator;
    default:
      return Brain;
  }
}
