import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface PromptCardProps {
  title: string;
  icon?: LucideIcon;
  onClick?: () => void;
}

export function PromptCard({ title, icon: Icon, onClick }: PromptCardProps) {
  return (
    <Card 
      className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 bg-card border-border group"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {Icon && (
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-primary/15 transition-colors">
              <Icon className="w-4 h-4 text-primary" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground leading-relaxed line-clamp-3 group-hover:text-primary/90 transition-colors">
              {title}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}