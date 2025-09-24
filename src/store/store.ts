import { configureStore } from "@reduxjs/toolkit";
import chatReducer from "../redux/ChatSlice";
import crmReducer from "../redux/CrmSlice";
import authReducer from "../redux/AuthSlice";
import modelReducer from "../redux/ModelSlice";
import chatHistoryReducer from "../redux/chatHistorySlice";
// import notificationReducer from "../redux/notificationSlice";
// import sidebarSlice from "../redux/SidebarSlice";

const store = configureStore({
  reducer: {
    chat: chatReducer,
    crm: crmReducer,
    auth: authReducer,
    model: modelReducer,
    chatHistory: chatHistoryReducer,
    // notification: notificationReducer,
    // sidebar: sidebarSlice
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
