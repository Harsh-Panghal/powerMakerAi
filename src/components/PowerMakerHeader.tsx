import { useState, useEffect } from "react";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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

export function PowerMakerHeader() {
  const { toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  const { selectedModel, setModel } = useChatStore();
  const { toast } = useToast();
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [demoUser, setDemoUser] = useState<{email: string; name: string} | null>(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  // Check for demo user on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('demoUser');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (userData.isLoggedIn) {
        setIsLoggedIn(true);
        setDemoUser(userData);
      }
    }
  }, []);

  // Mock notification data
  const notifications = [
    {
      id: 1,
      type: "trace",
      title: "Plugin Execution Trace",
      startDate: "2024-01-15 10:30",
      endDate: "2024-01-15 10:35",
      plugin: "ContactValidation",
      stage: "PreOperation",
    },
    {
      id: 2,
      type: "activity",
      title: "Entity Created Successfully",
      startDate: "2024-01-15 09:45",
      endDate: "2024-01-15 09:46",
      plugin: "EntityCreation",
      stage: "PostOperation",
    },
    {
      id: 3,
      type: "update",
      title: "Configuration Updated",
      startDate: "2024-01-15 08:20",
      endDate: "2024-01-15 08:21",
      plugin: "ConfigManager",
      stage: "PreValidation",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('demoUser');
    setIsLoggedIn(false);
    setDemoUser(null);
    toast({
      title: "Success",
      description: "Successfully signed out! (Demo Mode)",
    });
    setShowLogoutDialog(false);
  };

  const handleDeleteAccount = () => {
    console.log("Deleting account...");
    setShowDeleteDialog(false);
  };

  return (
    <>
      <header className="h-14 flex items-center justify-between px-2 sm:px-4 border-b border-border bg-background">
        {/* left section */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="mr-1 sm:mr-2"
          >
            <Menu className="w-5 h-5" />
          </Button>
          {/* model selector */}
          <div className="flex items-center flex-1 justify-start px-2 max-w-[120px] sm:max-w-xs md:max-w-sm">
            <Select
              value={selectedModel}
              onValueChange={(value) => {
                setModel(value);
                navigate("/");
              }}
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
          {/* Connection Status */}
          <div className="hidden md:flex items-center space-x-2 text-sm">
            <CheckCircle className="w-4 h-4 text-success" />
            <span className="text-success-dark hidden lg:inline">
              Connected to Dataverse Harsh
            </span>
            <span className="text-success-dark lg:hidden">Connected</span>
          </div>

          {/* Mobile Connection Status - Just icon */}
          <div className="md:hidden">
            <CheckCircle className="w-4 h-4 text-success" />
          </div>

          {/* Notification Bell */}
          <Sheet open={notificationOpen} onOpenChange={setNotificationOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Bell className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[90vw] sm:w-96 max-w-md">
              <SheetHeader>
                <SheetTitle className="flex items-center justify-between">
                  Notifications
                  <Button variant="ghost" size="sm">
                    <Filter className="w-4 h-4" />
                  </Button>
                </SheetTitle>
              </SheetHeader>

              <Tabs defaultValue="all" className="mt-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="activities">Activities</TabsTrigger>
                  <TabsTrigger value="updates">Updates</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-4 space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="border rounded-lg p-4 space-y-2"
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
                      <Button size="sm" variant="outline" className="w-full">
                        View
                      </Button>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="activities" className="mt-4 space-y-4">
                  {notifications
                    .filter((n) => n.type === "activity")
                    .map((notification) => (
                      <div
                        key={notification.id}
                        className="border rounded-lg p-4 space-y-2"
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
                        <Button size="sm" variant="outline" className="w-full">
                          View
                        </Button>
                      </div>
                    ))}
                </TabsContent>

                <TabsContent value="updates" className="mt-4 space-y-4">
                  {notifications
                    .filter((n) => n.type === "update")
                    .map((notification) => (
                      <div
                        key={notification.id}
                        className="border rounded-lg p-4 space-y-2"
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
                        <Button size="sm" variant="outline" className="w-full">
                          View
                        </Button>
                      </div>
                    ))}
                </TabsContent>
              </Tabs>
            </SheetContent>
          </Sheet>

          {/* User Authentication Section - Demo Mode */}
          {isLoggedIn ? (
            // Hardcoded logged in user
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-1 sm:space-x-2 p-1 sm:p-2 h-auto"
                >
                  <Avatar className="w-7 h-7 sm:w-8 sm:h-8">
                    <AvatarFallback className="bg-brand text-white font-medium text-xs sm:text-sm">
                      {demoUser?.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline text-sm font-medium text-foreground">
                    {demoUser?.name || 'User'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setShowProfileDialog(true)}>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowInviteDialog(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite
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
          ) : (
            // Show Sign In Button
            <Button
              onClick={() => navigate("/auth")}
              className="bg-brand-light hover:bg-brand-light/90 text-white"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          )}
        </div>
      </header>

      {/* Profile Dialog */}
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

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Invite people</DialogTitle>
            <DialogDescription>
              Lorem Ipsum is simply dummy text of the printing
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex space-x-2">
              <Button className="bg-brand hover:bg-brand/90 text-white">
                Invite with email
              </Button>
              <Button variant="outline">Invite with link</Button>
            </div>

            <div className="space-y-2">
              <Label>Add Team</Label>
              <div className="flex space-x-2">
                <Input placeholder="Enter email" className="flex-1" />
                <Button className="bg-brand hover:bg-brand/90 text-white">
                  Send
                </Button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Lorem Ipsum is simply dummy text of the printing
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation Dialog */}
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

      {/* Delete Account Confirmation Dialog */}
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
    </>
  );
}
