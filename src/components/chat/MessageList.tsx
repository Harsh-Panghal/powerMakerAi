import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChatStore } from '@/store/chatStore';
import { MessageBubble } from './MessageBubble';

export function MessageList() {
  const { currentThread } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const previousMessageCountRef = useRef(0);
  const listControls = useAnimation();

  const messages = currentThread?.messages || [];
  const isAtBottom = useRef(true);

  const scrollToBottom = (smooth = true) => {
    if (!containerRef.current) return;
    
    containerRef.current.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto'
    });
  };

  const handleScroll = () => {
    if (!containerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    isAtBottom.current = isNearBottom;
    setShowScrollToBottom(!isNearBottom);
    setIsUserScrolling(!isNearBottom);
  };

  // Smooth upward push animation when new messages appear
  useLayoutEffect(() => {
    const messageCount = messages.length;
    const previousCount = previousMessageCountRef.current;

    if (messageCount > previousCount && previousCount > 0) {
      // New message added - trigger upward push animation
      listControls.start({
        y: [20, 0],
        transition: { 
          duration: 0.4, 
          ease: [0.4, 0, 0.2, 1] // cubic-bezier ease-out
        }
      });

      // Auto-scroll to bottom if user was already at bottom
      if (isAtBottom.current) {
        // Use RAF for smoother scroll timing
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            scrollToBottom(true);
          });
        });
      }
    }

    previousMessageCountRef.current = messageCount;
  }, [messages.length, listControls]);

  useEffect(() => {
    // Reset user scrolling when new chat starts
    setIsUserScrolling(false);
    isAtBottom.current = true;
    previousMessageCountRef.current = 0;
    scrollToBottom(false);
  }, [currentThread?.id]);

  if (!currentThread) return null;

  return (
    <div className="h-full relative">
      {/* Messages Container */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto overflow-x-hidden px-2 sm:px-4 py-2 sm:py-4 scroll-smooth"
      >
        <motion.div 
          className="max-w-4xl mx-auto space-y-4 sm:space-y-6"
          animate={listControls}
        >
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => {
              const isLatest = index === messages.length - 1;
              const isSecondLatest = index === messages.length - 2;
              const isOlder = index < messages.length - 2;
              
              return (
                <motion.div
                  key={message.id}
                  layout
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ 
                    opacity: isOlder ? 0.75 : 1,
                    y: 0,
                    scale: isOlder ? 0.98 : 1,
                    filter: isOlder ? 'blur(0px)' : 'blur(0px)'
                  }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ 
                    duration: 0.4,
                    ease: [0.4, 0, 0.2, 1],
                    layout: { duration: 0.3 }
                  }}
                  className={`${
                    isLatest || isSecondLatest 
                      ? 'ring-2 ring-primary/10 rounded-3xl' 
                      : ''
                  } transition-all duration-300`}
                >
                  <MessageBubble 
                    message={message} 
                    isLast={isLatest}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {/* Invisible element to scroll to */}
          <div ref={messagesEndRef} className="h-4" />
        </motion.div>
      </div>

      {/* Scroll to Bottom Button */}
      <AnimatePresence>
        {showScrollToBottom && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 z-10"
          >
            <Button
              onClick={() => {
                setIsUserScrolling(false);
                scrollToBottom(true);
              }}
              size="sm"
              className="rounded-full bg-background border border-border shadow-lg hover:bg-muted text-xs sm:text-sm px-2 sm:px-4"
              variant="outline"
            >
              <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">Scroll to latest</span>
              <span className="sm:hidden">Latest</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}