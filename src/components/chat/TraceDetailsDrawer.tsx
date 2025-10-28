import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingProgressBar } from '@/components/ui/loading-progress-bar';
import { Copy, Check, AlertCircle, Code2, Lightbulb, Wrench } from 'lucide-react';

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

  const formatContentWithLineNumbers = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, index) => {
      const timestampRegex = /(\[\+?\d+ms\])/g;
      const methodRegex = /([A-Z][a-zA-Z0-9]*\.[A-Z][a-zA-Z0-9.]*)/g;
      const filePathRegex = /([a-zA-Z0-9_/\\.-]+\.(java|kt|js|ts|py|xml|json))/gi;
      const numberRegex = /\b(\d+)\b/g;
      const errorKeywordRegex = /\b(ERROR|WARN|FATAL|Exception|Error|Failed|Failure)\b/gi;
      
      let formattedLine = line
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      
      formattedLine = formattedLine.replace(errorKeywordRegex, '<span class="text-red-600 dark:text-red-400 font-semibold">$1</span>');
      formattedLine = formattedLine.replace(timestampRegex, '<span class="text-amber-600 dark:text-amber-400 font-semibold">$1</span>');
      formattedLine = formattedLine.replace(filePathRegex, '<span class="text-purple-600 dark:text-purple-400">$1</span>');
      formattedLine = formattedLine.replace(methodRegex, '<span class="text-blue-600 dark:text-blue-400 font-medium">$1</span>');
      formattedLine = formattedLine.replace(numberRegex, '<span class="text-emerald-600 dark:text-emerald-400">$1</span>');
      
      return { lineNumber: index + 1, content: formattedLine, original: line };
    });
  };

  const formatStructuredContent = (content: string) => {
    const lines = content.split('\n');
    const formatted: JSX.Element[] = [];
    let currentSection: JSX.Element[] = [];
    let sectionIndex = 0;
    let inCodeBlock = false;
    let codeBlockLines: string[] = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Handle code blocks
      if (trimmedLine.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeBlockLines = [];
        } else {
          inCodeBlock = false;
          currentSection.push(
            <div key={`code-block-${index}`} className="my-4 rounded-lg border border-border bg-muted/30 overflow-hidden">
              <div className="bg-muted/50 px-3 py-1.5 border-b border-border">
                <span className="text-xs font-medium text-muted-foreground">Code</span>
              </div>
              <pre className="p-4 text-xs font-mono overflow-x-auto">
                <code>{codeBlockLines.join('\n')}</code>
              </pre>
            </div>
          );
          codeBlockLines = [];
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockLines.push(line);
        return;
      }
      
      if (!trimmedLine) {
        if (currentSection.length > 0) {
          formatted.push(
            <div key={`section-${sectionIndex++}`} className="mb-3">
              {currentSection}
            </div>
          );
          currentSection = [];
        }
        return;
      }

      // Main headers (bold text)
      if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
        const headerText = trimmedLine.replace(/^\*\*|\*\*$/g, '');
        currentSection.push(
          <div key={`header-${index}`} className="flex items-center gap-2 mt-6 mb-3 first:mt-0">
            <div className="h-5 w-1 bg-primary rounded-full" />
            <h3 className="text-base font-semibold text-foreground">
              {headerText}
            </h3>
          </div>
        );
      }
      // Numbered lists
      else if (/^\d+\.\s/.test(trimmedLine)) {
        const [, number, text] = trimmedLine.match(/^(\d+)\.\s(.+)$/) || [];
        const formatted = text
          ?.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-primary/10 border border-primary/20 rounded text-xs font-mono text-primary">$1</code>')
          .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>');
        
        currentSection.push(
          <div key={`numbered-${index}`} className="flex gap-3 mb-3 ml-2">
            <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold mt-0.5">
              {number}
            </span>
            <span 
              className="text-sm leading-relaxed flex-1 pt-0.5"
              dangerouslySetInnerHTML={{ __html: formatted }}
            />
          </div>
        );
      }
      // Bullet points
      else if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
        const bulletText = trimmedLine.substring(2);
        const formatted = bulletText
          .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-primary/10 border border-primary/20 rounded text-xs font-mono text-primary">$1</code>')
          .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>');
        
        currentSection.push(
          <div key={`bullet-${index}`} className="flex gap-3 mb-2.5 ml-2">
            <span className="text-primary font-bold text-base leading-none mt-1.5">•</span>
            <span 
              className="text-sm leading-relaxed flex-1"
              dangerouslySetInnerHTML={{ __html: formatted }}
            />
          </div>
        );
      }
      // Inline code or method references
      else if (trimmedLine.includes('`') || /[A-Z][a-zA-Z0-9]*\.[A-Z]/.test(trimmedLine)) {
        const formatted = trimmedLine
          .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-primary/10 border border-primary/20 rounded text-xs font-mono text-primary">$1</code>')
          .replace(/([A-Z][a-zA-Z0-9]*\.[A-Z][a-zA-Z0-9.]*)/g, '<code class="text-blue-600 dark:text-blue-400 font-medium">$1</code>')
          .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>');
        
        currentSection.push(
          <p 
            key={`code-${index}`}
            className="text-sm leading-relaxed mb-2 text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: formatted }}
          />
        );
      }
      // Regular text
      else {
        const formatted = trimmedLine
          .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>');
        
        currentSection.push(
          <p 
            key={`text-${index}`} 
            className="text-sm leading-relaxed mb-2 text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: formatted }}
          />
        );
      }
    });

    if (currentSection.length > 0) {
      formatted.push(
        <div key={`section-${sectionIndex}`} className="mb-3">
          {currentSection}
        </div>
      );
    }

    return formatted.length > 0 ? formatted : (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        <p className="text-sm">No content available</p>
      </div>
    );
  };

  const isLoadingContent = loading && (activeTab === "explanation" || activeTab === "resolution");

  const tabIcons = {
    message: <Code2 className="h-3.5 w-3.5" />,
    exception: <AlertCircle className="h-3.5 w-3.5" />,
    explanation: <Lightbulb className="h-3.5 w-3.5" />,
    resolution: <Wrench className="h-3.5 w-3.5" />
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl lg:max-w-4xl p-0 flex flex-col">
          <SheetHeader className="px-6 py-4 border-b border-border bg-muted/30 flex-shrink-0">
            <div className="flex items-center justify-between space-y-0">
              <SheetTitle className="text-lg font-semibold">Trace Details</SheetTitle>
            </div>
          </SheetHeader>

          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as typeof activeTab)} className="flex-1 flex flex-col min-h-0">
            <div className="px-6 py-3 border-b border-border bg-background flex-shrink-0 flex items-center justify-between gap-4">
              <TabsList className="grid grid-cols-4 h-10 bg-muted/50 p-1 flex-1">
                <TabsTrigger value="message" className="text-xs font-medium flex items-center gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  {tabIcons.message}
                  <span className="hidden sm:inline">Message</span>
                </TabsTrigger>
                <TabsTrigger value="exception" className="text-xs font-medium flex items-center gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  {tabIcons.exception}
                  <span className="hidden sm:inline">Exception</span>
                </TabsTrigger>
                <TabsTrigger value="explanation" className="text-xs font-medium flex items-center gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  {tabIcons.explanation}
                  <span className="hidden sm:inline">Analysis</span>
                </TabsTrigger>
                <TabsTrigger value="resolution" className="text-xs font-medium flex items-center gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  {tabIcons.resolution}
                  <span className="hidden sm:inline">Solution</span>
                </TabsTrigger>
              </TabsList>
              
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-background hover:bg-accent border border-border rounded-md transition-colors shadow-sm flex-shrink-0"
                title="Copy content"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden min-h-0">
              {isLoadingContent ? (
                <div className="flex items-center justify-center h-full bg-muted/10">
                  <LoadingProgressBar
                    isLoading={true}
                    message="Analyzing trace data..."
                    position="inline"
                    colorScheme="primary"
                  />
                </div>
              ) : (
                <>
                  <TabsContent value="message" className="mt-0 h-full overflow-hidden data-[state=active]:flex data-[state=active]:flex-col">
                    <ScrollArea className="flex-1">
                      <div className="p-6">
                        <div className="rounded-lg border border-border bg-muted/20 overflow-hidden">
                      <div className="bg-muted/50 px-4 py-2 border-b border-border flex items-center gap-2">
                        <Code2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Message Block</span>
                      </div>
                      <div className="p-4">
                        {formatContentWithLineNumbers(getTabContent()).map((line) => (
                          <div 
                            key={line.lineNumber}
                            className="flex gap-4 hover:bg-accent/50 px-3 py-1 -mx-3 rounded-md group transition-colors"
                          >
                            <span className="text-muted-foreground/40 font-mono text-xs select-none min-w-[2.5rem] text-right flex-shrink-0 pt-1 group-hover:text-muted-foreground/60">
                              {line.lineNumber}
                            </span>
                            <pre 
                              className="text-xs whitespace-pre-wrap font-mono flex-1 leading-relaxed text-foreground"
                              dangerouslySetInnerHTML={{ __html: line.content }}
                            />
                          </div>
                        ))}
                      </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="exception" className="mt-0 h-full overflow-hidden data-[state=active]:flex data-[state=active]:flex-col">
                    <ScrollArea className="flex-1">
                      <div className="p-6">
                        <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 overflow-hidden">
                      <div className="bg-red-100/50 dark:bg-red-900/30 px-4 py-2 border-b border-red-200 dark:border-red-900/50 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <span className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wide">Exception Details</span>
                      </div>
                      <div className="p-4">
                        {formatContentWithLineNumbers(getTabContent()).map((line) => (
                          <div 
                            key={line.lineNumber}
                            className="flex gap-4 hover:bg-red-100/50 dark:hover:bg-red-900/20 px-3 py-1 -mx-3 rounded-md group transition-colors"
                          >
                            <span className="text-red-400/60 dark:text-red-600/60 font-mono text-xs select-none min-w-[2.5rem] text-right flex-shrink-0 pt-1 group-hover:text-red-500/80">
                              {line.lineNumber}
                            </span>
                            <pre 
                              className="text-xs whitespace-pre-wrap font-mono flex-1 leading-relaxed text-red-900 dark:text-red-100"
                              dangerouslySetInnerHTML={{ __html: line.content }}
                            />
                          </div>
                        ))}
                      </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="explanation" className="mt-0 h-full overflow-hidden data-[state=active]:flex data-[state=active]:flex-col">
                    <ScrollArea className="flex-1">
                      <div className="p-6">
                        <div className="rounded-lg border border-blue-200 dark:border-blue-900/50 bg-blue-50/30 dark:bg-blue-950/20 overflow-hidden">
                      <div className="bg-blue-100/50 dark:bg-blue-900/30 px-4 py-3 border-b border-blue-200 dark:border-blue-900/50 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide">Error Analysis</span>
                      </div>
                      <div className="p-6">
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          {formatStructuredContent(getTabContent())}
                        </div>
                      </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="resolution" className="mt-0 h-full overflow-hidden data-[state=active]:flex data-[state=active]:flex-col">
                    <ScrollArea className="flex-1">
                      <div className="p-6">
                        <div className="rounded-lg border border-green-200 dark:border-green-900/50 bg-green-50/30 dark:bg-green-950/20 overflow-hidden">
                      <div className="bg-green-100/50 dark:bg-green-900/30 px-4 py-3 border-b border-green-200 dark:border-green-900/50 flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide">Recommended Solution</span>
                      </div>
                      <div className="p-6">
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          {formatStructuredContent(getTabContent())}
                        </div>
                      </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </>
              )}
            </div>
          </Tabs>
      </SheetContent>
    </Sheet>
  );
}