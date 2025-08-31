import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

  const messages = currentThread?.messages || [];

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: smooth ? 'smooth' : 'auto' 
    });
  };

  const handleScroll = () => {
    if (!containerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    setShowScrollToBottom(!isAtBottom);
    setIsUserScrolling(!isAtBottom);
  };

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added, unless user is scrolling
    if (!isUserScrolling) {
      scrollToBottom(true);
    }
  }, [messages, isUserScrolling]);

  useEffect(() => {
    // Reset user scrolling when new chat starts
    setIsUserScrolling(false);
    scrollToBottom(false);
  }, [currentThread?.id]);

  if (!currentThread) return null;

  return (
    <div className="flex-1 relative">
      {/* Messages Container */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto p-4 space-y-4"
      >
        <div className="max-w-4xl mx-auto space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <MessageBubble 
                  message={message} 
                  isLast={index === messages.length - 1}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Invisible element to scroll to */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Scroll to Bottom Button */}
      <AnimatePresence>
        {showScrollToBottom && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-4 right-4 z-10"
          >
            <Button
              onClick={() => {
                setIsUserScrolling(false);
                scrollToBottom(true);
              }}
              size="sm"
              className="rounded-full bg-background border border-border shadow-lg hover:bg-muted"
              variant="outline"
            >
              <ChevronDown className="w-4 h-4 mr-1" />
              Scroll to latest
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}