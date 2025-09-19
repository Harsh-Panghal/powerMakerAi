import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase config/firebase.config";
import { secureAxios } from "../config/firebase config/firebase.auth";
import { useDispatch, useSelector } from "react-redux";
import { setIsCrmConnected } from "../redux/CrmSlice";
import { RootState } from "../store/store";
import { useToast } from "@/hooks/use-toast";

secureAxios.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken(true);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🔁 Retry once on 401 due to expired token
secureAxios.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loop
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;

      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken(true); // Refresh the token
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return secureAxios(originalRequest); // Retry the request
      }
    }
    return Promise.reject(error);
  }
);

const AppInitializer = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { retryTrigger } = useSelector((state: RootState) => state.crm);
  const { isAuthenticated,  } = useSelector((state: RootState) => state.auth);

  // Helper function to show success toast
  const showSuccessToast = (message: string) => {
    toast({
      title: "Success",
      description: message,
      className: "border-brand bg-brand/10 text-brand",
      duration: 3000,
    });
  };

  // Helper function to show error toast
  const showErrorToast = (message: string) => {
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
      className: "border-error bg-error/10 text-error",
      duration: 4000,
    });
  };

  useEffect(() => {
    const tryCrmConnection = async () => {
      try {
        const crmRes = await fetch(`${import.meta.env.VITE_BACKEND_API}/users/crm-connection`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        const crmData = await crmRes.json();
        if (crmData.success) {
          dispatch(setIsCrmConnected({ connected: crmData.success, connectionName: crmData.connectionName }));
          // Uncomment if you want to show success toast for CRM connection
          // showSuccessToast("Dataverse connection established");
        } else {
          dispatch(setIsCrmConnected({ connected: crmData.success, connectionName: crmData.connectionName }));
          showErrorToast(crmData.message || "Failed to connect to CRM");
        }

      } catch (error) {
        console.error("Initialization error:", error);
        dispatch(setIsCrmConnected({ connected: false, connectionName: "" }));
        showErrorToast("Connection error. Please try again");
      }
    };

    tryCrmConnection();
  }, [retryTrigger, toast, dispatch]); // Added toast and dispatch to dependencies

  useEffect(() => {
    const initializeApp = () => {
      onAuthStateChanged(auth, async (user) => {
        if (!user) {
          //console.log("User not signed in");
          dispatch(setIsCrmConnected({ connected: false, connectionName: "" }));
          return;
        }

        try {
          const token = await user.getIdToken(true);

          // Step 1: Verify Firebase token with backend
          const verifyRes = await fetch(
            `${import.meta.env.VITE_BACKEND_API}/chat/auth`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ userId: user.uid }),
              credentials: "include",
            }
          );

          if (!verifyRes.ok) {
            console.error("Token verification failed");
            dispatch(setIsCrmConnected({ connected: false, connectionName: "" }));
            showErrorToast("Authentication failed. Please sign in again");
            return;
          }

          // Step 2: Fetch conversation history
          await secureAxios.get("/chat/conversationhistory");

          // Step 3: Connect to CRM
          const crmRes = await fetch(`${import.meta.env.VITE_BACKEND_API}/users/crm-connection`, {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });

          const crmData = await crmRes.json();
          if (crmData.success) {
            dispatch(setIsCrmConnected({ connected: crmData.success, connectionName: crmData.connectionName }));
            // Optionally show success toast for CRM connection during initialization
            // showSuccessToast("CRM connection established");
          } else {
            dispatch(setIsCrmConnected({ connected: crmData.success, connectionName: crmData.connectionName }));
            // Only show error toast if there's a specific error message
            if (crmData.message && crmData.message !== "No CRM connection found") {
              showErrorToast(crmData.message);
            }
          }

        } catch (error) {
          console.error("Initialization error:", error);
          dispatch(setIsCrmConnected({ connected: false, connectionName: "" }));
          showErrorToast("Failed to initialize application. Please refresh the page");
        }
      });
    };

    initializeApp();
  }, [isAuthenticated, dispatch, toast]); // Added toast to dependencies

  return <>{children}</>;
};

export default AppInitializer;