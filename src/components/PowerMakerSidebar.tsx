import { useState } from "react";
import { Plus, ChevronDown, MoreHorizontal, HelpCircle, Settings, Star, Upload, Trash2, Check, ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
  const [hoveredChat, setHoveredChat] = useState<number | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isCleanChatOpen, setIsCleanChatOpen] = useState(false);
  const [isCrmConnectionOpen, setIsCrmConnectionOpen] = useState(false);
  const [showConnectionForm, setShowConnectionForm] = useState(false);
  const [chatMenuOpen, setChatMenuOpen] = useState<number | null>(null);
  const [rating, setRating] = useState(0);
  const [feedbackType, setFeedbackType] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [connectionList, setConnectionList] = useState(connections);
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const handleLogoClick = () => {
    // Navigate to default/landing page - reload greeting container
    window.location.reload();
  };

  const handleNewChat = () => {
    // Load greeting container in chat area
    console.log("Loading new chat greeting");
  };

  const handleChatClick = (chatTitle: string) => {
    // Display specific chat in chat area
    console.log("Loading chat:", chatTitle);
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

  return (
    <Sidebar collapsible="icon" className="border-r border-border/30 shadow-[inset_-8px_0_16px_rgba(0,0,0,0.08)] data-[state=collapsed]:w-16">
      <SidebarHeader className={`p-4 ${isCollapsed ? 'flex justify-center' : ''}`}>
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

      <SidebarContent className="flex-1 overflow-y-auto ">
        {/* New Chat Button */}
        <div className="p-4">
          <Button 
            className="w-full justify-center bg-transparent border border-border hover:bg-sidebar-accent text-brand shadow-[2px_2px_4px_rgba(0,0,0,0.1)] transition-all duration-300 ease-in-out"
            variant="outline"
            onClick={handleNewChat}
          >
            <Plus className="w-4 h-4" />
            {!isCollapsed && <span className="ml-1">New Chat</span>}
          </Button>
        </div>

        {/* Recent Chats */}
        {!isCollapsed && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-4 text-sm font-medium text-muted-foreground">
              Recent
            </SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                {recentChats.map((chat, index) => (
                  <SidebarMenuItem key={index}>
                    <div
                      className="flex items-center justify-between px-4 py-1 mx-2 hover:bg-sidebar-accent rounded-md group transition-all duration-200 ease-in-out"
                      onMouseEnter={() => setHoveredChat(index)}
                      onMouseLeave={() => setHoveredChat(null)}
                    >
                      <SidebarMenuButton 
                        className="flex-1 justify-start p-0 h-auto cursor-pointer"
                        onClick={() => handleChatClick(chat)}
                      >
                        <span className="text-sm text-sidebar-foreground truncate">
                          {chat}
                        </span>
                      </SidebarMenuButton>
                      <Popover open={chatMenuOpen === index} onOpenChange={(open) => setChatMenuOpen(open ? index : null)}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`w-6 h-6 p-0 transition-opacity duration-200 ease-in-out ${
                              hoveredChat === index ? 'opacity-100' : 'opacity-0'
                            }`}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-32 p-1" side="right" align="start">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-xs"
                            onClick={() => console.log("Rename chat:", chat)}
                          >
                            Rename
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-xs text-destructive"
                            onClick={() => console.log("Delete chat:", chat)}
                          >
                            Delete
                          </Button>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>

            {!showAllChats && (
              <div className="px-4 py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-brand hover:text-brand-accent flex items-center"
                  onClick={() => setShowAllChats(true)}
                >
                  <ChevronDown className="w-4 h-4 mr-1" />
                  More
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

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
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
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
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

      {/* Clean Chat Confirmation Dialog */}
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

      {/* CRM Connection Details Dialog */}
      <Dialog open={isCrmConnectionOpen} onOpenChange={setIsCrmConnectionOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>CRM Connection Details</DialogTitle>
          </DialogHeader>
          
          {!showConnectionForm ? (
            <div className="space-y-4">
              <div className="space-y-2">
                {connectionList.map((connection) => (
                  <div key={connection.id} className="flex items-center justify-between p-2 border rounded">
                    <span>{connection.name}</span>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleConnectionToggle(connection.id)}
                        className={connection.isActive ? 'text-green-600' : 'text-gray-400'}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleConnectionDelete(connection.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button onClick={() => setShowConnectionForm(true)} className="w-full">
                Add New Connection
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Button
                variant="ghost"
                onClick={() => setShowConnectionForm(false)}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Connections
              </Button>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="connection-name">Connection Name</Label>
                  <Input id="connection-name" placeholder="Enter connection name" />
                </div>
                <div>
                  <Label htmlFor="tenant-id">Tenant Id</Label>
                  <Input id="tenant-id" placeholder="Enter tenant ID" />
                </div>
                <div>
                  <Label htmlFor="client-id">Client ID</Label>
                  <Input id="client-id" placeholder="Enter client ID" />
                </div>
                <div>
                  <Label htmlFor="client-secret">Client Secret</Label>
                  <Input id="client-secret" type="password" placeholder="Enter client secret" />
                </div>
                <div>
                  <Label htmlFor="resource">Resource (CRM Uri)</Label>
                  <Input id="resource" placeholder="Enter CRM URI" />
                </div>
                <div>
                  <Label htmlFor="crm-solution">Default CRM Solution (Unmanaged Only)</Label>
                  <Input id="crm-solution" placeholder="Enter CRM solution" />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowConnectionForm(false)}>
                    Clear
                  </Button>
                  <Button onClick={() => {
                    setShowConnectionForm(false);
                    console.log("Connection saved");
                  }}>
                    Save
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}