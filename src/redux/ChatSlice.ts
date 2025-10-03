import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SavedResultinLocalInterface {
  prompt: string;
  response: string;
  developerModeText: string[];
}

interface CurrentThread {
  title: string;
  model: string | number;
  chatId?: string;
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
  savedResultsInLocal: SavedResultinLocalInterface[];
  chatTitle: string;
  concatenatedPrompts: string;
  creditStatus?: boolean;
  chatId: string | null;
  currentThread: CurrentThread | null;
  // Preview state
  isPreviewOpen: boolean;
  previewContent: string;
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
  savedResultsInLocal: [],
  chatTitle: "",
  concatenatedPrompts: "",
  chatId: null,
  creditStatus: true,
  currentThread: null,
  // Initialize preview state
  isPreviewOpen: false,
  previewContent: "",
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
      state.currentThread = null;
      state.isPreviewOpen = false;
      state.previewContent = "";
    },
    setConcatenatedPrompts: (state, action: PayloadAction<string>) => {
      state.concatenatedPrompts = action.payload;
    },
    setChatTitle: (state, action: PayloadAction<string>) => {
      state.chatTitle = action.payload;
    },
    setChatHistory: (state, action: PayloadAction<any[]>) => {
      state.savedResultsInLocal = action.payload;
    },
    clearChatHistory: (state) => {
      state.savedResultsInLocal = [];
    },
    setChatId: (state, action: PayloadAction<string | null>) => {
      state.chatId = action.payload;
    },
    setCurrentThread: (state, action: PayloadAction<CurrentThread | null>) => {
      state.currentThread = action.payload;
    },
    // Preview actions
    openPreview: (state, action: PayloadAction<string>) => {
      state.isPreviewOpen = true;
      state.previewContent = action.payload;
    },
    closePreview: (state) => {
      state.isPreviewOpen = false;
      state.previewContent = "";
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
  newChat,
  setChatHistory,
  clearChatHistory,
  setChatTitle,
  setChatId,
  setConcatenatedPrompts,
  setCreditStatus,
  setCurrentThread,
  openPreview,
  closePreview,
} = chatSlice.actions;

export default chatSlice.reducer;