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
  Target,
  Play,
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
import { Spotlight } from "@/components/ui/spotlight";
import { useStepValidation, ValidationRules } from "@/hooks/use-step-validation";

interface UserGuideStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: string;
  target?: string; // CSS selector for highlighting
  interactive?: boolean; // Whether this step requires interaction
  validationText?: string; // Text to show during validation
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
    title: "Start New Conversations",
    description: "Try the chat interface",
    icon: <MessageSquare className="h-6 w-6" />,
    content: "Click the 'New Chat' button in the sidebar to start a conversation. The AI assistant can help with complex queries and provide intelligent recommendations.",
    target: '[data-guide="new-chat-button"]',
    interactive: true,
    validationText: "Click the 'New Chat' button to continue"
  },
  {
    id: 3,
    title: "Select AI Models",
    description: "Choose the right model for your task",
    icon: <Database className="h-6 w-6" />,
    content: "Use the model selector in the header to choose between different AI models. Each model is specialized for different tasks like CRM customization, plugin tracing, or general expertise.",
    target: '[data-guide="model-selector"]',
    interactive: true,
    validationText: "Click on the model selector to see available options"
  },
  {
    id: 4,
    title: "Check Notifications",
    description: "Stay updated with system activities",
    icon: <Plug className="h-6 w-6" />,
    content: "Click the notification bell to view recent activities, plugin logs, and system updates. This helps you track what's happening in your CRM integrations.",
    target: '[data-guide="notifications-bell"]',
    interactive: true,
    validationText: "Click the notification bell to view activities"
  },
  {
    id: 5,
    title: "Access User Menu",
    description: "Manage your profile and settings",
    icon: <Users className="h-6 w-6" />,
    content: "Click on your profile avatar to access user settings, invite team members, and manage your account preferences.",
    target: '[data-guide="user-menu"]',
    interactive: true,
    validationText: "Click on your profile avatar to open the menu"
  },
  {
    id: 6,
    title: "Explore Settings & CRM Setup",
    description: "Access advanced options and connect your CRM",
    icon: <Settings className="h-6 w-6" />,
    content: "Use the settings option in the sidebar to access feedback, CRM connections, privacy policy, and other advanced features. Setting up CRM connections allows you to sync data and automate workflows with your existing systems.",
    target: '[data-guide="settings-button"]',
    interactive: true,
    validationText: "Click the settings button in the sidebar"
  },
];

// Validation rules for interactive steps
const validationRules: ValidationRules = {
  2: {
    type: 'click',
    target: '[data-guide="new-chat-button"]',
    description: 'Click the New Chat button'
  },
  3: {
    type: 'click',
    target: '[data-guide="model-selector"]',
    description: 'Open the model selector'
  },
  4: {
    type: 'click',
    target: '[data-guide="notifications-bell"]',
    description: 'Open notifications'
  },
  5: {
    type: 'click',
    target: '[data-guide="user-menu"]',
    description: 'Open user menu'
  },
  6: {
    type: 'click',
    target: '[data-guide="settings-button"]',
    description: 'Open settings'
  },
};

interface UserGuideWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserGuideWizard({ isOpen, onClose }: UserGuideWizardProps) {
  const [currentStep, setCurrentStep] = useState(() => {
    const savedStep = localStorage.getItem('userGuideCurrentStep');
    return savedStep ? parseInt(savedStep, 10) : 1;
  });
  const [isCompleted, setIsCompleted] = useState(false);
  const [waitingForInteraction, setWaitingForInteraction] = useState(false);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const isMobile = useIsMobile();
  
  const {
    startValidation,
    stopValidation,
    isStepCompleted,
    isValidationActive,
    resetAll,
    completeStep
  } = useStepValidation(validationRules);

  const handleNext = () => {
    console.log('UserGuide: handleNext called, currentStep:', currentStep);
    const currentStepData = guideSteps.find(step => step.id === currentStep);
    
    // If current step is interactive and not completed, start validation
    if (currentStepData?.interactive && !isStepCompleted(currentStep)) {
      console.log('UserGuide: Starting validation for step', currentStep);
      setWaitingForInteraction(true);
      startValidation(currentStep);
      return;
    }
    
    // Move to next step
    console.log('UserGuide: Moving to next step');
    stopValidation(currentStep);
    setWaitingForInteraction(false);
    
    if (currentStep < guideSteps.length) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      localStorage.setItem('userGuideCurrentStep', nextStep.toString());
    } else {
      setIsCompleted(true);
      resetAll();
      localStorage.setItem('userGuideCompleted', 'true');
      localStorage.removeItem('userGuideCurrentStep');
    }
  };

  const handlePrevious = () => {
    stopValidation(currentStep);
    setWaitingForInteraction(false);
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      localStorage.setItem('userGuideCurrentStep', prevStep.toString());
    }
  };

  const handleSkip = () => {
    resetAll();
    stopValidation(currentStep);
    setWaitingForInteraction(false);
    setIsCompleted(true);
    localStorage.setItem('userGuideCompleted', 'true');
    localStorage.removeItem('userGuideCurrentStep');
    onClose();
  };

  const handleFinish = () => {
    resetAll();
    localStorage.setItem('userGuideCompleted', 'true');
    localStorage.removeItem('userGuideCurrentStep');
    onClose();
    setIsCompleted(false);
    setCurrentStep(1);
    setWaitingForInteraction(false);
  };

  const handleResumeGuide = () => {
    setShowResumePrompt(false);
  };

  const handleStartOver = () => {
    setCurrentStep(1);
    localStorage.removeItem('userGuideCurrentStep');
    setShowResumePrompt(false);
  };

  const currentStepData = guideSteps.find(step => step.id === currentStep);
  
  // Check for resume prompt on mount
  useEffect(() => {
    const savedStep = localStorage.getItem('userGuideCurrentStep');
    const isCompleted = localStorage.getItem('userGuideCompleted') === 'true';
    
    if (savedStep && !isCompleted && parseInt(savedStep, 10) > 1) {
      setShowResumePrompt(true);
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || showResumePrompt) return;
      
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (currentStep > 1) handlePrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (!waitingForInteraction) handleNext();
          break;
        case 'Enter':
          e.preventDefault();
          if (isCompleted) {
            handleFinish();
          } else if (currentStepData?.interactive && !isStepCompleted(currentStep) && !waitingForInteraction) {
            handleNext(); // Start "Try It" mode
          } else if (!waitingForInteraction) {
            handleNext();
          }
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, currentStep, waitingForInteraction, isCompleted, showResumePrompt]);

  // Auto-advance when interactive step is completed
  useEffect(() => {
    if (currentStepData?.interactive && isStepCompleted(currentStep) && waitingForInteraction) {
      setTimeout(() => {
        handleNext();
      }, 1000); // Small delay to show completion
    }
  }, [currentStep, isStepCompleted, waitingForInteraction, currentStepData?.interactive]);

  const renderResumePrompt = () => (
    <div className="text-center py-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="flex justify-center mb-4"
      >
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <HelpCircle className="h-8 w-8 text-primary" />
        </div>
      </motion.div>
      <h3 className="text-lg font-semibold mb-2">Resume Your Tour?</h3>
      <p className="text-muted-foreground mb-6">
        You were on step {currentStep} of {guideSteps.length}. Would you like to continue where you left off?
      </p>
      <div className="flex gap-3 justify-center">
        <Button variant="outline" onClick={handleStartOver}>
          Start Over
        </Button>
        <Button onClick={handleResumeGuide}>
          Resume Tour
        </Button>
      </div>
    </div>
  );

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

            <p className="text-foreground leading-relaxed mb-4">
              {currentStepData.content}
            </p>
            
            {/* Interactive Step Status */}
            {currentStepData.interactive && (
              <div className="mb-6 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2">
                  {isStepCompleted(currentStep) ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm text-success font-medium">
                        Great! You completed this step.
                      </span>
                    </>
                  ) : waitingForInteraction ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Target className="h-4 w-4 text-primary" />
                      </motion.div>
                      <span className="text-sm text-primary font-medium">
                        {currentStepData.validationText}
                      </span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Click "Try It" to practice this step
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}
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
            disabled={currentStepData?.interactive && !isStepCompleted(currentStep) && !waitingForInteraction}
          >
            {currentStepData?.interactive && !isStepCompleted(currentStep) ? 
              (waitingForInteraction ? "Waiting..." : "Try It") :
              (currentStep === guideSteps.length ? "Finish" : "Next")
            }
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
      </div>
      {showResumePrompt ? renderResumePrompt() : renderStepContent()}
    </div>
  );

  if (isMobile) {
    return (
      <>
        <Drawer open={isOpen} onOpenChange={onClose}>
          <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="text-center">
            <DrawerTitle className="sr-only">
              {showResumePrompt ? "Resume User Guide" : `User Guide - Step ${currentStep} of ${guideSteps.length}`}
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6">
            {showResumePrompt ? renderResumePrompt() : renderStepContent()}
          </div>
          </DrawerContent>
        </Drawer>
        
        {/* Spotlight for highlighting elements */}
        <Spotlight
          target={currentStepData?.target || ''}
          isActive={isOpen && !!currentStepData?.target && waitingForInteraction && !showResumePrompt}
          onTargetClick={() => {
            console.log('Spotlight: Target clicked for step', currentStep);
            if (currentStepData?.interactive) {
              console.log('Spotlight: Completing step', currentStep);
              completeStep(currentStep);
            }
          }}
        />
      </>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="sr-only">
              {showResumePrompt ? "Resume User Guide" : `User Guide - Step ${currentStep} of ${guideSteps.length}`}
            </DialogTitle>
          </DialogHeader>
          {dialogContent}
        </DialogContent>
      </Dialog>
      
      {/* Spotlight for highlighting elements */}
      <Spotlight
        target={currentStepData?.target || ''}
        isActive={isOpen && !!currentStepData?.target && waitingForInteraction && !showResumePrompt}
        onTargetClick={() => {
          console.log('Spotlight: Target clicked for step', currentStep);
          if (currentStepData?.interactive) {
            console.log('Spotlight: Completing step', currentStep);
            completeStep(currentStep);
          }
        }}
      />
    </>
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
    localStorage.removeItem('userGuideCurrentStep');
    localStorage.removeItem('onboardingChecklistDismissed');
    setHasCompletedGuide(false);
  };

  return {
    hasCompletedGuide,
    resetGuide,
  };
}