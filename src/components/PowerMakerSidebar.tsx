import { useState } from "react";
import { Plus, ChevronDown, MoreHorizontal, HelpCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export function PowerMakerSidebar() {
  const [showAllChats, setShowAllChats] = useState(false);
  const [hoveredChat, setHoveredChat] = useState<number | null>(null);
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="bg-layout-sidebar border-r border-border/30">
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          {!isCollapsed && (
            <>
              <span className="font-semibold text-brand">PowerMaker AI</span>
              <span className="text-xs bg-brand/10 text-brand px-2 py-1 rounded">Beta</span>
            </>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-y-auto">
        {/* New Chat Button */}
        <div className="p-4">
          <Button 
            className="w-full justify-center bg-transparent border border-border hover:bg-sidebar-accent text-brand"
            variant="outline"
          >
            <Plus className="w-4 h-4" />
            {!isCollapsed && <span className="ml-2">New Chat</span>}
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
                      className="flex items-center justify-between px-4 py-2 mx-2 hover:bg-sidebar-accent rounded-md group transition-all duration-200 ease-in-out"
                    >
                      <SidebarMenuButton className="flex-1 justify-start p-0 h-auto">
                        <span className="text-sm text-sidebar-foreground truncate">
                          {chat}
                        </span>
                      </SidebarMenuButton>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
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
        <div className="space-y-2">
          <SidebarMenuButton className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent">
            <HelpCircle className="w-4 h-4" />
            {!isCollapsed && <span className="ml-2">Help</span>}
          </SidebarMenuButton>
          <SidebarMenuButton className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent">
            <Settings className="w-4 h-4" />
            {!isCollapsed && <span className="ml-2">Settings</span>}
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}