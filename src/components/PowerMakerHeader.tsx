import { useState } from "react";
import { Menu, Bell, CheckCircle, User, UserPlus, LogOut, X, Camera, Filter, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSidebar } from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export function PowerMakerHeader() {
  const { toggleSidebar } = useSidebar();
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  // Mock notification data
  const notifications = [
    {
      id: 1,
      type: "trace",
      title: "Plugin Execution Trace",
      startDate: "2024-01-15 10:30",
      endDate: "2024-01-15 10:35",
      plugin: "ContactValidation",
      stage: "PreOperation"
    },
    {
      id: 2,
      type: "activity",
      title: "Entity Created Successfully",
      startDate: "2024-01-15 09:45",
      endDate: "2024-01-15 09:46",
      plugin: "EntityCreation",
      stage: "PostOperation"
    },
    {
      id: 3,
      type: "update",
      title: "Configuration Updated",
      startDate: "2024-01-15 08:20",
      endDate: "2024-01-15 08:21",
      plugin: "ConfigManager",
      stage: "PreValidation"
    }
  ];

  const handleLogout = () => {
    console.log("Logging out...");
    setShowLogoutDialog(false);
  };

  const handleDeleteAccount = () => {
    console.log("Deleting account...");
    setShowDeleteDialog(false);
  };

  return (
    <>
      <header className="h-14 flex items-center justify-between px-4 border-b border-border bg-background">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm" 
            onClick={toggleSidebar}
            className="mr-2"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2 text-sm">
            <CheckCircle className="w-4 h-4 text-success" />
            <span className="text-success-dark">Connected to Dataverse Harsh</span>
          </div>

          {/* Notification Bell */}
          <Sheet open={notificationOpen} onOpenChange={setNotificationOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Bell className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-96">
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
                    <div key={notification.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
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
                  {notifications.filter(n => n.type === 'activity').map((notification) => (
                    <div key={notification.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
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
                  {notifications.filter(n => n.type === 'update').map((notification) => (
                    <div key={notification.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
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

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 p-2 h-auto">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-warning text-white font-medium">
                    H
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-foreground">Harsh</span>
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
              <DropdownMenuItem onClick={() => setShowLogoutDialog(true)}>
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Profile Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
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
                <Button size="sm" className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-brand hover:bg-brand/90">
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
              <Button variant="outline">
                Invite with link
              </Button>
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