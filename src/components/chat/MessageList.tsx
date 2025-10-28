import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { useQuery } from "@tanstack/react-query";
import { setFullHistory } from "@/redux/chatHistorySlice";
import { MessageBubble } from "./MessageBubble";

export function MessageList() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [previousMessageCount, setPreviousMessageCount] = useState(0);
  const lastScrollTopRef = useRef(0);
  const scrollVelocityRef = useRef(0);
  const dispatch = useDispatch();

  const chatId = useSelector((state: RootState) => state.chat.chatId);
  const recentPrompt = useSelector(
    (state: RootState) => state.chat.recentPrompt
  );
  const resultData = useSelector((state: RootState) => state.chat.resultData);
  const loading = useSelector((state: RootState) => state.chat.loading);

  const history = useSelector((state: RootState) => {
    if (!chatId) return [];
    return state.chatHistory[chatId] || [];
  });

  const {
    data,
    refetch,
    error: fetchError,
  } = useQuery({
    queryKey: ["chats", chatId],
    queryFn: async () => {
      if (!chatId) return null;

      const url = `${
        import.meta.env.VITE_BACKEND_API
      }/chat/chats/:id?chatId=${chatId}`;
      console.log("Fetching chat history from:", url);

      const res = await fetch(url, {
        credentials: "include",
      });

      if (!res.ok) {
        console.error(
          "Failed to fetch chat history:",
          res.status,
          res.statusText
        );
        throw new Error(`Failed to fetch: ${res.status}`);
      }

      const data = await res.json();
      console.log("Chat history fetched:", data);
      return data;
    },
    enabled: !!chatId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    retry: 1,
  });

  useEffect(() => {
    if (fetchError) {
      console.error("Chat history fetch error:", fetchError);
    }
  }, [fetchError]);

  useEffect(() => {
    if (data?.history && data?.history.length !== 0 && chatId) {
      const parsed = [];
      for (let i = 0; i < data.history.length; i++) {
        const userMsg = data.history[i];
        const modelMsg = data.history[i + 1];
        if (userMsg?.role === "user" && modelMsg?.role === "model") {
          parsed.push({
            prompt: userMsg.parts?.[0]?.text || "",
            response: modelMsg.parts?.[0]?.text || "",
          });
          i++;
        }
      }
      dispatch(setFullHistory({ chatId, history: parsed }));
    }
  }, [data, chatId, dispatch]);

  const prevChatIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (chatId && prevChatIdRef.current !== chatId && history.length > 0) {
      refetch();
      prevChatIdRef.current = chatId;
    }
  }, [chatId, history.length, refetch]);

  const createMessage = (
    id: string,
    content: string,
    type: "user" | "assistant",
    isStreaming = false
  ) => ({
    id,
    content,
    type,
    timestamp: new Date(),
    isStreaming,
    images: [] as Array<{
      data: string;
      name: string;
      size: number;
      type: string;
    }>,
  });

  const historyMessages = history.flatMap((item, index) => [
    createMessage(`user-${chatId}-${index}`, item.prompt, "user"),
    createMessage(`assistant-${chatId}-${index}`, item.response, "assistant"),
  ]);

  const currentMessages: any[] = [];

  const isCurrentInHistory =
    recentPrompt &&
    resultData &&
    history.some(
      (item) =>
        item.prompt?.trim() === recentPrompt?.trim() &&
        item.response?.trim() === resultData?.trim()
    );

  if (!isCurrentInHistory) {
    if (recentPrompt && recentPrompt.trim()) {
      currentMessages.push(createMessage(`current-user`, recentPrompt, "user"));
    }

    if (loading) {
      currentMessages.push(
        createMessage(`current-assistant`, resultData || "", "assistant", true)
      );
    } else if (resultData && resultData.trim()) {
      currentMessages.push(
        createMessage(`current-assistant`, resultData, "assistant", false)
      );
    }
  }

  const allMessages = [...historyMessages, ...currentMessages];

  let lastAssistantIndex = -1;
  for (let i = allMessages.length - 1; i >= 0; i--) {
    if (allMessages[i].type === "assistant") {
      lastAssistantIndex = i;
      break;
    }
  }

  // Enhanced scroll with spring animation
  const scrollToBottom = (smooth = true, withSpring = false) => {
    if (!messagesEndRef.current) return;

    if (withSpring && containerRef.current) {
      // Smooth spring animation for button clicks
      const container = containerRef.current;
      const targetScroll = container.scrollHeight - container.clientHeight;
      const currentScroll = container.scrollTop;
      const distance = targetScroll - currentScroll;

      let start: number | null = null;
      const duration = 600;

      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

      const animate = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const eased = easeOutCubic(progress);

        container.scrollTop = currentScroll + distance * eased;

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    } else {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "end",
      });
    }
  };

  // Calculate scroll velocity
  const handleScroll = () => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;

    // Calculate velocity
    const velocity = scrollTop - lastScrollTopRef.current;
    scrollVelocityRef.current = velocity;
    lastScrollTopRef.current = scrollTop;

    setShowScrollToBottom(!isAtBottom);

    // Only set isUserScrolling if we're scrolling up with intent
    if (!isAtBottom && velocity < -5) {
      // Negative velocity = scrolling up
      setIsUserScrolling(true);
    } else if (isAtBottom) {
      setIsUserScrolling(false);
      setNewMessageCount(0); // Reset count when at bottom
    }
  };

  // Track new messages while scrolled up
  useEffect(() => {
    const currentCount = allMessages.length;
    if (currentCount > previousMessageCount && isUserScrolling) {
      setNewMessageCount((prev) => prev + (currentCount - previousMessageCount));
    }
    setPreviousMessageCount(currentCount);
  }, [allMessages.length, isUserScrolling, previousMessageCount]);

  // ENHANCED: Smooth upward push animation on new prompt
  useEffect(() => {
    if (recentPrompt && recentPrompt.trim()) {
      setIsUserScrolling(false);
      setNewMessageCount(0);

      // Prepare for smooth push animation
      if (containerRef.current) {
        const container = containerRef.current;
        const wasAtBottom =
          container.scrollHeight - container.scrollTop - container.clientHeight <
          100;

        if (wasAtBottom) {
          // Instant scroll for new messages when already at bottom
          requestAnimationFrame(() => {
            scrollToBottom(false);
          });
        } else {
          // Smooth scroll if user was viewing history
          setTimeout(() => {
            scrollToBottom(true);
          }, 100);
        }
      }
    }
  }, [recentPrompt]);

  // ENHANCED: Smooth scroll during streaming with better control
  useEffect(() => {
    if (!isUserScrolling && resultData && loading) {
      // During streaming, use smooth scroll
      const container = containerRef.current;
      if (container) {
        const isNearBottom =
          container.scrollHeight - container.scrollTop - container.clientHeight <
          200;

        if (isNearBottom) {
          requestAnimationFrame(() => {
            scrollToBottom(true);
          });
        }
      }
    }
  }, [resultData, isUserScrolling, loading]);

  // Reset scrolling state when chat changes with smooth transition
  useEffect(() => {
    setIsUserScrolling(false);
    setNewMessageCount(0);
    setPreviousMessageCount(0);
    
    // Smooth scroll to bottom when switching chats
    setTimeout(() => {
      scrollToBottom(true);
    }, 100);
  }, [chatId]);

  // Auto-pause scroll detection (when user hovers over a message)
  const [isHoveringMessage, setIsHoveringMessage] = useState(false);

  return (
    <div className="h-full relative">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto overflow-x-hidden px-2 sm:px-4 py-2 scroll-smooth"
        style={{
          scrollBehavior: isUserScrolling ? "auto" : "smooth",
        }}
      >
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          <AnimatePresence mode="popLayout" initial={false}>
            {allMessages.map((message, index) => (
              <motion.div
                key={message.id}
                layout // Enable layout animations for smooth push effect
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                    mass: 0.5
                  }
                }}
                exit={{ 
                  opacity: 0, 
                  y: -20, 
                  scale: 0.95,
                  transition: { duration: 0.2 }
                }}
                transition={{
                  layout: {
                    type: "spring",
                    stiffness: 350,
                    damping: 25,
                  },
                }}
                onHoverStart={() => setIsHoveringMessage(true)}
                onHoverEnd={() => setIsHoveringMessage(false)}
              >
                <MessageBubble
                  message={message}
                  items={data?.followUpPrompts}
                  isLast={index === lastAssistantIndex}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Enhanced Scroll to Bottom Button with Badge */}
      <AnimatePresence>
        {showScrollToBottom && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 20
              }
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.8, 
              y: 20,
              transition: { duration: 0.2 }
            }}
            className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 z-10"
          >
            <div className="relative">
              {/* New message badge */}
              {newMessageCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ 
                    scale: 1,
                    transition: {
                      type: "spring",
                      stiffness: 500,
                      damping: 15
                    }
                  }}
                  className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg border-2 border-background z-10"
                >
                  {newMessageCount > 9 ? "9+" : newMessageCount}
                </motion.div>
              )}
              
              <Button
                onClick={() => {
                  setIsUserScrolling(false);
                  setNewMessageCount(0);
                  scrollToBottom(true, true); // Enable spring animation
                }}
                size="sm"
                className="rounded-full bg-background border border-border shadow-lg hover:bg-muted text-xs sm:text-sm px-2 sm:px-4 hover:shadow-xl transition-all duration-200 hover:scale-105"
                variant="outline"
              >
                <motion.div
                  animate={{ 
                    y: [0, -3, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="flex items-center"
                >
                  <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                </motion.div>
                <span className="hidden sm:inline">
                  {newMessageCount > 0 ? "New messages" : "Scroll to latest"}
                </span>
                <span className="sm:hidden">
                  {newMessageCount > 0 ? "New" : "Latest"}
                </span>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Smooth gradient overlay at top when scrolled */}
      <AnimatePresence>
        {showScrollToBottom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-layout-main to-transparent pointer-events-none z-5"
          />
        )}
      </AnimatePresence>
    </div>
  );
}