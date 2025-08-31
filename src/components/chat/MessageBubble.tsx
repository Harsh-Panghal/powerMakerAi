import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';
import { Message } from '@/store/chatStore';
import { AssistantActions } from './AssistantActions';
import { Skeleton } from '@/components/ui/skeleton';

interface MessageBubbleProps {
  message: Message;
  isLast?: boolean;
}

export function MessageBubble({ message, isLast }: MessageBubbleProps) {
  const [showTimestamp, setShowTimestamp] = useState(false);

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const isUser = message.type === 'user';
  const isStreaming = message.isStreaming && !message.content;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full`}>
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3 max-w-[85%]`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted text-muted-foreground'
        }`}>
          {isUser ? (
            <User className="w-4 h-4" />
          ) : (
            <Bot className="w-4 h-4" />
          )}
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          <motion.div
            onHoverStart={() => setShowTimestamp(true)}
            onHoverEnd={() => setShowTimestamp(false)}
            className={`relative rounded-2xl px-4 py-3 break-words ${
              isUser
                ? 'bg-primary text-primary-foreground ml-4'
                : 'bg-muted text-foreground mr-4'
            }`}
          >
            {/* Streaming Loading State */}
            {isStreaming ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              /* Message Content */
              <div className="prose prose-sm max-w-none dark:prose-invert">
                {message.content.split('\n').map((line, index) => {
                  // Handle table formatting
                  if (line.includes('|') && line.includes('---')) {
                    return null; // Skip separator lines
                  }
                  if (line.includes('|')) {
                    const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
                    return (
                      <div key={index} className="flex border-b border-border/20 py-1">
                        {cells.map((cell, cellIndex) => (
                          <div key={cellIndex} className={`flex-1 px-2 text-xs ${cellIndex === 0 ? 'font-medium' : ''}`}>
                            {cell}
                          </div>
                        ))}
                      </div>
                    );
                  }
                  
                  // Handle bold text
                  if (line.includes('**')) {
                    const parts = line.split('**');
                    return (
                      <p key={index} className="mb-2">
                        {parts.map((part, partIndex) => 
                          partIndex % 2 === 1 ? 
                            <strong key={partIndex}>{part}</strong> : 
                            part
                        )}
                      </p>
                    );
                  }
                  
                  // Regular text
                  return line ? <p key={index} className="mb-2">{line}</p> : <br key={index} />;
                })}
              </div>
            )}

            {/* Streaming Animation for Assistant Messages */}
            {message.isStreaming && message.content && (
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="inline-block w-2 h-4 bg-current ml-1"
              />
            )}

            {/* Timestamp Tooltip */}
            {showTimestamp && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`absolute -top-8 ${
                  isUser ? 'right-0' : 'left-0'
                } bg-popover text-popover-foreground text-xs px-2 py-1 rounded border shadow-lg whitespace-nowrap z-10`}
              >
                {formatTime(message.timestamp)}
              </motion.div>
            )}
          </motion.div>

          {/* Assistant Actions */}
          {!isUser && !message.isStreaming && message.content && (
            <div className="mt-3">
              <AssistantActions message={message} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}