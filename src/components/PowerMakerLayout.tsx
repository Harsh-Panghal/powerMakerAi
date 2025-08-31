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
        
        <div className="flex-1 flex flex-col">
          <PowerMakerHeader />
          <ChatArea />
        </div>
      </div>
    </SidebarProvider>
  );
}