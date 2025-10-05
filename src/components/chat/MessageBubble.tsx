// Updated MessageBubble.tsx with improved thinking indicator

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bot, Expand, Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { AssistantActions } from './AssistantActions';
import { Skeleton } from '@/components/ui/skeleton';

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    type: 'user' | 'assistant';
    timestamp: Date;
    isStreaming?: boolean;
    images: Array<{ data: string; name: string; size: number; type: string }>;
  };
  isLast?: boolean;
  items: string[];
}

export function MessageBubble({ message, isLast, items }: MessageBubbleProps) {
  const [showTimestamp, setShowTimestamp] = useState(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  
  const chatId = useSelector((state: RootState) => state.chat.chatId);
  const recentPrompt = useSelector((state: RootState) => state.chat.recentPrompt);
  const resultData = useSelector((state: RootState) => state.chat.resultData);

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const isUser = message.type === 'user';
  const isStreaming = message.isStreaming;
  const hasContent = message.content && message.content.trim().length > 0;

  const shouldShowActions = () => {
    if (isUser || message.isStreaming) return false;
    if (!message.content || !message.content.trim()) return false;
    return isLast === true;
  };

  const handleImageClick = (imageSrc: string) => {
    setExpandedImage(imageSrc);
  };

  const handleCloseExpanded = () => {
    setExpandedImage(null);
  };

  return (
    <>
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full px-2 sm:px-4`}>
        <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-2 sm:gap-3 max-w-[90%] sm:max-w-[80%] md:max-w-[75%] lg:max-w-[70%]`}>
          {/* Avatar */}
          <div className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
            isUser 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground'
          }`}>
            {isUser ? (
              <User className="w-3 h-3 sm:w-4 sm:h-4" />
            ) : (
              <Bot className="w-3 h-3 sm:w-4 sm:h-4" />
            )}
          </div>

          {/* Message Content */}
          <div className="flex-1 min-w-0 overflow-hidden">
            <motion.div
              onHoverStart={() => setShowTimestamp(true)}
              onHoverEnd={() => setShowTimestamp(false)}
              className={`relative rounded-2xl px-3 py-2 sm:px-4 sm:py-3 break-words hyphens-auto overflow-hidden ${
                isUser
                  ? 'bg-primary text-primary-foreground ml-2 sm:ml-4'
                  : 'bg-muted text-foreground mr-2 sm:mr-4'
              }`}
            >
              {/* Message Content */}
              {isStreaming && !hasContent ? (
                // UPDATED: Show "Assistant thinking..." indicator
                <div className="flex items-center gap-2 py-1">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground animate-pulse">
                    Assistant thinking...
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Compact Images Display */}
                  {message.images && message.images.length > 0 && (
                    <div className="mb-3">
                      {message.images.length > 1 && (
                        <div className="text-xs opacity-75 mb-2">
                          {message.images.length} image{message.images.length > 1 ? 's' : ''}
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2">
                        {message.images.map((image, index) => (
                          <div key={index} className="relative group cursor-pointer">
                            <div 
                              className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 border-border hover:border-primary/50 transition-colors"
                              onClick={() => handleImageClick(image.data)}
                            >
                              <img 
                                src={image.data} 
                                alt={`Image ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                <Expand className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              
                              <div className="absolute bottom-0 left-0 bg-black/70 text-white text-xs rounded-tr-lg px-1.5 py-0.5 min-w-[16px] text-center">
                                {index + 1}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Text Content */}
                  {hasContent && (
                    <div className="prose prose-sm max-w-full dark:prose-invert text-sm sm:text-base overflow-hidden">
                      {message.content.split('\n').map((line, index) => {
                        // Handle table formatting
                        if (line.includes('|') && line.includes('---')) {
                          return null;
                        }
                        if (line.includes('|')) {
                          const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
                          return (
                            <div key={index} className="w-full overflow-x-auto">
                              <div className="flex flex-col sm:flex-row border-b border-border/20 py-1 gap-1 sm:gap-0 min-w-0">
                                {cells.map((cell, cellIndex) => (
                                  <div key={cellIndex} className={`flex-1 px-1 sm:px-2 text-xs sm:text-sm break-words overflow-hidden text-ellipsis ${cellIndex === 0 ? 'font-medium' : ''}`}>
                                    {cell}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }
                        
                        // Handle bold text
                        if (line.includes('**')) {
                          const parts = line.split('**');
                          return (
                            <p key={index} className="mb-2 break-words overflow-wrap-anywhere">
                              {parts.map((part, partIndex) => 
                                partIndex % 2 === 1 ? 
                                  <strong key={partIndex}>{part}</strong> : 
                                  part
                              )}
                            </p>
                          );
                        }
                        
                        return line ? <p key={index} className="mb-2 break-words overflow-wrap-anywhere">{line}</p> : <br key={index} />;
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Streaming Animation - UPDATED to show blinking cursor during streaming */}
              {isStreaming && hasContent && (
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="inline-block w-2 h-4 bg-current ml-1 align-middle animate-pulse"
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

            {/* Assistant Actions - Only show when not streaming and has content */}
            {shouldShowActions() && (
              <div className="mt-3">
                <AssistantActions message={message} items={items} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Image Modal */}
      {expandedImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={handleCloseExpanded}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative max-w-[90vw] max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={expandedImage} 
              alt="Expanded view"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              onClick={handleCloseExpanded}
              className="absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center"
            >
              ×
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
}