import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const dispatch = useDispatch();
  // Get data from Redux store - use proper selectors to avoid unnecessary rerenders

  const chatId = useSelector((state: RootState) => state.chat.chatId);
  const recentPrompt = useSelector(
    (state: RootState) => state.chat.recentPrompt
  );
  const resultData = useSelector((state: RootState) => state.chat.resultData);
  const loading = useSelector((state: RootState) => state.chat.loading);

  // Memoize history selector to prevent unnecessary rerenders
  const history = useSelector((state: RootState) => {
    if (!chatId) return [];
    return state.chatHistory[chatId] || [];
  });

  // Fetch chat history from backend
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
  // Log fetch errors
  useEffect(() => {
    if (fetchError) {
      console.error("Chat history fetch error:", fetchError);
    }
  }, [fetchError]);

  // Parse and store chat history in Redux
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

  // Clear prompt/result when chatId changes
  const prevChatIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (chatId && prevChatIdRef.current !== chatId && history.length > 0) {
      refetch();
      prevChatIdRef.current = chatId;
    }
  }, [chatId, history.length, refetch]);

  // Helper to create proper message objects
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

  // Convert chat history to message format
  const historyMessages = history.flatMap((item, index) => [
    createMessage(`user-${chatId}-${index}`, item.prompt, "user"),
    createMessage(`assistant-${chatId}-${index}`, item.response, "assistant"),
  ]);

  // Add current conversation (if exists and not duplicate)
  const currentMessages: any[] = [];

  // FIXED: Better deduplication logic with null safety
  const isCurrentInHistory =
    recentPrompt &&
    resultData &&
    history.some(
      (item) =>
        item.prompt?.trim() === recentPrompt?.trim() &&
        item.response?.trim() === resultData?.trim()
    );

  // Only show current messages if they're not already saved in history
  if (!isCurrentInHistory) {
    if (recentPrompt && recentPrompt.trim()) {
      currentMessages.push(createMessage(`current-user`, recentPrompt, "user"));
    }

    // UPDATED: Show thinking indicator when loading with no content
    if (loading) {
      // Show streaming message (empty or partial content)
      currentMessages.push(
        createMessage(`current-assistant`, resultData || "", "assistant", true)
      );
    } else if (resultData && resultData.trim()) {
      // Show completed message
      currentMessages.push(
        createMessage(`current-assistant`, resultData, "assistant", false)
      );
    }
  }

  const allMessages = [...historyMessages, ...currentMessages];

  // Find the last assistant message index
  let lastAssistantIndex = -1;
  for (let i = allMessages.length - 1; i >= 0; i--) {
    if (allMessages[i].type === "assistant") {
      lastAssistantIndex = i;
      break;
    }
  }

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  };

  const handleScroll = () => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;

    setShowScrollToBottom(!isAtBottom);
    setIsUserScrolling(!isAtBottom);
  };

  // Auto-scroll when messages change (unless user is manually scrolling)
  useEffect(() => {
    if (!isUserScrolling) {
      scrollToBottom(true);
    }
  }, [allMessages.length, resultData, isUserScrolling]);

  // Reset scrolling state when chat changes
  useEffect(() => {
    setIsUserScrolling(false);
    scrollToBottom(false);
  }, [chatId]);

  return (
    <div className="h-full relative">
      {/* Messages Container - Now takes full height of parent */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto overflow-x-hidden px-2 sm:px-4 py-2 "
      >
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 ">
          <AnimatePresence initial={false}>
            {allMessages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <MessageBubble
                  message={message}
                  items={data?.followUpPrompts}
                  isLast={index === lastAssistantIndex}
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