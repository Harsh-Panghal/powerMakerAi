import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingProgressBar } from '@/components/ui/loading-progress-bar';

interface TraceDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRecord: any;
}

interface ErrorSolution {
  explanation: string;
  resolution: string;
}

export function TraceDetailsDrawer({ isOpen, onClose, selectedRecord }: TraceDetailsDrawerProps) {
  const [errorSolution, setErrorSolution] = useState<ErrorSolution | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"message" | "exception" | "explanation" | "resolution">("message");

  // Fetch error solution when record changes
  useEffect(() => {
    async function fetchErrorSolution() {
      if (!selectedRecord || !selectedRecord.exceptionDetails) {
        setErrorSolution(null);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_API}/users/pluginerrorresolution`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(selectedRecord),
        });
        
        const result = await response.json();
        setErrorSolution(result.errorSolution);
      } catch (error) {
        console.error("Failed to fetch error solution:", error);
        setErrorSolution({ 
          explanation: "Error fetching explanation.", 
          resolution: "Error fetching resolution." 
        });
      } finally {
        setLoading(false);
      }
    }

    if (isOpen && selectedRecord) {
      fetchErrorSolution();
    }
  }, [selectedRecord, isOpen]);

  // Reset tab when drawer opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab("message");
    }
  }, [isOpen]);

  if (!selectedRecord) return null;

  const getTabContent = () => {
    switch (activeTab) {
      case "message":
        return selectedRecord?.messageBlock || "No message block available.";
      case "exception":
        return selectedRecord?.exceptionDetails || "No exception details available.";
      case "explanation":
        return errorSolution?.explanation || "No explanation available.";
      case "resolution":
        return errorSolution?.resolution || "No resolution available.";
      default:
        return "";
    }
  };

  const isLoadingContent = loading && (activeTab === "explanation" || activeTab === "resolution");

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md lg:max-w-lg">
        <SheetHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <SheetTitle className="text-lg font-semibold">Details</SheetTitle>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as typeof activeTab)} className="h-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="message" className="text-xs">
              Message Block
            </TabsTrigger>
            <TabsTrigger value="exception" className="text-xs">
              Exception
            </TabsTrigger>
            <TabsTrigger value="explanation" className="text-xs">
              Explanation
            </TabsTrigger>
            <TabsTrigger value="resolution" className="text-xs">
              Resolution
            </TabsTrigger>
          </TabsList>
          
          <div className="border rounded-lg bg-muted/30 p-4 h-[calc(100vh-250px)]">
            {isLoadingContent ? (
              <div className="flex items-center justify-center h-full">
                <LoadingProgressBar
                  isLoading={true}
                  message="Loading analysis..."
                  position="inline"
                  colorScheme="primary"
                />
              </div>
            ) : (
              <ScrollArea className="h-full">
                <TabsContent value="message" className="mt-0">
                  <pre className="text-xs whitespace-pre-wrap font-mono text-muted-foreground leading-relaxed">
                    {getTabContent()}
                  </pre>
                </TabsContent>
                
                <TabsContent value="exception" className="mt-0">
                  <pre className="text-xs whitespace-pre-wrap font-mono text-muted-foreground leading-relaxed">
                    {getTabContent()}
                  </pre>
                </TabsContent>
                
                <TabsContent value="explanation" className="mt-0">
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {getTabContent()}
                  </div>
                </TabsContent>
                
                <TabsContent value="resolution" className="mt-0">
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {getTabContent()}
                  </div>
                </TabsContent>
              </ScrollArea>
            )}
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}