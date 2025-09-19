import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { newChat } from "./ChatSlice"; // Import the newChat action

interface CrmState {
  crmActionData: any;
  traceData: any;
  runCrmActionResult: any | null;
  isCrmConnected: CrmConnectionData;
  retryTrigger: boolean;
}

interface CrmConnectionData {
  connected: boolean | null;
  connectionName: string;
}

const initialState: CrmState = {
  crmActionData: "",
  traceData: "",
  runCrmActionResult: null,
  isCrmConnected: { connected: null, connectionName: "" },
  retryTrigger: false,
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

    setIsCrmConnected: (state, action: PayloadAction<CrmConnectionData>) => {
      state.isCrmConnected = action.payload;
    },
    setRetryTrigger: (state) => {
      state.retryTrigger = !state.retryTrigger; // flip to re-run useEffect
    },
  },
  extraReducers: (builder) => {
    builder.addCase(newChat, (state) => {
      state.crmActionData = ""; // Reset crmActionData to an empty string
      state.traceData = ""; // Reset traceData to an empty string
    });
  },
});

export const { setCrmActionData, setRunCrmActionResult, setTraceData, setIsCrmConnected, setRetryTrigger } = crmSlice.actions;

export default crmSlice.reducer;
