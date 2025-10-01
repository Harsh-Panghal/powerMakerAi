import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import {
  setInput,
  setRecentPrompt,
  setResultData,
  setLoading,
  setShowResult,
  newChat,
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

  const handleResponse = useCallback(
    async (responseData: OpenAPIResponse) => {
      // Manually set crm_action for testing
      // const crm_action =
      //   "create a new entity account with a primary attribute Name and a globaloptionset attribute Bookings and a integer attribute age Invoice";
      const {
        response,
        next_user_responses,
        crm_action,
        tracing_filters,
        title,
      } = responseData;

      // Fetch currentModel from Redux state
      dispatch(setChatTitle(title));
      dispatch(setResultData(response));
      dispatch(setRecommendation(next_user_responses));

      if (currentModel === 0) {
        if (crm_action !== null && crm_action !== "") {
          const crmAction = JSON.parse(crm_action);
          dispatch(setCrmActionData(crmAction));
          dispatch(setDeveloperModeEnable(true));
          dispatch(setRecommendationVisible(false));
          // //console.log("model no0 with crm action", currentModel )
        } else {
          //console.log("crm action is null");
          dispatch(setRecommendationVisible(true));
          dispatch(setDeveloperModeEnable(false));
        }
      } else if (currentModel === 1) {
        if (tracing_filters !== null && tracing_filters !== "") {
          const traceData = JSON.parse(tracing_filters);
          dispatch(setTraceData(traceData));
          dispatch(setRecommendationVisible(false));
          // //console.log("model no1 with tracing", currentModel)
        } else {
          // //console.log("model no1 with tracing", currentModel)
          //console.log("tracing_filters is null");
          dispatch(setRecommendationVisible(true));
        }
      } else {
        dispatch(setRecommendationVisible(true));
      }
    },
    [currentModel, dispatch]
  );

  const runChatMutation = useRunChat(); // 💡 here!
  const onSent = useCallback(
    async (
      prompt: string = input,
      chatId: string,
      action: number = 0,
      model: number = 0
    ) => {
      if (!prompt.trim()) return;

      dispatch(newChat());
      dispatch(setLoading(true));
      dispatch(setShowResult(true));
      dispatch(setRecentPrompt(prompt));
      dispatch(setCreditStatus(true));
      //console.log(model);

      try {
        // call the chat api
        const responseData = await runChatMutation.mutateAsync({
          prompt,
          chatId: chatId ?? "",
          action,
          model,
        });
        if ("status" in responseData && !responseData.status) {
          dispatch(setCreditStatus(false));
          return;
        }

        if (prompt !== "" || responseData.response !== "") {
          dispatch(
            addToHistory({
              chatId: chatId ?? "",
              entry: { prompt: prompt, response: responseData.response },
            })
          );
        }
        // handling response
        handleResponse(responseData);
      } catch (error) {
        console.error("Error handling the response:", error);
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, input, handleResponse, concatenatedPrompts]
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
