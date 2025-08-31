import { motion } from 'framer-motion';
import { Eye, Sparkles, Plus, FileCode, Code, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Message, useChatStore } from '@/store/chatStore';

interface AssistantActionsProps {
  message: Message;
}

const quickPrompts = [
  {
    text: "Refine this",
    icon: Sparkles,
    variant: "outline" as const,
  },
  {
    text: "Add columns",
    icon: Plus,
    variant: "outline" as const,
  },
  {
    text: "Generate schema JSON",
    icon: FileCode,
    variant: "outline" as const,
  },
  {
    text: "Show code sample",
    icon: Code,
    variant: "outline" as const,
  },
  {
    text: "Explain step-by-step",
    icon: HelpCircle,
    variant: "outline" as const,
  },
];

export function AssistantActions({ message }: AssistantActionsProps) {
  const { openPreview, sendMessage } = useChatStore();

  const handlePreview = () => {
    openPreview(message.content);
  };

  const handleQuickPrompt = (promptText: string) => {
    sendMessage(promptText);
  };

  return (
    <div className="space-y-3">
      {/* Show Preview Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Button
          onClick={handlePreview}
          variant="outline"
          size="sm"
          className="bg-background hover:bg-muted border-border text-foreground"
        >
          <Eye className="w-4 h-4 mr-2" />
          Show Preview
        </Button>
      </motion.div>

      {/* Quick Prompts */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap gap-2"
      >
        {quickPrompts.map((prompt, index) => {
          const IconComponent = prompt.icon;
          return (
            <motion.div
              key={prompt.text}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => handleQuickPrompt(prompt.text)}
                variant={prompt.variant}
                size="sm"
                className="h-8 text-xs bg-background hover:bg-muted border-border text-foreground hover:border-primary/20"
              >
                <IconComponent className="w-3 h-3 mr-1.5" />
                {prompt.text}
              </Button>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}