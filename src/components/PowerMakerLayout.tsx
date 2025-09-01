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
        
        <div className="flex-1 flex flex-col h-[100dvh] overflow-hidden relative bg-layout-main">
          <div className="flex-shrink-0">
            <PowerMakerHeader />
          </div>
          <div className="bg-layout-main h-[80%] overflow-y-auto overflow-x-hidden">
            <ChatArea />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}