
// Cloudinary upload widget type
export interface CloudinaryUploadWidget {
  open: () => void;
  close: () => void;
  destroy: () => void;
  // Add more methods if needed
}

import { useState, useCallback, useRef } from 'react';
import { validateImage, getUploadWidgetConfig } from '../lib/cloudinary';
import type { CloudinaryUploadResult, CloudinaryErrorResult } from '../lib/cloudinary';
import toast from 'react-hot-toast';

interface UploadedImage {
  url: string;
  publicId: string;
  isPrimary: boolean;
  file?: File; // Original file (optional)
}

interface UseImageUploadProps {
  maxFiles?: number;
  maxFileSize?: number;
  folder?: string;
  onUploadComplete?: (images: UploadedImage[]) => void;
  onUploadError?: (error: string) => void;
}

export const useImageUpload = ({
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  folder = 'hostels',
  onUploadComplete,
  onUploadError,
}: UseImageUploadProps = {}) => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
interface CloudinaryUploadWidget {
  open: () => void;
  close: () => void;
  destroy: () => void;
  // Add more methods if needed
}
const widgetRef = useRef<CloudinaryUploadWidget | null>(null);

  // Initialize Cloudinary upload widget
  const openUploadWidget = useCallback(() => {
    // Create widget if it doesn't exist
    if (!widgetRef.current && window.cloudinary) {
      widgetRef.current = window.cloudinary.createUploadWidget(
        getUploadWidgetConfig({
          maxFiles,
          maxFileSize,
          folder,
          tags: ['uploaded-from-app'],
        }),
        (error: CloudinaryErrorResult | null, result: CloudinaryUploadResult) => {
          if (error) {
            console.error('Upload error:', error);
            setError(error.info?.message || 'Upload failed');
            onUploadError?.(error.info?.message || 'Upload failed');
            toast.error('Upload failed. Please try again.');
            return;
          }

          if (result && result.event === 'success') {
            const newImage: UploadedImage = {
              url: result.info.secure_url,
              publicId: result.info.public_id,
              isPrimary: images.length === 0, // First image is primary by default
            };

            setImages(prev => {
              const updated = [...prev, newImage];
              onUploadComplete?.(updated);
              return updated;
            });

            toast.success('Image uploaded successfully!');
          }
        }
      );
    }

    // Open the widget
    if (widgetRef.current) {
      widgetRef.current.open();
    } else {
      toast.error('Upload widget failed to initialize');
    }
  }, [maxFiles, maxFileSize, folder, images.length, onUploadComplete, onUploadError]);

  // Manual file upload (alternative to widget)
  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // Validate files
    for (const file of fileArray) {
      const validation = validateImage(file);
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        toast.error(validation.error || 'Invalid file');
        return;
      }
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const uploadPromises = fileArray.map(async (file, index) => {
        // Create form data
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
        formData.append('folder', folder);

        // Upload to Cloudinary
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        const data = await response.json();

        // Update progress
        setUploadProgress(((index + 1) / fileArray.length) * 100);

        return {
          url: data.secure_url,
          publicId: data.public_id,
          isPrimary: images.length === 0 && index === 0,
        };
      });

      const uploadedImages = await Promise.all(uploadPromises);
      
      setImages(prev => {
        const updated = [...prev, ...uploadedImages];
        onUploadComplete?.(updated);
        return updated;
      });

      toast.success(`Successfully uploaded ${uploadedImages.length} image(s)`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
      onUploadError?.(message);
      toast.error(message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [folder, images.length, onUploadComplete, onUploadError]);

  // Remove an image
  const removeImage = useCallback((publicId: string) => {
    setImages(prev => {
      const filtered = prev.filter(img => img.publicId !== publicId);
      
      // If we removed the primary image, set the first remaining as primary
      if (prev.find(img => img.publicId === publicId)?.isPrimary && filtered.length > 0) {
        filtered[0].isPrimary = true;
      }
      
      onUploadComplete?.(filtered);
      return filtered;
    });

    toast.success('Image removed');
  }, [onUploadComplete]);

  // Set primary image
  const setPrimaryImage = useCallback((publicId: string) => {
    setImages(prev => {
      const updated = prev.map(img => ({
        ...img,
        isPrimary: img.publicId === publicId,
      }));
      onUploadComplete?.(updated);
      return updated;
    });
  }, [onUploadComplete]);

  // Reorder images
  const reorderImages = useCallback((startIndex: number, endIndex: number) => {
    setImages(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      
      // Ensure first image is primary if none is set
      if (!result.some(img => img.isPrimary) && result.length > 0) {
        result[0].isPrimary = true;
      }
      
      onUploadComplete?.(result);
      return result;
    });
  }, [onUploadComplete]);

  // Clear all images
  const clearImages = useCallback(() => {
    setImages([]);
    setError(null);
    onUploadComplete?.([]);
  }, [onUploadComplete]);

  // Reset state
  const reset = useCallback(() => {
    setImages([]);
    setUploading(false);
    setUploadProgress(0);
    setError(null);
  }, []);

  return {
    images,
    uploading,
    uploadProgress,
    error,
    openUploadWidget,
    uploadFiles,
    removeImage,
    setPrimaryImage,
    reorderImages,
    clearImages,
    reset,
  };
};

// ==================== Mobile Camera Hook ====================

export const useCameraCapture = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [supported] = useState('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices);

  const startCamera = useCallback(async (facingMode: 'user' | 'environment' = 'environment') => {
    if (!supported) {
      setError('Camera not supported on this device');
      return null;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      
      setStream(mediaStream);
      setError(null);
      return mediaStream;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to access camera';
      setError(message);
      toast.error(message);
      return null;
    }
  }, [supported]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const capturePhoto = useCallback((videoElement: HTMLVideoElement): File | null => {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    const context = canvas.getContext('2d');
    if (!context) return null;
    
    context.drawImage(videoElement, 0, 0);
    
    return new Promise<File | null>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `camera-${Date.now()}.jpg`, {
            type: 'image/jpeg',
          });
          resolve(file);
        } else {
          resolve(null);
        }
      }, 'image/jpeg', 0.9);
    }) as unknown as File; // Type assertion for simplicity
  }, []);

  return {
    stream,
    error,
    supported,
    startCamera,
    stopCamera,
    capturePhoto,
  };
};

// Add Cloudinary to window type
declare global {
  interface Window {
    cloudinary: {
      createUploadWidget: (
        options: object,
        callback: (error: CloudinaryErrorResult | null, result: CloudinaryUploadResult) => void
      ) => CloudinaryUploadWidget;
    };
  }
}