import { Menu, Bell, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSidebar } from "@/components/ui/sidebar";

export function PowerMakerHeader() {
  const { toggleSidebar } = useSidebar();

  return (
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
        <Button variant="ghost" size="sm">
          <Bell className="w-5 h-5" />
        </Button>

        {/* User Profile */}
        <div className="flex items-center space-x-2">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-warning text-white font-medium">
              H
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-foreground">Harsh</span>
        </div>
      </div>
    </header>
  );
}