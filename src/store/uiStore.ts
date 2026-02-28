import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { SearchFilters, SortOption } from '../types';

// ==================== UI Store Types ====================

interface UIState {
  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  // Search & Filters
  filters: SearchFilters;
  setFilters: (filters: Partial<SearchFilters>) => void;
  resetFilters: () => void;
  
  // Sorting
  sortBy: SortOption;
  setSortBy: (sortBy: SortOption) => void;
  
  // View mode
  viewMode: 'list' | 'map';
  setViewMode: (mode: 'list' | 'map') => void;
  
  // Selected items
  selectedHostelId: string | null;
  setSelectedHostelId: (id: string | null) => void;
  
  // Modals
  modals: {
    auth: boolean;
    filters: boolean;
    share: boolean;
    report: boolean;
  };
  openModal: (modal: keyof UIState['modals']) => void;
  closeModal: (modal: keyof UIState['modals']) => void;
  toggleModal: (modal: keyof UIState['modals']) => void;
  closeAllModals: () => void;
  
  // Notifications
  notifications: {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    duration?: number;
  }[];
  addNotification: (notification: Omit<UIState['notifications'][0], 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Loading states (UI-specific)
  loadingStates: Record<string, boolean>;
  setLoading: (key: string, isLoading: boolean) => void;
  
  // Recent searches (for autocomplete)
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  
  // Onboarding
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (seen: boolean) => void;
  
  // Network status (for mobile)
  isOnline: boolean;
  setIsOnline: (isOnline: boolean) => void;
  
  // Reset all state
  reset: () => void;
}

// Default filter values
const DEFAULT_FILTERS: SearchFilters = {
  gender: 'all',
  priceMin: 0,
  priceMax: 2000,
  amenities: [],
  verified: false,
  featured: false,
};

// ==================== Create Store ====================

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Theme
      theme: 'system',
      setTheme: (theme) => set({ theme }),

      // Search & Filters
      filters: DEFAULT_FILTERS,
      setFilters: (newFilters) => 
        set((state) => ({ 
          filters: { ...state.filters, ...newFilters } 
        })),
      resetFilters: () => set({ filters: DEFAULT_FILTERS }),

      // Sorting
      sortBy: 'rating-desc',
      setSortBy: (sortBy) => set({ sortBy }),

      // View mode
      viewMode: 'list',
      setViewMode: (viewMode) => set({ viewMode }),

      // Selected items
      selectedHostelId: null,
      setSelectedHostelId: (id) => set({ selectedHostelId: id }),

      // Modals
      modals: {
        auth: false,
        filters: false,
        share: false,
        report: false,
      },
      openModal: (modal) => 
        set((state) => ({
          modals: { ...state.modals, [modal]: true }
        })),
      closeModal: (modal) => 
        set((state) => ({
          modals: { ...state.modals, [modal]: false }
        })),
      toggleModal: (modal) => 
        set((state) => ({
          modals: { ...state.modals, [modal]: !state.modals[modal] }
        })),
      closeAllModals: () => 
        set({
          modals: {
            auth: false,
            filters: false,
            share: false,
            report: false,
          }
        }),

      // Notifications
      notifications: [],
      addNotification: (notification) => {
        const id = Date.now().toString();
        const newNotification = { ...notification, id };
        
        set((state) => ({
          notifications: [...state.notifications, newNotification]
        }));

        // Auto-remove after duration
        if (notification.duration !== 0) {
          setTimeout(() => {
            get().removeNotification(id);
          }, notification.duration || 3000);
        }
      },
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        })),
      clearNotifications: () => set({ notifications: [] }),

      // Loading states
      loadingStates: {},
      setLoading: (key, isLoading) =>
        set((state) => ({
          loadingStates: { ...state.loadingStates, [key]: isLoading }
        })),

      // Recent searches
      recentSearches: [],
      addRecentSearch: (query) => {
        if (!query.trim()) return;
        
        set((state) => {
          // Remove if exists, then add to front
          const filtered = state.recentSearches.filter(q => q !== query);
          const updated = [query, ...filtered].slice(0, 10); // Keep last 10
          return { recentSearches: updated };
        });
      },
      clearRecentSearches: () => set({ recentSearches: [] }),

      // Onboarding
      hasSeenOnboarding: false,
      setHasSeenOnboarding: (seen) => set({ hasSeenOnboarding: seen }),

      // Network status
      isOnline: navigator.onLine,
      setIsOnline: (isOnline) => set({ isOnline }),

      // Reset
      reset: () => set({
        filters: DEFAULT_FILTERS,
        sortBy: 'rating-desc',
        viewMode: 'list',
        selectedHostelId: null,
        modals: {
          auth: false,
          filters: false,
          share: false,
          report: false,
        },
        notifications: [],
        recentSearches: [],
      }),
    }),
    {
      name: 'ucc-hostel-finder-storage', // unique name for localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist these fields
        theme: state.theme,
        recentSearches: state.recentSearches,
        hasSeenOnboarding: state.hasSeenOnboarding,
        filters: state.filters,
        sortBy: state.sortBy,
        viewMode: state.viewMode,
      }),
    }
  )
);

// ==================== Selector Hooks ====================

// These help with performance by preventing re-renders on unrelated changes

export const useTheme = () => useUIStore((state) => state.theme);
export const useFilters = () => useUIStore((state) => state.filters);
export const useSortBy = () => useUIStore((state) => state.sortBy);
export const useViewMode = () => useUIStore((state) => state.viewMode);
export const useSelectedHostel = () => useUIStore((state) => state.selectedHostelId);
export const useModal = (modal: keyof UIState['modals']) => 
  useUIStore((state) => state.modals[modal]);
export const useIsOnline = () => useUIStore((state) => state.isOnline);

// ==================== Network Listener ====================

// Listen to online/offline events
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useUIStore.getState().setIsOnline(true);
    useUIStore.getState().addNotification({
      type: 'success',
      message: 'You are back online!',
      duration: 3000,
    });
  });

  window.addEventListener('offline', () => {
    useUIStore.getState().setIsOnline(false);
    useUIStore.getState().addNotification({
      type: 'warning',
      message: 'You are offline. Showing cached data.',
      duration: 0, // Don't auto-dismiss
    });
  });
}