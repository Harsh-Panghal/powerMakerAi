import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X } from 'lucide-react';

interface TraceDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRecord: any;
}

export function TraceDetailsDrawer({ isOpen, onClose, selectedRecord }: TraceDetailsDrawerProps) {
  if (!selectedRecord) return null;

  const mockMessageBlockContent = `&lt;-- Quo eius veniam? --&gt;
&lt;maxime&gt;Ut aliquam rerum.&lt;/maxime&gt;
&lt;qui&gt;In mollitia quis?&lt;/qui&gt;
&lt;velit&gt;Sed dolores quibusdam et minus reiciendis.&lt;/velit&gt;
&lt;voluptates&gt;Qui aperiantur possimus.&lt;/voluptates&gt;&lt;!-- Quo eius veniam? --&gt;
--&gt;
&lt;maxime&gt;Ut aliquam rerum.&lt;/maxime&gt;
&lt;qui&gt;In mollitia quis?&lt;/qui&gt;
&lt;velit&gt;Sed dolores quibusdam et minus reiciendis.&lt;/velit&gt;
&lt;voluptates&gt;Qui aperiantur possimus.&lt;/voluptates&gt;&lt;!-- Quo eius veniam? --&gt;

&lt;maxime&gt;Ut aliquam rerum.&lt;/maxime&gt;
&lt;qui&gt;In mollitia quis?&lt;/qui&gt;
&lt;velit&gt;Sed dolores quibusdam et minus reiciendis.&lt;/velit&gt;
&lt;voluptates&gt;Qui aperiantur possimus.&lt;/voluptates&gt;&lt;!-- Quo eius veniam? --&gt;
--&gt;

&lt;maxime&gt;Ut aliquam rerum.&lt;/maxime&gt;
&lt;qui&gt;In mollitia quis?&lt;/qui&gt;
&lt;velit&gt;Sed dolores quibusdam et minus reiciendis.&lt;/velit&gt;
&lt;voluptates&gt;Qui aperiantur possimus.&lt;/voluptates&gt;&lt;!-- Quo eius veniam? --&gt;

&lt;maxime&gt;Ut aliquam rerum.&lt;/maxime&gt;
&lt;qui&gt;In mollitia quis?&lt;/qui&gt;
&lt;velit&gt;Sed dolores quibusdam et minus reiciendis.&lt;/velit&gt;
&lt;voluptates&gt;Qui aperiantur possimus.&lt;/voluptates&gt;`;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <SheetTitle className="text-lg font-semibold">Details</SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="message" className="h-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="message" className="text-xs">Message Block</TabsTrigger>
            <TabsTrigger value="exception" className="text-xs">Exception Details</TabsTrigger>
            <TabsTrigger value="explanation" className="text-xs">Explanation</TabsTrigger>
            <TabsTrigger value="resolution" className="text-xs">Resolution</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[calc(100vh-200px)] mt-4">
            <TabsContent value="message" className="mt-0 space-y-4">
              <div className="bg-muted/30 rounded-lg p-4">
                <pre className="text-xs whitespace-pre-wrap font-mono text-muted-foreground leading-relaxed">
                  {mockMessageBlockContent}
                </pre>
              </div>
            </TabsContent>
            
            <TabsContent value="exception" className="mt-0 space-y-4">
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  No exception details available for this trace record.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="explanation" className="mt-0 space-y-4">
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  This trace record shows the execution flow of the {selectedRecord.pluginName} plugin during step "{selectedRecord.stepName}".
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="resolution" className="mt-0 space-y-4">
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  No resolution required. Execution completed successfully.
                </p>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}