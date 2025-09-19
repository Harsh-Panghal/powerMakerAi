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
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

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

  // Helper function to safely parse JSON response
  const safeJsonParse = async (response: Response) => {
    const text = await response.text();
    
    // Check if response is HTML (common for error pages)
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      console.error('Received HTML instead of JSON:', text.substring(0, 200));
      throw new Error(`Server returned HTML instead of JSON. Status: ${response.status}`);
    }
    
    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Response text:', text);
      throw new Error('Invalid JSON response from server');
    }
  };

  useEffect(() => {
    const tryCrmConnection = async () => {
      try {
        console.log('Attempting CRM connection to:', `${import.meta.env.VITE_BACKEND_API}/users/crm-connection`);
        
        const crmRes = await fetch(`${import.meta.env.VITE_BACKEND_API}/users/crm-connection`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        console.log('CRM response status:', crmRes.status, crmRes.statusText);
        
        if (!crmRes.ok) {
          throw new Error(`HTTP error! status: ${crmRes.status}`);
        }
        
        const crmData = await safeJsonParse(crmRes);
        
        if (crmData.success) {
          dispatch(setIsCrmConnected({ connected: crmData.success, connectionName: crmData.connectionName }));
          // Uncomment if you want to show success toast for CRM connection
          // showSuccessToast("Dataverse connection established");
        } else {
          dispatch(setIsCrmConnected({ connected: crmData.success, connectionName: crmData.connectionName }));
          showErrorToast(crmData.message || "Failed to connect to CRM");
        }

      } catch (error) {
        console.error("CRM connection error:", error);
        dispatch(setIsCrmConnected({ connected: false, connectionName: "" }));
        showErrorToast("Connection error. Please try again");
      }
    };

    tryCrmConnection();
  }, [retryTrigger, toast, dispatch]);

  useEffect(() => {
    const initializeApp = () => {
      onAuthStateChanged(auth, async (user) => {
        if (!user) {
          console.log("User not signed in");
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
            console.error("Token verification failed:", verifyRes.status, verifyRes.statusText);
            dispatch(setIsCrmConnected({ connected: false, connectionName: "" }));
            showErrorToast("Authentication failed. Please sign in again");
            return;
          }

          // Step 2: Fetch conversation history
          await secureAxios.get("/chat/conversationhistory");

          // Step 3: Connect to CRM
          console.log('Attempting CRM connection during initialization to:', `${import.meta.env.VITE_BACKEND_API}/users/crm-connection`);
          
          const crmRes = await fetch(`${import.meta.env.VITE_BACKEND_API}/users/crm-connection`, {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });

          console.log('CRM initialization response status:', crmRes.status, crmRes.statusText);
          
          if (!crmRes.ok) {
            throw new Error(`HTTP error! status: ${crmRes.status}`);
          }

          const crmData = await safeJsonParse(crmRes);
          
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
  }, [isAuthenticated, dispatch, toast]);

  return <>{children}</>;
};

export default AppInitializer;