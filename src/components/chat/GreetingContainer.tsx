import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Send, ImagePlus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { processImage, getImagesFromClipboard, type ImageData } from "@/utils/imageUtils";
import { useToast } from "@/hooks/use-toast";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useChat } from "../../redux/useChat";
import { useDispatch } from "react-redux";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setChatId, setInput } from "../../redux/ChatSlice";
import { setCurrentModel } from "../../redux/ModelSlice";

const promptSuggestionsByModel = {
  0: [
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
  1: [
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
  2: [
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

export function GreetingContainer() {
  const [pastedImages, setPastedImages] = useState<ImageData[]>([]);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useSelector((state: RootState) => state.auth);
  const maxLength = 1000;
  const maxImages = 10;

  const { input, onSent } = useChat();
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

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "24px";
      const newHeight = Math.min(textarea.scrollHeight, 200);
      textarea.style.height = `${newHeight}px`;
    }
  }, [input]);

  const currentPromptSuggestions = useMemo(() => {
    return (
      promptSuggestionsByModel[
        currentModel as keyof typeof promptSuggestionsByModel
      ] || promptSuggestionsByModel[0]
    );
  }, [currentModel]);

  const handlePromptCardClick = (prompt: string) => {
    if (!prompt.trim()) return;

    newChatMutation
      .mutateAsync()
      .then(async (data) => {
        navigate(`/c/${data.chatId}`);
        await onSent(prompt, data.chatId, 0, currentModel);
        queryClient.invalidateQueries({ queryKey: ["recentChats"] });
      })
      .catch((err) => {
        console.error("Error from card click:", err);
      });
  };

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
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      queryClient.invalidateQueries({ queryKey: ["recentChats"] });
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
        const processedImages = await Promise.all(
          images.map((image) => processImage(image))
        );
        setPastedImages((prev) => [...prev, ...processedImages]);

        toast({
          title: `${processedImages.length} image${
            processedImages.length > 1 ? "s" : ""
          } pasted successfully`,
          description: `${processedImages.length} image${
            processedImages.length > 1 ? "s" : ""
          } ready to send. Total: ${
            pastedImages.length + processedImages.length
          }`,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to process image";

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

  const handleRemoveImage = (index: number) => {
    setPastedImages((prev) => prev.filter((_, i) => i !== index));
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

  const handleImageUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = async (e: any) => {
      const files = Array.from(e.target.files || []) as File[];
      if (files.length === 0) return;

      if (pastedImages.length + files.length > maxImages) {
        toast({
          variant: "destructive",
          title: "Too many images",
          description: `Maximum ${maxImages} images allowed.`,
        });
        return;
      }

      setIsProcessingImage(true);
      try {
        const processedImages = await Promise.all(
          files.map((file) => processImage(file))
        );
        setPastedImages((prev) => [...prev, ...processedImages]);
        toast({
          title: `${processedImages.length} image${processedImages.length > 1 ? "s" : ""} uploaded`,
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error uploading images",
          description: error instanceof Error ? error.message : "Failed to upload",
        });
      } finally {
        setIsProcessingImage(false);
      }
    };
    input.click();
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
            <h1 className="text-4xl font-semibold text-brand">Hello, {firstName}!</h1>
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
                key={`${currentModel}-${index}`}
                title={suggestion.title}
                icon={suggestion.icon}
                onClick={() => handlePromptCardClick(suggestion.title)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Input Area - Matching ChatInput Style */}
      <div className="p-2 bg-layout-main" data-tour="input-area">
        <div className="max-w-4xl mx-auto px-2 sm:px-4">
          {/* Image Previews with Brand Colors */}
          {pastedImages.length > 0 && (
            <div className="mb-3">
              <div className="backdrop-blur-xl bg-white/60 rounded-2xl p-3 border border-border shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-brand flex items-center gap-1">
                    <ImagePlus className="w-3.5 h-3.5" />
                    {pastedImages.length} attached
                  </span>
                  <button
                    onClick={handleRemoveAllImages}
                    className="text-xs text-brand-light hover:text-brand font-semibold transition-colors"
                  >
                    Clear
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {pastedImages.map((image, index) => (
                    <div key={`${image.name}-${index}`} className="relative group">
                      <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                        <img
                          src={image.data}
                          alt={`Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveImage(index)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-error hover:bg-error-dark text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                        aria-label={`Remove image ${index + 1}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Main Input Container with Brand Colors */}
          <div className="relative">
            {/* Animated Brand Gradient Border */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-brand/30 via-brand-medium/10 to-brand-light/20 rounded-3xl opacity-60 blur-sm hover:opacity-80 transition duration-300" />
            
            <div className={`relative backdrop-blur-xl bg-white/95 rounded-3xl transition-all duration-300 ${
              isFocused 
                ? input.length >= maxLength 
                  ? 'shadow-lg ring-2 ring-error/60' 
                  : 'shadow-lg ring-2 ring-brand-light'
                : input.length >= maxLength
                  ? 'ring-1 ring-error/40 shadow-lg'
                  : 'shadow-lg'
            }`}>
              {/* Shimmer Effect */}
              {isFocused && (
                <div className="absolute inset-0 rounded-3xl overflow-hidden">
                  <div className="absolute inset-0 translate-x-[-100%] animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-brand-light/10 to-transparent" />
                </div>
              )}

              <div className="relative flex items-end gap-2 px-4 py-2.5">
                {/* Textarea */}
                <div className="flex-1 relative min-w-0">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => dispatch(setInput(e.target.value.slice(0, maxLength)))}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Ask anything..."
                    rows={1}
                    disabled={isProcessingImage}
                    className={`w-full resize-none bg-transparent border-none focus:outline-none placeholder:text-slate-400 text-[15px] leading-6 py-1 px-1 overflow-y-auto disabled:opacity-50 break-words ${
                      input.length >= maxLength 
                        ? 'text-error caret-error' 
                        : 'text-brand caret-brand-light'
                    }`}
                    style={{ 
                      height: "24px",
                      maxHeight: "200px",
                      scrollbarWidth: 'thin',
                      scrollbarColor: 'hsl(215,58%,55%) transparent',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word'
                    }}
                    aria-label="Message input with multiple image paste support"
                  />
                </div>

                {/* Right Actions */}
                <div className="flex items-end gap-1.5 flex-shrink-0 pb-1">
                  {/* Character Count Display */}
                  {input.length > 0 && (
                    <div className="flex items-center justify-center px-2 py-1">
                      <span className={`text-[11px] font-semibold transition-colors ${
                        input.length >= maxLength 
                          ? 'text-error animate-pulse' 
                          : input.length > maxLength * 0.9 
                            ? 'text-warning' 
                            : 'text-brand-light'
                      }`}>
                        {input.length}/{maxLength}
                      </span>
                    </div>
                  )}

                  {/* Processing Indicator */}
                  {isProcessingImage && (
                    <div className="w-9 h-9 flex items-center justify-center">
                      <div className="w-5 h-5 animate-spin border-2 border-brand-light border-t-transparent rounded-full" />
                    </div>
                  )}

                  {/* Send Button */}
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() && pastedImages.length === 0 || isProcessingImage}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all text-white shadow-lg ${
                      (input.trim() || pastedImages.length > 0) && !isProcessingImage
                        ? 'bg-gradient-to-r from-brand via-brand-medium to-brand-light hover:from-brand-dark hover:via-brand hover:to-brand-medium hover:shadow-xl'
                        : 'bg-gray-300 cursor-not-allowed opacity-60'
                    }`}
                    title={(!input.trim() && pastedImages.length === 0) ? "Type a message or add an image" : "Send message"}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Hints */}
          <div className="mt-3 flex items-center justify-between px-2 text-xs">
            <div className="flex items-center gap-3 flex-wrap">
              {input.length >= maxLength && (
                <span className="text-error font-medium animate-pulse flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-error"></span>
                  Character limit reached
                </span>
              )}
              {pastedImages.length > 0 && (
                <span className="text-brand-light font-medium">
                  {pastedImages.length}/{maxImages} images
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}