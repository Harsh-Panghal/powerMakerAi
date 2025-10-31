import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase config/firebase.config";
import { secureAxios } from "../config/firebase config/firebase.auth";
import { useDispatch, useSelector } from "react-redux";
import { setConnections, setIsCrmConnected } from "../redux/CrmSlice";
import { RootState } from "../store/store";
import { useToast } from "@/hooks/use-toast";

// Setup secureAxios interceptors once
secureAxios.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken(true);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

secureAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken(true);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return secureAxios(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

const AppInitializer = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { retryTrigger, connections, isCrmConnected } = useSelector((state: RootState) => state.crm);

  // 1) Run auth and fetch connections only once on login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        dispatch(setIsCrmConnected({ connected: false, connectionName: "" }));
        dispatch(setConnections([]));
        return;
      }

      try {
        const token = await user.getIdToken(true);
        // console.log("User logged in, fetching connections...");
        
        // verify user
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
          dispatch(setIsCrmConnected({ connected: false, connectionName: "" }));
          return;
        }

        // fetch connections once
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_API}/users/get-crm-connection-names`,
          { credentials: "include" }
        );
        const data = await res.json();

        if (!data.success || !data.connections?.length) {
          dispatch(setConnections([]));
          dispatch(setIsCrmConnected({ connected: false, connectionName: "" }));
          toast({
            variant: "destructive",
            title: "Error",
            description: "No CRM connections found",
          });
          return;
        }

        // console.log("Connections fetched:", data.connections);
        dispatch(setConnections(data.connections));
        
        // Immediately try to connect to active connection
        await attemptCrmConnection(data.connections);
        
      } catch (err) {
        // console.error("Auth init error:", err);
        dispatch(setIsCrmConnected({ connected: false, connectionName: "" }));
      }
    });

    return () => unsubscribe();
  }, [dispatch, toast]); // Only depend on dispatch and toast

  // Helper function to attempt CRM connection
  const attemptCrmConnection = async (connectionsToUse?: any[]) => {
    const connectionsData = connectionsToUse || connections;
    
    if (!connectionsData?.length) {
      // console.log("No connections available for CRM connection");
      return;
    }

    const activeConnection = connectionsData.find((c: any) => c.isActive);
    
    if (!activeConnection) {
      // console.log("No active connection found");
      dispatch(setIsCrmConnected({ connected: false, connectionName: "" }));
      toast({
        variant: "destructive",
        title: "Error",
        description: "No active connection found. Please set a connection as active.",
      });
      return;
    }

    // console.log("Attempting to connect to:", activeConnection.connectionName);
    
    // Set connecting state
    dispatch(setIsCrmConnected({ 
      connected: null, 
      connectionName: activeConnection.connectionName 
    }));

    try {
      const crmRes = await fetch(
        `${import.meta.env.VITE_BACKEND_API}/users/crm-connection`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ connectionName: activeConnection.connectionName }),
        }
      );

      const crmData = await crmRes.json();
      
      if (crmData.success) {
        // console.log("CRM connection successful:", activeConnection.connectionName);
        dispatch(setIsCrmConnected({
          connected: true,
          connectionName: activeConnection.connectionName,
        }));
        toast({
          title: "Connection Established",
          description: `${crmData.message} with ${activeConnection.connectionName}`,
          className: "border-success bg-success/10 text-success-dark",
        });
      } else {
        // console.log("CRM connection failed:", crmData.message);
        dispatch(setIsCrmConnected({
          connected: false,
          connectionName: activeConnection.connectionName,
        }));
        toast({
          variant: "destructive",
          title: "Connection Failed",
          description: crmData.message || "Failed to connect to CRM",
        });
      }
    } catch (err) {
      // console.error("CRM connection error:", err);
      dispatch(setIsCrmConnected({ 
        connected: false, 
        connectionName: activeConnection.connectionName 
      }));
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to connect to CRM. Network error occurred.",
      });
    }
  };

  // 🔁 2) Handle retry trigger separately
  useEffect(() => {
    if (retryTrigger && connections?.length) {
      // console.log("Retry triggered, attempting reconnection...");
      attemptCrmConnection();
    }
  }, [retryTrigger]); // Only depend on retryTrigger, not connections

  return <>{children}</>;
};

export default AppInitializer;