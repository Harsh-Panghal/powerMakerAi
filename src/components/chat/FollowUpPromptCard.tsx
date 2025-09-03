import { Card, CardContent } from "@/components/ui/card";

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
        <p className="text-sm text-foreground leading-snug line-clamp-2 group-hover:text-primary/90 transition-colors">
          {title}
        </p>
      </CardContent>
    </Card>
  );
}