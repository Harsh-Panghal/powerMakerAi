import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { newChat } from "./ChatSlice"; // Import the newChat action

interface CrmState {
  crmActionData: any;
  traceData: any;
  runCrmActionResult: any | null;
  isCrmConnected: CrmConnectionData;
  retryTrigger: boolean;
  isActiveConnection: string;
  connections: Connection[];
  apiTraceLogs: any[]; // Store trace logs from API
  isLoadingTraceLogs: boolean; // Loading state for trace logs
}

interface CrmConnectionData {
  connected: boolean | null;
  connectionName: string;
}

interface Connection {
  connectionName: string;
  isActive: boolean;
}

const initialState: CrmState = {
  crmActionData: "",
  traceData: "",
  runCrmActionResult: null,
  isActiveConnection: "",
  isCrmConnected: { connected: null, connectionName: "" },
  retryTrigger: false,
  connections: [],
  apiTraceLogs: [],
  isLoadingTraceLogs: false, 
};

const crmSlice = createSlice({
  name: "crm",
  initialState,
  reducers: {
    setCrmActionData: (state, action: PayloadAction<any>) => {
      state.crmActionData = action.payload;
    },
    setTraceData: (state, action: PayloadAction<string>) => {
      state.traceData = action.payload;
    },
    setRunCrmActionResult: (state, action: PayloadAction<any>) => {
      state.runCrmActionResult = action.payload;
    },
    setIsActiveConnection: (state, action: PayloadAction<string>) => {
      state.isActiveConnection = action.payload;
    },
    setIsCrmConnected: (state, action: PayloadAction<CrmConnectionData>) => {
      state.isCrmConnected = action.payload;
    },
    setConnections: (state, action: PayloadAction<Connection[]>) => {
      state.connections = action.payload;
    },
    setRetryTrigger: (state) => {
      state.retryTrigger = !state.retryTrigger; // flip to re-run useEffect
    },
    // Actions for trace logs
    setApiTraceLogs: (state, action: PayloadAction<any[]>) => {
      state.apiTraceLogs = action.payload;
    },
    setIsLoadingTraceLogs: (state, action: PayloadAction<boolean>) => {
      state.isLoadingTraceLogs = action.payload;
    },
    clearTraceData: (state) => {
      state.traceData = "";
      state.apiTraceLogs = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(newChat, (state) => {
      state.crmActionData = ""; // Reset crmActionData to an empty string
      state.traceData = ""; // Reset traceData to an empty string
      state.apiTraceLogs = []; //Reset trace logs on new chat
    });
  },
});

export const {
  setCrmActionData,
  setRunCrmActionResult,
  setTraceData,
  setIsCrmConnected,
  setRetryTrigger,
  setIsActiveConnection,
  setConnections,
  setApiTraceLogs, //  Export new action
  setIsLoadingTraceLogs, // Export new action
  clearTraceData, //Export new action
} = crmSlice.actions;

export default crmSlice.reducer;