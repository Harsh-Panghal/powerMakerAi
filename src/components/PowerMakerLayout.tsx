import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { PowerMakerSidebar } from "./PowerMakerSidebar";
import { PowerMakerHeader } from "./PowerMakerHeader";
import { OnboardingChecklist, useOnboardingChecklist } from "./OnboardingChecklist";

export function PowerMakerLayout() {
  console.log("PowerMakerLayout rendering");
  
  const { isChecklistOpen, shouldShowChecklist, closeChecklist } = useOnboardingChecklist();
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <PowerMakerSidebar />
        
        <div className="flex-1 flex flex-col h-[100dvh] overflow-hidden relative bg-layout-main transition-all duration-300 ease-linear">
          <div className="flex-shrink-0">
            <PowerMakerHeader />
          </div>
          <div className="bg-layout-main overflow-y-auto overflow-x-hidden">
            <Outlet />
          </div>
        </div>
      </div>
      
      {/* Onboarding Checklist */}
      <OnboardingChecklist
        isOpen={isChecklistOpen}
        onClose={closeChecklist}
      />
    </SidebarProvider>
  );
}