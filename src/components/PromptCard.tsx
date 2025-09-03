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
      className="cursor-pointer transition-all hover:shadow-md hover:border-brand-light bg-info-light border-border flex-shrink-0 w-[160px] h-[140px] sm:w-[160px] sm:h-[160px] lg:w-auto lg:h-auto lg:min-w-0"
      onClick={onClick}
    >
      <CardContent className="p-3 h-full">
        <div className="flex flex-col items-center justify-center text-center space-y-2 h-full">
          {Icon && (
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            </div>
          )}
          <p className="text-xs sm:text-sm text-brand leading-tight line-clamp-3">
            {title}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}