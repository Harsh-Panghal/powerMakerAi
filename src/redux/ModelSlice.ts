// store/modelSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ModelState {
  currentModel: number;
}

const initialState: ModelState = {
  currentModel: 0,
};

const modelSlice = createSlice({
  name: "model",
  initialState,
  reducers: {
    setCurrentModel(state, action: PayloadAction<number>) {
      state.currentModel = action.payload;
    },
  },
});

export const { setCurrentModel } = modelSlice.actions;
export default modelSlice.reducer;
