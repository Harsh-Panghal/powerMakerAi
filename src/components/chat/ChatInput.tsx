import { useState, useEffect } from "react";
import { Send, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate, useParams } from "react-router-dom";
import { ImagePreview } from "./ImagePreview";
import {
  processImage,
  getImagesFromClipboard,
  type ImageData,
} from "@/utils/imageUtils";
import { useToast } from "@/hooks/use-toast";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { setInput } from "../../redux/ChatSlice";
import { useChat } from "../../redux/useChat";

interface PromptSearchBarProps {
  handleSend: () => void;
}

export function ChatInput({ handleSend }: PromptSearchBarProps) {
  const [pastedImages, setPastedImages] = useState<ImageData[]>([]);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const maxLength = 1000;
  const maxImages = 10;

  const dispatch = useDispatch();
  const { input } = useChat();
  const { chatId } = useSelector((state: RootState) => state.chat);
  
  // Get current model from Redux instead of useChatStore
  const currentModel = useSelector((state: RootState) => state.model.currentModel);

  const inputLength = input.trim().length;
  const isInputEmpty = inputLength === 0;

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

        // Announce to screen readers
        const announcement = `${processedImages.length} image${
          processedImages.length > 1 ? "s" : ""
        } pasted successfully`;
        const ariaLiveRegion = document.createElement("div");
        ariaLiveRegion.setAttribute("aria-live", "polite");
        ariaLiveRegion.setAttribute("aria-atomic", "true");
        ariaLiveRegion.className = "sr-only";
        ariaLiveRegion.textContent = announcement;
        document.body.appendChild(ariaLiveRegion);

        setTimeout(() => {
          document.body.removeChild(ariaLiveRegion);
        }, 1000);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to process image";

        toast({
          variant: "destructive",
          title: "Error processing images",
          description: errorMessage,
        });

        // Announce error to screen readers
        const announcement = `Error: ${errorMessage}`;
        const ariaLiveRegion = document.createElement("div");
        ariaLiveRegion.setAttribute("aria-live", "assertive");
        ariaLiveRegion.setAttribute("aria-atomic", "true");
        ariaLiveRegion.className = "sr-only";
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
    setPastedImages((prev) => prev.filter((_, i) => i !== index));

    toast({
      title: "Image removed",
      description: `Image has been removed. Remaining: ${
        pastedImages.length - 1
      }`,
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
    <div
      className="p-2 bg-layout-main border-t border-border"
      data-tour="input-area"
    >
      <div className="max-w-4xl mx-auto px-2 sm:px-4">
        {/* Compact Image Previews */}
        {pastedImages.length > 0 && (
          <div className="mb-2 animate-fade-in">
            {/* Images counter and clear all button */}
            {pastedImages.length > 1 && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {pastedImages.length} image
                  {pastedImages.length > 1 ? "s" : ""} attached
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

            {/* Compact Images */}
            <div className="flex flex-wrap gap-2">
              {pastedImages.map((image, index) => (
                <div key={`${image.name}-${index}`} className="relative group">
                  {/* Compact Image Preview */}
                  <div className="relative w-12 h-12 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-gray-300 transition-colors">
                    <img
                      src={image.data}
                      alt={`Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Remove button overlay */}
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-0 right-0 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 hover:bg-red-600 text-white rounded-bl-lg flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label={`Remove image ${index + 1}`}
                    >
                      ×
                    </button>

                    {/* Image index badge */}
                    <div className="absolute bottom-0 left-0 bg-black/70 text-white text-xs rounded-tr-lg px-1 py-0.5 min-w-[14px] sm:min-w-[16px] text-center">
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
            placeholder={`Type your message or paste ${
              pastedImages.length === 0 ? "images" : "more images"
            }... (${pastedImages.length}/${maxImages} images)`}
            value={input}
            onChange={(e) => dispatch(setInput(e.target.value))}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            className="w-full min-h-[80px] sm:min-h-[80px] pr-28 sm:pr-22 pb-12 sm:pb-8 resize-none border-brand-light focus:ring-brand-light text-sm sm:text-base align-top"
            aria-label="Message input with multiple image paste support"
            disabled={isProcessingImage}
          />

          {/* Bottom Controls - Character Counter & Send Button */}
          <div className="absolute right-2 sm:right-3 bottom-2 sm:bottom-3 flex items-center space-x-2 sm:space-x-3">
            {/* Character Counter */}
            <span className="text-xs text-muted-foreground inline">
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
              disabled={
                (!input.trim() && pastedImages.length === 0) ||
                isProcessingImage
              }
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