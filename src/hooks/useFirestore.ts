import { useState, useEffect, useCallback } from 'react';
import type { QueryDocumentSnapshot, Unsubscribe } from 'firebase/firestore';
import { hostelService, reviewService, favoriteService, userService } from '../lib/firestore';
import type {
  Hostel,
  Review,
  SearchFilters,
  PaginationOptions,
  User
} from '../types';
import { useAuth } from './useAuth';

// ==================== Hostel Hooks ====================

export const useHostels = (initialFilters?: SearchFilters) => {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(false);
  // error state removed for clean compilation
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<SearchFilters | undefined>(initialFilters);

  const loadHostels = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      const options: PaginationOptions = {
        limit: 10,
        lastVisible: reset ? undefined : lastVisible || undefined,
      };
      const result = await hostelService.getHostels(filters, options);
      setHostels(prev => reset ? result.hostels : [...prev, ...result.hostels]);
      setLastVisible(result.lastVisible);
      setHasMore(result.hostels.length === 10);
    } finally {
      setLoading(false);
    }
  }, [filters, lastVisible]);

  // Initial load
  useEffect(() => {
    loadHostels(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const refresh = useCallback(() => {
    setLastVisible(null);
    loadHostels(true);
  }, [loadHostels]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadHostels(false);
    }
  }, [loading, hasMore, loadHostels]);

  const updateFilters = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
    setLastVisible(null);
  }, []);

  return {
    hostels,
    loading,
    // error removed
    hasMore,
    loadMore,
    refresh,
    updateFilters,
  };
};

export const useHostel = (hostelId: string) => {
  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [loading, setLoading] = useState(true);
  // error state removed for clean compilation

  useEffect(() => {
    if (!hostelId) return;

    const unsubscribe = hostelService.onHostelChange(hostelId, (updatedHostel: Hostel | null) => {
      setHostel(updatedHostel);
      setLoading(false);
    });

    // Increment view count
    hostelService.incrementViewCount(hostelId);

    return () => unsubscribe();
  }, [hostelId]);

  return { hostel, loading };
};

// ==================== Review Hooks ====================

export const useReviews = (hostelId: string) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  // error state removed for clean compilation
  const { user } = useAuth();

  useEffect(() => {
    if (!hostelId) return;

    const unsubscribe = reviewService.onReviewsChange(hostelId, (updatedReviews: Review[]) => {
      setReviews(updatedReviews);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [hostelId]);

  const addReview = useCallback(async (reviewData: Omit<Review, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'userName'>) => {
    if (!user) throw new Error('Must be logged in to review');

    try {
      setLoading(true);
      await reviewService.addReview(hostelId, user.uid, {
        ...reviewData,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userAvatar: user.photoURL || undefined,
      });
    } finally {
      setLoading(false);
    }
  }, [hostelId, user]);

  const markHelpful = useCallback(async (reviewId: string) => {
    try {
      await reviewService.markHelpful(reviewId, hostelId);
    } catch (err) {
      console.error('Failed to mark helpful:', err);
    }
  }, [hostelId]);

  return {
    reviews,
    loading,
    // error removed
    addReview,
    markHelpful,
  };
};

// ==================== Favorite Hooks ====================

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteHostels, setFavoriteHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(false);
  // error state removed for clean compilation
  const { user } = useAuth();

  // Load all favorite IDs
  useEffect(() => {
    if (!user) {
      setFavorites([]);
      setFavoriteHostels([]);
      return;
    }

    const loadFavorites = async () => {
      try {
        setLoading(true);
        const userFavorites = await favoriteService.getUserFavorites(user.uid);
        const favoriteIds = userFavorites.map((f: { hostelId: string }) => f.hostelId);
        setFavorites(favoriteIds);

        // Load full hostel details for favorites
        const hostels = await Promise.all(
          favoriteIds.map((id: string) => hostelService.getHostelById(id))
        );
        setFavoriteHostels(hostels.filter((h: Hostel | null): h is Hostel => h !== null));
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [user]);

  const toggleFavorite = useCallback(async (hostelId: string) => {
    if (!user) throw new Error('Must be logged in to favorite');

    try {
      setLoading(true);
      const isNowFavorited = await favoriteService.toggleFavorite(user.uid, hostelId);
      
      setFavorites(prev => 
        isNowFavorited 
          ? [...prev, hostelId] 
          : prev.filter((id: string) => id !== hostelId)
      );

      // Update favoriteHostels list
      if (isNowFavorited) {
        const hostel = await hostelService.getHostelById(hostelId);
        if (hostel) {
          setFavoriteHostels(prev => [...prev, hostel]);
        }
      } else {
        setFavoriteHostels(prev => prev.filter((h: Hostel) => h.id !== hostelId));
      }

      return isNowFavorited;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const isFavorited = useCallback((hostelId: string) => {
    return favorites.includes(hostelId);
  }, [favorites]);

  // Real-time favorite status for a specific hostel
  const useFavoriteStatus = (hostelId: string) => {
    const [isFav, setIsFav] = useState(false);
    const [statusLoading, setStatusLoading] = useState(true);

    useEffect(() => {
      if (!user || !hostelId) {
        setIsFav(false);
        setStatusLoading(false);
        return;
      }

      let unsubscribe: Unsubscribe | undefined;

      const setupListener = async () => {
        unsubscribe = favoriteService.onFavoriteStatus(
          user.uid, 
          hostelId, 
          (status: boolean) => {
            setIsFav(status);
            setStatusLoading(false);
          }
        );
      };

      setupListener();

      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }, [hostelId]);

    return { isFav, loading: statusLoading };
  };

  return {
    favorites,
    favoriteHostels,
    loading,
    // error removed
    toggleFavorite,
    isFavorited,
    useFavoriteStatus,
  };
};

// ==================== User Profile Hooks ====================

export const useUserProfile = (userId?: string) => {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // error state removed for clean compilation
  const { user: currentUser } = useAuth();
  const targetUserId = userId || currentUser?.uid;

  useEffect(() => {
    if (!targetUserId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const unsubscribe = userService.onUserProfileChange(targetUserId, (userProfile: User | null) => {
      setProfile(userProfile);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [targetUserId]);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    if (!targetUserId) throw new Error('No user ID');

    try {
      setLoading(true);
      await userService.updateUserProfile(targetUserId, data);
    } finally {
      setLoading(false);
    }
  }, [targetUserId]);

  return {
    profile,
    loading,
    // error removed
    updateProfile,
    isOwnProfile: currentUser?.uid === targetUserId,
  };
};

// ==================== Search Hook ====================

export const useSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(false);
  const { hostels } = useHostels(); // Get all hostels with current filters

  useEffect(() => {
    if (!searchQuery.trim()) {
      // Avoid calling setState synchronously in effect
      setTimeout(() => setResults([]), 0);
      return;
    }

    const searchTimeout = setTimeout(() => {
      setLoading(true);
      // Simple client-side search (for small dataset)
      // In production, you might want a dedicated search service
      const query = searchQuery.toLowerCase();
      const filtered = hostels.filter((hostel: Hostel) => 
        hostel.name.toLowerCase().includes(query) ||
        hostel.location.toLowerCase().includes(query) ||
        hostel.description?.toLowerCase().includes(query) ||
        hostel.amenities.some((a: string) => a.toLowerCase().includes(query))
      );
      setResults(filtered);
      setLoading(false);
    }, 300); // Debounce

    return () => clearTimeout(searchTimeout);
  }, [searchQuery, hostels]);

  return {
    searchQuery,
    setSearchQuery,
    results,
    loading,
  };
};

// ==================== Pagination Hook ====================

export const usePagination = <T>(
  fetchFunction: (page: number) => Promise<T[]>,
  itemsPerPage: number = 10
) => {
  const [items, setItems] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  // error state removed for clean compilation

  const loadPage = useCallback(async (page: number) => {
    try {
      setLoading(true);
      const newItems = await fetchFunction(page);
      
      if (page === 1) {
        setItems(newItems);
      } else {
        setItems(prev => [...prev, ...newItems]);
      }
      
      setHasMore(newItems.length === itemsPerPage);
      // setError removed
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, itemsPerPage]);

  useEffect(() => {
    loadPage(currentPage);
  }, [currentPage, loadPage]);

  const nextPage = useCallback(() => {
    if (hasMore && !loading) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasMore, loading]);

  const refresh = useCallback(() => {
    setCurrentPage(1);
    loadPage(1);
  }, [loadPage]);

  return {
    items,
    loading,
    // error removed
    hasMore,
    nextPage,
    refresh,
    currentPage,
  };
};