import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingProgressBar } from '@/components/ui/loading-progress-bar';
import { Copy, Check } from 'lucide-react';

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
  const [copied, setCopied] = useState(false);

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

  const handleCopy = () => {
    const content = getTabContent();
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

  // Format content with line numbers and syntax highlighting
  const formatContentWithLineNumbers = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, index) => {
      // Highlight timestamps
      const timestampRegex = /(\[\+?\d+ms\])/g;
      // Highlight method/class names
      const methodRegex = /([A-Z][a-zA-Z0-9]*\.[A-Z][a-zA-Z0-9.]*)/g;
      // Highlight special keywords
      const keywordRegex = /\*\*(.*?)\*\*/g;
      
      let formattedLine = line;
      
      // Apply formatting
      formattedLine = formattedLine.replace(timestampRegex, '<span class="text-orange-600 dark:text-orange-400 font-semibold">$1</span>');
      formattedLine = formattedLine.replace(methodRegex, '<span class="text-blue-600 dark:text-blue-400 font-medium">$1</span>');
      formattedLine = formattedLine.replace(keywordRegex, '<strong class="text-foreground">$1</strong>');
      
      return { lineNumber: index + 1, content: formattedLine, original: line };
    });
  };

  // Format explanation/resolution with better structure
  const formatStructuredContent = (content: string) => {
    const lines = content.split('\n');
    const formatted: JSX.Element[] = [];
    let currentSection: JSX.Element[] = [];
    let sectionIndex = 0;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        if (currentSection.length > 0) {
          formatted.push(
            <div key={`section-${sectionIndex++}`} className="mb-4">
              {currentSection}
            </div>
          );
          currentSection = [];
        }
        return;
      }

      // Headers (bold text)
      if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
        const headerText = trimmedLine.replace(/^\*\*|\*\*$/g, '');
        currentSection.push(
          <h3 key={`header-${index}`} className="text-base font-semibold text-foreground mb-2 mt-4 first:mt-0">
            {headerText}
          </h3>
        );
      }
      // Bullet points
      else if (trimmedLine.startsWith('* ')) {
        const bulletText = trimmedLine.substring(2);
        const formatted = bulletText
          .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">$1</code>')
          .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        
        currentSection.push(
          <div key={`bullet-${index}`} className="flex gap-2 mb-2 ml-4">
            <span className="text-muted-foreground mt-1">•</span>
            <span 
              className="text-sm leading-relaxed flex-1"
              dangerouslySetInnerHTML={{ __html: formatted }}
            />
          </div>
        );
      }
      // Code/method references
      else if (trimmedLine.includes('`') || /[A-Z][a-zA-Z0-9]*\.[A-Z]/.test(trimmedLine)) {
        const formatted = trimmedLine
          .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-muted rounded text-xs font-mono text-blue-600 dark:text-blue-400">$1</code>')
          .replace(/([A-Z][a-zA-Z0-9]*\.[A-Z][a-zA-Z0-9.]*)/g, '<code class="text-blue-600 dark:text-blue-400 font-medium">$1</code>');
        
        currentSection.push(
          <p 
            key={`code-${index}`}
            className="text-sm leading-relaxed mb-2"
            dangerouslySetInnerHTML={{ __html: formatted }}
          />
        );
      }
      // Regular text
      else {
        currentSection.push(
          <p key={`text-${index}`} className="text-sm leading-relaxed mb-2">
            {trimmedLine}
          </p>
        );
      }
    });

    if (currentSection.length > 0) {
      formatted.push(
        <div key={`section-${sectionIndex}`} className="mb-4">
          {currentSection}
        </div>
      );
    }

    return formatted;
  };

  const isLoadingContent = loading && (activeTab === "explanation" || activeTab === "resolution");

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl lg:max-w-3xl">
        <SheetHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <SheetTitle className="text-lg font-semibold">Details</SheetTitle>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as typeof activeTab)} className="h-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="grid grid-cols-4 w-auto">
              <TabsTrigger value="message" className="text-xs px-4">
                Message Block
              </TabsTrigger>
              <TabsTrigger value="exception" className="text-xs px-4">
                Exception Details
              </TabsTrigger>
              <TabsTrigger value="explanation" className="text-xs px-4">
                Explanation
              </TabsTrigger>
              <TabsTrigger value="resolution" className="text-xs px-4">
                Resolution
              </TabsTrigger>
            </TabsList>
            
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 text-xs bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
              title="Copy content"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </>
              )}
            </button>
          </div>
          
          <div className="border rounded-lg bg-card h-[calc(100vh-200px)]">
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
                <TabsContent value="message" className="mt-0 p-4">
                  <div className="space-y-0">
                    {formatContentWithLineNumbers(getTabContent()).map((line) => (
                      <div 
                        key={line.lineNumber}
                        className="flex gap-4 hover:bg-muted/50 px-2 py-0.5 -mx-2 rounded group"
                      >
                        <span className="text-muted-foreground/50 font-mono text-xs select-none min-w-[2rem] text-right flex-shrink-0 pt-0.5">
                          {line.lineNumber}
                        </span>
                        <pre 
                          className="text-xs whitespace-pre-wrap font-mono flex-1 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: line.content }}
                        />
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="exception" className="mt-0 p-4">
                  <div className="space-y-0">
                    {formatContentWithLineNumbers(getTabContent()).map((line) => (
                      <div 
                        key={line.lineNumber}
                        className="flex gap-4 hover:bg-muted/50 px-2 py-0.5 -mx-2 rounded group"
                      >
                        <span className="text-muted-foreground/50 font-mono text-xs select-none min-w-[2rem] text-right flex-shrink-0 pt-0.5">
                          {line.lineNumber}
                        </span>
                        <pre 
                          className="text-xs whitespace-pre-wrap font-mono flex-1 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: line.content }}
                        />
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="explanation" className="mt-0 p-6">
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    {formatStructuredContent(getTabContent())}
                  </div>
                </TabsContent>
                
                <TabsContent value="resolution" className="mt-0 p-6">
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    {formatStructuredContent(getTabContent())}
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