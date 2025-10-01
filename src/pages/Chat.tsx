import { motion } from "framer-motion";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { PreviewDrawer } from "@/components/chat/PreviewDrawer";

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useChat } from "../redux/useChat";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import { setChatId, setCurrentThread } from "../redux/ChatSlice";

// Define the expected response type from backend
interface ChatDataResponse {
  chatId: string;
  title: string;
  model: string | number;
  messages?: any[];
  createdAt?: string;
  updatedAt?: string;
}

const Chat = () => {
  const { chatId: routeChatId } = useParams<{ chatId?: string }>();
  const storeChatId = useSelector((state: RootState) => state.chat.chatId);
  const chatId = routeChatId || storeChatId;

  const { input, onSent } = useChat();
  
  const currentModel = useSelector(
    (state: RootState) => state.model.currentModel
  );

  // Get currentThread from Redux
  const currentThread = useSelector((state: RootState) => state.chat.currentThread);

  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch chat details when chatId changes
  const { data: chatData, isLoading: isChatLoading } = useQuery<ChatDataResponse | null>({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      if (!chatId) return null;
      
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API}/chat/${chatId}`,
        {
          credentials: "include",
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch chat");
      }
      
      return response.json();
    },
    enabled: !!chatId, // Only run if chatId exists
  });

  // Update currentThread when chat data is loaded
  useEffect(() => {
    if (chatData) {
      dispatch(setCurrentThread({
        title: chatData.title || "New Conversation",
        model: chatData.model || currentModel,
        chatId: chatData.chatId || chatId || "",
      }));
    }
  }, [chatData, dispatch, currentModel, chatId]);

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
      dispatch(setCurrentThread({
        title: "New Conversation",
        model: currentModel,
        chatId: data.chatId,
      }));
      
      // Invalidate queries to refresh chat list
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      queryClient.invalidateQueries({ queryKey: ["recentChats"] });
    },
  });

  const handlePrompt = async () => {
    if (!input.trim()) return;

    try {
      if (!chatId) {
        // Create new chat first
        const data = await newChatMutation.mutateAsync();
        if (data?.chatId) {
          navigate(`/c/${data.chatId}`);
          await onSent(input, data.chatId, 0, currentModel);
          queryClient.invalidateQueries({ queryKey: ["recentChats"] });
        }
      } else {
        // Use existing chat
        await onSent(input, chatId, 0, currentModel);
        queryClient.invalidateQueries({ queryKey: ["recentChats"] });
      }
    } catch (error) {
      console.error("Error handling prompt input:", error);
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

  const { recentPrompt } = useSelector(
    (state: RootState) => state.chat
  );
  const history =
    useSelector((state: RootState) => state.chatHistory[chatId ?? ""]) || [];

  return (
    <div
      className="flex-1 flex flex-col bg-layout-main h-[82%]"
      data-tour="chat-area"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 flex flex-col h-full"
      >
        {/* Chat Header */}
        <div className="p-2 border-b border-border bg-layout-main">
          <div className="max-w-4xl px-4">
            {isChatLoading ? (
              <div className="animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            ) : (
              <>
                <h2 className="text-md sm:text-md font-semibold text-brand break-words">
                  {currentThread?.title || "New Conversation"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {getModelDisplayName(currentModel)}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Scrollable Messages Area */}
        <div className="flex-1 overflow-hidden">
          <MessageList />
        </div>

        {/* Fixed Chat Input */}
        <div className="bg-layout-main absolute w-full bottom-0">
          <ChatInput handleSend={handlePrompt} />
        </div>
      </motion.div>

      {/* Preview Drawer */}
      <PreviewDrawer />
    </div>
  );
};

export default Chat;