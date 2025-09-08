import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  X,
  SkipForward,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpLeft,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createPortal } from "react-dom";

interface TourStep {
  id: number;
  title: string;
  description: string;
  target: string; // CSS selector
  position:
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right";
  arrow:
    | "up"
    | "down"
    | "left"
    | "right"
    | "up-left"
    | "up-right"
    | "down-left"
    | "down-right";
  autoAdvance?: number; // seconds to auto-advance
  autoPopup?: {
    trigger: string; // selector to trigger popup
    delay: number; // delay before opening popup
    duration: number; // how long to show popup
  };
}

const tourSteps: TourStep[] = [
  {
    id: 1,
    title: "Welcome & Sidebar Overview",
    description:
      "Welcome to PowerMaker AI! This is your Sidebar – your navigation hub on the left for chats and settings.",
    target: '[data-sidebar="true"]',
    position: "right",
    arrow: "left",
    autoAdvance: 5,
  },
  {
    id: 2,
    title: "Logo",
    description:
      "Click the Logo to return to the landing page. It's your home button!",
    target: '[data-tour="logo"]',
    position: "bottom",
    arrow: "up",
    autoAdvance: 4,
  },
  {
    id: 3,
    title: "New Chat Button",
    description:
      "Click '+ New Chat' to start a new conversation. It loads a greeting in the chat area.",
    target: '[data-guide="new-chat-button"]',
    position: "bottom-right",
    arrow: "up-left",
    autoAdvance: 4,
  },
  {
    id: 4,
    title: "Recent Chats Area",
    description:
      "See your Recent Chats here. Click a title to reopen or hover for Rename/Delete.",
    target: '[data-tour="recent-chats"]',
    position: "right",
    arrow: "left",
    autoAdvance: 4,
  },
  {
    id: 5,
    title: "Header Overview",
    description:
      "This is the Header – it shows model selection, connection status, notifications, and your profile. Let's explore!",
    target: '[data-tour="header"]',
    position: "bottom",
    arrow: "up",
    autoAdvance: 4,
  },
  {
    id: 6,
    title: "Hamburger Icon",
    description: "Click the Hamburger ☰ to toggle the Sidebar open or closed.",
    target: '[data-tour="hamburger"]',
    position: "right",
    arrow: "left",
    autoAdvance: 4,
  },
  {
    id: 7,
    title: "Model Selector",
    description: "Select the AI model you want to use. It's your AI companion!",
    target: '[data-tour="model-selector"]',
    position: "bottom",
    arrow: "up",
    autoAdvance: 4,
  },
  {
    id: 8,
    title: "Connection Status",
    description:
      "This shows your CRM connection status. It updates dynamically.",
    target: '[data-tour="connection-status"]',
    position: "bottom",
    arrow: "up",
    autoAdvance: 4,
  },
  {
    id: 9,
    title: "Bell Icon",
    description:
      "Click the Bell to see notifications. We'll open it to show alerts.",
    target: '[data-guide="notifications-bell"]',
    position: "bottom",
    arrow: "up",
    autoAdvance: 4
  },
  {
    id: 10,
    title: "Profile Picture & Username",
    description:
      "Click your Profile Picture to Invite or Logout. It's your personal hub.",
    target: '[data-guide="user-menu"]',
    position: "left",
    arrow: "right",
    autoAdvance: 4
  },
  {
    id: 11,
    title: "Chat Area & Greeting Container",
    description:
      "This is the Chat Area – where you interact with AI! It starts with a Greeting.",
    target: '[data-tour="chat-area"]',
    position: "right",
    arrow: "left",
    autoAdvance: 4,
  },
  {
    id: 12,
    title: "Prompt Cards",
    description:
      "Click these Prompt Cards for tasks like creating entities or fields. Quick starts await!",
    target: '[data-tour="prompt-cards"]',
    position: "bottom",
    arrow: "up",
    autoAdvance: 4,
  },
  {
    id: 13,
    title: "Input Area",
    description:
      "Type your prompt here (up to 1000 chars). It's your typing area.",
    target: '[data-tour="input-area"]',
    position: "top-right",
    arrow: "down-left",
    autoAdvance: 5,
  },
  {
    id: 14,
    title: "Settings Icon",
    description:
      "Click Settings (gear icon) for options like Feedback, Clean Chat, CRM Connections, and Privacy Policy/Terms of Use. Let's see them!",
    target: '[data-guide="settings-button"]',
    position: "top-right",
    arrow: "down-left",
    autoAdvance: 6
  },
  {
    id: 15,
    title: "Feedback Option",
    description:
      "Send Feedback here. We'll open it to show text, type, image, and star fields.",
    target: '[data-tour="feedback-option"]',
    position: "bottom",
    arrow: "down-left",
    autoAdvance: 4
  },
  {
    id: 16,
    title: "Clean Chat Option",
    description:
      "Clean Chat deletes all chats. We'll open it to show the confirmation.",
    target: '[data-tour="clean-chat-option"]',
    position: "right",
    arrow: "down-left",
    autoAdvance: 4   
  },
  {
    id: 17,
    title: "CRM Connection Details - List",
    description:
      "Manage CRM Connections here. We'll open it to show the list.",
    target: '[data-tour="crm-connections"]',
    position: "bottom",
    arrow: "down-left",
    autoAdvance: 4
  },
  {
    id: 18,
    title: "Privacy Policy & Terms of Use",
    description:
      "Privacy Policy and Terms open in new tabs. Read them for app rules.",
    target: '[data-tour="privacy-terms"]',
    position: "bottom",
    arrow: "down-left",
    autoAdvance: 4,
  },
  {
    id: 19,
    title: "Help Icon",
    description:
      "Click Help (?) for Documentation. Tour complete – explore freely!",
    target: '[data-tour="help-icon"]',
    position: "top-right",
    arrow: "down-left",
    autoAdvance: 5,
  },
];

interface PowerMakerTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PowerMakerTour({ isOpen, onClose }: PowerMakerTourProps) {
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = localStorage.getItem("powermaker-tour-step");
    return saved ? parseInt(saved, 10) : 1;
  });
  const [isCompleted, setIsCompleted] = useState(false);
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });
  const [targetPosition, setTargetPosition] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [autoAdvanceTimer, setAutoAdvanceTimer] =
    useState<NodeJS.Timeout | null>(null);
  const [popupTimer, setPopupTimer] = useState<NodeJS.Timeout | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const currentStepData = tourSteps.find((step) => step.id === currentStep);

  // Calculate positions
  useEffect(() => {
    if (!isOpen || !currentStepData) return;

    const updatePositions = () => {
      const targetElement = document.querySelector(currentStepData.target);
      if (!targetElement) return;

      const targetRect = targetElement.getBoundingClientRect();
      const cardWidth = 280;
      const cardHeight = 150;
      const offset = 20;

      setTargetPosition({
        x: targetRect.left,
        y: targetRect.top,
        width: targetRect.width,
        height: targetRect.height,
      });

      let x = 0;
      let y = 0;

      switch (currentStepData.position) {
        case "top":
          x = targetRect.left + targetRect.width / 2 - cardWidth / 2;
          y = targetRect.top - cardHeight - offset;
          break;
        case "bottom":
          x = targetRect.left + targetRect.width / 2 - cardWidth / 2;
          y = targetRect.bottom + offset;
          break;
        case "left":
          x = targetRect.left - cardWidth - offset;
          y = targetRect.top + targetRect.height / 2 - cardHeight / 2;
          break;
        case "right":
          x = targetRect.right + offset;
          y = targetRect.top + targetRect.height / 2 - cardHeight / 2;
          break;
        case "top-left":
          x = targetRect.left - cardWidth - offset;
          y = targetRect.top - cardHeight - offset;
          break;
        case "top-right":
          x = targetRect.right + offset;
          y = targetRect.top - cardHeight - offset;
          break;
        case "bottom-left":
          x = targetRect.left - cardWidth - offset;
          y = targetRect.bottom + offset;
          break;
        case "bottom-right":
          x = targetRect.right + offset;
          y = targetRect.bottom + offset;
          break;
      }

      // Ensure card stays within viewport
      const padding = 16;
      x = Math.max(
        padding,
        Math.min(x, window.innerWidth - cardWidth - padding)
      );
      y = Math.max(
        padding,
        Math.min(y, window.innerHeight - cardHeight - padding)
      );

      setCardPosition({ x, y });
    };

    updatePositions();
    window.addEventListener("scroll", updatePositions, true);
    window.addEventListener("resize", updatePositions);

    return () => {
      window.removeEventListener("scroll", updatePositions, true);
      window.removeEventListener("resize", updatePositions);
    };
  }, [currentStep, isOpen, currentStepData]);

  // Auto-advance timer
  useEffect(() => {
    if (!isOpen || !currentStepData?.autoAdvance) return;

    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer);
    }

    const timer = setTimeout(() => {
      handleNext();
    }, currentStepData.autoAdvance * 1000);

    setAutoAdvanceTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [currentStep, isOpen]);

  // Auto-popup functionality
  useEffect(() => {
    if (!isOpen || !currentStepData?.autoPopup) return;

    if (popupTimer) {
      clearTimeout(popupTimer);
    }

    const timer = setTimeout(() => {
      const triggerElement = document.querySelector(
        currentStepData.autoPopup!.trigger
      );
      if (triggerElement) {
        // Simulate click to open popup
        (triggerElement as HTMLElement).click();

        // Close popup after duration
        setTimeout(() => {
          // 1. Try to close dialogs
          const closeButton = document.querySelector('[role="dialog"] button');
          if (closeButton) {
            (closeButton as HTMLElement).click();
            return;
          }

          // 2. Try to close dropdowns (by toggling trigger again)
          const triggerElement = document.querySelector(
            currentStepData.autoPopup!.trigger
          );
          if (triggerElement) {
            (triggerElement as HTMLElement).click();
            return;
          }

          // 3. Fallback to Escape key
          document.dispatchEvent(
            new KeyboardEvent("keydown", { key: "Escape" })
          );
        }, currentStepData.autoPopup!.duration);
      }
    }, currentStepData.autoPopup.delay);

    setPopupTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [currentStep, isOpen]);

  const handleNext = () => {
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer);
      setAutoAdvanceTimer(null);
    }

    if (currentStep < tourSteps.length) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      localStorage.setItem("powermaker-tour-step", nextStep.toString());
    } else {
      setIsCompleted(true);
      localStorage.setItem("powermaker-tour-completed", "true");
      localStorage.removeItem("powermaker-tour-step");
    }
  };

  const handlePrevious = () => {
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer);
      setAutoAdvanceTimer(null);
    }

    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      localStorage.setItem("powermaker-tour-step", prevStep.toString());
    }
  };

  const handleSkip = () => {
    if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);
    if (popupTimer) clearTimeout(popupTimer);

    setIsCompleted(true);
    localStorage.setItem("powermaker-tour-completed", "true");
    localStorage.removeItem("powermaker-tour-step");
    onClose();
  };

  const handleFinish = () => {
    localStorage.setItem("powermaker-tour-completed", "true");
    localStorage.removeItem("powermaker-tour-step");
    onClose();
    setIsCompleted(false);
    setCurrentStep(1);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          e.preventDefault();
          handleSkip();
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (currentStep > 1) handlePrevious();
          break;
        case "ArrowRight":
          e.preventDefault();
          handleNext();
          break;
        case "Tab":
          e.preventDefault();
          handleNext();
          break;
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, currentStep]);

  const getArrowIcon = (direction: string) => {
    switch (direction) {
      case "up":
        return <ArrowUp className="h-4 w-4" />;
      case "down":
        return <ArrowDown className="h-4 w-4" />;
      case "left":
        return <ArrowLeft className="h-4 w-4" />;
      case "right":
        return <ArrowRight className="h-4 w-4" />;
      case "up-left":
        return <ArrowUpLeft className="h-4 w-4" />;
      case "up-right":
        return <ArrowUpRight className="h-4 w-4" />;
      case "down-left":
        return <ArrowDownLeft className="h-4 w-4" />;
      case "down-right":
        return <ArrowDownRight className="h-4 w-4" />;
      default:
        return <ArrowRight className="h-4 w-4" />;
    }
  };

  if (!isOpen || isCompleted) return null;

  return createPortal(
    <>
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black/60 z-[9998]" />

      {/* Target highlight */}
      {currentStepData && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: targetPosition.x - 4,
            top: targetPosition.y - 4,
            width: targetPosition.width + 8,
            height: targetPosition.height + 8,
          }}
        >
          <div
            className="w-full h-full rounded-lg border-2 border-primary shadow-lg bg-transparent"
            style={{ boxShadow: "0 0 20px hsl(var(--primary) / 0.5)" }}
          />
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 rounded-lg border border-primary/50"
          />
        </motion.div>
      )}

      {/* Tour card */}
      {currentStepData && (
        <motion.div
          ref={cardRef}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="fixed z-[10000] w-[280px]"
          style={{
            left: cardPosition.x,
            top: cardPosition.y,
          }}
        >
          <Card className="shadow-2xl border-2 border-primary/20 bg-background/95 backdrop-blur-sm">
            <CardContent className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {currentStep} of {tourSteps.length}
                  </Badge>
                  <div className="flex items-center gap-1 text-primary">
                    {getArrowIcon(currentStepData.arrow)}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-muted rounded-full h-1 mb-3">
                <motion.div
                  className="bg-primary h-1 rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(currentStep / tourSteps.length) * 100}%`,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Content */}
              <div className="mb-4">
                <h3 className="font-semibold text-sm mb-2">
                  {currentStepData.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {currentStepData.description}
                </p>
              </div>

              {/* Auto-advance indicator */}
              {currentStepData.autoAdvance && (
                <div className="flex items-center gap-1 text-xs text-primary mb-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-3 h-3"
                  >
                    <div className="w-full h-full border border-primary rounded-full border-t-transparent" />
                  </motion.div>
                  Auto-advancing in {currentStepData.autoAdvance}s
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex justify-between gap-2">
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className="text-xs h-7 px-2"
                  >
                    <ChevronLeft className="h-3 w-3 mr-1" />
                    Prev
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSkip}
                    className="text-xs h-7 px-2"
                  >
                    <SkipForward className="h-3 w-3 mr-1" />
                    Skip
                  </Button>
                </div>
                <Button
                  onClick={handleNext}
                  size="sm"
                  className="text-xs h-7 px-2"
                >
                  {currentStep === tourSteps.length ? "Finish" : "Next"}
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </>,
    document.body
  );
}

// Hook for tour management
export function usePowerMakerTour() {
  const [hasCompletedTour, setHasCompletedTour] = useState<boolean | null>(
    null
  );

  useEffect(() => {
    const completed =
      localStorage.getItem("powermaker-tour-completed") === "true";
    setHasCompletedTour(completed);
  }, []);

  const resetTour = () => {
    localStorage.removeItem("powermaker-tour-completed");
    localStorage.removeItem("powermaker-tour-step");
    setHasCompletedTour(false);
  };

  const startTour = () => {
    localStorage.removeItem("powermaker-tour-completed");
    localStorage.removeItem("powermaker-tour-step");
    setHasCompletedTour(false);
  };

  return {
    hasCompletedTour,
    resetTour,
    startTour,
  };
}
