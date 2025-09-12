import { useState, useMemo } from "react";
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
  const [pastedImage, setPastedImage] = useState<ImageData | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const navigate = useNavigate();
  const { selectedModel, setModel, startChat } = useChatStore();
  const { toast } = useToast();
  const maxLength = 1000;

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
    if (prompt.trim() || pastedImage) {
      startChat(prompt.trim(), pastedImage || undefined);
      setPrompt("");
      setPastedImage(null);
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
      const imageFile = images[0];
      
      setIsProcessingImage(true);
      
      try {
        const processedImage = await processImage(imageFile);
        setPastedImage(processedImage);
        
        toast({
          title: "Image pasted successfully",
          description: `${processedImage.name} ready to send`,
        });
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to process image';
        
        toast({
          variant: "destructive",
          title: "Error processing image",
          description: errorMessage,
        });
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

      {/* Input Area */}
      <div className="p-6 bg-layout-main" data-tour="input-area">
        <div className="max-w-4xl mx-auto">
          {/* Image Preview */}
          {pastedImage && (
            <div className="mb-4 animate-fade-in">
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
              value={prompt}
              onChange={(e) => setPrompt(e.target.value.slice(0, maxLength))}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              className="w-full min-h-[100px] pr-28 lg:pr-30 pb-14 resize-none border-brand-light focus:ring-brand-light leading-[1.4] align-top"
              aria-label="Message input with image paste support"
              disabled={isProcessingImage}
            />

            {/* Bottom Controls - Character Counter & Send Button */}
            <div className="absolute right-3 bottom-3 flex items-center space-x-3">
              {/* Character Counter */}
              <span className="text-xs text-muted-foreground">
                {prompt.length}/{maxLength}
              </span>

              {/* Send Button */}
              <Button
                onClick={handleSend}
                disabled={(!prompt.trim() && !pastedImage) || isProcessingImage}
                size="sm"
                className="w-8 h-8 p-0 rounded-full bg-success-light hover:bg-success text-success-dark"
                aria-label="Send message"
              >
                {isProcessingImage ? (
                  <div className="w-4 h-4 animate-spin border-2 border-current border-t-transparent rounded-full" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
