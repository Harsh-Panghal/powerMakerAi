import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Plus,
  ChevronDown,
  MoreHorizontal,
  HelpCircle,
  Settings,
  Star,
  Upload,
  Trash2,
  Check,
  ArrowLeft,
  X,
  MessageSquare,
  Pencil,
} from "lucide-react";
import { CrmConnectionDetail } from "@/components/CrmConnectionDetail";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { useChatStore } from "@/store/chatStore";
import { useToast } from "@/hooks/use-toast";
import { firestore, storage } from "../config/firebase config/firebase.config";
import { useDispatch, useSelector } from "react-redux";
import { Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, getDoc, arrayUnion, updateDoc, setDoc } from "firebase/firestore";
import { RootState, AppDispatch } from "../store/store";
import {
  newChat,
  setChatId,
  setShowResult,
  setRecentPrompt,
  setResultData,
  clearChatHistory,
} from "../redux/ChatSlice";
import { setFullHistory } from "../redux/chatHistorySlice";
import { setCurrentModel } from "../redux/ModelSlice";
import { useParams } from "react-router-dom";

const connections = [
  { id: 1, name: "Connection Name 1", isActive: true },
  { id: 2, name: "Connection Name 2", isActive: false },
  { id: 3, name: "Connection Name 3", isActive: false },
  { id: 4, name: "Connection Name 4", isActive: false },
  { id: 5, name: "Connection Name 5", isActive: false },
  { id: 6, name: "Connection Name 6", isActive: false },
];

interface Chat {
  chatId: string;
  title: string;
  model: number;
  createdAt: string;
}

export function PowerMakerSidebar() {
  const [showAllChats, setShowAllChats] = useState(false);
  const INITIAL_CHAT_LIMIT = 12;
  const [hoveredChat, setHoveredChat] = useState<number | null>(null);
  const isMobile = useIsMobile();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isCleanChatOpen, setIsCleanChatOpen] = useState(false);
  const [isCrmConnectionOpen, setIsCrmConnectionOpen] = useState(false);
  const [showConnectionForm, setShowConnectionForm] = useState(false);
  const [chatMenuOpen, setChatMenuOpen] = useState<number | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);

  // Feedback form state
  const [rating, setRating] = useState(0);
  const [feedbackType, setFeedbackType] = useState<
    "testimonial" | "feature" | "compliment" | "bug" | "other"
  >("compliment");
  const [feedbackText, setFeedbackText] = useState("");
  const [connectionList, setConnectionList] = useState(connections);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [deletingAllIds, setDeletingAllIds] = useState<string[]>([]);
  const editInputRef = useRef<HTMLInputElement>(null);

  const { state, setOpen } = useSidebar();
  const isCollapsed = state === "collapsed";
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redux state
  const dispatch: AppDispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const { chatId: currentChatId, showResult } = useSelector(
    (state: RootState) => state.chat
  );
  const { currentModel } = useSelector((state: RootState) => state.model);

  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toggleSidebar } = useSidebar();

  const { chatId } = useParams();
  const [activeChatId, setActiveChatId] = useState<string | null>(
    chatId ?? null
  );

  // Fetch recent chats from API
  const { data, refetch, isLoading } = useQuery({
    queryKey: ["recentChats"],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API}/chat/recentchats`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Update Redux state when URL changes
  useEffect(() => {
    if (chatId) {
      dispatch(setChatId(chatId));
      dispatch(setShowResult(true));
      setActiveChatId(chatId);
    } else {
      setActiveChatId(null);
    }
  }, [chatId, dispatch]);

  // Update current model when chat data changes
  useEffect(() => {
    if (data && chatId) {
      const foundChat = data.chats.find((chat: Chat) => chat.chatId === chatId);
      if (foundChat) {
        dispatch(setCurrentModel(foundChat.model));
      }
    }
  }, [data, chatId, dispatch]);

  // Sort chats by creation date
  const sortedChats = [...(data?.chats || [])].sort(
    (a: Chat, b: Chat) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Get displayed chats based on showAllChats state
  const displayedChats = showAllChats
    ? sortedChats
    : sortedChats.slice(0, INITIAL_CHAT_LIMIT);

  const hasMoreChats = sortedChats.length > INITIAL_CHAT_LIMIT;

  // Track sidebar state changes for animation
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 400);
    return () => clearTimeout(timer);
  }, [isCollapsed]);

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleNewChat = () => {
    // Close sidebar on mobile
    if (window.innerWidth <= 600) {
      toggleSidebar();
    }

    // Reset chat state using Redux actions
    dispatch(setShowResult(false));
    dispatch(setFullHistory({ chatId: "", history: [] }));
    dispatch(newChat());
    dispatch(setChatId(null));

    // Navigate to home/greeting page
    navigate("/");
  };

  const handleChatClick = async (chatId: string) => {
    navigate(`/c/${chatId}`);
  };

  const handleHelpClick = () => {
    window.open("https://powermakerai.com/Documentation/", "_blank");
  };

  const handleSettingsClick = () => {
    setIsSettingsOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const imageURL = URL.createObjectURL(file);
      setSelectedFile(file);
      setPreview(imageURL);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackText || rating === 0 || !feedbackType || !user) return;

    setLoading(true);

    try {
      let imageUrl = "";

      // Upload image if present
      if (selectedFile) {
        const imageRef = ref(
          storage,
          `feedbacks/${Date.now()}-${selectedFile.name}`
        );
        await uploadBytes(imageRef, selectedFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      const feedbackDocRef = doc(firestore, "feedbacks", user.uid);
      const docSnap = await getDoc(feedbackDocRef);

      const newEntry = {
        feedbackText,
        rating,
        imageUrl: imageUrl || null,
        timestamp: Timestamp.now(),
        type: feedbackType,
      };

      if (docSnap.exists()) {
        await updateDoc(feedbackDocRef, {
          feedbacks: arrayUnion(newEntry),
        });
      } else {
        await setDoc(feedbackDocRef, {
          feedbacks: [newEntry],
        });
      }

      toast({
        title: "Success",
        description: "Feedback submitted successfully!",
        variant: "default",
        className: "border-green-200 bg-green-50 text-green-900",
      });

      // Reset form
      setFeedbackText("");
      setRating(0);
      setFeedbackType("compliment");
      setSelectedFile(null);
      setPreview(null);
      setIsFeedbackOpen(false);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle clean chat action
  const handleCleanChatConfirm = async () => {
    setIsDeletingAll(true);

    try {
      // Get all chat IDs for animation
      const allChatIds = sortedChats.map((chat) => chat.chatId);
      setDeletingAllIds(allChatIds);

      // Close the dialog first
      setIsCleanChatOpen(false);

      // Start staggered animation
      allChatIds.forEach((chatId, index) => {
        setTimeout(() => {
          setDeletingChatId(chatId);
        }, index * 100);
      });

      // Delete all chats from backend with new API endpoint
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_API}/chat/delete-all-chats`,
        {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!res.ok) throw new Error("Failed to delete chats");

      // Clear Redux state
      dispatch(setChatId(null));
      dispatch(setRecentPrompt(""));
      dispatch(setResultData(""));

      // Navigate to home page
      navigate("/");

      // Refetch chat data
      refetch();

      toast({
        title: "All chats deleted",
        description: "All conversations have been removed successfully.",
        variant: "destructive",
      });
    } catch (error) {
      console.error("Failed to clean chats:", error);
      toast({
        title: "Error",
        description: "Failed to delete chats. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Reset states after animation completes
      setTimeout(() => {
        setIsDeletingAll(false);
        setDeletingAllIds([]);
        setDeletingChatId(null);
      }, sortedChats.length * 100 + 500);
    }
  };

  const handleConnectionToggle = (id: number) => {
    setConnectionList(
      connections.map((conn) =>
        conn.id === id
          ? { ...conn, isActive: true }
          : { ...conn, isActive: false }
      )
    );
  };

  const handleConnectionDelete = (id: number) => {
    setConnectionList(connections.filter((conn) => conn.id !== id));
  };

  // Handle rename action and open modal
  const handleRenameChat = (chatId: string, currentTitle: string) => {
    setEditingChatId(chatId);
    setEditingTitle(currentTitle);
  };

  // Handle rename confirm action
  const handleRenameConfirm = async () => {
    if (editingChatId && editingTitle.trim()) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_API}/chat/renamechattitle`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              chatId: editingChatId,
              newTitle: editingTitle.trim(),
            }),
          }
        );

        if (response.ok) {
          // Refetch chat data to update UI
          refetch();
        } else {
          throw new Error("Failed to rename chat");
        }
      } catch (error) {
        console.error("Error renaming chat:", error);
        toast({
          title: "Error",
          description: "Failed to rename chat. Please try again.",
          variant: "destructive",
        });
      }
    }
    setEditingChatId(null);
    setEditingTitle("");
  };

  const handleRenameCancel = () => {
    setEditingChatId(null);
    setEditingTitle("");
  };

  // Handle delete action
  const handleDeleteChat = async (chatId: string) => {
    try {
      setDeletingChatId(chatId);

      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_API
        }/chat/deletechat/:id?chatId=${chatId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to delete chat");

      // If deleting current active chat, navigate to home
      if (chatId === activeChatId) {
        dispatch(setChatId(null));
        dispatch(setRecentPrompt(""));
        dispatch(setResultData(""));
        navigate("/");
      }

      // Refetch chat data
      refetch();
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast({
        title: "Error",
        description: "Failed to delete chat. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => setDeletingChatId(null), 300);
    }
  };

  // Focus input when editing starts
  useEffect(() => {
    if (editingChatId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingChatId]);

  const renderStarRating = () => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className={`w-6 h-6 ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
          >
            <Star className="w-full h-full fill-current" />
          </button>
        ))}
      </div>
    );
  };

  // Reusable settings content
  const renderSettingsContent = () => (
    <div className="space-y-2">
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => {
          setIsSettingsOpen(false);
          setIsFeedbackOpen(true);
        }}
        data-tour="feedback-option"
      >
        <span className="mr-2">💬</span>
        Feedback
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => {
          setIsSettingsOpen(false);
          setIsCleanChatOpen(true);
        }}
        data-tour="clean-chat-option"
        disabled={sortedChats.length === 0}
      >
        <span className="mr-2">🧹</span>
        Clean Chat
        {sortedChats.length === 0 && (
          <span className="ml-auto text-xs text-muted-foreground">
            (No chats)
          </span>
        )}
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => {
          setIsSettingsOpen(false);
          setIsCrmConnectionOpen(true);
        }}
        data-tour="crm-connections"
      >
        <span className="mr-2">🔗</span>
        CRM Connection Details
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() =>
          window.open(
            "https://powermakerai.com/src/privacyPolicy.html",
            "_blank"
          )
        }
        data-tour="privacy-terms"
      >
        <span className="mr-2">🔒</span>
        Privacy Policy
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() =>
          window.open("https://powermakerai.com/src/terms.html", "_blank")
        }
      >
        <span className="mr-2">📋</span>
        Terms of Use
      </Button>
    </div>
  );

  return (
    <Sidebar
      collapsible="icon"
      className="h-screen border-r border-border/30 shadow-[inset_-8px_0_16px_rgba(0,0,0,0.08)] data-[state=collapsed]:w-16 flex flex-col"
      data-sidebar="true"
    >
      {/* Logo and title */}
      <SidebarHeader
        className={`p-4 flex-shrink-0 ${
          isCollapsed ? "flex justify-center" : ""
        }`}
      >
        <div
          className={`flex items-center cursor-pointer ${
            isCollapsed ? "justify-center" : "space-x-2"
          }`}
          onClick={handleLogoClick}
          data-tour="logo"
        >
          <img src="/logo.svg" alt="Logo" className="w-8 h-8 flex-shrink-0" />
          <div
            className={`
              flex items-center space-x-2 overflow-hidden
              transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]
              ${
                isCollapsed
                  ? "w-0 opacity-0 -translate-x-2"
                  : "w-auto opacity-100 translate-x-0"
              }
            `}
          >
            <span className="font-bold text-brand whitespace-nowrap">
              PowerMaker AI
            </span>
            <span className="text-xs bg-brand/10 text-brand px-2 py-1 rounded whitespace-nowrap">
              Beta
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* New Chat Button - Fixed position */}
      <div
        className={`p-4 border-b border-border/30 flex-shrink-0 ${
          isCollapsed ? "px-2" : ""
        } transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]`}
      >
        <Button
          className={`
            w-full bg-transparent border border-border hover:bg-sidebar-accent text-brand 
            shadow-[2px_2px_4px_rgba(0,0,0,0.1)] 
            transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]
            ${isCollapsed ? "justify-start pl-1.5" : "justify-center px-4"}
          `}
          variant="outline"
          onClick={handleNewChat}
          size={isCollapsed ? "sm" : "default"}
          data-guide="new-chat-button"
        >
          <Plus className="w-4 h-4 flex-shrink-0" />
          <span
            className={`
              whitespace-nowrap overflow-hidden
              transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]
              ${
                isCollapsed
                  ? "w-0 opacity-0 -translate-x-2 ml-0"
                  : "w-auto opacity-100 translate-x-0 ml-2"
              }
            `}
          >
            New Chat
          </span>
        </Button>
      </div>

      {/* Recent Chat List */}
      <SidebarContent className="flex-1 flex flex-col">
        <SidebarGroup className="flex-1 flex flex-col">
          <SidebarGroupLabel
            className={`
              px-4 text-sm font-medium text-muted-foreground flex-shrink-0
              transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]
              ${
                isCollapsed
                  ? "opacity-0 h-0 py-0 -translate-x-2"
                  : "opacity-100 h-auto py-2 translate-x-0"
              }
            `}
            data-tour="recent-chats"
          >
            Recent
          </SidebarGroupLabel>
          <SidebarGroupContent
            className="overflow-y-auto overflow-x-hidden"
            style={{ height: "calc(100vh - 340px)" }}
          >
            <SidebarMenu>
              {isLoading ? (
                // Loading state
                <div
                  className={`
                  px-4 py-2 text-sm text-muted-foreground
                  transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]
                  ${
                    isCollapsed
                      ? "opacity-0 h-0 py-0 -translate-x-2"
                      : "opacity-100 h-auto py-2 translate-x-0"
                  }
                `}
                >
                  Loading chats...
                </div>
              ) : displayedChats.length > 0 ? (
                displayedChats.map((chat, index) => {
                  const isActiveChat = currentChatId === chat.chatId;
                  const isBeingDeleted =
                    deletingChatId === chat.chatId ||
                    (isDeletingAll && deletingAllIds.includes(chat.chatId));

                  return (
                    <SidebarMenuItem
                      key={chat.chatId}
                      className={`transition-all duration-500 ease-in-out ${
                        isBeingDeleted
                          ? "opacity-0 translate-x-8 scale-95 pointer-events-none"
                          : "opacity-100 translate-x-0 scale-100"
                      }`}
                      style={{
                        transitionDelay:
                          isAnimating && !isCollapsed
                            ? `${index * 50 + 200}ms`
                            : isDeletingAll &&
                              deletingAllIds.includes(chat.chatId)
                            ? `${deletingAllIds.indexOf(chat.chatId) * 100}ms`
                            : "0ms",
                      }}
                    >
                      <div
                        className={`flex items-center px-4 py-1 mx-2 rounded-md group transition-all duration-200 ease-in-out overflow-hidden ${
                          isActiveChat && !isCollapsed
                            ? "bg-sidebar-accent border-l-2 border-l-brand text-brand"
                            : "hover:bg-sidebar-accent"
                        }`}
                        onMouseEnter={() =>
                          !isBeingDeleted && setHoveredChat(index)
                        }
                        onMouseLeave={() => setHoveredChat(null)}
                      >
                        <SidebarMenuButton
                          className="flex-1 justify-start p-0 h-auto min-w-0 cursor-pointer"
                          onClick={() =>
                            editingChatId !== chat.chatId && !isBeingDeleted
                              ? handleChatClick(chat.chatId)
                              : undefined
                          }
                          disabled={isBeingDeleted}
                        >
                          <MessageSquare
                            className={`w-3 h-3 mr-2 flex-shrink-0 ${
                              isActiveChat
                                ? "text-brand"
                                : "text-muted-foreground"
                            }`}
                          />
                          <div
                            className={`
                              flex flex-col items-start min-w-0 flex-1 overflow-hidden
                              transition-all duration-300 ease-in-out
                              ${
                                isCollapsed
                                  ? "w-0 opacity-0"
                                  : "w-auto opacity-100"
                              }
                              ${isAnimating && !isCollapsed ? "delay-200" : ""}
                            `}
                          >
                            {editingChatId === chat.chatId ? (
                              <div className="flex items-center gap-1 w-full">
                                <Input
                                  ref={editInputRef}
                                  value={editingTitle}
                                  onChange={(e) =>
                                    setEditingTitle(e.target.value)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter")
                                      handleRenameConfirm();
                                    if (e.key === "Escape")
                                      handleRenameCancel();
                                  }}
                                  onBlur={handleRenameConfirm}
                                  className="text-sm h-6 py-0 px-1 border-0 bg-transparent focus:ring-1 focus:ring-brand"
                                  maxLength={50}
                                />
                              </div>
                            ) : (
                              <>
                                <span
                                  className={`text-sm truncate w-full whitespace-nowrap font-medium ${
                                    isActiveChat
                                      ? "text-brand"
                                      : "text-sidebar-foreground"
                                  }`}
                                >
                                  {chat.title}
                                </span>
                                {/* TODO: Add timestamp */}
                                {/* <span className="text-xs text-muted-foreground truncate w-full whitespace-nowrap">
                                  {new Date(
                                    chat.createdAt
                                  ).toLocaleDateString()}
                                </span> */}
                              </>
                            )}
                          </div>
                        </SidebarMenuButton>
                        {editingChatId !== chat.chatId &&
                          !isCollapsed &&
                          !isBeingDeleted && (
                            <div className="flex-shrink-0 ml-2">
                              <Popover
                                open={chatMenuOpen === index}
                                onOpenChange={(open) =>
                                  setChatMenuOpen(open ? index : null)
                                }
                              >
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`w-6 h-6 p-0 transition-opacity duration-200 ease-in-out ${
                                      hoveredChat === index || isMobile
                                        ? "opacity-100"
                                        : "opacity-0"
                                    }`}
                                  >
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-32 p-1 z-50"
                                  side="right"
                                  align="start"
                                  sideOffset={3}
                                  avoidCollisions={true}
                                  alignOffset={10}
                                >
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start text-xs"
                                    onClick={() => {
                                      setChatMenuOpen(null);
                                      handleRenameChat(chat.chatId, chat.title);
                                    }}
                                  >
                                    <Pencil className="w-3 h-3 mr-2" />
                                    Rename
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start text-xs text-destructive hover:text-destructive hover:bg-destructive/20"
                                    onClick={() => {
                                      setChatMenuOpen(null);
                                      handleDeleteChat(chat.chatId);
                                    }}
                                  >
                                    <Trash2 className="w-3 h-3 mr-2" />
                                    Delete
                                  </Button>
                                </PopoverContent>
                              </Popover>
                            </div>
                          )}
                      </div>
                    </SidebarMenuItem>
                  );
                })
              ) : (
                <div
                  className={`
                    px-4 py-2 text-sm text-muted-foreground
                    transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]
                    ${
                      isCollapsed
                        ? "opacity-0 h-0 py-0 -translate-x-2"
                        : "opacity-100 h-auto py-2 translate-x-0"
                    }
                  `}
                >
                  No recent conversations
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>

          {hasMoreChats && !isDeletingAll && (
            <div
              className={`
                px-4 py-2 flex-shrink-0
                transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]
                ${
                  isCollapsed
                    ? "opacity-0 h-0 py-0 -translate-x-2"
                    : "opacity-100 h-auto py-2 translate-x-0"
                }
              `}
            >
              <Button
                variant="ghost"
                size="sm"
                className="text-brand hover:text-brand-accent flex items-center transition-all duration-200"
                onClick={() => setShowAllChats(!showAllChats)}
                data-tour="more-menu"
              >
                <ChevronDown
                  className={`w-4 h-4 mr-0 transition-transform duration-300 ${
                    showAllChats ? "rotate-180" : ""
                  }`}
                />
                <span className="ml-1 whitespace-nowrap">
                  {showAllChats ? "Less" : "More"}
                </span>
              </Button>
            </div>
          )}
        </SidebarGroup>
      </SidebarContent>

      {/* Footer -> help and setting button */}
      <SidebarFooter className="p-4 border-t border-border transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]">
        <div className={isCollapsed ? "flex flex-col items-center" : ""}>
          <SidebarMenuButton
            className={`w-full ${
              isCollapsed ? "justify-start pl-1.5" : "justify-start"
            } text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer`}
            onClick={handleHelpClick}
            data-tour="help-icon"
          >
            <HelpCircle className="w-4 h-4 flex-shrink-0" />
            <span
              className={`
                whitespace-nowrap overflow-hidden
                transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]
                ${
                  isCollapsed
                    ? "w-0 opacity-0 -translate-x-2 ml-0"
                    : "w-auto opacity-100 translate-x-0 ml-2"
                }
              `}
            >
              Help
            </span>
          </SidebarMenuButton>
          <SidebarMenuButton
            className={`w-full ${
              isCollapsed ? "justify-start pl-1.5" : "justify-start"
            } text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer`}
            onClick={handleSettingsClick}
            data-guide="settings-button"
          >
            <Settings className="w-4 h-4 flex-shrink-0" />
            <span
              className={`
                whitespace-nowrap overflow-hidden
                transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]
                ${
                  isCollapsed
                    ? "w-0 opacity-0 -translate-x-2 ml-0"
                    : "w-auto opacity-100 translate-x-0 ml-2"
                }
              `}
            >
              Settings
            </span>
          </SidebarMenuButton>
        </div>
      </SidebarFooter>

      {/* Responsive Settings - Drawer for mobile, Dialog for desktop */}
      {isMobile ? (
        <Drawer open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DrawerContent className="max-h-[80vh]">
            <DrawerHeader className="px-4 pt-4 pb-2">
              <DrawerTitle>Settings</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-4">{renderSettingsContent()}</div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Settings</DialogTitle>
            </DialogHeader>
            {renderSettingsContent()}
          </DialogContent>
        </Dialog>
      )}

      {/* Responsive Feedback - Drawer for mobile, Dialog for desktop */}
      {isMobile ? (
        <Drawer open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
          <DrawerContent className="max-h-[90vh]">
            <DrawerHeader className="px-4 pt-4 pb-2">
              <DrawerTitle>Send Feedback</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-4 space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                We'd love to hear your thoughts about our application.
              </p>
              <div>
                <Label htmlFor="feedback-type">Feedback Type</Label>
                <Select
                  value={feedbackType}
                  onValueChange={(value) =>
                    setFeedbackType(
                      value as
                        | "testimonial"
                        | "feature"
                        | "compliment"
                        | "bug"
                        | "other"
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select feedback type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="testimonial">Testimonial</SelectItem>
                    <SelectItem value="feature">Feature</SelectItem>
                    <SelectItem value="compliment">Compliment</SelectItem>
                    <SelectItem value="bug">Bug</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="feedback-text">Your Feedback</Label>
                <Textarea
                  id="feedback-text"
                  placeholder="Tell us what you think..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  rows={4}
                />
              </div>
              <div>
                <Label>Rating</Label>
                {renderStarRating()}
              </div>
              <div>
                <Label>Upload Image (optional)</Label>
                <div className="mt-1 feedback-img-area max-w-full min-h-[135px] border border-[#1FA2D0] border-dashed rounded-md flex items-center justify-center flex-col relative p-4">
                  <input
                    type="file"
                    name="feedback-img"
                    id="feedback-img"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="feedback-img"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    {preview ? (
                      <img
                        src={preview}
                        alt="Uploaded Preview"
                        className="max-h-[100px] object-contain rounded-md mb-2 hover:opacity-80 transition"
                      />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-[#1FA2D0] mb-2" />
                        <span className="text-[#1FA2D0] text-sm font-normal">
                          Upload Image
                        </span>
                      </>
                    )}
                    {preview && (
                      <span className="text-[#1FA2D0] text-xs font-normal underline">
                        Change Image
                      </span>
                    )}
                  </label>
                </div>
              </div>
              <Button
                onClick={handleFeedbackSubmit}
                className="w-full"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Feedback"}
              </Button>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Send Feedback</DialogTitle>
              <DialogDescription>
                We'd love to hear your thoughts about our application.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="feedback-type">Feedback Type</Label>
                <Select
                  value={feedbackType}
                  onValueChange={(value) =>
                    setFeedbackType(
                      value as
                        | "testimonial"
                        | "feature"
                        | "compliment"
                        | "bug"
                        | "other"
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select feedback type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="testimonial">Testimonial</SelectItem>
                    <SelectItem value="feature">Feature</SelectItem>
                    <SelectItem value="compliment">Compliment</SelectItem>
                    <SelectItem value="bug">Bug</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="feedback-text">Your Feedback</Label>
                <Textarea
                  id="feedback-text"
                  placeholder="Tell us what you think..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  rows={4}
                />
              </div>
              <div>
                <Label>Rating</Label>
                {renderStarRating()}
              </div>
              <div>
                <Label>Upload Image (optional)</Label>
                <div className="mt-1 feedback-img-area max-w-full min-h-[135px] border border-[#1FA2D0] border-dashed rounded-md flex items-center justify-center flex-col relative p-4">
                  <input
                    type="file"
                    name="feedback-img"
                    id="feedback-img"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="feedback-img"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    {preview ? (
                      <img
                        src={preview}
                        alt="Uploaded Preview"
                        className="max-h-[100px] object-contain rounded-md mb-2 hover:opacity-80 transition"
                      />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-[#1FA2D0] mb-2" />
                        <span className="text-[#1FA2D0] text-sm font-normal">
                          Upload Image
                        </span>
                      </>
                    )}
                    {preview && (
                      <span className="text-[#1FA2D0] text-xs font-normal underline">
                        Change Image
                      </span>
                    )}
                  </label>
                </div>
              </div>
              <Button
                onClick={handleFeedbackSubmit}
                className="w-full"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Feedback"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Responsive Clean Chat - Drawer for mobile, Dialog for desktop */}
      {isMobile ? (
        <Drawer open={isCleanChatOpen} onOpenChange={setIsCleanChatOpen}>
          <DrawerContent className="max-h-[40vh]">
            <DrawerHeader className="px-4 pt-4 pb-2">
              <DrawerTitle>Delete All Chats?</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-4">
              <p className="text-sm text-muted-foreground mb-6">
                This will permanently delete all {sortedChats.length}{" "}
                conversation{sortedChats.length !== 1 ? "s" : ""}. This action
                cannot be undone.
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  variant="destructive"
                  onClick={handleCleanChatConfirm}
                  className="w-full"
                  disabled={isDeletingAll}
                >
                  {isDeletingAll
                    ? "Deleting..."
                    : `Yes, Delete All (${sortedChats.length})`}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsCleanChatOpen(false)}
                  className="w-full"
                  disabled={isDeletingAll}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isCleanChatOpen} onOpenChange={setIsCleanChatOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete All Chats?</DialogTitle>
              <DialogDescription>
                This will permanently delete all {sortedChats.length}{" "}
                conversation{sortedChats.length !== 1 ? "s" : ""}. This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsCleanChatOpen(false)}
                disabled={isDeletingAll}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleCleanChatConfirm}
                disabled={isDeletingAll}
              >
                {isDeletingAll
                  ? "Deleting..."
                  : `Yes, Delete All (${sortedChats.length})`}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* CRM Connection Details Dialog */}
      <CrmConnectionDetail
        isOpen={isCrmConnectionOpen}
        onClose={() => setIsCrmConnectionOpen(false)}
      />
    </Sidebar>
  );
}
