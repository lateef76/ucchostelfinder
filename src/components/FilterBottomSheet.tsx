import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  SlidersHorizontal,
  Wifi,
  Shield,
  Droplets,
  Zap,
  Coffee,
  Car,
  Users,
  Fan,
  Snowflake,
  Tv,
  // Removed unused and invalid icons
} from "lucide-react";
import { useUIStore } from "../store/uiStore";
import type { SearchFilters, Amenity } from "../types";

interface FilterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
}

// Amenity options with icons
const AMENITIES: { value: Amenity; label: string; icon: React.ReactNode }[] = [
  { value: "wifi", label: "WiFi", icon: <Wifi size={20} /> },
  { value: "security", label: "Security", icon: <Shield size={20} /> },
  { value: "water", label: "Water", icon: <Droplets size={20} /> },
  { value: "electricity", label: "Electricity", icon: <Zap size={20} /> },
  { value: "meals", label: "Meals", icon: <Coffee size={20} /> },
  { value: "parking", label: "Parking", icon: <Car size={20} /> },
  { value: "study-area", label: "Study Area", icon: <Users size={20} /> },
  { value: "fan", label: "Fan", icon: <Fan size={20} /> },
  { value: "air-conditioning", label: "AC", icon: <Snowflake size={20} /> },
  { value: "tv", label: "TV", icon: <Tv size={20} /> },
];

// Location options (UCC areas)
const LOCATIONS = [
  "Science",
  "North Campus",
  "South Campus",
  "Atlantic Hall",
  "African Hall",
  "Casford",
  "Valco Trust",
  "Business School",
  "Medical School",
  "Main Gate",
  "Ayensu",
  "Kwaprow",
];

export const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
  isOpen,
  onClose,
  onApply,
  initialFilters,
}) => {
  const { filters: storeFilters } = useUIStore();
  const [localFilters, setLocalFilters] = useState<SearchFilters>(
    initialFilters || storeFilters,
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([
    localFilters.priceMin || 0,
    localFilters.priceMax || 2000,
  ]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>(
    localFilters.location || [],
  );
  const [selectedAmenities, setSelectedAmenities] = useState<Amenity[]>(
    localFilters.amenities || [],
  );
  const [gender, setGender] = useState(localFilters.gender || "all");
  const [minRating, setMinRating] = useState(localFilters.rating || 0);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(
    localFilters.verified || false,
  );

  // Reset when sheet opens with new initial filters (only on open transition)
  const wasOpen = useRef(isOpen);
  useEffect(() => {
    if (isOpen && !wasOpen.current) {
      const newFilters = initialFilters || storeFilters;
      setTimeout(() => {
        setLocalFilters(newFilters);
        setPriceRange([
          initialFilters?.priceMin || storeFilters.priceMin || 0,
          initialFilters?.priceMax || storeFilters.priceMax || 2000,
        ]);
        setSelectedLocations(
          initialFilters?.location || storeFilters.location || [],
        );
        setSelectedAmenities(
          initialFilters?.amenities || storeFilters.amenities || [],
        );
        setGender(
          (initialFilters?.gender || storeFilters.gender || "all") as
            | "male"
            | "female"
            | "mixed"
            | "all",
        );
        setMinRating(initialFilters?.rating || storeFilters.rating || 0);
        setShowVerifiedOnly(
          initialFilters?.verified || storeFilters.verified || false,
        );
      }, 0);
    }
    wasOpen.current = isOpen;
  }, [isOpen, initialFilters, storeFilters]);

  // Handle apply filters
  const handleApply = () => {
    const newFilters: SearchFilters = {
      location: selectedLocations.length > 0 ? selectedLocations : undefined,
      gender:
        gender !== "all" ? (gender as "male" | "female" | "mixed") : undefined,
      priceMin: priceRange[0],
      priceMax: priceRange[1],
      amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined,
      rating: minRating > 0 ? minRating : undefined,
      verified: showVerifiedOnly || undefined,
    };

    onApply(newFilters);
    onClose();
  };

  // Handle reset filters
  const handleReset = () => {
    setPriceRange([0, 2000]);
    setSelectedLocations([]);
    setSelectedAmenities([]);
    setGender("all");
    setMinRating(0);
    setShowVerifiedOnly(false);
  };

  // Toggle location selection
  const toggleLocation = (location: string) => {
    setSelectedLocations((prev) =>
      prev.includes(location)
        ? prev.filter((l) => l !== location)
        : [...prev, location],
    );
  };

  // Toggle amenity selection
  const toggleAmenity = (amenity: Amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity],
    );
  };

  // Active filter count
  const activeFilterCount =
    (selectedLocations.length > 0 ? 1 : 0) +
    (gender !== "all" ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 2000 ? 1 : 0) +
    selectedAmenities.length +
    (minRating > 0 ? 1 : 0) +
    (showVerifiedOnly ? 1 : 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={20} className="text-ucc-blue" />
                  <h2 className="text-lg font-semibold">Filters</h2>
                  {activeFilterCount > 0 && (
                    <span className="bg-ucc-blue text-white text-xs px-2 py-1 rounded-full">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleReset}
                    className="text-ucc-blue text-sm px-3 py-1 touch-manipulation"
                  >
                    Reset
                  </button>
                  <button onClick={onClose} className="p-2 touch-manipulation">
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div
              className="overflow-y-auto p-4 pb-24"
              style={{ maxHeight: "calc(90vh - 140px)" }}
            >
              {/* Location Section */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Location</h3>
                <div className="flex flex-wrap gap-2">
                  {LOCATIONS.map((location) => (
                    <button
                      key={location}
                      onClick={() => toggleLocation(location)}
                      className={`
                        px-4 py-2 rounded-full text-sm border touch-manipulation
                        ${
                          selectedLocations.includes(location)
                            ? "bg-ucc-blue text-white border-ucc-blue"
                            : "bg-gray-100 text-gray-700 border-gray-200"
                        }
                      `}
                    >
                      {location}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gender Section */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Gender</h3>
                <div className="flex gap-2">
                  {["all", "male", "female", "mixed"].map((g) => (
                    <button
                      key={g}
                      onClick={() =>
                        setGender(g as "male" | "female" | "mixed" | "all")
                      }
                      className={`
                        flex-1 px-4 py-2 rounded-lg text-sm capitalize touch-manipulation
                        ${
                          gender === g
                            ? "bg-ucc-blue text-white"
                            : "bg-gray-100 text-gray-700"
                        }
                      `}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Section */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Price Range (GHS/month)</h3>
                <div className="px-2">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">
                      Min: GH₵{priceRange[0]}
                    </span>
                    <span className="text-sm text-gray-600">
                      Max: GH₵{priceRange[1]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    value={priceRange[0]}
                    onChange={(e) =>
                      setPriceRange([parseInt(e.target.value), priceRange[1]])
                    }
                    className="w-full accent-ucc-blue"
                  />
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], parseInt(e.target.value)])
                    }
                    className="w-full accent-ucc-blue mt-2"
                  />
                </div>
              </div>

              {/* Rating Section */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Minimum Rating</h3>
                <div className="flex gap-2">
                  {[0, 1, 2, 3, 4].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(rating)}
                      className={`
                        flex-1 px-4 py-2 rounded-lg touch-manipulation
                        ${
                          minRating === rating
                            ? "bg-ucc-gold text-white"
                            : "bg-gray-100 text-gray-700"
                        }
                      `}
                    >
                      {rating === 0 ? "Any" : `${rating}+ ⭐`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amenities Section */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Amenities</h3>
                <div className="grid grid-cols-2 gap-2">
                  {AMENITIES.map((amenity) => (
                    <button
                      key={amenity.value}
                      onClick={() => toggleAmenity(amenity.value)}
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded-lg border touch-manipulation
                        ${
                          selectedAmenities.includes(amenity.value)
                            ? "bg-ucc-blue text-white border-ucc-blue"
                            : "bg-gray-100 text-gray-700 border-gray-200"
                        }
                      `}
                    >
                      {amenity.icon}
                      <span className="text-sm">{amenity.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Verified Only Toggle */}
              <div className="mb-6">
                <label className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                  <div>
                    <span className="font-medium">Verified hostels only</span>
                    <p className="text-xs text-gray-600">
                      UCC verified accommodations
                    </p>
                  </div>
                  <button
                    onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
                    className={`
                      w-12 h-6 rounded-full transition-colors relative
                      ${showVerifiedOnly ? "bg-ucc-blue" : "bg-gray-300"}
                    `}
                  >
                    <span
                      className={`
                        absolute top-1 w-4 h-4 bg-white rounded-full transition-transform
                        ${showVerifiedOnly ? "translate-x-7" : "translate-x-1"}
                      `}
                    />
                  </button>
                </label>
              </div>
            </div>

            {/* Footer - Apply Button */}
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
              <button
                onClick={handleApply}
                className="w-full bg-ucc-blue text-white py-3 rounded-lg font-medium touch-manipulation"
              >
                Show Results
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
