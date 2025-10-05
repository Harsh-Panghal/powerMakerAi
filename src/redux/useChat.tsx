import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import {
  setInput,
  setRecentPrompt,
  setResultData,
  setLoading,
  setShowResult,
  setRecommendationVisible,
  setRecommendation,
  setChatTitle,
  setCreditStatus,
} from "./ChatSlice";
import { setCrmActionData, setTraceData } from "./CrmSlice";
import { setDeveloperModeEnable } from "./ChatSlice";
import useRunChat from "../config/api config/chat-api";
import { useCallback } from "react";
import { addToHistory } from "./chatHistorySlice";

interface OpenAPIResponse {
  title: string;
  response: string;
  next_user_responses: string[];
  timestamp: string;
  crm_action: string | null;
  tracing_filters: string | null;
  status?: boolean;
}

export const useChat = () => {
  const dispatch: AppDispatch = useDispatch();

  const {
    input,
    recentPrompt,
    showResult,
    loading,
    resultData,
    recommendation,
    recommendationVisible,
    savedResults,
  } = useSelector((state: RootState) => state.chat);

  const { developerModeEnable, concatenatedPrompts } = useSelector(
    (state: RootState) => state.chat
  );
  const { currentModel } = useSelector((state: RootState) => state.model);

  // ⭐ NEW: Streaming function for smooth word-by-word animation
  const streamText = useCallback(
    async (text: string, onUpdate: (chunk: string) => void) => {
      let displayedText = '';
      
      // Split by words for natural streaming
      const words = text.split(' ');
      
      for (let i = 0; i < words.length; i++) {
        // Add space before word (except first word)
        displayedText += (i > 0 ? ' ' : '') + words[i];
        onUpdate(displayedText);
        
        // Adjust speed: 20ms = fast, 40ms = medium, 60ms = slow
        await new Promise(resolve => setTimeout(resolve, 35));
      }
      
      return displayedText;
    },
    []
  );

  const handleResponse = useCallback(
    async (responseData: OpenAPIResponse) => {
      const {
        response,
        next_user_responses,
        crm_action,
        tracing_filters,
        title,
      } = responseData;

      // Set chat title
      dispatch(setChatTitle(title));
      
      // ⭐ UPDATED: Stream the response instead of setting it all at once
      console.log("Starting response streaming...");
      await streamText(response, (chunk) => {
        dispatch(setResultData(chunk));
      });
      console.log("Response streaming completed");

      // Set recommendations after streaming completes
      dispatch(setRecommendation(next_user_responses || []));

      if (currentModel === 0) {
        if (crm_action !== null && crm_action !== "") {
          try {
            const crmAction = JSON.parse(crm_action);
            dispatch(setCrmActionData(crmAction));
            dispatch(setDeveloperModeEnable(true));
            dispatch(setRecommendationVisible(false));
          } catch (error) {
            console.error("Error parsing crm_action:", error);
            dispatch(setRecommendationVisible(true));
            dispatch(setDeveloperModeEnable(false));
          }
        } else {
          dispatch(setRecommendationVisible(true));
          dispatch(setDeveloperModeEnable(false));
        }
      } else if (currentModel === 1) {
        if (tracing_filters !== null && tracing_filters !== "") {
          try {
            const traceData = JSON.parse(tracing_filters);
            dispatch(setTraceData(traceData));
            dispatch(setRecommendationVisible(false));
          } catch (error) {
            console.error("Error parsing tracing_filters:", error);
            dispatch(setRecommendationVisible(true));
          }
        } else {
          dispatch(setRecommendationVisible(true));
        }
      } else {
        dispatch(setRecommendationVisible(true));
      }
    },
    [currentModel, dispatch, streamText]
  );

  const runChatMutation = useRunChat();
  
  const onSent = useCallback(
    async (
      prompt: string,
      chatId: string,
      action: number = 0,
      model: number = 0
    ) => {
      console.log("=== onSent called ===");
      console.log("Prompt:", prompt);
      console.log("ChatId:", chatId);
      console.log("Action:", action);
      console.log("Model:", model);

      if (!prompt.trim()) {
        console.warn("Empty prompt provided");
        return;
      }

      // Set loading states
      console.log("Setting loading state to true...");
      dispatch(setLoading(true));
      dispatch(setShowResult(true));
      dispatch(setRecentPrompt(prompt));
      dispatch(setCreditStatus(true));
      
      // ⭐ IMPORTANT: Clear previous result data to show "thinking" indicator
      dispatch(setResultData(""));
      dispatch(setRecommendationVisible(false));

      try {
        console.log("Calling API mutation...");
        
        // Call the chat API
        const responseData = await runChatMutation.mutateAsync({
          prompt,
          chatId: chatId ?? "",
          action,
          model,
        });
        
        console.log("Response received:", responseData);
        console.log("Response type:", typeof responseData);
        console.log("Response keys:", Object.keys(responseData || {}));

        // Check for credit status
        if ("status" in responseData && responseData.status === false) {
          console.warn("Credit status is false");
          dispatch(setCreditStatus(false));
          dispatch(setLoading(false));
          return;
        }

        // Validate response data
        if (!responseData || typeof responseData !== "object") {
          console.error("Invalid response format:", responseData);
          throw new Error("Invalid response format");
        }

        if (!responseData.response) {
          console.error("No response text in API response");
          console.error("Response data:", JSON.stringify(responseData, null, 2));
          throw new Error("No response text in API response");
        }

        console.log("Response validation passed");
        console.log("Response text length:", responseData.response.length);

        // ⭐ UPDATED: Handle response with streaming (loading will be set to false after streaming)
        console.log("Handling response with streaming...");
        await handleResponse(responseData);
        console.log("Response handled successfully");

        // ⭐ UPDATED: Add to history AFTER streaming completes
        if (prompt.trim() && responseData.response.trim()) {
          console.log("Adding to history...");
          dispatch(
            addToHistory({
              chatId: chatId ?? "",
              entry: { 
                prompt: prompt.trim(), 
                response: responseData.response.trim() 
              },
            })
          );
          console.log("Added to history");
        }
        
      } catch (error) {
        console.error("Error in onSent:");
        console.error("Error object:", error);
        console.error("Error message:", error instanceof Error ? error.message : "Unknown error");
        console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
        
        // ⭐ UPDATED: Stream error message as well
        const errorMessage = error instanceof Error 
          ? `Error: ${error.message}` 
          : "Something went wrong. Please try again.";
        
        console.log("Streaming error message:", errorMessage);
        await streamText(errorMessage, (chunk) => {
          dispatch(setResultData(chunk));
        });
        dispatch(setRecommendationVisible(false));
      } finally {
        console.log("Setting loading to false");
        dispatch(setLoading(false));
        console.log("=== onSent completed ===\n");
      }
    },
    [dispatch, handleResponse, runChatMutation, streamText]
  );

  return {
    input,
    recentPrompt,
    showResult,
    loading,
    resultData,
    recommendation,
    recommendationVisible,
    developerModeEnable,
    savedResults,
    onSent,
    setInput: (value: string) => dispatch(setInput(value)),
  };
};