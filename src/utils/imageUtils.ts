/**
 * Utility functions for image handling, compression, and validation
 */

export interface ImageData {
  data: string;
  name: string;
  size: number;
  type: string;
}

export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

/**
 * Validates if the file is a supported image type and within size limits
 */
export const validateImage = (file: File): { isValid: boolean; error?: string } => {
  if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Image must be JPEG, PNG, or GIF format'
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: 'Image must be under 5MB'
    };
  }

  return { isValid: true };
};

/**
 * Compresses an image using Canvas API if it exceeds the size limit
 */
export const compressImage = (file: File, maxSize: number = MAX_FILE_SIZE): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    if (file.size <= maxSize) {
      resolve(file);
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions to reduce file size
      const ratio = Math.sqrt(maxSize / file.size);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // Draw compressed image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Convert to blob with quality compression
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        file.type,
        0.8 // 80% quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Converts a blob to base64 data URL
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Processes a pasted image file and returns processed image data
 */
export const processImage = async (file: File): Promise<ImageData> => {
  const validation = validateImage(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  try {
    const compressedBlob = await compressImage(file);
    const base64Data = await blobToBase64(compressedBlob);

    return {
      data: base64Data,
      name: file.name || `image.${file.type.split('/')[1]}`,
      size: compressedBlob.size,
      type: file.type
    };
  } catch (error) {
    throw new Error(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Extracts images from clipboard data
 */
export const getImagesFromClipboard = (clipboardData: DataTransfer): File[] => {
  const images: File[] = [];
  
  if (clipboardData && clipboardData.files) {
    for (let i = 0; i < clipboardData.files.length; i++) {
      const file = clipboardData.files[i];
      if (SUPPORTED_IMAGE_TYPES.includes(file.type)) {
        images.push(file);
      }
    }
  }

  return images;
};