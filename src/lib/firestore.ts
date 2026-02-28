import type {
	Hostel,
	Review,
	Favorite,
	SearchFilters,
	PaginationOptions,
	User
} from '../types';
import type { QueryDocumentSnapshot } from 'firebase/firestore';

// HOSTEL SERVICE
export interface HostelService {
	getHostels: (filters?: SearchFilters, options?: PaginationOptions) => Promise<{ hostels: Hostel[]; lastVisible: QueryDocumentSnapshot | null }>;
	onHostelChange: (hostelId: string, callback: (hostel: Hostel | null) => void) => () => void;
	incrementViewCount: (hostelId: string) => void;
	getHostelById: (hostelId: string) => Promise<Hostel | null>;
}
export const hostelService: HostelService = {
	getHostels: async () => ({ hostels: [], lastVisible: null }),
	onHostelChange: () => () => {},
	incrementViewCount: () => {},
	getHostelById: async () => null,
};

// REVIEW SERVICE
export interface ReviewService {
	onReviewsChange: (hostelId: string, callback: (reviews: Review[]) => void) => () => void;
	addReview: (hostelId: string, userId: string, reviewData: Partial<Review>) => Promise<void>;
	markHelpful: (reviewId: string, hostelId: string) => Promise<void>;
}
export const reviewService: ReviewService = {
	onReviewsChange: () => () => {},
	addReview: async () => {},
	markHelpful: async () => {},
};

// FAVORITE SERVICE
export interface FavoriteService {
	getUserFavorites: (userId: string) => Promise<Favorite[]>;
	toggleFavorite: (userId: string, hostelId: string) => Promise<boolean>;
	onFavoriteStatus: (userId: string, hostelId: string, callback: (status: boolean) => void) => () => void;
}
export const favoriteService: FavoriteService = {
	getUserFavorites: async () => [],
	toggleFavorite: async () => false,
	onFavoriteStatus: () => () => {},
};

// USER SERVICE
export interface UserService {
	onUserProfileChange: (userId: string, callback: (user: User | null) => void) => () => void;
	updateUserProfile: (userId: string, data: Partial<User>) => Promise<void>;
}
export const userService: UserService = {
	onUserProfileChange: () => () => {},
	updateUserProfile: async () => {},
};
