import { QueryClient } from '@tanstack/react-query';
import type { DefaultOptions } from '@tanstack/react-query';

// Configure default options for all queries
const defaultOptions: DefaultOptions = {
  queries: {
    // Stale time: how long data is considered fresh (5 minutes)
    staleTime: 5 * 60 * 1000,
    
    // Cache time: how long inactive data stays in cache (10 minutes)
    gcTime: 10 * 60 * 1000,
    
    // Retry failed queries 3 times
    retry: 3,
    
    // Retry with exponential backoff
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Refetch on window focus (useful for mobile)
    refetchOnWindowFocus: true,
    
    // Refetch on reconnect (when mobile network comes back)
    refetchOnReconnect: true,
    
    // Don't refetch on mount if data is fresh
    refetchOnMount: false,
    
    // Show stale data while fetching
    placeholderData: (previousData: unknown) => previousData,
  },
  mutations: {
    // Retry mutations 2 times
    retry: 2,
    
    // Don't retry on network errors (mobile might lose connection)
    retryDelay: 1000,
  },
};

// Create a client
export const queryClient = new QueryClient({
  defaultOptions,
});

// Query keys for consistent cache management
export const queryKeys = {
  hostels: {
    all: ['hostels'] as const,
    lists: () => [...queryKeys.hostels.all, 'list'] as const,
    list: (filters: unknown) => [...queryKeys.hostels.lists(), filters] as const,
    details: () => [...queryKeys.hostels.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.hostels.details(), id] as const,
    nearby: (lat: number, lng: number, radius: number) => 
      [...queryKeys.hostels.all, 'nearby', lat, lng, radius] as const,
  },
  reviews: {
    all: ['reviews'] as const,
    lists: () => [...queryKeys.reviews.all, 'list'] as const,
    list: (hostelId: string) => [...queryKeys.reviews.lists(), hostelId] as const,
  },
  user: {
    all: ['user'] as const,
    profile: (userId: string) => [...queryKeys.user.all, 'profile', userId] as const,
    favorites: (userId: string) => [...queryKeys.user.all, 'favorites', userId] as const,
  },
  search: {
    all: ['search'] as const,
    results: (query: string) => [...queryKeys.search.all, query] as const,
  },
};

// Prefetch configuration for common queries
export const prefetchConfig = {
  hostels: {
    staleTime: 5 * 60 * 1000, // 5 minutes
  },
  hostelDetail: {
    staleTime: 2 * 60 * 1000, // 2 minutes
  },
  reviews: {
    staleTime: 1 * 60 * 1000, // 1 minute
  },
};