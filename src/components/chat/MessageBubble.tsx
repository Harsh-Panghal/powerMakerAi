import { useState } from "react";
import { motion } from "framer-motion";
import { User, Bot, Expand, Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { AssistantActions } from "./AssistantActions";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    type: "user" | "assistant";
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

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  const isUser = message.type === "user";
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

  // Check if content contains trace log patterns
  const isTraceLog = (code: string) => {
    return code.includes("// Trace Log") || code.includes("// Operation:") || code.includes("// Stage:");
  };

  // Custom trace log renderer with enhanced styling
  const renderTraceLog = (code: string) => {
    const lines = code.split("\n");
    
    return (
      <div className="my-2 rounded-lg overflow-hidden border border-border shadow-sm">
        <div className="bg-muted/40 px-4 py-2 border-b border-border flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-xs text-muted-foreground ml-2 font-mono">
            Trace Log
          </span>
        </div>
        <div className="bg-slate-950 dark:bg-slate-900 p-4 overflow-x-auto">
          <pre className="text-xs sm:text-sm font-mono leading-relaxed">
            {lines.map((line, idx) => {
              const trimmed = line.trim();

              // Color coding for different log elements
              if (
                trimmed.startsWith("// Trace Log Start") ||
                trimmed.startsWith("// ---")
              ) {
                return (
                  <div key={idx} className="text-cyan-400 font-semibold">
                    {line}
                  </div>
                );
              } else if (
                trimmed.startsWith("// Operation:") ||
                trimmed.startsWith("// Entity:")
              ) {
                return (
                  <div key={idx} className="text-purple-400">
                    {line}
                  </div>
                );
              } else if (trimmed.startsWith("// Record ID:")) {
                return (
                  <div key={idx} className="text-amber-400">
                    {line}
                  </div>
                );
              } else if (trimmed.startsWith("// Stage:")) {
                return (
                  <div key={idx} className="text-green-400 font-semibold">
                    {line}
                  </div>
                );
              } else if (
                trimmed.startsWith("// Message:") ||
                trimmed.startsWith("// Trace:")
              ) {
                return (
                  <div key={idx} className="text-blue-300">
                    {line}
                  </div>
                );
              } else if (
                trimmed.startsWith("// Input Parameters:") ||
                trimmed.startsWith("// Target:")
              ) {
                return (
                  <div key={idx} className="text-yellow-300">
                    {line}
                  </div>
                );
              } else if (
                trimmed.startsWith("// Retrieving") ||
                trimmed.startsWith("// Checking")
              ) {
                return (
                  <div key={idx} className="text-gray-400 italic">
                    {line}
                  </div>
                );
              } else if (
                trimmed.startsWith("// Business Rule") ||
                trimmed.startsWith("// Updated Attribute:")
              ) {
                return (
                  <div key={idx} className="text-emerald-400">
                    {line}
                  </div>
                );
              } else if (
                trimmed.includes("Successfully") ||
                trimmed.includes("Applied")
              ) {
                return (
                  <div key={idx} className="text-green-300">
                    {line}
                  </div>
                );
              } else if (trimmed.startsWith("--")) {
                return (
                  <div key={idx} className="text-gray-500">
                    {line}
                  </div>
                );
              } else {
                return (
                  <div key={idx} className="text-gray-300">
                    {line}
                  </div>
                );
              }
            })}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <>
      <div
        className={`flex ${
          isUser ? "justify-end" : "justify-start"
        } w-full px-2 sm:px-4`}
      >
        <div
          className={`flex ${
            isUser ? "flex-row-reverse" : "flex-row"
          } items-start gap-2 sm:gap-3 max-w-[90%] sm:max-w-[80%] md:max-w-[75%] lg:max-w-[80%]`}
        >
          {/* Avatar */}
          <div
            className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
              isUser
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
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
                  ? "bg-primary text-primary-foreground ml-2 sm:ml-4"
                  : "bg-muted text-foreground mr-2 sm:mr-4"
              }`}
            >
              {/* Message Content */}
              {isStreaming && !hasContent ? (
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
                          {message.images.length} image
                          {message.images.length > 1 ? "s" : ""}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {message.images.map((image, index) => (
                          <div
                            key={index}
                            className="relative group cursor-pointer"
                          >
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

                  {/* Text Content with React Markdown */}
                  {hasContent && (
                    <div className="prose prose-sm max-w-full dark:prose-invert text-sm sm:text-base overflow-hidden">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          // Custom table wrapper with modern styling
                          table: ({ node, ...props }) => (
                            <div className="my-4 w-full overflow-x-auto rounded-xl border border-border shadow-sm bg-card">
                              <table
                                className="min-w-full border-collapse"
                                {...props}
                              />
                            </div>
                          ),
                          // Table header styling
                          thead: ({ node, ...props }) => (
                            <thead className="bg-muted/50 sticky top-0 z-10" {...props} />
                          ),
                          // Table header row styling
                          th: ({ node, ...props }) => (
                            <th
                              className="px-4 py-3.5 text-left text-xs font-semibold text-foreground/90 uppercase tracking-wider border-b border-r border-border last:border-r-0"
                              {...props}
                            />
                          ),
                          // Table body styling
                          tbody: ({ node, ...props }) => (
                            <tbody {...props} />
                          ),
                          // Table row styling
                          tr: ({ node, ...props }) => {
                            const isHeaderRow = node?.position?.start.line === 1;
                            if (isHeaderRow) {
                              return <tr {...props} />;
                            }
                            return (
                              <tr
                                className="transition-colors hover:bg-muted/30 border-b border-border last:border-b-0"
                                {...props}
                              />
                            );
                          },
                          // Table cell styling
                          td: ({ node, ...props }) => (
                            <td
                              className="px-4 py-3 text-sm text-foreground/80 border-r border-border last:border-r-0"
                              {...props}
                            />
                          ),

                          // Code block with syntax highlighting and trace log support
                          code: ({ node, inline, className, children, ...props }: any) => {
                            const match = /language-(\w+)/.exec(className || "");
                            const codeString = String(children).replace(/\n$/, "");
                            
                            // Check if it's a trace log
                            if (!inline && isTraceLog(codeString)) {
                              return renderTraceLog(codeString);
                            }
                            
                            // Regular code block with syntax highlighting
                            if (!inline && match) {
                              return (
                                <SyntaxHighlighter
                                  style={oneDark as any}
                                  language={match[1]}
                                  PreTag="div"
                                  customStyle={{
                                    borderRadius: "0.5rem",
                                    margin: "0.5rem 0"
                                  }}
                                >
                                  {codeString}
                                </SyntaxHighlighter>
                              );
                            }
                            
                            // Inline code
                            return (
                              <code
                                className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
                                {...props}
                              >
                                {children}
                              </code>
                            );
                          },
                          // Paragraph styling
                          p: ({ node, ...props }) => (
                            <p
                              className="mb-2 break-words overflow-wrap-anywhere"
                              {...props}
                            />
                          ),
                          // Strong/bold styling
                          strong: ({ node, ...props }) => (
                            <strong className="font-bold" {...props} />
                          ),
                          // List styling
                          ul: ({ node, ...props }) => (
                            <ul className="list-disc list-inside mb-2" {...props} />
                          ),
                          ol: ({ node, ...props }) => (
                            <ol className="list-decimal list-inside mb-2" {...props} />
                          ),
                          li: ({ node, ...props }) => (
                            <li className="mb-1" {...props} />
                          ),
                          // Blockquote styling
                          blockquote: ({ node, ...props }) => (
                            <blockquote
                              className="border-l-4 border-primary/50 pl-4 italic my-2 text-muted-foreground"
                              {...props}
                            />
                          ),
                          // Heading styling
                          h1: ({ node, ...props }) => (
                            <h1 className="text-2xl font-bold mb-2 mt-4" {...props} />
                          ),
                          h2: ({ node, ...props }) => (
                            <h2 className="text-xl font-bold mb-2 mt-3" {...props} />
                          ),
                          h3: ({ node, ...props }) => (
                            <h3 className="text-lg font-bold mb-2 mt-2" {...props} />
                          ),
                          // Link styling
                          a: ({ node, ...props }) => (
                            <a
                              className="text-primary hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                              {...props}
                            />
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              )}

              {/* Streaming Animation */}
              {isStreaming && hasContent && (
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 0.3, repeat: Infinity }}
                  className="inline-block w-2 h-4 bg-current ml-1 align-middle animate-pulse"
                />
              )}

              {/* Timestamp Tooltip */}
              {showTimestamp && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`absolute -top-8 ${
                    isUser ? "right-0" : "left-0"
                  } bg-popover text-popover-foreground text-xs px-2 py-1 rounded border shadow-lg whitespace-nowrap z-10`}
                >
                  {formatTime(message.timestamp)}
                </motion.div>
              )}
            </motion.div>

            {/* Assistant Actions */}
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