import { SidebarProvider } from "@/components/ui/sidebar";
import { PowerMakerSidebar } from "./PowerMakerSidebar";
import { PowerMakerHeader } from "./PowerMakerHeader";
import { ChatArea } from "./chat/ChatArea";

export function PowerMakerLayout() {
  console.log("PowerMakerLayout rendering");
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <PowerMakerSidebar />
        
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-shrink-0">
            <PowerMakerHeader />
          </div>
          <div className="flex-1 min-h-0 bg-layout-main">
            <ChatArea />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}