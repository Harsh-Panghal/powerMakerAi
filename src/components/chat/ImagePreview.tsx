import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImagePreviewProps {
  imageData: string;
  imageName: string;
  imageSize: number;
  onRemove: () => void;
  className?: string;
}

export function ImagePreview({ 
  imageData, 
  imageName, 
  imageSize, 
  onRemove, 
  className 
}: ImagePreviewProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("relative inline-block animate-fade-in", className)}>
      <div className="relative bg-muted/50 border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        {/* Image */}
        <div className="relative">
          <img 
            src={imageData} 
            alt={imageName}
            className="max-w-[120px] h-auto object-cover rounded-t-lg"
            style={{ maxHeight: '80px' }}
          />
          
          {/* Remove Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={onRemove}
            className="absolute top-2 right-2 w-6 h-6 p-0 rounded-full bg-destructive/90 hover:bg-destructive text-destructive-foreground border-0 shadow-sm hover-scale"
            aria-label="Remove pasted image"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>

        {/* Image Info */}
        <div className="p-2 bg-muted/30">
          <p className="text-xs text-muted-foreground truncate font-medium">
            {imageName}
          </p>
          <p className="text-xs text-muted-foreground/80">
            {formatFileSize(imageSize)}
          </p>
        </div>
      </div>
    </div>
  );
}