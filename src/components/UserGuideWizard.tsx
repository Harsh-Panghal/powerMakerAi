import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  X,
  MessageSquare,
  Settings,
  Users,
  Database,
  CheckCircle,
  Plug,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";

interface UserGuideStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: string;
}

const guideSteps: UserGuideStep[] = [
  {
    id: 1,
    title: "Welcome to PowerMaker AI",
    description: "Let's get you started with a quick tour",
    icon: <HelpCircle className="h-6 w-6" />,
    content: "PowerMaker AI is your intelligent assistant for data analysis and CRM management. This guide will show you the key features to get you productive quickly."
  },
  {
    id: 2,
    title: "Start Conversations",
    description: "Chat with your AI assistant",
    icon: <MessageSquare className="h-6 w-6" />,
    content: "Use the chat interface to ask questions, analyze data, or get insights. Your AI assistant can help with complex queries and provide intelligent recommendations."
  },
  {
    id: 3,
    title: "Manage Your Data",
    description: "Connect and organize your information",
    icon: <Database className="h-6 w-6" />,
    content: "Connect your CRM systems, databases, and other data sources. The AI will help you analyze patterns and generate actionable insights from your data."
  },
  {
    id: 4,
    title: "CRM Connections",
    description: "Set up and manage your CRM integrations",
    icon: <Plug className="h-6 w-6" />,
    content: "Create new CRM connections by navigating to the connections section. You can add multiple CRM systems, configure authentication, and manage data sync settings. Each connection allows you to access customer data, leads, and analytics directly through the AI assistant."
  },
  {
    id: 5,
    title: "Collaborate & Share",
    description: "Invite team members and share insights",
    icon: <Users className="h-6 w-6" />,
    content: "Invite team members to collaborate on projects. Share conversations, insights, and findings with your colleagues to work together more effectively."
  },
  {
    id: 6,
    title: "Customize Settings",
    description: "Personalize your experience",
    icon: <Settings className="h-6 w-6" />,
    content: "Adjust your preferences, manage integrations, and customize the interface to match your workflow. Access settings from the user menu in the top right."
  },
];

interface UserGuideWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserGuideWizard({ isOpen, onClose }: UserGuideWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const isMobile = useIsMobile();

  const handleNext = () => {
    if (currentStep < guideSteps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsCompleted(true);
      // Mark guide as completed in localStorage
      localStorage.setItem('userGuideCompleted', 'true');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setIsCompleted(true);
    localStorage.setItem('userGuideCompleted', 'true');
    onClose();
  };

  const handleFinish = () => {
    localStorage.setItem('userGuideCompleted', 'true');
    onClose();
    setIsCompleted(false);
    setCurrentStep(1);
  };

  const currentStepData = guideSteps.find(step => step.id === currentStep);

  const renderStepContent = () => {
    if (isCompleted) {
      return (
        <div className="text-center py-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex justify-center mb-4"
          >
            <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </motion.div>
          <h3 className="text-lg font-semibold mb-2">You're all set!</h3>
          <p className="text-muted-foreground mb-6">
            You've completed the user guide. You can always restart it from the help menu when needed.
          </p>
          <Button onClick={handleFinish} className="w-full sm:w-auto">
            Get Started
          </Button>
        </div>
      );
    }

    if (!currentStepData) return null;

    return (
      <div className="py-4">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              Step {currentStep} of {guideSteps.length}
            </span>
            <Badge variant="secondary" className="text-xs">
              {Math.round((currentStep / guideSteps.length) * 100)}%
            </Badge>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <motion.div
              className="bg-primary h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / guideSteps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                {currentStepData.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">{currentStepData.title}</h3>
                <p className="text-sm text-muted-foreground">{currentStepData.description}</p>
              </div>
            </div>

            <p className="text-foreground leading-relaxed mb-6">
              {currentStepData.content}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              size={isMobile ? "sm" : "default"}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="ghost"
              onClick={handleSkip}
              size={isMobile ? "sm" : "default"}
            >
              Skip Tour
            </Button>
          </div>
          
          <Button
            onClick={handleNext}
            size={isMobile ? "sm" : "default"}
          >
            {currentStep === guideSteps.length ? "Finish" : "Next"}
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  };

  const dialogContent = (
    <div className="max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div />
        {/* <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button> */}
      </div>
      {renderStepContent()}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="text-center">
            <DrawerTitle>User Guide</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6">
            {renderStepContent()}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>User Guide</DialogTitle>
        </DialogHeader>
        {dialogContent}
      </DialogContent>
    </Dialog>
  );
}

// Hook to check if user has completed the guide
export function useUserGuide() {
  const [hasCompletedGuide, setHasCompletedGuide] = useState<boolean | null>(null);

  useEffect(() => {
    const completed = localStorage.getItem('userGuideCompleted') === 'true';
    setHasCompletedGuide(completed);
  }, []);

  const resetGuide = () => {
    localStorage.removeItem('userGuideCompleted');
    setHasCompletedGuide(false);
  };

  return {
    hasCompletedGuide,
    resetGuide,
  };
}