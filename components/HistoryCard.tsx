import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

export interface SolveHistoryItem {
  id: string;
  created_at: string;
  problem_summary: string;
  pattern_name: string;
  difficulty: string;
}

interface HistoryCardProps {
  item: SolveHistoryItem;
  isBlurred?: boolean;
}

export function HistoryCard({ item, isBlurred = false }: HistoryCardProps) {
  const getDifficultyColor = (diff: string) => {
    switch (diff?.toLowerCase()) {
      case "easy":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "hard":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const cardContent = (
    <div className={`flex flex-col h-full justify-between p-5 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors ${isBlurred ? "filter blur-sm select-none" : ""}`}>
      <div>
        <div className="flex justify-between items-start mb-3">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none font-mono text-[10px]">
            {item.pattern_name || "Unknown Pattern"}
          </Badge>
          <Badge variant="outline" className={`font-mono text-[10px] ${getDifficultyColor(item.difficulty)}`}>
            {item.difficulty || "Unknown"}
          </Badge>
        </div>
        
        <h3 className="font-medium text-sm text-foreground line-clamp-3 mb-4 leading-relaxed">
          {item.problem_summary || "No summary available"}
        </h3>
      </div>
      
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
        <div className="flex items-center text-xs text-muted-foreground font-mono">
          <Clock className="w-3 h-3 mr-1.5" />
          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
        </div>
        
        {!isBlurred && (
          <div className="flex items-center text-xs text-primary font-medium group">
            View Details
            <ArrowRight className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform" />
          </div>
        )}
      </div>
    </div>
  );

  if (isBlurred) {
    return cardContent;
  }

  return (
    <Link href={`/history/${item.id}`} className="block h-full group outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-xl">
      {cardContent}
    </Link>
  );
}
