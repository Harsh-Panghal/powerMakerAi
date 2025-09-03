import { Card, CardContent } from "@/components/ui/card";
import { Send } from "lucide-react";

interface FollowUpPromptCardProps {
  title: string;
  onClick?: () => void;
}

export function FollowUpPromptCard({ title, onClick }: FollowUpPromptCardProps) {
  return (
    <Card 
      className="cursor-pointer transition-all duration-200 hover:shadow-md hover:shadow-primary/5 hover:border-primary/20 bg-card border-border group"
      onClick={onClick}
    >
      <CardContent className="px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-foreground leading-snug line-clamp-2 group-hover:text-primary/90 transition-colors flex-1">
            {title}
          </p>
          <Send className="w-4 h-4 text-muted-foreground group-hover:text-primary/70 transition-colors flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}