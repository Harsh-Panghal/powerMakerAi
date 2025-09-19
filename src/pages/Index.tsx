import { PowerMakerLayout } from "@/components/PowerMakerLayout";
import AppInitializer from "@/setup/AppInitializer";
import { monitorAuthState } from "../config/firebase config/firebase.config";
import store from "../store/store";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useEffect } from "react";
import Auth from "./Auth";

const Index = () => {
  // console.log("Index component rendering");
  const { isAuthenticated, isAuthLoading } = useSelector(
    (state: RootState) => state.auth
  ); // Get authentication state from Redux

  useEffect(() => {
    // Start monitoring Firebase auth state
    monitorAuthState(store.dispatch);
  }, []);

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-white">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthLoading) {
    return (
      <>
        {isAuthenticated ? (
          <AppInitializer>
            <PowerMakerLayout />
          </AppInitializer>
        ) : (
          <Auth />
        )}
      </>
    );
  }
};

export default Index;
