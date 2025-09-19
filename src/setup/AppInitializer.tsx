import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase config/firebase.config";
import { secureAxios } from "../config/firebase config/firebase.auth";
import { useDispatch, useSelector } from "react-redux";
import { setConnections, setIsCrmConnected } from "../redux/CrmSlice";
import { RootState } from "../store/store";
import { useToast } from "@/hooks/use-toast";

// ✅ Setup secureAxios interceptors once
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
  const { retryTrigger, connections } = useSelector((state: RootState) => state.crm);

  // 🔑 1) Run chat/auth only once on login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        dispatch(setIsCrmConnected({ connected: false, connectionName: "" }));
        return;
      }

      try {
        const token = await user.getIdToken(true);
        // console.log("User logged in, token:", token);
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
          dispatch(setIsCrmConnected({ connected: false, connectionName: "" }));
          toast({
            variant: "destructive",
            title: "Error",
            description: "No CRM connections found",
          });
          return;
        }

        dispatch(setConnections(data.connections));
      } catch (err) {
        console.error("Auth init error:", err);
        dispatch(setIsCrmConnected({ connected: false, connectionName: "" }));
      }
    });

    return () => unsubscribe();
  }, [dispatch, toast]);

  // 🔁 2) Run CRM connect logic when retryTrigger OR connections change
  useEffect(() => {
    if (!connections?.length) return;

    const connectToActiveCrm = async () => {
      const activeConnection = connections.find((c: any) => c.isActive);
      if (!activeConnection) {
        dispatch(setIsCrmConnected({ connected: false, connectionName: "" }));
        toast({
          variant: "destructive",
          title: "Error",
          description: "Connection failed. No connections are active.",
        });
        return;
      }

      try {
        const crmRes = await fetch(
          `${import.meta.env.VITE_BACKEND_API}/users/crm-connection`,
          {
            method: "POST", // ✅ use POST since body is required
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ connectionName: activeConnection.connectionName }),
          }
        );

        const crmData = await crmRes.json();
        if (crmData.success) {
          dispatch(setIsCrmConnected({
            connected: true,
            connectionName: activeConnection.connectionName,
          }));
          toast({
            title: "Success",
            description: `${crmData.message} with ${activeConnection.connectionName}`,
          });
        } else {
          dispatch(setIsCrmConnected({
            connected: false,
            connectionName: "",
          }));
          toast({
            variant: "destructive",
            title: "Error",
            description: crmData.message || "Failed to connect to CRM",
          });
        }
      } catch (err) {
        dispatch(setIsCrmConnected({ connected: false, connectionName: "" }));
        toast({
          variant: "destructive",
          title: "Error",
          description: "CRM connection error",
        });
      }
    };

    connectToActiveCrm();
  }, [retryTrigger, dispatch, toast]);

  return <>{children}</>;
};

export default AppInitializer;