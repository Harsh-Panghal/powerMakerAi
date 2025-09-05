import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Plus, ChevronDown, MoreHorizontal, HelpCircle, Settings, Star, Upload, Trash2, Check, ArrowLeft, X, MessageSquare, Pencil } from "lucide-react";
import { CrmConnectionDetail } from "@/components/CrmConnectionDetail";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  useSidebar
} from "@/components/ui/sidebar";
import { useChatStore } from "@/store/chatStore";
import { useToast } from "@/hooks/use-toast";

const recentChats = [
  "API Config Entity Design",
  "API Config Entity Design", 
  "API Config Entity Design",
  "Account Plugin Trace Logs"
];

const connections = [
  { id: 1, name: "Connection Name 1", isActive: true },
  { id: 2, name: "Connection Name 2", isActive: false },
  { id: 3, name: "Connection Name 3", isActive: false },
  { id: 4, name: "Connection Name 4", isActive: false },
  { id: 5, name: "Connection Name 5", isActive: false },
  { id: 6, name: "Connection Name 6", isActive: false },
];

export function PowerMakerSidebar() {
  const [showAllChats, setShowAllChats] = useState(false);
  const INITIAL_CHAT_LIMIT = 9;
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
  const [rating, setRating] = useState(0);
  const [feedbackType, setFeedbackType] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [connectionList, setConnectionList] = useState(connections);
  const editInputRef = useRef<HTMLInputElement>(null);
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Chat store integration
  const { newChat, recentThreads, loadThread, renameThread, deleteThread, setModel } = useChatStore();

  // Get displayed chats based on showAllChats state
  const displayedChats = showAllChats ? recentThreads : recentThreads.slice(0, INITIAL_CHAT_LIMIT);
  const hasMoreChats = recentThreads.length > INITIAL_CHAT_LIMIT;

  const handleLogoClick = () => {
    // Navigate to greeting page
    navigate('/');
  };

  const handleNewChat = () => {
    newChat();
    navigate('/');
  };

  const handleChatClick = (threadId: string) => {
    loadThread(threadId);
    navigate('/chat');
  };

  const handleHelpClick = () => {
    window.open("/help", "_blank");
  };

  const handleSettingsClick = () => {
    setIsSettingsOpen(true);
  };

  const handleFeedbackSubmit = () => {
    console.log("Feedback submitted:", { feedbackType, feedbackText, rating });
    setIsFeedbackOpen(false);
    setFeedbackType("");
    setFeedbackText("");
    setRating(0);
  };

  const handleCleanChatConfirm = () => {
    console.log("All chats deleted");
    setIsCleanChatOpen(false);
  };

  const handleConnectionToggle = (id: number) => {
    setConnectionList(connections.map(conn => 
      conn.id === id 
        ? { ...conn, isActive: true }
        : { ...conn, isActive: false }
    ));
  };

  const handleConnectionDelete = (id: number) => {
    setConnectionList(connections.filter(conn => conn.id !== id));
  };

  const handleRenameChat = (threadId: string, currentTitle: string) => {
    setEditingChatId(threadId);
    setEditingTitle(currentTitle);
    setChatMenuOpen(null);
  };

  const handleRenameConfirm = () => {
    if (editingChatId && editingTitle.trim()) {
      renameThread(editingChatId, editingTitle.trim());
      toast({
        title: "Chat renamed",
        description: "Chat title has been updated successfully.",
        variant: "default",
        className: "border-green-200 bg-green-50 text-green-900",
      });
    }
    setEditingChatId(null);
    setEditingTitle("");
  };

  const handleRenameCancel = () => {
    setEditingChatId(null);
    setEditingTitle("");
  };

  const handleDeleteChat = (threadId: string) => {
    setDeletingChatId(threadId);
    setChatMenuOpen(null);
    
    setTimeout(() => {
      deleteThread(threadId);
      toast({
        title: "Chat deleted",
        description: "Chat has been removed successfully.",
        variant: "destructive",
      });
      setDeletingChatId(null);
      navigate('/');
    }, 300);
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
            className={`w-6 h-6 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
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
      >
        <span className="mr-2">🧹</span>
        Clean Chat
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => {
          setIsSettingsOpen(false);
          setIsCrmConnectionOpen(true);
        }}
      >
        <span className="mr-2">🔗</span>
        CRM Connection Details
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => window.open("/privacy-policy", "_blank")}
      >
        <span className="mr-2">🔒</span>
        Privacy Policy
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => window.open("/terms-of-use", "_blank")}
      >
        <span className="mr-2">📋</span>
        Terms of Use
      </Button>
    </div>
  );

  return (
    <Sidebar collapsible="icon" className="h-screen border-r border-border/30 shadow-[inset_-8px_0_16px_rgba(0,0,0,0.08)] data-[state=collapsed]:w-16 flex flex-col">
      <SidebarHeader className={`p-4 flex-shrink-0 ${isCollapsed ? 'flex justify-center' : ''}`}>
        <div 
          className={`flex items-center cursor-pointer ${isCollapsed ? 'justify-center' : 'space-x-2'}`}
          onClick={handleLogoClick}
        >
          <img src="/logo.svg" alt="Logo" className="w-8 h-8" />
          {!isCollapsed && (
            <>
              <span className="font-bold text-brand">PowerMaker AI</span>
              <span className="text-xs bg-brand/10 text-brand px-2 py-1 rounded">Beta</span>
            </>
          )}
        </div>
      </SidebarHeader>

      {/* New Chat Button - Fixed position */}
      <div className={`p-4 border-b border-border/30 flex-shrink-0 ${isCollapsed ? 'px-2' : ''}`}>
        <Button 
          className={`w-full ${isCollapsed ? 'justify-center px-0' : 'justify-center'} bg-transparent border border-border hover:bg-sidebar-accent text-brand shadow-[2px_2px_4px_rgba(0,0,0,0.1)] transition-all duration-300 ease-in-out`}
          variant="outline"
          onClick={handleNewChat}
          size={isCollapsed ? "sm" : "default"}
        >
          <Plus className="w-4 h-4" />
          {!isCollapsed && <span className="ml-1">New Chat</span>}
        </Button>
      </div>

      <SidebarContent className="flex-1 flex flex-col">
        {/* Recent Chats */}
        {!isCollapsed && (
          <SidebarGroup className="flex-1 flex flex-col">
            <SidebarGroupLabel className="px-4 text-sm font-medium text-muted-foreground flex-shrink-0">
              Recent
            </SidebarGroupLabel>
            <SidebarGroupContent className="overflow-y-auto overflow-x-hidden" style={{ height: 'calc(100vh - 340px)' }}>
              <SidebarMenu>
                {displayedChats.length > 0 ? (
                  displayedChats.map((thread, index) => (
                    <SidebarMenuItem 
                      key={thread.id} 
                      className={`transition-all duration-300 ${
                        deletingChatId === thread.id ? 'opacity-0 translate-x-4 scale-95' : 'opacity-100 translate-x-0 scale-100'
                      }`}
                    >
                      <div
                        className="flex items-center px-4 py-1 mx-2 hover:bg-sidebar-accent rounded-md group transition-all duration-200 ease-in-out overflow-hidden"
                        onMouseEnter={() => setHoveredChat(index)}
                        onMouseLeave={() => setHoveredChat(null)}
                      >
                        <SidebarMenuButton 
                          className="flex-1 justify-start p-0 h-auto cursor-pointer min-w-0"
                          onClick={() => editingChatId !== thread.id ? handleChatClick(thread.id) : undefined}
                        >
                          <MessageSquare className="w-3 h-3 mr-2 text-muted-foreground flex-shrink-0" />
                          <div className="flex flex-col items-start min-w-0 flex-1 overflow-hidden">
                            {editingChatId === thread.id ? (
                              <div className="flex items-center gap-1 w-full">
                                <Input
                                  ref={editInputRef}
                                  value={editingTitle}
                                  onChange={(e) => setEditingTitle(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleRenameConfirm();
                                    if (e.key === 'Escape') handleRenameCancel();
                                  }}
                                  onBlur={handleRenameConfirm}
                                  className="text-sm h-6 py-0 px-1 border-0 bg-transparent focus:ring-1 focus:ring-brand"
                                  maxLength={50}
                                />
                              </div>
                            ) : (
                              <>
                                <span className="text-sm text-sidebar-foreground truncate w-full">
                                  {thread.title}
                                </span>
                                <span className="text-xs text-muted-foreground truncate w-full">
                                  {thread.messages.length} messages • {thread.createdAt.toLocaleDateString()}
                                </span>
                              </>
                            )}
                          </div>
                        </SidebarMenuButton>
                        {editingChatId !== thread.id && (
                          <div className="flex-shrink-0 ml-2">
                            <Popover open={chatMenuOpen === index} onOpenChange={(open) => setChatMenuOpen(open ? index : null)}>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`w-6 h-6 p-0 transition-opacity duration-200 ease-in-out ${
                                    hoveredChat === index || isMobile ? 'opacity-100' : 'opacity-0'
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
                                  onClick={() => handleRenameChat(thread.id, thread.title)}
                                >
                                  <Pencil className="w-3 h-3 mr-2" />
                                  Rename
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start text-xs text-destructive hover:text-destructive hover:bg-destructive/20"
                                  onClick={() => handleDeleteChat(thread.id)}
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
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-muted-foreground">
                    No recent conversations
                  </div>
                )}
              </SidebarMenu>
            </SidebarGroupContent>

            {hasMoreChats && (
              <div className="px-4 py-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-brand hover:text-brand-accent flex items-center"
                  onClick={() => setShowAllChats(!showAllChats)}
                >
                  <ChevronDown className={`w-4 h-4 mr-0 transition-transform ${showAllChats ? 'rotate-180' : ''}`} />
                  {showAllChats ? 'Less' : 'More'}
                </Button>
              </div>
            )}
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border">
        <div className={isCollapsed ? 'flex flex-col items-center space-y-2' : ''}>
          <SidebarMenuButton 
            className={`w-full ${isCollapsed ? 'justify-center' : 'justify-start'} text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200 ease-in-out cursor-pointer`}
            onClick={handleHelpClick}
          >
            <HelpCircle className="w-4 h-4" />
            {!isCollapsed && <span className="ml-2">Help</span>}
          </SidebarMenuButton>
          <SidebarMenuButton 
            className={`w-full ${isCollapsed ? 'justify-center' : 'justify-start'} text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200 ease-in-out cursor-pointer`}
            onClick={handleSettingsClick}
          >
            <Settings className="w-4 h-4" />
            {!isCollapsed && <span className="ml-2">Settings</span>}
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
            <div className="px-4 pb-4">
              {renderSettingsContent()}
            </div>
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
                <Select value={feedbackType} onValueChange={setFeedbackType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select feedback type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compliment">Compliment</SelectItem>
                    <SelectItem value="suggestion">Suggestion</SelectItem>
                    <SelectItem value="issue">Issue</SelectItem>
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
                <Label htmlFor="feedback-image">Upload Image (optional)</Label>
                <Input id="feedback-image" type="file" accept="image/*" />
              </div>
              <Button onClick={handleFeedbackSubmit} className="w-full">
                Send Feedback
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
                <Select value={feedbackType} onValueChange={setFeedbackType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select feedback type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compliment">Compliment</SelectItem>
                    <SelectItem value="suggestion">Suggestion</SelectItem>
                    <SelectItem value="issue">Issue</SelectItem>
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
                <Label htmlFor="feedback-image">Upload Image (optional)</Label>
                <Input id="feedback-image" type="file" accept="image/*" />
              </div>
              <Button onClick={handleFeedbackSubmit} className="w-full">
                Send Feedback
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
              <DrawerTitle>Are you sure?</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-4">
              <p className="text-sm text-muted-foreground mb-6">
                Do you really want to delete all chats? This action cannot be undone.
              </p>
              <div className="flex flex-col gap-3">
                <Button variant="destructive" onClick={handleCleanChatConfirm} className="w-full">
                  Yes, Delete All
                </Button>
                <Button variant="outline" onClick={() => setIsCleanChatOpen(false)} className="w-full">
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
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription>
                Do you really want to delete all chats? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCleanChatOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleCleanChatConfirm}>
                Yes
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