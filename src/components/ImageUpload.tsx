import React, { useRef, useState } from "react";
import { useImageUpload, useCameraCapture } from "../hooks/useImageUpload";
import { getOptimizedImageUrl } from "../lib/cloudinary";
import {
  Camera,
  Upload,
  X,
  Star,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
} from "lucide-react";

interface ImageUploadProps {
  maxFiles?: number;
  folder?: string;
  onImagesChange?: (
    images: { url: string; publicId: string; isPrimary: boolean }[],
  ) => void;
  initialImages?: { url: string; publicId: string; isPrimary: boolean }[];
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  maxFiles = 10,
  folder = "hostels",
  onImagesChange,
  initialImages = [],
}) => {
  const {
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
  } = useImageUpload({
    maxFiles,
    folder,
    onUploadComplete: onImagesChange,
  });

  const {
    supported: cameraSupported,
    startCamera,
    stopCamera,
    capturePhoto,
  } = useCameraCapture();
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  // Initialize with existing images
  React.useEffect(() => {
    if (initialImages.length > 0 && images.length === 0) {
      // This would need to be handled by the hook - for now, we'll just note it
      console.log("Initial images provided:", initialImages);
    }
  }, [initialImages, images.length]);

  // Handle camera start
  const handleStartCamera = async () => {
    const stream = await startCamera("environment");
    if (stream) {
      setCameraStream(stream);
      setShowCamera(true);

      // Wait for video to be ready
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    }
  };

  // Handle camera stop
  const handleStopCamera = () => {
    stopCamera();
    setCameraStream(null);
    setShowCamera(false);
  };

  // Handle capture photo
  const handleCapture = () => {
    if (videoRef.current && cameraStream) {
      const photo = capturePhoto(videoRef.current);
      if (photo) {
        uploadFiles([photo]);
        handleStopCamera();
      }
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFiles(files);
    }
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      uploadFiles(files);
    }
  };

  // Move image up in order
  const moveImageUp = (index: number) => {
    if (index > 0) {
      reorderImages(index, index - 1);
    }
  };

  // Move image down in order
  const moveImageDown = (index: number) => {
    if (index < images.length - 1) {
      reorderImages(index, index + 1);
    }
  };

  return (
    <div className="w-full">
      {/* Camera view */}
      {showCamera && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="flex-1 object-cover"
          />
          <div className="absolute top-4 right-4">
            <button
              onClick={handleStopCamera}
              className="bg-red-500 text-white p-3 rounded-full touch-manipulation"
            >
              <X size={24} />
            </button>
          </div>
          <div className="absolute bottom-8 left-0 right-0 flex justify-center">
            <button
              onClick={handleCapture}
              className="bg-white w-20 h-20 rounded-full border-4 border-ucc-blue flex items-center justify-center touch-manipulation"
            >
              <div className="w-16 h-16 bg-ucc-blue rounded-full"></div>
            </button>
          </div>
        </div>
      )}

      {/* Upload area */}
      {!showCamera && (
        <>
          {/* Image grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              {images.map((image, index) => (
                <div
                  key={image.publicId}
                  className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group"
                >
                  <img
                    src={getOptimizedImageUrl(image.publicId, "thumbnail")}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />

                  {/* Overlay controls */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity">
                    <div className="absolute top-1 right-1 flex gap-1">
                      {/* Primary star */}
                      <button
                        onClick={() => setPrimaryImage(image.publicId)}
                        className={`p-1.5 rounded-full touch-manipulation ${
                          image.isPrimary
                            ? "bg-ucc-gold text-white"
                            : "bg-white text-gray-600"
                        }`}
                        title={
                          image.isPrimary ? "Primary image" : "Set as primary"
                        }
                      >
                        <Star
                          size={16}
                          fill={image.isPrimary ? "currentColor" : "none"}
                        />
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => removeImage(image.publicId)}
                        className="bg-red-500 text-white p-1.5 rounded-full touch-manipulation"
                        title="Remove image"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {/* Order controls */}
                    <div className="absolute bottom-1 left-1 right-1 flex justify-between">
                      <button
                        onClick={() => moveImageUp(index)}
                        disabled={index === 0}
                        className={`p-1.5 rounded-full touch-manipulation ${
                          index === 0
                            ? "bg-gray-300 text-gray-500"
                            : "bg-white text-gray-700"
                        }`}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                        {index + 1}/{images.length}
                      </span>
                      <button
                        onClick={() => moveImageDown(index)}
                        disabled={index === images.length - 1}
                        className={`p-1.5 rounded-full touch-manipulation ${
                          index === images.length - 1
                            ? "bg-gray-300 text-gray-500"
                            : "bg-white text-gray-700"
                        }`}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upload progress bar */}
          {uploading && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Uploading...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-ucc-blue h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Upload buttons */}
          {images.length < maxFiles && (
            <div
              className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                dragActive
                  ? "border-ucc-blue bg-blue-50"
                  : "border-gray-300 hover:border-ucc-blue"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p className="text-sm text-gray-600 mb-3">
                  Drag and drop images here, or click to select
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {/* File input button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 bg-ucc-blue text-white px-4 py-3 rounded-lg touch-manipulation"
                    disabled={uploading}
                  >
                    <Upload size={20} />
                    <span>Choose Files</span>
                  </button>

                  {/* Camera button (mobile only) */}
                  {cameraSupported && (
                    <button
                      onClick={handleStartCamera}
                      className="flex items-center justify-center gap-2 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg touch-manipulation sm:hidden"
                      disabled={uploading}
                    >
                      <Camera size={20} />
                      <span>Take Photo</span>
                    </button>
                  )}

                  {/* Cloudinary widget button (optional) */}
                  <button
                    onClick={openUploadWidget}
                    className="flex items-center justify-center gap-2 bg-ucc-gold text-white px-4 py-3 rounded-lg touch-manipulation"
                    disabled={uploading}
                  >
                    <ImageIcon size={20} />
                    <span className="hidden sm:inline">Advanced Upload</span>
                  </button>
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic"
                  multiple={maxFiles > 1}
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={uploading}
                />

                <p className="text-xs text-gray-500 mt-3">
                  JPEG, PNG, WebP up to 10MB each
                </p>
                <p className="text-xs text-gray-500">
                  {images.length} of {maxFiles} images uploaded
                </p>
              </div>
            </div>
          )}

          {/* Clear all button */}
          {images.length > 0 && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearImages}
                className="text-red-600 text-sm px-3 py-2 touch-manipulation"
              >
                Clear all images
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Add CSS for mobile optimization
const styles = `
  /* Ensure touch targets are at least 44px */
  .touch-manipulation {
    min-height: 44px;
    min-width: 44px;
  }

  /* Prevent zoom on input focus in iOS */
  input, select, textarea {
    font-size: 16px !important;
  }

  /* Smooth transitions */
  .transition-all {
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 300ms;
  }
`;

// Inject styles
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
