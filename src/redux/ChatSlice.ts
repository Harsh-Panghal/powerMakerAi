import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SavedResultinLocalInterface {
  prompt: string;
  response: string;
  developerModeText: string[];
}

interface ChatState {
  input: string;
  recentPrompt: string;
  prevPrompt: string[];
  showResult: boolean;
  loading: boolean;
  resultData: string;
  recommendation: string[];
  recommendationVisible: boolean;
  savedResults: { prompt: string; response: string }[];
  developerModeText: string[];
  developerModeEnable: boolean;
  savedResultsInLocal: SavedResultinLocalInterface[]; // Store chat history
  chatTitle: string;
  concatenatedPrompts: string;
  creditStatus?: boolean;
  chatId: string | null; // Add chatId to the state
  recentImages: string[]; // Add this for storing recent images
}

const initialState: ChatState = {
  input: "",
  recentPrompt: "",
  prevPrompt: [],
  showResult: false,
  loading: false,
  resultData: "",
  recommendation: [],
  recommendationVisible: false,
  savedResults: [],
  developerModeText: [],
  developerModeEnable: false,
  savedResultsInLocal: [], // Default empty chat list
  chatTitle: "",
  concatenatedPrompts: "",
  chatId: null, // Initialize chatId as null,
  creditStatus: true,
  recentImages: [], // Add this- initialize as empty array
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setInput: (state, action: PayloadAction<string>) => {
      state.input = action.payload;
    },
    setRecentPrompt: (state, action: PayloadAction<string>) => {
      state.recentPrompt = action.payload;
    },
    setPrevPrompt: (state, action: PayloadAction<string[]>) => {
      state.prevPrompt = action.payload;
    },
    setShowResult: (state, action: PayloadAction<boolean>) => {
      state.showResult = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setResultData: (state, action: PayloadAction<string>) => {
      state.resultData = action.payload;
    },
    setCreditStatus: (state, action: PayloadAction<boolean>) => {
      state.creditStatus = action.payload;
    },
    setRecommendation: (state, action: PayloadAction<string[]>) => {
      state.recommendation = action.payload;
    },
    setRecommendationVisible: (state, action: PayloadAction<boolean>) => {
      state.recommendationVisible = action.payload;
    },
    saveResult: (
      state,
      action: PayloadAction<{ prompt: string; response: string }>
    ) => {
      state.savedResults.push(action.payload);
    },
    setDeveloperModeText: (state, action: PayloadAction<string>) => {
      state.developerModeText.push(action.payload);
    },
    setDeveloperModeEnable: (state, action: PayloadAction<boolean>) => {
      state.developerModeEnable = action.payload;
    },
    // Add this new reducer for setting recent images
    setRecentImages: (state, action: PayloadAction<string[]>) => {
      state.recentImages = action.payload;
    },
    newChat: (state) => {
      state.input = "";
      state.recentPrompt = "";
      state.resultData = "";
      state.showResult = false;
      state.loading = false;
      state.developerModeEnable = false;
      state.developerModeText = [];
      state.recommendationVisible = false;
      state.recommendation = [];
      state.recentImages = []; // Add this to clear images on new chat
    },
    setConcatenatedPrompts: (state, action: PayloadAction<string>) => {
      state.concatenatedPrompts = action.payload;
    },
    setChatTitle: (state, action: PayloadAction<string>) => {
      state.chatTitle = action.payload;
    },
    // for local chat history
    setChatHistory: (state, action: PayloadAction<any[]>) => {
      state.savedResultsInLocal = action.payload;
    },
    clearChatHistory: (state) => {
      state.savedResultsInLocal = [];
    },
    setChatId: (state, action: PayloadAction<string | null>) => {
      state.chatId = action.payload;
    },
  },
});

export const {
  setInput,
  setRecentPrompt,
  setPrevPrompt,
  setShowResult,
  setLoading,
  setResultData,
  setRecommendation,
  setRecommendationVisible,
  saveResult,
  setDeveloperModeEnable,
  setDeveloperModeText,
  setRecentImages, // Add this export
  newChat,
  setChatHistory,
  clearChatHistory,
  setChatTitle,
  setChatId,
  setConcatenatedPrompts,
  setCreditStatus,
} = chatSlice.actions;

export default chatSlice.reducer;