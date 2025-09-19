import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the user type
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  phoneNumber: string | null;
  providerData: Array<{
    providerId: string;
  }>;
}


// Define the auth state type
interface AuthState {
  isAuthenticated: boolean;
  isAuthLoading: boolean
  user: User | null;
  showSignIn: boolean;
}

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  isAuthLoading: true,
  user: null,
  showSignIn: false,
};

// Create the auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setisAuthenticated(state, action: PayloadAction<User>) {
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    clearUser(state) {
      state.isAuthenticated = false;
      state.user = null;
    },
    setShowSignIn(state, action: PayloadAction<boolean>) {
      state.showSignIn = action.payload;
    },
    setAuthLoading(state, action: PayloadAction<boolean>) {
      state.isAuthLoading = action.payload;
    }
  },
});

export const { setisAuthenticated, clearUser, setShowSignIn, setAuthLoading } = authSlice.actions;
export default authSlice.reducer;
