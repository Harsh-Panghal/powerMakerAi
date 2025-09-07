import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  MessageSquare,
  Plug,
  Settings,
  Database,
  X,
  Trophy,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: "essential" | "recommended" | "advanced";
  actionText?: string;
  actionTarget?: string; // CSS selector or route
}

const checklistItems: ChecklistItem[] = [
  {
    id: "first-chat",
    title: "Send Your First Message",
    description: "Start a conversation with the AI assistant",
    icon: <MessageSquare className="h-5 w-5" />,
    category: "essential",
    actionText: "Start Chat",
    actionTarget: '[data-guide="new-chat-button"]',
  },
  {
    id: "try-model-selector",
    title: "Explore AI Models",
    description: "Try different AI models for various tasks",
    icon: <Database className="h-5 w-5" />,
    category: "essential",
    actionText: "Select Model",
    actionTarget: '[data-guide="model-selector"]',
  },
  {
    id: "check-notifications",
    title: "View System Activities",
    description: "Check notifications and plugin logs",
    icon: <Plug className="h-5 w-5" />,
    category: "recommended",
    actionText: "View Notifications",
    actionTarget: '[data-guide="notifications-bell"]',
  },
  {
    id: "explore-settings",
    title: "Configure Your Preferences",
    description: "Set up CRM connections and customize settings",
    icon: <Settings className="h-5 w-5" />,
    category: "recommended",
    actionText: "Open Settings",
    actionTarget: '[data-guide="settings-button"]',
  },
];

interface OnboardingChecklistProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingChecklist({ isOpen, onClose }: OnboardingChecklistProps) {
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [isMinimized, setIsMinimized] = useState(false);
  const isMobile = useIsMobile();

  // Load completion status from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('onboardingChecklistCompleted');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCompletedItems(new Set(parsed));
      } catch (e) {
        console.error('Failed to parse onboarding checklist data:', e);
      }
    }
  }, []);

  // Save completion status to localStorage
  useEffect(() => {
    localStorage.setItem('onboardingChecklistCompleted', JSON.stringify([...completedItems]));
  }, [completedItems]);

  // Auto-detect completions based on user actions
  useEffect(() => {
    const checkCompletion = () => {
      const newCompleted = new Set(completedItems);
      
      // Check for first chat (if there are any chats in history)
      const hasChats = localStorage.getItem('chatHistory');
      if (hasChats && !newCompleted.has('first-chat')) {
        newCompleted.add('first-chat');
      }

      // Save if changed
      if (newCompleted.size !== completedItems.size) {
        setCompletedItems(newCompleted);
      }
    };

    if (isOpen) {
      checkCompletion();
      const interval = setInterval(checkCompletion, 2000); // Check every 2 seconds
      return () => clearInterval(interval);
    }
  }, [isOpen, completedItems]);

  const handleItemClick = (item: ChecklistItem) => {
    if (item.actionTarget) {
      const element = document.querySelector(item.actionTarget);
      if (element) {
        (element as HTMLElement).click();
        // Mark as completed after click
        setTimeout(() => {
          setCompletedItems(prev => new Set([...prev, item.id]));
        }, 1000);
      }
    }
  };

  const handleItemComplete = (itemId: string) => {
    setCompletedItems(prev => new Set([...prev, itemId]));
  };

  const essentialItems = checklistItems.filter(item => item.category === "essential");
  const recommendedItems = checklistItems.filter(item => item.category === "recommended");
  
  const totalItems = checklistItems.length;
  const completedCount = completedItems.size;
  const progressPercentage = Math.round((completedCount / totalItems) * 100);

  const renderChecklistContent = () => {
    if (isMinimized) {
      return (
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Trophy className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Quick Setup</h4>
                <p className="text-sm text-muted-foreground">
                  {completedCount}/{totalItems} completed
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {progressPercentage}%
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(false)}
                className="h-8 w-8 p-0"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Progress value={progressPercentage} className="mt-2" />
        </div>
      );
    }

    return (
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex justify-center mb-3"
          >
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
          </motion.div>
          <h3 className="text-lg font-semibold mb-1">Quick Setup Guide</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Complete these steps to get the most out of PowerMaker AI
          </p>
          
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">
                {completedCount} of {totalItems} completed
              </span>
              <Badge variant="secondary">
                {progressPercentage}%
              </Badge>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>

        {/* Essential Items */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Essential Setup
          </h4>
          {essentialItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ChecklistItemCard
                item={item}
                isCompleted={completedItems.has(item.id)}
                onComplete={() => handleItemComplete(item.id)}
                onClick={() => handleItemClick(item)}
              />
            </motion.div>
          ))}
        </div>

        {/* Recommended Items */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Recommended
          </h4>
          {recommendedItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (essentialItems.length + index) * 0.1 }}
            >
              <ChecklistItemCard
                item={item}
                isCompleted={completedItems.has(item.id)}
                onComplete={() => handleItemComplete(item.id)}
                onClick={() => handleItemClick(item)}
              />
            </motion.div>
          ))}
        </div>

        {/* Completion Message */}
        {completedCount === totalItems && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
          >
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-1">
              All Set! 🎉
            </h4>
            <p className="text-sm text-green-700 dark:text-green-300">
              You've completed the setup. You're ready to explore PowerMaker AI!
            </p>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(true)}
          >
            Minimize
          </Button>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Reset guide and open it
                localStorage.removeItem('userGuideCompleted');
                localStorage.removeItem('userGuideCurrentStep');
                localStorage.removeItem('onboardingChecklistDismissed');
                window.location.reload(); // Reload to trigger guide
              }}
            >
              <HelpCircle className="h-4 w-4 mr-1" />
              Restart Guide
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="text-center pb-2">
            <DrawerTitle>Setup Guide</DrawerTitle>
          </DrawerHeader>
          {renderChecklistContent()}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Setup Guide</DialogTitle>
        </DialogHeader>
        {renderChecklistContent()}
      </DialogContent>
    </Dialog>
  );
}

interface ChecklistItemCardProps {
  item: ChecklistItem;
  isCompleted: boolean;
  onComplete: () => void;
  onClick: () => void;
}

function ChecklistItemCard({ item, isCompleted, onComplete, onClick }: ChecklistItemCardProps) {
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-sm ${
        isCompleted ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800' : ''
      }`}
      onClick={isCompleted ? undefined : onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <motion.button
            className="mt-0.5"
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              if (!isCompleted) onComplete();
            }}
          >
            {isCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
            )}
          </motion.button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="text-primary">{item.icon}</div>
              <h5 className={`font-medium ${isCompleted ? 'text-green-900 dark:text-green-100' : ''}`}>
                {item.title}
              </h5>
            </div>
            <p className={`text-sm ${isCompleted ? 'text-green-700 dark:text-green-300' : 'text-muted-foreground'}`}>
              {item.description}
            </p>
            
            {!isCompleted && item.actionText && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 h-7 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
              >
                {item.actionText}
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Hook to manage onboarding checklist state
export function useOnboardingChecklist() {
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [shouldShowChecklist, setShouldShowChecklist] = useState(false);

  useEffect(() => {
    // Show checklist after guide is completed but checklist hasn't been dismissed
    const guideCompleted = localStorage.getItem('userGuideCompleted') === 'true';
    const checklistDismissed = localStorage.getItem('onboardingChecklistDismissed') === 'true';
    
    if (guideCompleted && !checklistDismissed) {
      setShouldShowChecklist(true);
      // Auto-open checklist a few seconds after guide completion
      const timer = setTimeout(() => {
        setIsChecklistOpen(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const openChecklist = () => setIsChecklistOpen(true);
  
  const closeChecklist = () => {
    setIsChecklistOpen(false);
    localStorage.setItem('onboardingChecklistDismissed', 'true');
    setShouldShowChecklist(false);
  };

  return {
    isChecklistOpen,
    shouldShowChecklist,
    openChecklist,
    closeChecklist,
  };
}