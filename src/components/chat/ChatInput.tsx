import { useState, useEffect, useRef } from "react";
import { Send, ImagePlus, Plus, Mic, X, Sparkles, Zap, AtSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { setInput } from "../../redux/ChatSlice";
import { useChat } from "../../redux/useChat";
import {
  processImage,
  getImagesFromClipboard,
  type ImageData,
} from "@/utils/imageUtils";

interface PromptSearchBarProps {
  handleSend: () => void;
}

export function ChatInput({ handleSend }: PromptSearchBarProps) {
  const [pastedImages, setPastedImages] = useState<ImageData[]>([]);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const maxLength = 1000;
  const maxImages = 10;

  const dispatch = useDispatch();
  const { input } = useChat();
  const { chatId } = useSelector((state: RootState) => state.chat);
  const currentModel = useSelector((state: RootState) => state.model.currentModel);

  const inputLength = input.trim().length;
  const isInputEmpty = inputLength === 0;

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "24px";
      const newHeight = Math.min(textarea.scrollHeight, 200);
      textarea.style.height = `${newHeight}px`;
    }
  }, [input]);

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

  // Trigger file input for image upload
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

  return (
    <div className="p-2 bg-layout-main border-t border-border" data-tour="input-area">
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
            isFocused ? 'shadow-2xl ring-2 ring-brand-light' : 'shadow-lg'
          }`}>
            {/* Shimmer Effect */}
            {isFocused && (
              <div className="absolute inset-0 rounded-3xl overflow-hidden">
                <div className="absolute inset-0 translate-x-[-100%] animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-brand-light/10 to-transparent" />
              </div>
            )}

            <div className="relative flex items-end gap-2 px-4 py-2.5">
              {/* Left Action Button - COMMENTED FOR FUTURE USE */}
              {/* <div className="relative group/plus">
                <button
                  onClick={() => setShowActions(!showActions)}
                  disabled={isProcessingImage}
                  className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    showActions 
                      ? 'bg-brand text-white rotate-45' 
                      : 'bg-info-light text-brand-light hover:bg-brand-light hover:text-white'
                  }`}
                  aria-label="Open actions menu"
                >
                  <Plus className="w-5 h-5" />
                </button>
                
                {showActions && (
                  <div className="absolute bottom-full left-0 mb-2 backdrop-blur-xl bg-white/95 rounded-2xl shadow-2xl border border-border p-2 min-w-[160px] animate-in slide-in-from-bottom-2 z-10">
                    <button
                      onClick={() => { handleImageUpload(); setShowActions(false); }}
                      disabled={pastedImages.length >= maxImages || isProcessingImage}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-info-light transition-colors text-sm font-medium text-brand disabled:opacity-50"
                    >
                      <ImagePlus className="w-4 h-4 text-brand-light" />
                      Add Image
                    </button>
                    <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-info-light transition-colors text-sm font-medium text-brand">
                      <AtSign className="w-4 h-4 text-brand-medium" />
                      Mention
                    </button>
                    <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-info-light transition-colors text-sm font-medium text-brand">
                      <Zap className="w-4 h-4 text-brand-accent" />
                      Quick Action
                    </button>
                  </div>
                )}
              </div> */}

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
                  className="w-full resize-none bg-transparent border-none focus:outline-none text-brand placeholder:text-slate-400 text-[15px] leading-6 py-1 px-1 overflow-y-auto caret-brand-light disabled:opacity-50 break-words"
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
                
                {/* AI Sparkle Indicator */}
                {isFocused && !input && (
                  <div className="absolute left-0 top-0 flex items-center gap-1 text-brand-light animate-pulse pointer-events-none">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              {/* Right Actions */}
              <div className="flex items-end gap-1.5 flex-shrink-0 pb-1">
                {/* Circular Progress for Character Count */}
                {input.length > 0 && (
                  <div className="relative w-8 h-8 flex items-center justify-center">
                    <svg className="w-8 h-8 transform -rotate-90">
                      <circle
                        cx="16"
                        cy="16"
                        r="14"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        className="text-border"
                      />
                      <circle
                        cx="16"
                        cy="16"
                        r="14"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 14}`}
                        strokeDashoffset={`${2 * Math.PI * 14 * (1 - input.length / maxLength)}`}
                        className={input.length > maxLength * 0.9 ? 'text-error' : 'text-success'}
                        style={{ transition: 'stroke-dashoffset 0.3s' }}
                      />
                    </svg>
                    <span className="absolute text-[9px] font-bold text-brand">
                      {Math.round((input.length / maxLength) * 100)}
                    </span>
                  </div>
                )}

                {/* Voice Button - COMMENTED FOR FUTURE USE */}
                {/* {!input.trim() && pastedImages.length === 0 && !isProcessingImage && (
                  <button
                    className="w-9 h-9 rounded-full bg-info-light hover:bg-brand-light hover:text-white text-brand-light flex items-center justify-center transition-all hover:scale-105"
                    title="Voice input"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                )} */}

                {/* Processing Indicator */}
                {isProcessingImage && (
                  <div className="w-9 h-9 flex items-center justify-center">
                    <div className="w-5 h-5 animate-spin border-2 border-brand-light border-t-transparent rounded-full" />
                  </div>
                )}

                {/* Send Button - Always Visible (Disabled when no content) */}
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

        {/* Bottom Hints with Brand Colors */}
        <div className="mt-3 flex items-center justify-between px-2 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <kbd className="px-2 py-0.5 bg-white/80 backdrop-blur-sm rounded border border-border font-mono text-brand">↵</kbd>
            <span>send</span>
            <span className="text-slate-300">•</span>
            <kbd className="px-2 py-0.5 bg-white/80 backdrop-blur-sm rounded border border-border font-mono text-brand">⇧↵</kbd>
            <span>new line</span>
          </div>
          {pastedImages.length > 0 && (
            <span className="text-brand-light font-medium">
              {pastedImages.length}/{maxImages} images
            </span>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}