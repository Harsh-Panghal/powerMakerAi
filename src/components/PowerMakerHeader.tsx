import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  Bell,
  CheckCircle,
  User,
  UserPlus,
  LogOut,
  X,
  Camera,
  Filter,
  Settings,
  Database,
  Key,
  LogIn,
  HelpCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSidebar } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useChatStore } from "@/store/chatStore";
import { useToast } from "@/components/ui/use-toast";
import { PowerMakerTour, usePowerMakerTour } from "./PowerMakerTour";
import { handleSignOut } from "@/config/firebase config/firebase.auth";
import { useQueryClient } from "@tanstack/react-query";
import { AvatarImage } from "@/components/ui/avatar";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import { onAuthStateChanged } from "firebase/auth";
import { auth, firestore } from "../config/firebase config/firebase.config";
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  arrayUnion,
  increment,
} from "firebase/firestore";
import { setRetryTrigger } from "../redux/CrmSlice";

const modelOptions = [
  {
    value: "model-0-1",
    title: "Model 0.1",
    subtitle: "CRM Customization",
    icon: Settings,
  },
  {
    value: "model-0-2",
    title: "Model 0.2",
    subtitle: "Plugin Tracing",
    icon: Database,
  },
  {
    value: "model-0-3",
    title: "Model 0.3",
    subtitle: "CRM Expert",
    icon: Key,
  },
];

const getFirstName = (displayName?: string): string => {
  if (!displayName) return "";
  return displayName.split(" ")[0];
};

export function PowerMakerHeader() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  const {
    selectedModel,
    setModel,
    isNotificationOpen,
    notifications,
    openNotifications,
    closeNotifications,
    highlightedNotificationId,
  } = useChatStore();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  // Invite form state
  const [inviteMode, setInviteMode] = useState<"email" | "link">("email");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLink, setInviteLink] = useState<string>("");
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showTour, setShowTour] = useState(false);

  // Use Redux state as primary source
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const { isCrmConnected, connections } = useSelector(
    (state: RootState) => state.crm
  );
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Local state for current Firebase user (for real-time updates)
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Firebase authentication listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setCurrentUser(firebaseUser);
    });

    return () => unsubscribe();
  }, []);

  const { hasCompletedTour, resetTour } = usePowerMakerTour();

  // Connection status configuration based on Redux state from AppInitializer
  const getConnectionStatus = () => {
    // No connections available
    if (!connections || connections.length === 0) {
      return {
        icon: <AlertCircle className="w-4 h-4 text-destructive" />,
        text: "No CRM connections found",
        textColor: "text-destructive",
        status: "no-connections",
      };
    }

    // Find active connection
    const activeConnection = connections.find((c: any) => c.isActive);

    if (!activeConnection) {
      return {
        icon: <AlertCircle className="w-4 h-4 text-destructive" />,
        text: "No active connection",
        textColor: "text-destructive",
        status: "no-active",
      };
    }

    // Check connection status
    if (isCrmConnected.connected === null) {
      return {
        icon: <Loader2 className="w-4 h-4 text-warning animate-spin" />,
        text: "Connecting...",
        textColor: "text-warning",
        status: "connecting",
      };
    } else if (isCrmConnected.connected === false) {
      return {
        icon: <AlertCircle className="w-4 h-4 text-destructive" />,
        text: `Failed to connect to ${activeConnection.connectionName}`,
        textColor: "text-destructive",
        status: "failed",
      };
    } else {
      // Successfully connected
      return {
        icon: (
          <img
            src="/Dataverse_scalable.svg"
            alt={activeConnection.connectionName}
            className="w-4 h-4 text-success"
          />
        ),
        text: activeConnection.connectionName,
        textColor: "text-success-dark",
        status: "connected",
      };
    }
  };

  const currentConnection = getConnectionStatus();

  // Auto-show tour for new users
  useEffect(() => {
    if (isAuthenticated && hasCompletedTour === false) {
      const timer = setTimeout(() => {
        setShowTour(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, hasCompletedTour]);

  const handleLogout = async () => {
    const didLogout = await handleSignOut();
    if (!didLogout) return;
    queryClient.removeQueries({ queryKey: ["recentChats"] });
    navigate("/");
  };

  // Handle connection status click - retry connection if failed
  const handleConnectionClick = () => {
    if (
      currentConnection.status === "failed" ||
      currentConnection.status === "no-active"
    ) {
      dispatch(setRetryTrigger());
    }
  };

  // Fetch the user's referral link from Firestore
  useEffect(() => {
    const fetchReferralLink = async () => {
      if (!user?.uid) return;

      try {
        const docRef = doc(firestore, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setInviteLink(data.referralLink || "");
        } else {
          console.warn("User document not found");
        }
      } catch (error) {
        console.error("Error fetching referral link:", error);
      }
    };

    fetchReferralLink();
  }, [user?.uid]);

  // Invite handlers with link and email
  const handleInviteWithLink = () => {
    setInviteMode("link");
    setInviteEmail(inviteLink);
  };

  const handleInviteWithEmail = () => {
    setInviteMode("email");
    setInviteEmail("");
  };

  // Handle invite link copy
  const handleCopyLink = async () => {
    navigator.clipboard.writeText(inviteEmail);
    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 2000);
  };

  // Handle invite send
  const handleSendInvite = async () => {
    if (inviteMode === "link") {
      handleCopyLink();
      return;
    }

    // Validation for email mode
    if (!inviteEmail) {
      toast({
        title: "Email required",
        description: "Please enter an email address.",
        variant: "destructive",
      });
      return;
    }

    if (!inviteLink) {
      toast({
        title: "Referral link missing",
        description: "Referral link not found. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (!user?.uid) {
      toast({
        title: "Authentication required",
        description: "Please log in to send invites.",
        variant: "destructive",
      });
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setSending(true);

    try {
      // 1. Get current user doc
      const userRef = doc(firestore, "users", user.uid);
      const userSnap = await getDoc(userRef);

      let referredTo: string[] = [];

      if (userSnap.exists()) {
        const userData = userSnap.data();
        referredTo = userData.referredTo || [];

        // 2. Check if email is already invited
        if (referredTo.includes(inviteEmail)) {
          toast({
            title: "Already invited",
            description: "This email has already been invited.",
          });
          setSending(false);
          return;
        }
      }

      // 3. Send invite via backend
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_API}/users/send-invite`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: inviteEmail.trim(),
            inviteLink: inviteLink,
            inviterId: user.uid,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        toast({
          title: "Invite sent!",
          description: "Invite sent successfully!",
          className: "border-success bg-success/10 text-success-dark",
        });

        // 4. Update Firestore: add email to sentTo, increment credits
        if (userSnap.exists()) {
          await updateDoc(userRef, {
            referredTo: arrayUnion(inviteEmail.trim()),
            credits: increment(10),
            "referralRewards.sharedLinkCount": increment(1),
          });
        } else {
          await setDoc(userRef, {
            referredTo: [inviteEmail.trim()],
            credits: 110,
            referralRewards: {
              sharedLinkCount: 1,
              signedUpFromReferrals: 0,
            },
          });
        }

        setInviteEmail("");
      } else {
        console.error("Backend error:", data);
        toast({
          title: "Failed to send invite",
          description: data.error || data.message || "Failed to send invite.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Send invite error:", err);
      toast({
        title: "Error",
        description:
          "Network error. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleDeleteAccount = () => {
    console.log("Deleting account...");
    setShowDeleteDialog(false);
  };

  // Get user data with fallback logic
  const userData = currentUser || user;
  const userPhotoURL = currentUser?.photoURL;
  const userDisplayName = currentUser?.displayName || user?.displayName;

  const firstName = ((fullName: string = "") => {
    const first = fullName.trim().split(" ")[0] || "";
    return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
  })(userDisplayName || "");

  return (
    <>
      <header
        className="h-14 flex items-center justify-between px-2 sm:px-4 border-b border-border bg-background"
        data-tour="header"
      >
        {/* left section */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="mr-1 sm:mr-2"
            data-tour="hamburger"
          >
            <Menu className="w-5 h-5" />
          </Button>
          {/* model selector */}
          <div
            className="flex items-center flex-1 justify-start px-2 max-w-[120px] sm:max-w-xs md:max-w-sm"
            data-tour="model-selector"
          >
            <Select
              value={selectedModel}
              onValueChange={(value) => {
                setModel(value);
                navigate("/");
              }}
              data-guide="model-selector"
            >
              <SelectTrigger className="w-full min-w-[100px] sm:min-w-[140px] max-w-[120px] sm:max-w-[200px] h-8 border border-border/40 bg-background/80 backdrop-blur-sm hover:bg-muted/30 transition-colors duration-200 rounded-md shadow-sm">
                <SelectValue>
                  <span className="text-xs sm:text-sm font-medium text-brand truncate">
                    <span className="hidden lg:inline">
                      {selectedModel === "model-0-1"
                        ? "0.1 - CRM Customization"
                        : selectedModel === "model-0-2"
                        ? "0.2 - Plugin Tracing"
                        : "0.3 - CRM Expert"}
                    </span>
                    <span className="lg:hidden">
                      {selectedModel === "model-0-1"
                        ? "0.1 - CRM"
                        : selectedModel === "model-0-2"
                        ? "0.2 - Plugin"
                        : "0.3 - Expert"}
                    </span>
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="min-w-[100px] sm:min-w-[140px] lg:min-w-[200px] border-border/40 bg-background/95 backdrop-blur-sm">
                {modelOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="focus:bg-accent/50 focus:text-brand"
                    >
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium truncate">
                            {option.title}
                          </span>
                          <span className="text-muted-foreground text-xs truncate">
                            {option.subtitle}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* right section */}
        <div className="flex items-center space-x-1 sm:space-x-4">
          {/* Connection Status - Now using data from AppInitializer */}
          {isAuthenticated && (
            <div
              className={`hidden md:flex items-center space-x-2 text-sm ${
                currentConnection.status === "failed" ||
                currentConnection.status === "no-active"
                  ? "cursor-pointer hover:opacity-80"
                  : ""
              }`}
              data-tour="connection-status"
              onClick={
                currentConnection.status === "failed" ||
                currentConnection.status === "no-active"
                  ? handleConnectionClick
                  : undefined
              }
              title={
                currentConnection.status === "failed" ||
                currentConnection.status === "no-active"
                  ? "Click to retry connection"
                  : ""
              }
            >
              {currentConnection.icon}
              <span
                className={`${currentConnection.textColor} hidden lg:inline`}
              >
                {currentConnection.text}
              </span>
              <span className={`${currentConnection.textColor} lg:hidden`}>
                {currentConnection.status === "connecting"
                  ? "Connecting..."
                  : currentConnection.status === "failed"
                  ? "Failed"
                  : currentConnection.status === "connected"
                  ? "Connected"
                  : "No Connection"}
              </span>
            </div>
          )}

          {/* Mobile Connection Status - Just icon, also clickable if failed */}
          <div
            className={`md:hidden ${
              currentConnection.status === "failed" ||
              currentConnection.status === "no-active"
                ? "cursor-pointer hover:opacity-80"
                : ""
            }`}
            onClick={
              currentConnection.status === "failed" ||
              currentConnection.status === "no-active"
                ? handleConnectionClick
                : undefined
            }
            title={
              currentConnection.status === "failed" ||
              currentConnection.status === "no-active"
                ? "Click to retry connection"
                : ""
            }
          >
            {currentConnection.icon}
          </div>

          {/* Notification Bell */}
          <Sheet
            open={isNotificationOpen}
            onOpenChange={(open) =>
              open ? openNotifications() : closeNotifications()
            }
          >
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" data-guide="notifications-bell">
                <Bell className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[90vw] sm:w-96 max-w-md flex flex-col"
            >
              <SheetHeader className="flex-shrink-0">
                <SheetTitle className="flex items-center justify-between">
                  Notifications
                  <Button variant="ghost" size="sm">
                    <Filter className="w-4 h-4" />
                  </Button>
                </SheetTitle>
              </SheetHeader>

              <Tabs
                defaultValue="all"
                className="mt-4 flex flex-col flex-1 min-h-0"
              >
                <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="activities">Activities</TabsTrigger>
                  <TabsTrigger value="updates">Updates</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-4 flex-1 min-h-0">
                  <div className="h-full overflow-y-auto pr-2 space-y-4">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`border rounded-lg p-4 space-y-2 transition-all duration-300 ${
                          highlightedNotificationId === notification.id
                            ? "bg-brand/10 border-brand shadow-lg ring-2 ring-brand/20 animate-pulse"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">
                            {notification.title}
                          </h4>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              highlightedNotificationId === notification.id
                                ? "bg-brand text-white border-brand"
                                : ""
                            }`}
                          >
                            {notification.type}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>Start: {notification.startDate}</p>
                          <p>End: {notification.endDate}</p>
                          <p>Plugin: {notification.plugin}</p>
                          <p>Stage: {notification.stage}</p>
                        </div>
                        <Button size="sm" variant="outline" className="w-full">
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="activities" className="mt-4 flex-1 min-h-0">
                  <div className="h-full overflow-y-auto pr-2 space-y-4">
                    {notifications
                      .filter((n) => n.type === "activity")
                      .map((notification) => (
                        <div
                          key={notification.id}
                          className={`border rounded-lg p-4 space-y-2 transition-all duration-300 ${
                            highlightedNotificationId === notification.id
                              ? "bg-brand/10 border-brand shadow-lg ring-2 ring-brand/20 animate-pulse"
                              : "hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">
                              {notification.title}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {notification.type}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p>Start: {notification.startDate}</p>
                            <p>End: {notification.endDate}</p>
                            <p>Plugin: {notification.plugin}</p>
                            <p>Stage: {notification.stage}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                          >
                            View
                          </Button>
                        </div>
                      ))}
                  </div>
                </TabsContent>

                <TabsContent value="updates" className="mt-4 flex-1 min-h-0">
                  <div className="h-full overflow-y-auto pr-2 space-y-4">
                    {notifications
                      .filter((n) => n.type === "update")
                      .map((notification) => (
                        <div
                          key={notification.id}
                          className={`border rounded-lg p-4 space-y-2 transition-all duration-300 ${
                            highlightedNotificationId === notification.id
                              ? "bg-brand/10 border-brand shadow-lg ring-2 ring-brand/20 animate-pulse"
                              : "hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">
                              {notification.title}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {notification.type}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p>Start: {notification.startDate}</p>
                            <p>End: {notification.endDate}</p>
                            <p>Plugin: {notification.plugin}</p>
                            <p>Stage: {notification.stage}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                          >
                            View
                          </Button>
                        </div>
                      ))}
                  </div>
                </TabsContent>
              </Tabs>
            </SheetContent>
          </Sheet>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center space-x-1 sm:space-x-2 p-1 sm:p-2 h-auto"
                data-guide="user-menu"
              >
                <Avatar className="w-7 h-7 sm:w-8 sm:h-8">
                  {userPhotoURL ? (
                    <AvatarImage
                      src={userPhotoURL}
                      alt="User Avatar"
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : null}
                  <AvatarFallback className="text-sm bg-blue-500 text-white font-medium">
                    {firstName?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-sm font-medium text-foreground">
                  {firstName || "User"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48"
              data-guide="user-menu"
            >
              <DropdownMenuItem onClick={() => setShowProfileDialog(true)}>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowInviteDialog(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  resetTour();
                  setShowTour(true);
                }}
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Take a Tour
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowLogoutDialog(true)}
                className="text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Profile Dialog/Drawer */}
      {isMobile ? (
        <Drawer open={showProfileDialog} onOpenChange={setShowProfileDialog}>
          <DrawerContent className="max-h-[95vh]">
            <DrawerHeader>
              <DrawerTitle className="text-center text-lg">Profile</DrawerTitle>
              <div className="flex justify-center">
                <div className="flex items-center text-sm text-muted-foreground">
                  <span>Tokens</span>
                  <span className="ml-2 flex items-center">
                    <span className="w-2 h-2 bg-warning rounded-full mr-1"></span>
                    569
                  </span>
                </div>
              </div>
            </DrawerHeader>

            <div className="p-4 space-y-6 overflow-y-auto">
              {/* Profile Image */}
              <div className="flex justify-center">
                <div className="relative">
                  <Avatar className="w-20 h-20 bg-muted">
                    <AvatarFallback className="text-xl">H</AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    className="absolute -bottom-1 -right-1 rounded-full w-7 h-7 p-0 bg-brand hover:bg-brand/90"
                  >
                    <Camera className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" defaultValue="Alessio" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail</Label>
                  <Input id="email" defaultValue="yoroka1002@gmail.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input id="company" defaultValue="Lorem Ipsum is simpl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Select defaultValue="manager">
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="developer">Developer</SelectItem>
                      <SelectItem value="analyst">Analyst</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address1">Address Line 1</Label>
                  <Input id="address1" placeholder="Enter" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address2">Address Line 2</Label>
                  <Input id="address2" placeholder="Enter" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="Enter" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">Zip Code</Label>
                  <Input id="zip" placeholder="Enter" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" placeholder="Enter" />
                </div>
              </div>

              <div className="flex flex-col space-y-3 pb-4">
                <Button className="w-full h-12 bg-brand hover:bg-brand/90 text-white text-base">
                  Update
                </Button>
                <Button
                  variant="ghost"
                  className="w-full h-12 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 text-base"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
          <DialogContent className="profile-dialog sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-center text-lg">Profile</DialogTitle>
              <div className="flex justify-end">
                <div className="flex items-center text-sm text-muted-foreground">
                  <span>Tokens</span>
                  <span className="ml-2 flex items-center">
                    <span className="w-2 h-2 bg-warning rounded-full mr-1"></span>
                    569
                  </span>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              {/* Profile Image */}
              <div className="flex justify-center">
                <div className="relative">
                  <Avatar className="w-24 h-24 bg-muted">
                    <AvatarFallback className="text-2xl">H</AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-brand hover:bg-brand/90"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" defaultValue="Alessio" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail</Label>
                  <Input id="email" defaultValue="yoroka1002@gmail.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input id="company" defaultValue="Lorem Ipsum is simpl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Select defaultValue="manager">
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="developer">Developer</SelectItem>
                      <SelectItem value="analyst">Analyst</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address1">Address Line 1</Label>
                  <Input id="address1" placeholder="Enter" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address2">Address Line 2</Label>
                  <Input id="address2" placeholder="Enter" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="Enter" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">Zip Code</Label>
                  <Input id="zip" placeholder="Enter" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" placeholder="Enter" />
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <Button className="w-full bg-brand hover:bg-brand/90 text-white">
                  Update
                </Button>
                <Button
                  variant="ghost"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Invite Dialog/Drawer */}
      {isMobile ? (
        <Drawer
          open={showInviteDialog}
          onOpenChange={(open) => {
            setShowInviteDialog(open);
            if (!open) {
              setInviteMode("email");
              setInviteEmail("");
            }
          }}
        >
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Invite people</DrawerTitle>
              <DrawerDescription>
                Lorem Ipsum is simply dummy text of the printing
              </DrawerDescription>
            </DrawerHeader>

            <div className="p-4 space-y-6">
              <div className="flex flex-col space-y-3">
                <Button
                  onClick={handleInviteWithEmail}
                  variant={inviteMode === "email" ? "default" : "outline"}
                  className={`w-full h-12 text-base ${
                    inviteMode === "email"
                      ? "bg-brand hover:bg-brand/90 text-white"
                      : ""
                  }`}
                >
                  Invite with email
                </Button>
                <Button
                  onClick={handleInviteWithLink}
                  variant={inviteMode === "link" ? "default" : "outline"}
                  className={`w-full h-12 text-base ${
                    inviteMode === "link"
                      ? "bg-brand hover:bg-brand/90 text-white"
                      : ""
                  }`}
                >
                  Invite with link
                </Button>
              </div>

              <div className="space-y-3">
                <Label className="text-base">Add Team</Label>
                <div className="flex flex-col space-y-3">
                  <Input
                    placeholder={
                      inviteMode === "email" ? "Enter email" : "Invite link"
                    }
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="h-12 text-base"
                    readOnly={inviteMode === "link"}
                  />
                  <Button
                    onClick={handleSendInvite}
                    className="w-full h-12 bg-brand hover:bg-brand/90 text-white text-base"
                    disabled={
                      (inviteMode === "email" && (sending || !inviteEmail)) ||
                      (inviteMode === "link" && !inviteLink)
                    }
                  >
                    {inviteMode === "link" ? (
                      copied ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        "Copy Link"
                      )
                    ) : sending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send"
                    )}
                  </Button>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Lorem Ipsum is simply dummy text of the printing
              </p>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog
          open={showInviteDialog}
          onOpenChange={(open) => {
            setShowInviteDialog(open);
            if (!open) {
              setInviteMode("email");
              setInviteEmail("");
            }
          }}
        >
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Invite people</DialogTitle>
              <DialogDescription>
                Lorem Ipsum is simply dummy text of the printing
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex space-x-2">
                <Button
                  onClick={handleInviteWithEmail}
                  variant={inviteMode === "email" ? "default" : "outline"}
                  className={
                    inviteMode === "email"
                      ? "bg-brand hover:bg-brand/90 text-white"
                      : ""
                  }
                >
                  Invite with email
                </Button>
                <Button
                  onClick={handleInviteWithLink}
                  variant={inviteMode === "link" ? "default" : "outline"}
                  className={
                    inviteMode === "link"
                      ? "bg-brand hover:bg-brand/90 text-white"
                      : ""
                  }
                >
                  Invite with link
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Add Team</Label>
                <div className="flex space-x-2">
                  <Input
                    placeholder={
                      inviteMode === "email" ? "Enter email" : "Invite link"
                    }
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-1"
                    readOnly={inviteMode === "link"}
                  />
                  <Button
                    onClick={handleSendInvite}
                    className="bg-brand hover:bg-brand/90 text-white"
                    disabled={
                      (inviteMode === "email" && (sending || !inviteEmail)) ||
                      (inviteMode === "link" && !inviteLink)
                    }
                  >
                    {inviteMode === "link" ? (
                      copied ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        "Copy Link"
                      )
                    ) : sending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send"
                    )}
                  </Button>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Lorem Ipsum is simply dummy text of the printing
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Logout Confirmation Dialog/Drawer */}
      {isMobile ? (
        <Drawer open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Are you sure?</DrawerTitle>
              <DrawerDescription>
                Are you sure you want to Log Out?
              </DrawerDescription>
            </DrawerHeader>

            <div className="p-4 flex flex-col space-y-3 pb-8">
              <Button
                variant="outline"
                className="w-full h-12 text-base"
                onClick={() => setShowLogoutDialog(false)}
              >
                Stay
              </Button>
              <Button
                className="w-full h-12 bg-red-600 hover:bg-red-700 text-white text-base"
                onClick={handleLogout}
              >
                Log Out
              </Button>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription>
                Are you sure you want to Log Out?
              </DialogDescription>
            </DialogHeader>

            <div className="flex space-x-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowLogoutDialog(false)}
              >
                Stay
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleLogout}
              >
                Log Out
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Account Confirmation Dialog/Drawer */}
      {isMobile ? (
        <Drawer open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Are you sure?</DrawerTitle>
              <DrawerDescription>
                Are you sure you want to delete your account?
              </DrawerDescription>
            </DrawerHeader>

            <div className="p-4 flex flex-col space-y-3 pb-8">
              <Button
                variant="outline"
                className="w-full h-12 text-base"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="w-full h-12 bg-red-600 hover:bg-red-700 text-white text-base"
                onClick={handleDeleteAccount}
              >
                Yes
              </Button>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete your account?
              </DialogDescription>
            </DialogHeader>

            <div className="flex space-x-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleDeleteAccount}
              >
                Yes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* PowerMaker Tour */}
      <PowerMakerTour isOpen={showTour} onClose={() => setShowTour(false)} />
    </>
  );
}
