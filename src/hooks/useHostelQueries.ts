// Type guard for InfiniteData
function isInfiniteData<T>(data: unknown): data is InfiniteData<T, unknown> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'pages' in data &&
    Array.isArray((data as { pages?: unknown }).pages)
  );
}
import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';
import { hostelService, reviewService, favoriteService } from '../lib/firestore';
import type { SearchFilters, Review, PaginationOptions } from '../types';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';
import type { InfiniteData } from '@tanstack/react-query';
import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

// ==================== Hostel Queries ====================

interface UseHostelsOptions {
  filters?: SearchFilters;
  limit?: number;
  enabled?: boolean;
}

export const useHostelsQuery = ({ filters, limit = 10, enabled = true }: UseHostelsOptions = {}) => {
  const queryClient = useQueryClient();

  type HostelsPage = Awaited<ReturnType<typeof hostelService.getHostels>>;

  const query = useInfiniteQuery<HostelsPage, Error, HostelsPage, [string, string, unknown], unknown>({
    queryKey: [...queryKeys.hostels.list(filters || {})] as [string, string, unknown],
    queryFn: async ({ pageParam = null }) => {
      const options: PaginationOptions = {
        limit,
        lastVisible: pageParam,
      };
      return hostelService.getHostels(filters, options);
    },
    getNextPageParam: (lastPage) => (lastPage as HostelsPage).lastVisible,
    initialPageParam: null,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled,
  });

  // Flatten all hostels from pages
  const hostels =
    isInfiniteData<HostelsPage>(query.data)
      ? query.data.pages.flatMap((page: HostelsPage) => page.hostels)
      : [];
  const isLoading = query.isLoading;
  const isLoadingMore = query.isFetchingNextPage;
  const hasMore = !!query.hasNextPage;
  const error = query.error;

  const loadMore = () => {
    if (hasMore && !isLoadingMore) {
      query.fetchNextPage();
    }
  };

  const refresh = () => {
    query.refetch();
  };

  // Prefetch next page
  const prefetchNext = async () => {
    if (hasMore && isInfiniteData<HostelsPage>(query.data)) {
      const lastPage = query.data.pages[query.data.pages.length - 1] as HostelsPage;
      if (lastPage && lastPage.lastVisible) {
        await queryClient.prefetchInfiniteQuery({
          queryKey: queryKeys.hostels.list(filters || {}),
          initialPageParam: lastPage.lastVisible,
        });
      }
    }
  };

  return {
    hostels,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    refresh,
    prefetchNext,
    refetch: query.refetch,
  };
};

export const useHostelQuery = (hostelId: string) => {
  return useQuery({
    queryKey: queryKeys.hostels.detail(hostelId),
    queryFn: () => hostelService.getHostelById(hostelId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!hostelId,
  });
};

export const useNearbyHostelsQuery = (lat: number, lng: number, radius: number = 2) => {
  return useQuery({
    queryKey: queryKeys.hostels.nearby(lat, lng, radius),
    queryFn: async () => {
      const { hostels } = await hostelService.getHostels();
      
      // Calculate distances client-side
      const withDistance = hostels.map(hostel => ({
        ...hostel,
        distance: calculateDistance(
          lat,
          lng,
          hostel.coordinates.latitude,
          hostel.coordinates.longitude
        ),
      }));

      return withDistance
        .filter(h => h.distance <= radius)
        .sort((a, b) => (a.distance || 0) - (b.distance || 0));
    },
    staleTime: 60 * 1000, // 1 minute
    enabled: !!lat && !!lng,
  });
};

// ==================== Review Queries ====================

export const useReviewsQuery = (hostelId: string, limit: number = 20) => {
  const queryClient = useQueryClient();

  type ReviewsPage = { reviews: Review[]; lastVisible: QueryDocumentSnapshot<DocumentData, DocumentData> | null };

  const query = useInfiniteQuery<
    ReviewsPage,
    Error,
    ReviewsPage,
    [string, string, string],
    QueryDocumentSnapshot<DocumentData, DocumentData> | null
  >({
    queryKey: [...queryKeys.reviews.list(hostelId)] as [string, string, string],
    queryFn: async ({ pageParam = null }) => {
      return reviewService.getHostelReviews(hostelId, {
        limit,
        lastVisible: pageParam,
      });
    },
    getNextPageParam: (lastPage) => lastPage.lastVisible,
    initialPageParam: null,
    staleTime: 60 * 1000, // 1 minute
    enabled: !!hostelId,
  });

  const reviews =
    isInfiniteData<ReviewsPage>(query.data)
      ? query.data.pages.flatMap((page: ReviewsPage) => page.reviews)
      : [];
  const isLoading = query.isLoading;
  const isLoadingMore = query.isFetchingNextPage;
  const hasMore = !!query.hasNextPage;

  const loadMore = () => {
    if (hasMore && !isLoadingMore) {
      query.fetchNextPage();
    }
  };

  // Mutation for adding a review
  const addReviewMutation = useMutation({
    mutationFn: (reviewData: Omit<Review, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'userName'>) => {
      if (!hostelId) throw new Error('No hostel ID');
      return reviewService.addReview(hostelId, 'temp-user-id', reviewData); // User ID will come from auth
    },
    onSuccess: () => {
      // Invalidate reviews query to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.list(hostelId) });
      
      // Also invalidate hostel query (rating changed)
      queryClient.invalidateQueries({ queryKey: queryKeys.hostels.detail(hostelId) });
      
      toast.success('Review added successfully!');
    },
    onError: (error) => {
      toast.error('Failed to add review');
      console.error('Review error:', error);
    },
  });

  return {
    reviews,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    addReview: addReviewMutation.mutate,
    isAddingReview: addReviewMutation.isPending,
  };
};

// ==================== Favorite Mutations ====================

export const useFavoriteMutation = (hostelId: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: () => {
      if (!user) throw new Error('Must be logged in');
      return favoriteService.toggleFavorite(user.uid, hostelId);
    },
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.user.favorites(user?.uid || '') 
      });

      // Snapshot previous value
      const previousFavorites = queryClient.getQueryData(
        queryKeys.user.favorites(user?.uid || '')
      );

      // Optimistically update
      queryClient.setQueryData(
        queryKeys.user.favorites(user?.uid || ''),
        (old: string[] = []) => {
          if (old.includes(hostelId)) {
            return old.filter(id => id !== hostelId);
          } else {
            return [...old, hostelId];
          }
        }
      );

      return { previousFavorites };
    },
    onError: (_err, _, context) => {
      // Rollback on error
      queryClient.setQueryData(
        queryKeys.user.favorites(user?.uid || ''),
        context?.previousFavorites
      );
      toast.error('Failed to update favorite');
    },
    onSuccess: (isFavorited) => {
      toast.success(isFavorited ? 'Added to favorites' : 'Removed from favorites');
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.user.favorites(user?.uid || '') 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.hostels.detail(hostelId) 
      });
    },
  });
};

// ==================== Search Query ====================

export const useSearchQuery = (searchTerm: string, debounceMs: number = 300) => {
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);

  return useQuery({
    queryKey: queryKeys.search.results(debouncedTerm),
    queryFn: async () => {
      if (!debouncedTerm) return [];
      
      const { hostels } = await hostelService.getHostels();
      
      // Client-side search (replace with Algolia/Meilisearch for production)
      const term = debouncedTerm.toLowerCase();
      return hostels.filter(hostel => 
        hostel.name.toLowerCase().includes(term) ||
        hostel.location.toLowerCase().includes(term) ||
        hostel.description?.toLowerCase().includes(term) ||
        hostel.amenities.some(a => a.toLowerCase().includes(term))
      );
    },
    enabled: debouncedTerm.length > 2, // Only search if term > 2 chars
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// ==================== Helper Components ====================

import { useState, useEffect } from 'react';

// Helper function (duplicated from mapConfig to avoid circular dependency)
const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};