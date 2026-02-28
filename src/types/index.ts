// ==================== User Types ====================

export interface User {
  id: string;
  email: string;
  name: string;
  studentId?: string;
  yearOfStudy?: 1 | 2 | 3 | 4 | 5 | 6; // UCC programs vary in length
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  faculty?: string;
  department?: string;
  avatarUrl?: string;
  createdAt: Date;
  lastLogin: Date;
  favoriteCount: number;
  reviewCount: number;
  settings: UserSettings;
}

export interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    reviews: boolean;
    favorites: boolean;
  };
  privacy: {
    showProfile: boolean;
    showReviews: boolean;
    showFavorites: boolean;
  };
  theme: 'light' | 'dark' | 'system';
}

// ==================== Hostel Types ====================

export interface Hostel {
  id: string;
  name: string;
  description: string;
  location: string; // Area name (e.g., "Science", "North Campus")
  coordinates: GeoPoint;
  address: string;
  
  // Hostel details
  gender: 'male' | 'female' | 'mixed';
  type: 'self-contained' | 'shared' | 'both';
  rooms: number;
  occupantsPerRoom?: number; // For shared rooms
  
  // Pricing
  priceRange: PriceRange;
  paymentPeriod: 'semester' | 'yearly' | 'monthly';
  deposit?: number;
  
  // Amenities
  amenities: Amenity[];
  
  // Contact
  contactInfo: ContactInfo;
  ownerId?: string; // If owner has account
  
  // Media
  images: HostelImage[];
  virtualTourUrl?: string;
  
  // Stats
  averageRating: number;
  reviewCount: number;
  favoriteCount: number;
  views: number; // For popularity
  
  // Status
  availability: 'available' | 'limited' | 'full';
  featured: boolean;
  verified: boolean; // Verified by app admins
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string; // User ID who added it
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface PriceRange {
  min: number;
  max: number;
  currency: 'GHS';
}

export type Amenity = 
  | 'wifi'
  | 'security'
  | 'water'
  | 'electricity'
  | 'meals'
  | 'parking'
  | 'study-area'
  | 'laundry'
  | 'kitchen'
  | 'bedding'
  | 'furnished'
  | 'air-conditioning'
  | 'fan'
  | 'tv'
  | 'fridge'
  | 'generator'; // For power outages

export interface ContactInfo {
  phone: string[];
  email?: string;
  whatsapp?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
}

export interface HostelImage {
  url: string; // Cloudinary URL
  publicId: string; // Cloudinary public ID
  caption?: string;
  isPrimary: boolean;
  uploadedAt: Date;
}

// ==================== Review Types ====================

export interface Review {
  id: string;
  userId: string;
  userName: string; // Denormalized for performance
  userAvatar?: string;
  hostelId: string;
  
  // Rating (1-5)
  rating: number;
  comment: string;
  
  // Stay details
  dateStayed: string; // "January 2026" format
  duration?: 'semester' | 'year' | 'summer' | 'other';
  roomType?: 'self-contained' | 'shared';
  
  // Verification
  verified: boolean; // If we confirmed they actually stayed
  helpful: number; // Count of helpful votes
  reported: boolean; // Flag for moderation
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  
  // Responses (if owner replies)
  ownerResponse?: ReviewResponse;
}

export interface ReviewResponse {
  userId: string; // Owner's ID
  userName: string;
  comment: string;
  createdAt: Date;
  updatedAt?: Date;
}

// ==================== Favorite Types ====================

export interface Favorite {
  userId: string;
  hostelId: string;
  savedAt: Date;
  notes?: string; // Optional personal notes
  notifyOnPriceChange?: boolean;
}

// ==================== Search Types ====================

export interface SearchFilters {
  location?: string[];
  gender?: 'male' | 'female' | 'mixed' | 'all';
  priceMin?: number;
  priceMax?: number;
  amenities?: Amenity[];
  rating?: number; // Minimum rating
  availability?: 'available' | 'limited' | 'full' | 'all';
  verified?: boolean;
  featured?: boolean;
}

export interface SearchResult {
  hostels: Hostel[];
  total: number;
  lastVisible: unknown; // For pagination (Firestore DocumentSnapshot or similar)
  filters: SearchFilters;
}

// ==================== Notification Types ====================

export interface Notification {
  id: string;
  userId: string;
  type: 'review' | 'favorite' | 'price-change' | 'availability' | 'system';
  title: string;
  message: string;
  data?: Record<string, unknown>; // Additional data (hostelId, reviewId, etc.)
  read: boolean;
  createdAt: Date;
}

// ==================== Utility Types ====================

export type SortOption = 
  | 'rating-desc'
  | 'price-asc'
  | 'price-desc'
  | 'newest'
  | 'popularity';

export interface PaginationOptions {
  limit: number;
  lastVisible?: unknown;
  sortBy?: SortOption;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
// ==================== Map Types ====================

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapViewport {
  center: [number, number]; // [latitude, longitude]
  zoom: number;
  bounds?: MapBounds;
}

// UCC Campus locations (for reference)
export const UCC_LOCATIONS = {
  'science': { lat: 5.1167, lng: -1.2833, name: 'Science' },
  'north-campus': { lat: 5.1200, lng: -1.2800, name: 'North Campus' },
  'south-campus': { lat: 5.1130, lng: -1.2860, name: 'South Campus' },
  'atlantic-hall': { lat: 5.1150, lng: -1.2850, name: 'Atlantic Hall' },
  'african-hall': { lat: 5.1170, lng: -1.2820, name: 'African Hall' },
  'casford': { lat: 5.1180, lng: -1.2810, name: 'Casford' },
  'valco': { lat: 5.1140, lng: -1.2840, name: 'Valco Trust' },
  'business-school': { lat: 5.1160, lng: -1.2825, name: 'Business School' },
  'medical-school': { lat: 5.1190, lng: -1.2780, name: 'Medical School' },
  'main-gate': { lat: 5.1155, lng: -1.2835, name: 'Main Gate' },
};

export type UCCLocationKey = keyof typeof UCC_LOCATIONS;

// Hostel marker for map
export interface HostelMarker extends Hostel {
  distance?: number; // Distance from user in km
  clusterId?: string; // For marker clustering
}

// User location
export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp: number;
}