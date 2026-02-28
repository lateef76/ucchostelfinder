import React, { useState } from "react";
import { motion, useAnimation } from "framer-motion";
import type { PanInfo } from "framer-motion";
import type { Hostel as HostelBase } from "../types";
import { getOptimizedImageUrl } from "../lib/cloudinary";
import { formatDistance } from "../lib/mapConfig";
import { useFavoriteMutation } from "../hooks/useHostelQueries";
import { useAuth } from "../hooks/useAuth";
import { useUIStore } from "../store/uiStore";
import toast from "react-hot-toast";
import {
  Wifi,
  Shield,
  Droplets,
  Zap,
  Coffee,
  Car,
  Users,
  Heart,
  MapPin,
  Star,
  ChevronRight,
} from "lucide-react";

// Extend Hostel type to allow distance for UI
type HostelWithDistance = HostelBase & { distance?: number };

interface HostelCardProps {
  hostel: HostelWithDistance;
  onPress?: (hostel: HostelWithDistance) => void;
  onSwipe?: (direction: "left" | "right", hostel: HostelWithDistance) => void;
  showDistance?: boolean;
  showActions?: boolean;
  isSwipeable?: boolean;
  variant?: "grid" | "list" | "featured";
}

// Amenity icons mapping
const amenityIcons: Record<string, React.ReactNode> = {
  wifi: <Wifi size={16} />,
  security: <Shield size={16} />,
  water: <Droplets size={16} />,
  electricity: <Zap size={16} />,
  meals: <Coffee size={16} />,
  parking: <Car size={16} />,
  "study-area": <Users size={16} />,
};

export const HostelCard: React.FC<HostelCardProps> = ({
  hostel,
  onPress,
  onSwipe,
  showDistance = true,
  showActions = true,
  isSwipeable = false,
  variant = "list",
}) => {
  const [imageError, setImageError] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  const controls = useAnimation();
  const { user } = useAuth();
  const { openModal } = useUIStore();
  const favoriteMutation = useFavoriteMutation(hostel.id);

  // Handle favorite toggle
  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      openModal("auth");
      toast.error("Please login to save favorites");
      return;
    }

    await favoriteMutation.mutateAsync();
  };

  // Handle card press
  const handlePress = () => {
    if (onPress) {
      onPress(hostel);
    }
  };

  // Handle swipe gestures
  const handleDragEnd = (
    _event: MouseEvent | PointerEvent | TouchEvent,
    info: PanInfo,
  ) => {
    const threshold = 100;
    if (Math.abs(info.offset.x) > threshold) {
      const direction = info.offset.x > 0 ? "right" : "left";
      onSwipe?.(direction, hostel);

      // Animate out
      controls.start({
        x: direction === "right" ? 500 : -500,
        opacity: 0,
        transition: { duration: 0.2 },
      });
    } else {
      // Reset position
      controls.start({ x: 0, transition: { type: "spring", stiffness: 300 } });
    }
  };

  // Get primary image
  const primaryImage =
    hostel.images?.find((img) => img.isPrimary) || hostel.images?.[0];
  const imageUrl =
    primaryImage && !imageError
      ? getOptimizedImageUrl(
          primaryImage.publicId,
          variant === "featured" ? "detail" : "card",
        )
      : "https://via.placeholder.com/400x300?text=No+Image";

  // Variant styles
  const variants = {
    grid: "flex-col w-full max-w-sm",
    list: "flex-row h-32",
    featured: "flex-col w-full h-64",
  };

  return (
    <motion.div
      drag={isSwipeable ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      animate={controls}
      whileTap={isSwipeable ? { scale: 0.98 } : undefined}
      onTap={handlePress}
      onTapStart={() => setIsPressing(true)}
      onTapCancel={() => setIsPressing(false)}
      className={`
        bg-white rounded-xl shadow-sm overflow-hidden 
        touch-manipulation cursor-pointer
        ${isPressing ? "bg-gray-50" : ""}
        ${variants[variant]}
      `}
      style={{
        minHeight: variant === "list" ? "128px" : "auto",
      }}
    >
      {/* Image section */}
      <div
        className={`
        relative overflow-hidden bg-gray-100
        ${variant === "grid" ? "h-48" : ""}
        ${variant === "list" ? "w-32 h-full" : ""}
        ${variant === "featured" ? "h-40" : ""}
      `}
      >
        <img
          src={imageUrl}
          alt={hostel.name}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
          loading="lazy"
        />

        {/* Gender badge */}
        <div className="absolute top-2 left-2">
          <span
            className={`
            px-2 py-1 rounded-full text-xs font-medium
            ${hostel.gender === "male" ? "bg-blue-500 text-white" : ""}
            ${hostel.gender === "female" ? "bg-pink-500 text-white" : ""}
            ${hostel.gender === "mixed" ? "bg-purple-500 text-white" : ""}
          `}
          >
            {hostel.gender === "male" ? "👨 Male" : ""}
            {hostel.gender === "female" ? "👩 Female" : ""}
            {hostel.gender === "mixed" ? "👥 Mixed" : ""}
          </span>
        </div>

        {/* Verified badge */}
        {hostel.verified && (
          <div className="absolute top-2 right-2 bg-ucc-blue text-white p-1 rounded-full">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path d="M20 6L9 17l-5-5" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        )}

        {/* Favorite button */}
        {showActions && (
          <button
            onClick={handleFavorite}
            className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-md touch-manipulation"
          >
            <Heart
              size={20}
              className={favoriteMutation.isPending ? "opacity-50" : ""}
              fill={favoriteMutation.isSuccess ? "#ef4444" : "none"}
              color={favoriteMutation.isSuccess ? "#ef4444" : "#666"}
            />
          </button>
        )}
      </div>

      {/* Content section */}
      <div
        className={`
        flex-1 p-3
        ${variant === "list" ? "flex flex-col justify-between" : ""}
      `}
      >
        {/* Header */}
        <div>
          <h3 className="font-semibold text-gray-800 line-clamp-1">
            {hostel.name}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
            <MapPin size={14} />
            <span className="line-clamp-1">{hostel.location}</span>
          </div>
        </div>

        {/* Rating and price row */}
        <div className="flex items-center justify-between mt-2">
          {/* Rating */}
          {hostel.averageRating > 0 && (
            <div className="flex items-center gap-1">
              <Star size={16} className="fill-ucc-gold text-ucc-gold" />
              <span className="font-medium">
                {hostel.averageRating.toFixed(1)}
              </span>
              <span className="text-gray-500 text-sm">
                ({hostel.reviewCount})
              </span>
            </div>
          )}

          {/* Distance */}
          {showDistance && hostel.distance !== undefined && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <span>📍</span>
              <span>{formatDistance(hostel.distance)}</span>
            </div>
          )}

          {/* Price */}
          <div className="text-right">
            <span className="font-bold text-ucc-blue">
              GH₵{hostel.priceRange.min}
            </span>
            {hostel.priceRange.max > hostel.priceRange.min && (
              <span className="text-gray-500 text-sm">
                {" "}
                - {hostel.priceRange.max}
              </span>
            )}
          </div>
        </div>

        {/* Amenities preview (grid/list only) */}
        {variant !== "featured" &&
          hostel.amenities.slice(0, 3).map((amenity) => (
            <div
              key={amenity}
              className="flex items-center gap-1 text-gray-600"
            >
              {amenityIcons[amenity] || null}
              <span className="text-xs capitalize">{amenity}</span>
            </div>
          ))}

        {/* View details arrow (list only) */}
        {variant === "list" && (
          <ChevronRight size={20} className="text-gray-400" />
        )}
      </div>
    </motion.div>
  );
};

// Add line-clamp utility to your CSS
const lineClampStyles = `
  .line-clamp-1 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
  }
`;

// Add styles
const styleSheet = document.createElement("style");
styleSheet.innerText = lineClampStyles;
document.head.appendChild(styleSheet);
