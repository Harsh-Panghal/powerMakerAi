// store/slices/chatHistorySlice.ts
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
            if (!state[chatId]) state[chatId] = [];
            state[chatId].push(entry);
        },
    },
    extraReducers: (builder) => {
        builder.addCase(newChat, (state) => {
            state.setFullHistory = [];

        });
    },
});

export const { setFullHistory, addToHistory } = chatHistorySlice.actions;
export default chatHistorySlice.reducer;
