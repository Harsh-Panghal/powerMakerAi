import { useState, useCallback } from 'react';

export interface StepValidation {
  isCompleted: boolean;
  validate: () => boolean;
  reset: () => void;
}

export interface ValidationRules {
  [stepId: number]: {
    type: 'click' | 'navigate' | 'input' | 'custom';
    target?: string;
    condition?: () => boolean;
    description: string;
  };
}

export function useStepValidation(rules: ValidationRules) {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [activeValidations, setActiveValidations] = useState<Set<number>>(new Set());

  const startValidation = useCallback((stepId: number) => {
    const rule = rules[stepId];
    if (!rule) {
      return;
    }

    setActiveValidations(prev => new Set(prev).add(stepId));

    // Set up validation based on type
    switch (rule.type) {
      case 'click':
        if (rule.target) {
          const element = document.querySelector(rule.target);
          if (element) {
            // Create multiple event listeners for better compatibility
            const handleInteraction = () => {
              setCompletedSteps(prev => new Set(prev).add(stepId));
              setActiveValidations(prev => {
                const next = new Set(prev);
                next.delete(stepId);
                return next;
              });
              // Remove all listeners
              element.removeEventListener('click', handleInteraction);
              element.removeEventListener('mousedown', handleInteraction);
              element.removeEventListener('focus', handleInteraction);
            };
            
            // Add multiple event types for better compatibility
            element.addEventListener('click', handleInteraction);
            element.addEventListener('mousedown', handleInteraction);
            element.addEventListener('focus', handleInteraction);
            
            // Fallback timeout - auto-complete after 30 seconds
            setTimeout(() => {
              if (activeValidations.has(stepId)) {
                handleInteraction();
              }
            }, 30000);
          } else {
            // Element not found, try again in a moment
            setTimeout(() => {
              if (activeValidations.has(stepId)) {
                startValidation(stepId);
              }
            }, 1000);
          }
        }
        break;
      
      case 'navigate':
        // Listen for route changes
        const checkRoute = () => {
          if (rule.condition?.()) {
            setCompletedSteps(prev => new Set(prev).add(stepId));
            setActiveValidations(prev => {
              const next = new Set(prev);
              next.delete(stepId);
              return next;
            });
            window.removeEventListener('popstate', checkRoute);
          }
        };
        window.addEventListener('popstate', checkRoute);
        // Also check immediately
        setTimeout(checkRoute, 100);
        break;
      
      case 'input':
        if (rule.target) {
          const element = document.querySelector(rule.target) as HTMLInputElement;
          if (element) {
            const handleInput = () => {
              if (element.value.trim()) {
                setCompletedSteps(prev => new Set(prev).add(stepId));
                setActiveValidations(prev => {
                  const next = new Set(prev);
                  next.delete(stepId);
                  return next;
                });
                element.removeEventListener('input', handleInput);
              }
            };
            element.addEventListener('input', handleInput);
          }
        }
        break;
      
      case 'custom':
        if (rule.condition) {
          const checkCondition = () => {
            if (rule.condition?.()) {
              setCompletedSteps(prev => new Set(prev).add(stepId));
              setActiveValidations(prev => {
                const next = new Set(prev);
                next.delete(stepId);
                return next;
              });
            } else {
              setTimeout(checkCondition, 500);
            }
          };
          checkCondition();
        }
        break;
    }
  }, [rules]);

  const stopValidation = useCallback((stepId: number) => {
    setActiveValidations(prev => {
      const next = new Set(prev);
      next.delete(stepId);
      return next;
    });
  }, []);

  const isStepCompleted = useCallback((stepId: number) => {
    return completedSteps.has(stepId);
  }, [completedSteps]);

  const isValidationActive = useCallback((stepId: number) => {
    return activeValidations.has(stepId);
  }, [activeValidations]);

  const resetAll = useCallback(() => {
    setCompletedSteps(new Set());
    setActiveValidations(new Set());
  }, []);

  const completeStep = useCallback((stepId: number) => {
    setCompletedSteps(prev => new Set(prev).add(stepId));
    setActiveValidations(prev => {
      const next = new Set(prev);
      next.delete(stepId);
      return next;
    });
  }, []);

  return {
    startValidation,
    stopValidation,
    isStepCompleted,
    isValidationActive,
    resetAll,
    completeStep,
  };
}