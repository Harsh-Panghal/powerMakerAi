// UPDATED: Added useRef and useEffect for auto-resize functionality
import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PromptCard } from "@/components/PromptCard";
import {
  Database,
  Calendar,
  Key,
  Settings,
  Search,
  Clock,
  AlertTriangle,
  Timer,
  List,
  DollarSign,
  UserPlus,
  FileText,
} from "lucide-react";
import { useChatStore } from "@/store/chatStore";
import { ImagePreview } from "./ImagePreview";
import { processImage, getImagesFromClipboard, type ImageData } from "@/utils/imageUtils";
import { useToast } from "@/hooks/use-toast";

const promptSuggestionsByModel = {
  "model-0-1": [
    {
      title:
        "Create a custom entity to store API configuration details and suggest relevant columns.",
      icon: Database,
    },
    {
      title: "Add a boolean and a date field to the opportunity entity.",
      icon: Calendar,
    },
    {
      title:
        "I want to store 3rd party integration keys — create a config entity for that.!",
      icon: Key,
    },
    {
      title:
        "Create a settings entity for storing SMTP details with column suggestions.",
      icon: Settings,
    },
  ],
  "model-0-2": [
    {
      title: "Show all plugin trace logs for the account entity.",
      icon: Search,
    },
    {
      title: "Filter trace logs generated in the last 1 hour.",
      icon: Clock,
    },
    {
      title: "Find plugin logs that contain a NullReferenceException.",
      icon: AlertTriangle,
    },
    {
      title: "List trace logs where execution time exceeded 60,000 ms.",
      icon: Timer,
    },
  ],
  "model-0-3": [
    {
      title: "List all attributes of the Account entity..",
      icon: List,
    },
    {
      title: "Show opportunities with Estimated Revenue over 1 lakh.",
      icon: DollarSign,
    },
    {
      title: "Create a contact named John Doe.",
      icon: UserPlus,
    },
    {
      title: "Get all cases with 'refund' in the title.",
      icon: FileText,
    },
  ],
};

const modelOptions = [
  {
    value: "model-0-1",
    title: "Model 0.1",
    subtitle: "CRM Customization",
    icon: Settings,
  },
  {
    value: "model-0-2",
    title: "Model 0.2",
    subtitle: "Plugin Tracing",
    icon: Database,
  },
  {
    value: "model-0-3",
    title: "Model 0.3",
    subtitle: "CRM Expert",
    icon: Key,
  },
];

export function GreetingContainer() {
  const [prompt, setPrompt] = useState("");
  const [pastedImages, setPastedImages] = useState<ImageData[]>([]);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const navigate = useNavigate();
  const { selectedModel, setModel, startChat } = useChatStore();
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
  }, [prompt]);

  const currentPromptSuggestions = useMemo(() => {
    return (
      promptSuggestionsByModel[
        selectedModel as keyof typeof promptSuggestionsByModel
      ] || promptSuggestionsByModel["model-0-1"]
    );
  }, [selectedModel]);

  const handlePromptCardClick = (suggestion: string) => {
    setPrompt(suggestion);
  };

  const handleSend = () => {
    if (prompt.trim() || pastedImages.length > 0) {
      startChat(prompt.trim(), pastedImages.length > 0 ? pastedImages : undefined);
      setPrompt("");
      setPastedImages([]); // Clear all images
      navigate("/chat");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
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
        const processedImages: ImageData[] = [];
        
        // Process all images
        for (const imageFile of images) {
          const processedImage = await processImage(imageFile);
          processedImages.push(processedImage);
        }
        
        // Add to existing images
        setPastedImages(prev => [...prev, ...processedImages]);
        
        toast({
          title: `${processedImages.length} image${processedImages.length > 1 ? 's' : ''} pasted successfully`,
          description: `${processedImages.length} image${processedImages.length > 1 ? 's' : ''} ready to send. Total: ${pastedImages.length + processedImages.length}`,
        });
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to process image';
        
        toast({
          variant: "destructive",
          title: "Error processing images",
          description: errorMessage,
        });
      } finally {
        setIsProcessingImage(false);
      }
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setPastedImages(prev => prev.filter((_, index) => index !== indexToRemove));
    
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

  return (
    <>
      {/* Greeting Container */}
      <div className="flex-1 flex items-center justify-center p-8 lg:mt-12" data-tour="chat-area">
        <div className="max-w-4xl w-full text-center space-y-8">
          {/* Greeting */}
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold text-brand">Hello, Harsh!</h1>
            <h2 className="text-2xl text-brand">
              What would you like to make?
            </h2>
            <p className="text-muted-foreground">
              Use one of the most common prompts below
            </p>
          </div>

          {/* Prompt Cards */}
          <div className="flex gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-4 lg:overflow-visible transition-all duration-300 prompt-cards-scroll" data-tour="prompt-cards">
            {currentPromptSuggestions.map((suggestion, index) => (
              <PromptCard
                key={`${selectedModel}-${index}`}
                title={suggestion.title}
                icon={suggestion.icon}
                onClick={() => handlePromptCardClick(suggestion.title)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* UPDATED: Input Area with Grok-style layout */}
      <div className="p-6 bg-layout-main" data-tour="input-area">
        <div className="max-w-4xl mx-auto">
          {/* Multiple Images Preview */}
          {pastedImages.length > 0 && (
            <div className="mb-4 animate-fade-in">
              {/* Images counter and clear all button */}
              {pastedImages.length > 1 && (
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-muted-foreground">
                    {pastedImages.length} image{pastedImages.length > 1 ? 's' : ''} attached
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveAllImages}
                    className="text-xs h-7"
                  >
                    Remove All
                  </Button>
                </div>
              )}
              
              {/* Compact Images grid */}
              <div className="flex flex-wrap gap-2">
                {pastedImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-border hover:border-brand-light transition-colors">
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
                <div className="mt-2 text-xs text-muted-foreground">
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
                value={prompt}
                onChange={(e) => setPrompt(e.target.value.slice(0, maxLength))}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                className="w-full min-h-[44px] max-h-[200px] p-3 pr-20 rounded-lg border border-input bg-background resize-none focus:outline-none focus:border-brand-light focus:ring-2 focus:ring-brand-light/20 transition-all"
                aria-label="Chat input field"
                disabled={isProcessingImage}
                rows={1}
              />
              
              {/* UPDATED: Character counter positioned bottom-right inside textarea border */}
              <div className="absolute right-3 bottom-2 flex items-center gap-2">
                <span className={`text-xs ${prompt.length > maxLength * 0.9 ? 'text-warning' : 'text-success'}`}>
                  {prompt.length}/{maxLength}
                </span>
                {pastedImages.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    ({pastedImages.length}/{maxImages})
                  </span>
                )}
              </div>
            </div>
            
            {/* UPDATED: Conditional Send button - pill-shaped when content present */}
            {(prompt.trim() || pastedImages.length > 0) && !isProcessingImage && (
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
    </>
  );
}