import { useState } from 'react';
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
  const [pastedImage, setPastedImage] = useState<ImageData | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const { selectedModel, setModel, sendMessage } = useChatStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const maxLength = 1000;

  const handleModelChange = (newModel: string) => {
    setModel(newModel);
    navigate('/');
  };

  const handleSend = () => {
    if (message.trim() || pastedImage) {
      sendMessage(message.trim(), pastedImage || undefined);
      setMessage('');
      setPastedImage(null);
    }
  };

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
      // Only handle the first image (limit to one image at a time)
      const imageFile = images[0];
      
      setIsProcessingImage(true);
      
      try {
        const processedImage = await processImage(imageFile);
        setPastedImage(processedImage);
        
        toast({
          title: "Image pasted successfully",
          description: `${processedImage.name} ready to send`,
        });
        
        // Announce to screen readers
        const announcement = `Image ${processedImage.name} pasted successfully`;
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
          title: "Error processing image",
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

  const handleRemoveImage = () => {
    setPastedImage(null);
    
    toast({
      title: "Image removed",
      description: "Pasted image has been removed",
    });
  };

  return (
    <div className="p-2 sm:p-4 bg-layout-main border-t border-border" data-tour="input-area">
      <div className="max-w-4xl mx-auto px-2 sm:px-4">
        {/* Image Preview */}
        {pastedImage && (
          <div className="mb-2 animate-fade-in">
            <ImagePreview
              imageData={pastedImage.data}
              imageName={pastedImage.name}
              imageSize={pastedImage.size}
              onRemove={handleRemoveImage}
            />
          </div>
        )}
        
        <div className="relative">
          {/* Textarea */}
          <Textarea
            placeholder="Type your message or paste an image..."
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, maxLength))}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            className="w-full min-h-[80px] sm:min-h-[100px] pr-28 sm:pr-32 pb-12 sm:pb-14 resize-none border-brand-light focus:ring-brand-light text-sm sm:text-base align-top"
            aria-label="Message input with image paste support"
            disabled={isProcessingImage}
          />

          {/* Bottom Controls - Character Counter & Send Button */}
          <div className="absolute right-2 sm:right-3 bottom-2 sm:bottom-3 flex items-center space-x-2 sm:space-x-3">
            {/* Character Counter */}
            <span className="text-xs text-muted-foreground inline">
              {message.length}/{maxLength}
            </span>

            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={(!message.trim() && !pastedImage) || isProcessingImage}
              size="sm"
              className="w-7 h-7 sm:w-8 sm:h-8 p-0 rounded-full bg-success-light hover:bg-success text-success-dark flex-shrink-0"
              aria-label="Send message"
            >
              {isProcessingImage ? (
                <div className="w-3 h-3 sm:w-4 sm:h-4 animate-spin border-2 border-current border-t-transparent rounded-full" />
              ) : (
                <Send className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}