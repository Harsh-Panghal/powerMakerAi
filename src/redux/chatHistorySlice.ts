import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { newChat } from "./ChatSlice";

type MessagePair = {
    prompt: string;
    response: string;
};

type ChatHistoryState = {
    [chatId: string]: MessagePair[];
};

const initialState: ChatHistoryState = {};

const chatHistorySlice = createSlice({
    name: "chatHistory",
    initialState,
    reducers: {
        setFullHistory: (state, action: PayloadAction<{ chatId: string; history: MessagePair[] }>) => {
            state[action.payload.chatId] = action.payload.history;
        },
        addToHistory: (state, action: PayloadAction<{ chatId: string; entry: MessagePair }>) => {
            const { chatId, entry } = action.payload;
            if (!state[chatId]) {
                state[chatId] = [];
            }
            // Prevent duplicate entries
            const isDuplicate = state[chatId].some(
                (item) => item.prompt === entry.prompt && item.response === entry.response
            );
            if (!isDuplicate) {
                state[chatId].push(entry);
            }
        },
        clearHistoryForChat: (state, action: PayloadAction<string>) => {
            delete state[action.payload];
        },
        clearAllHistory: () => {
            return {};
        },
    },
    extraReducers: (builder) => {
        builder.addCase(newChat, (state, action) => {
            // Don't clear all history, just reset for the current chat if needed
            // The chatId should be passed or handled separately
        });
    },
});

export const { setFullHistory, addToHistory, clearHistoryForChat, clearAllHistory } = chatHistorySlice.actions;
export default chatHistorySlice.reducer;