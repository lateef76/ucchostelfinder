import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PanInfo } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperClass } from "swiper";
import { Pagination, Zoom, Navigation, Thumbs } from "swiper/modules";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { getOptimizedImageUrl } from "../lib/cloudinary";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/zoom";
import "swiper/css/navigation";
import "swiper/css/thumbs";

interface ImageGalleryProps {
  images: { url: string; publicId: string; caption?: string }[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  hostelName?: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  hostelName,
}) => {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperClass | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(
    new Set([initialIndex]),
  );
  const galleryRef = useRef<HTMLDivElement>(null);

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement && galleryRef.current) {
      galleryRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Preload adjacent images
  const preloadImages = (index: number) => {
    const indexes = [index - 1, index, index + 1].filter(
      (i) => i >= 0 && i < images.length,
    );
    setLoadedImages((prev) => {
      const next = new Set(prev);
      indexes.forEach((i) => next.add(i));
      return next;
    });
  };

  // Handle slide change
  const handleSlideChange = (swiper: SwiperClass) => {
    const newIndex = swiper.activeIndex;
    setCurrentIndex(newIndex);
    preloadImages(newIndex);
  };

  // Handle drag to close
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.y) > 150) {
      onClose();
    }
  };

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => Math.min(images.length - 1, prev + 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, images.length, onClose]);

  // Lock body scroll when gallery is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={galleryRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-50 flex flex-col"
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-linear-to-b from-black/50 to-transparent p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="text-white p-2 touch-manipulation"
            >
              <X size={24} />
            </button>

            <div className="text-white text-sm">
              {currentIndex + 1} / {images.length}
              {hostelName && ` • ${hostelName}`}
            </div>

            <button
              onClick={toggleFullscreen}
              className="text-white p-2 touch-manipulation"
            >
              {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
            </button>
          </div>
        </div>

        {/* Main Swiper */}
        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          className="flex-1"
        >
          <Swiper
            modules={[Pagination, Zoom, Navigation, Thumbs]}
            pagination={{ clickable: true }}
            zoom={true}
            navigation={{
              prevEl: ".swiper-button-prev",
              nextEl: ".swiper-button-next",
            }}
            thumbs={{ swiper: thumbsSwiper }}
            initialSlide={initialIndex}
            onSlideChange={handleSlideChange}
            onInit={(swiper) => preloadImages(swiper.activeIndex)}
            className="h-full"
          >
            {images.map((image, index) => (
              <SwiperSlide key={image.publicId}>
                <div className="swiper-zoom-container">
                  {loadedImages.has(index) ? (
                    <img
                      src={getOptimizedImageUrl(image.publicId, "full")}
                      alt={image.caption || `Image ${index + 1}`}
                      className="w-full h-full object-contain"
                      loading={index === currentIndex ? "eager" : "lazy"}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                {image.caption && (
                  <div className="absolute bottom-16 left-0 right-0 text-center text-white text-sm bg-black/50 py-2 px-4 mx-4 rounded-lg">
                    {image.caption}
                  </div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>

        {/* Navigation buttons */}
        <button className="swiper-button-prev text-white! hidden! md:flex!">
          <ChevronLeft size={32} />
        </button>
        <button className="swiper-button-next text-white! hidden! md:flex!">
          <ChevronRight size={32} />
        </button>

        {/* Thumbnails (hidden on mobile) */}
        {images.length > 1 && (
          <div className="hidden md:block absolute bottom-4 left-0 right-0">
            <Swiper
              onSwiper={setThumbsSwiper}
              spaceBetween={10}
              slidesPerView={5}
              freeMode={true}
              watchSlidesProgress={true}
              modules={[Thumbs]}
              className="thumbs-swiper"
            >
              {images.map((image, index) => (
                <SwiperSlide key={image.publicId}>
                  <button
                    onClick={() => setCurrentIndex(index)}
                    className={`
                      w-20 h-20 rounded-lg overflow-hidden border-2 transition-all
                      ${currentIndex === index ? "border-ucc-gold opacity-100" : "border-transparent opacity-60"}
                    `}
                  >
                    <img
                      src={getOptimizedImageUrl(image.publicId, "thumbnail")}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

        {/* Mobile caption toggle */}
        <div className="md:hidden absolute bottom-4 left-4 right-4">
          <button
            onClick={() => {
              /* Toggle caption */
            }}
            className="bg-black/50 text-white text-sm py-2 px-4 rounded-full w-full"
          >
            View Details
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// ==================== Lightweight Gallery for List View ====================

interface ThumbnailGalleryProps {
  images: { url: string; publicId: string }[];
  onImagePress?: (index: number) => void;
}

export const ThumbnailGallery: React.FC<ThumbnailGalleryProps> = ({
  images,
  onImagePress,
}) => {
  const displayImages = images.slice(0, 4);
  const remainingCount = images.length - 4;

  return (
    <div className="grid grid-cols-4 gap-1">
      {displayImages.map((image, index) => (
        <button
          key={image.publicId}
          onClick={() => onImagePress?.(index)}
          className="relative aspect-square overflow-hidden rounded-lg touch-manipulation"
        >
          <img
            src={getOptimizedImageUrl(image.publicId, "thumbnail")}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />

          {/* Show count on last image if more exist */}
          {index === 3 && remainingCount > 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                +{remainingCount}
              </span>
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

// ==================== Fullscreen Gallery Trigger ====================

interface GalleryTriggerProps {
  images: { url: string; publicId: string }[];
  children: React.ReactNode;
}

export const GalleryTrigger: React.FC<GalleryTriggerProps> = ({
  images,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);

  const handlePress = (index: number = 0) => {
    setInitialIndex(index);
    setIsOpen(true);
  };

  return (
    <>
      <div onClick={() => handlePress(0)} className="cursor-pointer">
        {children}
      </div>

      <ImageGallery
        images={images}
        initialIndex={initialIndex}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};

// Add custom Swiper styles
const swiperStyles = `
  .swiper-pagination-bullet {
    background: white !important;
    opacity: 0.5 !important;
  }
  
  .swiper-pagination-bullet-active {
    opacity: 1 !important;
    background: #f4c430 !important;
  }
  
  .thumbs-swiper {
    padding: 10px 0 !important;
  }
  
  .thumbs-swiper .swiper-slide {
    width: auto !important;
    opacity: 0.6;
    transition: opacity 0.2s;
    cursor: pointer;
  }
  
  .thumbs-swiper .swiper-slide-thumb-active {
    opacity: 1;
  }
  
  .thumbs-swiper .swiper-slide:hover {
    opacity: 1;
  }
  
  /* Mobile optimizations */
  @media (max-width: 768px) {
    .swiper-button-prev,
    .swiper-button-next {
      display: none !important;
    }
    
    .swiper-pagination {
      bottom: 20px !important;
    }
  }
`;

// Add styles
const styleSheet = document.createElement("style");
styleSheet.innerText = swiperStyles;
document.head.appendChild(styleSheet);
