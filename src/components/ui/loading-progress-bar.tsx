import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LoadingProgressBarProps {
  isLoading: boolean;
  message?: string;
  position?: 'top' | 'inline' | 'overlay';
  colorScheme?: 'light' | 'dark' | 'primary';
  duration?: number;
}

const LoadingProgressBar: React.FC<LoadingProgressBarProps> = ({
  isLoading,
  message = 'Fetching data, please wait...',
  position = 'top',
  colorScheme = 'primary',
  duration
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let showTimer: NodeJS.Timeout;
    let hideTimer: NodeJS.Timeout;
    let progressTimer: NodeJS.Timeout;

    if (isLoading) {
      // Show immediately
      setIsVisible(true);
      
      // If duration is provided, animate progress
      if (duration) {
        setProgress(0);
        const interval = 50; // Update every 50ms
        const increment = 100 / (duration * 1000 / interval);
        
        progressTimer = setInterval(() => {
          setProgress(prev => {
            if (prev >= 100) {
              clearInterval(progressTimer);
              return 100;
            }
            return prev + increment;
          });
        }, interval);
      }
    } else {
      // Hide with minimum display time of 500ms
      hideTimer = setTimeout(() => {
        setIsVisible(false);
        setProgress(0);
      }, 500);
    }

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      clearInterval(progressTimer);
    };
  }, [isLoading, duration]);

  if (!isVisible) return null;

  const getColorClasses = () => {
    switch (colorScheme) {
      case 'light':
        return {
          bar: 'bg-gray-200',
          progress: 'bg-gray-600',
          text: 'text-gray-700',
          overlay: 'bg-white/80'
        };
      case 'dark':
        return {
          bar: 'bg-gray-700',
          progress: 'bg-gray-300',
          text: 'text-gray-200',
          overlay: 'bg-black/80'
        };
      case 'primary':
      default:
        return {
          bar: 'bg-secondary',
          progress: 'bg-primary',
          text: 'text-foreground',
          overlay: 'bg-background/80'
        };
    }
  };

  const colors = getColorClasses();

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'fixed top-0 left-0 right-0 z-50';
      case 'overlay':
        return 'fixed inset-0 z-50 flex items-center justify-center';
      case 'inline':
      default:
        return 'relative w-full';
    }
  };

  const ProgressBar = () => (
    <div className="w-full max-w-md mx-auto">
      <div
        className={cn(
          'relative h-1.5 rounded-full overflow-hidden',
          colors.bar
        )}
        role="progressbar"
        aria-label="Loading progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={duration ? progress : undefined}
      >
        {duration ? (
          // Determinate progress
          <div
            className={cn(
              'h-full transition-all duration-100 ease-out rounded-full',
              colors.progress
            )}
            style={{ width: `${progress}%` }}
          />
        ) : (
          // Indeterminate progress
          <div
            className={cn(
              'h-full w-1/3 rounded-full animate-pulse',
              colors.progress,
              'absolute animate-[slide_2s_ease-in-out_infinite]'
            )}
          />
        )}
      </div>
      
      {message && (
        <div className="flex items-center justify-center mt-3 gap-2">
          <div
            className={cn(
              'w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin',
              colors.text
            )}
          />
          <p className={cn('text-sm font-medium', colors.text)}>
            {message}
          </p>
        </div>
      )}
    </div>
  );

  if (position === 'overlay') {
    return (
      <div
        className={cn(
          getPositionClasses(),
          colors.overlay,
          'backdrop-blur-sm animate-fade-in'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-card rounded-lg p-6 shadow-lg border animate-scale-in">
          <ProgressBar />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        getPositionClasses(),
        position === 'top' && cn(colors.overlay, 'backdrop-blur-sm'),
        'animate-fade-in'
      )}
    >
      <div className={cn(
        'p-4',
        position === 'top' && 'bg-card border-b shadow-sm'
      )}>
        <ProgressBar />
      </div>
    </div>
  );
};

export { LoadingProgressBar };