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
      className="cursor-pointer transition-all hover:shadow-md hover:border-brand-light bg-info-light border-border flex-shrink-0 min-w-[280px] lg:min-w-0"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex flex-col items-center text-center space-y-3">
          {Icon && (
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Icon className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
          <p className="text-sm text-brand leading-relaxed">
            {title}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}