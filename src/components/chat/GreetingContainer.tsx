import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useChat } from "../../redux/useChat";
import { useDispatch } from "react-redux";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setChatId } from "../../redux/ChatSlice";
import { auth } from "../../config/firebase config/firebase.config";
import { onAuthStateChanged } from "firebase/auth";


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
  // const [prompt, setPrompt] = useState("");
  const [pastedImages, setPastedImages] = useState<ImageData[]>([]); // Changed to array
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const navigate = useNavigate();
  const { selectedModel, setModel, startChat } = useChatStore();
  const { toast } = useToast();
  const { user } = useSelector((state: RootState) => state.auth);
  const maxLength = 1000;
  const maxImages = 10; // Set maximum number of images allowed

  const { input, setInput, onSent } = useChat();
  const { chatId: routeChatId } = useParams<{ chatId?: string }>();
  const storeChatId = useSelector((state: RootState) => state.chat.chatId);
  const chatId = routeChatId || storeChatId;

  const inputLength = input.trim().length;
  const isInputEmpty = inputLength === 0;

  const currentModel = useSelector(
    (state: RootState) => state.model.currentModel
  );

  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (routeChatId) {
      dispatch(setChatId(routeChatId));
    }
  }, [routeChatId]);

  const currentPromptSuggestions = useMemo(() => {
    return (
      promptSuggestionsByModel[
        selectedModel as keyof typeof promptSuggestionsByModel
      ] || promptSuggestionsByModel["model-0-1"]
    );
  }, [selectedModel]);



  const handlePromptCardClick = (prompt: string) => {
    if (!prompt.trim()) return;

    // Create a new chat, then send prompt
    newChatMutation
      .mutateAsync()
      .then(async (data) => {
        // //console.log("Card click - new chat:", data);
        navigate(`/c/${data.chatId}`);
        await onSent(prompt, data.chatId, 0, currentModel);
        queryClient.invalidateQueries({ queryKey: ["recentChats"] });
      })
      .catch((err) => {
        console.error("Error from card click:", err);
      });
  };

   //handle newchat api
  const newChatMutation = useMutation({
    mutationFn: async () => {
      return await fetch(`${import.meta.env.VITE_BACKEND_API}/chat/newchat`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentModel }),
      }).then((res) => res.json());
    },
    onSuccess: async (data) => {
      //console.log("New chat created with ID:", data);
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      // navigate(`/c/${data.chatId}`);
      // send the prompt using the new chatId
      queryClient.invalidateQueries({ queryKey: ["recentChats"] });
      queryClient.invalidateQueries({ queryKey: ["recentChats"] });

      // REMOVE THIS: becoz it tigger twice, once when onSuccess mutation and once from handleprompt
      // await onSent(input, data.chatId, 0, currentModel); // Send the prompt to the chat      
    },
  });
  const handleSend = async () => {
    if (!input.trim()) return;

    try {
      if (!chatId) {
        const data = await newChatMutation.mutateAsync();
        if (data?.chatId) {
          navigate(`/c/${data.chatId}`);
          await onSent(input, data.chatId, 0, currentModel);
          queryClient.invalidateQueries({ queryKey: ["recentChats"] });
        }
      } else {
        await onSent(input, chatId, 0, currentModel);
        queryClient.invalidateQueries({ queryKey: ["recentChats"] });
      }
    } catch (error) {
      console.error("Error handling prompt input:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isInputEmpty) {
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

  const firstName = ((fullName: string = "") => {
    const first = fullName.trim().split(" ")[0] || "";
    return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
  })(user?.displayName || "");

  return (
    <>
      {/* Greeting Container */}
      <div className="flex-1 flex items-center justify-center p-8 lg:mt-12" data-tour="chat-area">
        <div className="max-w-4xl w-full text-center space-y-8">
          {/* Greeting */}
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold text-brand">Hello, {firstName} !</h1>
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
                    {/* Compact Image Preview */}
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-gray-300 transition-colors">
                      <img
                        src={image.data}
                        alt={`Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Remove button overlay */}
                      <button
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-0 right-0 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-bl-lg flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label={`Remove image ${index + 1}`}
                      >
                        ×
                      </button>
                      
                      {/* Image index badge */}
                      <div className="absolute bottom-0 left-0 bg-black/70 text-white text-xs rounded-tr-lg px-1.5 py-0.5 min-w-[16px] text-center">
                        {index + 1}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Images limit indicator */}
              {pastedImages.length >= maxImages - 2 && (
                <div className="mt-2 text-xs text-muted-foreground text-center">
                  {pastedImages.length}/{maxImages} images
                </div>
              )}
            </div>
          )}
          
          <div className="relative">
            {/* Textarea */}
            <Textarea
              placeholder={`Type your message or paste ${pastedImages.length === 0 ? 'images' : 'more images'}... (${pastedImages.length}/${maxImages} images)`}
              value={input}
              onChange={(e) => dispatch(setInput(e.target.value))}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              className="w-full min-h-[100px] pr-28 lg:pr-30 pb-14 resize-none border-brand-light focus:ring-brand-light leading-[1.4] align-top"
              aria-label="Message input with multiple image paste support"
              disabled={isProcessingImage}
            />

            {/* Bottom Controls - Character Counter & Send Button */}
            <div className="absolute right-3 bottom-3 flex items-center space-x-3">
              {/* Character Counter */}
              <span className="text-xs text-muted-foreground">
                {input.length}/{maxLength}
              </span>

              {/* Images Counter */}
              {pastedImages.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {pastedImages.length} img
                </span>
              )}

              {/* Send Button */}
              <Button
                onClick={handleSend}
                disabled={(!input.trim() && pastedImages.length === 0) || isProcessingImage}
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