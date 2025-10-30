import { motion } from "framer-motion";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { PreviewDrawer } from "@/components/chat/PreviewDrawer";

import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useChat } from "../redux/useChat";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import { setChatId, setCurrentThread, setInput } from "../redux/ChatSlice";

const Chat = () => {
  const { chatId: routeChatId } = useParams<{ chatId?: string }>();
  const storeChatId = useSelector((state: RootState) => state.chat.chatId);
  const chatId = routeChatId || storeChatId;

  const { input, onSent } = useChat();

  const currentModel = useSelector(
    (state: RootState) => state.model.currentModel
  );

  // Get currentThread and chatTitle from Redux
  const currentThread = useSelector(
    (state: RootState) => state.chat.currentThread
  );
  // ⭐ NEW: Get the actual chat title from the API response
  const chatTitle = useSelector((state: RootState) => state.chat.chatTitle);

  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch recent chats to get the title
  const { data: recentChatsData } = useQuery({
    queryKey: ["recentChats"],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API}/chat/recentchats`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Update chatId in Redux when route changes
  useEffect(() => {
    if (routeChatId) {
      dispatch(setChatId(routeChatId));
    }
  }, [routeChatId, dispatch]);

  // Handle new chat creation
  const newChatMutation = useMutation({
    mutationFn: async () => {
      return await fetch(`${import.meta.env.VITE_BACKEND_API}/chat/newchat`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentModel }),
      }).then((res) => res.json());
    },
    onSuccess: async (data) => {
      // Set the new thread immediately
      dispatch(
        setCurrentThread({
          title: "New Conversation",
          model: currentModel,
          chatId: data.chatId,
        })
      );

      // Invalidate queries to refresh chat list
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      queryClient.invalidateQueries({ queryKey: ["recentChats"] });
    },
  });

  // Function to handle the prompt
  const handlePrompt = async () => {
    if (!input.trim()) return;

    // Save the input before clearing
    const messageToSend = input;

    try {
      if (!chatId) {
        // Create new chat first
        const data = await newChatMutation.mutateAsync();
        if (data?.chatId) {
          navigate(`/c/${data.chatId}`);
          // Clear input immediately after getting chatId
          dispatch(setInput(""));
          await onSent(messageToSend, data.chatId, 0, currentModel);
          queryClient.invalidateQueries({ queryKey: ["recentChats"] });
        }
      } else {
        // Clear input immediately before sending
        dispatch(setInput(""));
        // Use existing chat
        await onSent(messageToSend, chatId, 0, currentModel);
        queryClient.invalidateQueries({ queryKey: ["recentChats"] });
      }
    } catch (error) {
      console.error("Error handling prompt input:", error);
      // Optionally restore the input on error
      dispatch(setInput(messageToSend));
    }
  };

  // Helper function to get model display name
  const getModelDisplayName = (modelId: number) => {
    const modelMap: Record<string, string> = {
      0: "Model 0.1 - CRM Customization",
      1: "Model 0.2 - Plugin Tracing",
      2: "Model 0.3 - CRM Expert",
    };
    return modelMap[modelId] || modelId;
  };

  // Determine which title to display
  const displayTitle = () => {
    // First, try to get title from recent chats data (for existing chats)
    if (chatId && recentChatsData?.chats) {
      const currentChat = recentChatsData.chats.find(
        (chat: any) => chat.chatId === chatId
      );
      if (currentChat?.title) {
        return currentChat.title;
      }
    }

    // Then check chatTitle from API response (for new messages)
    if (chatTitle && chatTitle.trim()) {
      return chatTitle;
    }

    // Fall back to currentThread title or "New Conversation"
    return currentThread?.title || "New Conversation";
  };

  return (
    <div
      className="flex flex-col bg-layout-main h-[91vh] overflow-hidden"
      data-tour="chat-area"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col h-full"
      >
        {/* Chat Header - Fixed at top */}
        {/* <div className="flex-shrink-0 p-2 border-b border-border bg-layout-main z-10">
          <div className="max-w-4xl px-4">
            <h2 className="text-md sm:text-md font-semibold text-brand break-words">
              {displayTitle()}
            </h2>
            <p className="text-sm text-muted-foreground">
              {getModelDisplayName(currentModel)}
            </p>
          </div>
        </div> */}

        {/* Messages Area - Scrollable with fixed height */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <MessageList />
        </div>

        {/* Chat Input - Fixed at bottom */}
        <div className="flex-shrink-0 bg-layout-main border-t border-border">
          <ChatInput handleSend={handlePrompt} />
        </div>
      </motion.div>

      {/* Preview Drawer */}
      <PreviewDrawer />
    </div>
  );
};

export default Chat;