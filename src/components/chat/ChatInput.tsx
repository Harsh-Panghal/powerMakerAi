// UPDATED: Added useRef and useEffect for auto-resize functionality
import { useState, useRef, useEffect } from 'react';
import { Send, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Database, Key, Settings } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { useNavigate } from 'react-router-dom';
import { ImagePreview } from './ImagePreview';
import { processImage, getImagesFromClipboard, type ImageData } from '@/utils/imageUtils';
import { useToast } from '@/hooks/use-toast';

const modelOptions = [
  { 
    value: "model-0-1", 
    title: "Model 0.1", 
    subtitle: "CRM Customization",
    icon: Settings
  },
  { 
    value: "model-0-2", 
    title: "Model 0.2", 
    subtitle: "Plugin Tracing",
    icon: Database
  },
  { 
    value: "model-0-3", 
    title: "Model 0.3", 
    subtitle: "CRM Expert",
    icon: Key
  }
];

export function ChatInput() {
  const [message, setMessage] = useState('');
  const [pastedImages, setPastedImages] = useState<ImageData[]>([]);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const { selectedModel, setModel, sendMessage } = useChatStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const maxLength = 1000;
  const maxImages = 10;
  
  // UPDATED: Added ref for auto-resize functionality
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // UPDATED: Auto-resize textarea functionality
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  }, [message]);

  const handleModelChange = (newModel: string) => {
    setModel(newModel);
    navigate('/');
  };

  const handleSend = () => {
    if (message.trim() || pastedImages.length > 0) {
      sendMessage(message.trim(), pastedImages.length > 0 ? pastedImages : undefined);
      setMessage('');
      setPastedImages([]);
    }
  };

  // UPDATED: Enter sends, Shift+Enter for newline
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    const images = getImagesFromClipboard(clipboardData);
    
    if (images.length > 0) {
      // Check if adding new images would exceed the limit
      if (pastedImages.length + images.length > maxImages) {
        toast({
          variant: "destructive",
          title: "Too many images",
          description: `Maximum ${maxImages} images allowed. Current: ${pastedImages.length}`,
        });
        return;
      }

      setIsProcessingImage(true);
      
      try {
        const processedImages = await Promise.all(images.map(image => processImage(image)));
        setPastedImages(prev => [...prev, ...processedImages]);
        
        toast({
          title: `${processedImages.length} image${processedImages.length > 1 ? 's' : ''} pasted successfully`,
          description: `${processedImages.length} image${processedImages.length > 1 ? 's' : ''} ready to send. Total: ${pastedImages.length + processedImages.length}`,
        });
        
        // Announce to screen readers
        const announcement = `${processedImages.length} image${processedImages.length > 1 ? 's' : ''} pasted successfully`;
        const ariaLiveRegion = document.createElement('div');
        ariaLiveRegion.setAttribute('aria-live', 'polite');
        ariaLiveRegion.setAttribute('aria-atomic', 'true');
        ariaLiveRegion.className = 'sr-only';
        ariaLiveRegion.textContent = announcement;
        document.body.appendChild(ariaLiveRegion);
        
        setTimeout(() => {
          document.body.removeChild(ariaLiveRegion);
        }, 1000);
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to process image';
        
        toast({
          variant: "destructive",
          title: "Error processing images",
          description: errorMessage,
        });
        
        // Announce error to screen readers
        const announcement = `Error: ${errorMessage}`;
        const ariaLiveRegion = document.createElement('div');
        ariaLiveRegion.setAttribute('aria-live', 'assertive');
        ariaLiveRegion.setAttribute('aria-atomic', 'true');
        ariaLiveRegion.className = 'sr-only';
        ariaLiveRegion.textContent = announcement;
        document.body.appendChild(ariaLiveRegion);
        
        setTimeout(() => {
          document.body.removeChild(ariaLiveRegion);
        }, 1000);
      } finally {
        setIsProcessingImage(false);
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setPastedImages(prev => prev.filter((_, i) => i !== index));
    
    toast({
      title: "Image removed",
      description: `Image has been removed. Remaining: ${pastedImages.length - 1}`,
    });
  };

  const handleRemoveAllImages = () => {
    setPastedImages([]);
    
    toast({
      title: "All images removed",
      description: "All pasted images have been removed",
    });
  };

  // UPDATED: Bottom-fixed container with Grok-style layout
  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 bg-background border-t border-border shadow-lg" data-tour="input-area">
      <div className="max-w-4xl mx-auto p-3 sm:p-4">
        {/* Compact Image Previews */}
        {pastedImages.length > 0 && (
          <div className="mb-3 animate-fade-in">
            {/* Images counter and clear all button */}
            {pastedImages.length > 1 && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {pastedImages.length} image{pastedImages.length > 1 ? 's' : ''} attached
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveAllImages}
                  className="text-xs h-6 sm:h-7 px-2"
                >
                  Remove All
                </Button>
              </div>
            )}
            
            {/* Compact Images - Horizontal scrollable */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {pastedImages.map((image, index) => (
                <div key={`${image.name}-${index}`} className="relative group flex-shrink-0">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-border hover:border-brand-light transition-colors">
                    <img
                      src={image.data}
                      alt={`Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Remove button */}
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-error hover:bg-error-dark text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label={`Remove image ${index + 1}`}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Images limit indicator */}
            {pastedImages.length >= maxImages - 2 && (
              <div className="mt-1 text-xs text-muted-foreground">
                {pastedImages.length}/{maxImages} images
              </div>
            )}
          </div>
        )}
        
        {/* UPDATED: Grok-style input container with flex layout */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2">
          <div className="relative flex-1">
            {/* UPDATED: Auto-resizing textarea with ref */}
            <textarea
              ref={textareaRef}
              placeholder="Type your message or paste images..."
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, maxLength))}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              className="w-full min-h-[44px] max-h-[200px] p-3 pr-20 rounded-lg border border-input bg-background resize-none focus:outline-none focus:border-brand-light focus:ring-2 focus:ring-brand-light/20 transition-all text-sm sm:text-base"
              aria-label="Chat input field"
              disabled={isProcessingImage}
              rows={1}
            />
            
            {/* UPDATED: Character counter positioned bottom-right inside textarea border */}
            <div className="absolute right-3 bottom-2 flex items-center gap-2">
              <span className={`text-xs ${message.length > maxLength * 0.9 ? 'text-warning' : 'text-success'}`}>
                {message.length}/{maxLength}
              </span>
              {pastedImages.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  ({pastedImages.length}/{maxImages})
                </span>
              )}
            </div>
          </div>
          
          {/* UPDATED: Conditional Send button - pill-shaped when content present */}
          {(message.trim() || pastedImages.length > 0) && !isProcessingImage && (
            <Button
              onClick={handleSend}
              className="self-end sm:self-auto h-11 px-6 rounded-full bg-brand hover:bg-brand-medium text-white font-semibold transition-all animate-scale-in"
              aria-label="Send message"
            >
              Send
            </Button>
          )}
          
          {/* Processing indicator */}
          {isProcessingImage && (
            <div className="self-end sm:self-auto h-11 px-6 flex items-center">
              <div className="w-5 h-5 animate-spin border-2 border-brand border-t-transparent rounded-full" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}