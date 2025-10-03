import { motion } from 'framer-motion';
import { X, Copy, Download } from 'lucide-react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { closePreview } from '@/redux/ChatSlice';

export function PreviewDrawer() {
  const dispatch = useDispatch();
  const { isPreviewOpen, previewContent } = useSelector((state: RootState) => state.chat);
  const { toast } = useToast();

  const handleClose = () => {
    dispatch(closePreview());
  };

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(previewContent);
      toast({
        title: "Copied to clipboard",
        description: "The message content has been copied successfully.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy content to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([previewContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `powermaker-response-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded successfully",
      description: "The response has been saved as a text file.",
    });
  };

  const formatPreviewContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      // Handle table formatting
      if (line.includes('|') && line.includes('---')) {
        return null; // Skip separator lines
      }
      if (line.includes('|')) {
        const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
        return (
          <div key={index} className="grid grid-cols-2 gap-4 border-b border-border/20 py-2 text-sm">
            {cells.map((cell, cellIndex) => (
              <div key={cellIndex} className={`${cellIndex === 0 ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                {cell}
              </div>
            ))}
          </div>
        );
      }
      
      // Handle bold text
      if (line.includes('**')) {
        const parts = line.split('**');
        return (
          <p key={index} className="mb-3 text-sm leading-relaxed">
            {parts.map((part, partIndex) => 
              partIndex % 2 === 1 ? 
                <strong key={partIndex} className="font-semibold text-foreground">{part}</strong> : 
                <span key={partIndex} className="text-muted-foreground">{part}</span>
            )}
          </p>
        );
      }
      
      // Regular text
      return line ? (
        <p key={index} className="mb-3 text-sm leading-relaxed text-muted-foreground">
          {line}
        </p>
      ) : (
        <div key={index} className="mb-2" />
      );
    });
  };

  return (
    <Sheet open={isPreviewOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent side="right" className="w-full sm:w-[600px] sm:max-w-[90vw]" showClose={false}>
        <SheetHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-semibold text-brand">
              Message Preview
            </SheetTitle>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleCopyContent}
                variant="outline"
                size="sm"
                className="h-8"
              >
                <Copy className="w-3 h-3 mr-1.5" />
                Copy
              </Button>
              <Button
                onClick={handleDownload}
                variant="outline"
                size="sm"
                className="h-8"
              >
                <Download className="w-3 h-3 mr-1.5" />
                Download
              </Button>
            </div>
          </div>
          <SheetDescription className="text-sm text-muted-foreground">
            Preview and export the AI assistant's response
          </SheetDescription>
        </SheetHeader>
        
        <Separator className="my-4" />
        
        <ScrollArea className="h-[calc(100vh-200px)] pr-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
              <div className="space-y-3">
                {formatPreviewContent(previewContent)}
              </div>
            </div>
          </motion.div>
        </ScrollArea>
        
        <Separator className="my-4" />
        
        <SheetFooter className="flex justify-between sm:justify-between">
          <div className="text-xs text-muted-foreground">
            {previewContent.length} characters • {previewContent.split(' ').length} words
          </div>
          <SheetClose asChild>
            <Button variant="outline" size="sm" onClick={handleClose}>
              <X className="w-3 h-3 mr-1.5" />
              Close
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}