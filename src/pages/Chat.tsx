import { motion } from "framer-motion";
import { useChatStore } from "@/store/chatStore";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { PreviewDrawer } from "@/components/chat/PreviewDrawer";

import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase config/firebase.config";
import { useParams, useNavigate } from "react-router-dom";
import { useChat } from "../redux/useChat";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import { setChatId } from "../redux/ChatSlice";

const Chat = () => {
  const { currentThread } = useChatStore();

  const { input, onSent } = useChat();
  const { chatId: routeChatId } = useParams<{ chatId?: string }>();
  const storeChatId = useSelector((state: RootState) => state.chat.chatId);
  const chatId = routeChatId || storeChatId;

  const currentModel = useSelector(
    (state: RootState) => state.model.currentModel
  );

  const dispatch = useDispatch();

  useEffect(() => {
    if (routeChatId) {
      dispatch(setChatId(routeChatId));
    }
  }, [routeChatId]);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  //handle newchat api
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
      //console.log("New chat created with ID:", data);
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      navigate(`/c/${data.chatId}`);
      // send the prompt using the new chatId
      queryClient.invalidateQueries({ queryKey: ["recentChats"] });
      queryClient.invalidateQueries({ queryKey: ["recentChats"] });

      // REMOVE THIS: becoz it tigger twice, once when onSuccess mutation and once from handleprompt
      // await onSent(input, data.chatId, 0, currentModel); // Send the prompt to the chat      
    },
  });
  const handlePrompt = async () => {
    if (!input.trim()) return;

    try {
      if (!chatId) {
        const data = await newChatMutation.mutateAsync();
        if (data?.chatId) {
          navigate(`/c/${data.chatId}`);
          await onSent(input, data.chatId, 0, currentModel);
          queryClient.invalidateQueries({ queryKey: ["recentChats"] });
        }
      } else {
        await onSent(input, chatId, 0, currentModel);
        queryClient.invalidateQueries({ queryKey: ["recentChats"] });
      }
    } catch (error) {
      console.error("Error handling prompt input:", error);
    }
  };

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
        <div className="p-2  border-b border-border bg-layout-main">
          <div className="max-w-4xl px-4">
            <h2 className="text-md sm:text-md font-semibold text-brand break-words">
              {currentThread?.title || "New Conversation"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Model:{" "}
              {currentThread?.model === "model-0-1"
                ? "Model 0.1 - CRM Customization"
                : currentThread?.model === "model-0-2"
                ? "Model 0.2 - Plugin Tracing"
                : "Model 0.3 - CRM Expert"}
            </p>
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
