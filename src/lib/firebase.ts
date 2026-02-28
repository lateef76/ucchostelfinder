import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  Timestamp,
  writeBatch,
  increment,
  onSnapshot
} from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { app } from './firebaseApp';
import type {
  Hostel,
  User,
  Review,
  Favorite,
  SearchFilters,
  PaginationOptions,
  SortOption
} from '../types';

// Initialize Firestore
export const db = getFirestore(app);

// ==================== Collection References ====================

export const usersCollection = collection(db, 'users');
export const hostelsCollection = collection(db, 'hostels');

// Helper to get subcollections
export const getFavoritesCollection = (userId: string) => 
  collection(db, 'users', userId, 'favorites');

export const getReviewsCollection = (hostelId: string) => 
  collection(db, 'hostels', hostelId, 'reviews');

// ==================== User Operations ====================

export const userService = {
  // Create or update user profile
  async setUserProfile(userId: string, userData: Partial<User>) {
    const userRef = doc(usersCollection, userId);
    await setDoc(userRef, {
      ...userData,
      updatedAt: Timestamp.now(),
    }, { merge: true });
  },

  // Get user profile
  async getUserProfile(userId: string): Promise<User | null> {
    const userRef = doc(usersCollection, userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() } as User;
    }
    return null;
  },

  // Update user profile
  async updateUserProfile(userId: string, userData: Partial<User>) {
    const userRef = doc(usersCollection, userId);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: Timestamp.now(),
    });
  },

  // Listen to user profile changes (real-time)
  onUserProfileChange(userId: string, callback: (user: User | null) => void): Unsubscribe {
    const userRef = doc(usersCollection, userId);
    return onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() } as User);
      } else {
        callback(null);
      }
    });
  }
};

// ==================== Hostel Operations ====================

export const hostelService = {
  // Get all hostels with filters and pagination
  async getHostels(
    filters?: SearchFilters,
    options: PaginationOptions = { limit: 10 }
  ): Promise<{ hostels: Hostel[]; lastVisible: QueryDocumentSnapshot | null }> {
    let q = query(hostelsCollection);

    // Apply filters
    if (filters) {
      if (filters.gender && filters.gender !== 'all') {
        q = query(q, where('gender', '==', filters.gender));
      }
      
      if (filters.location && filters.location.length > 0) {
        q = query(q, where('location', 'in', filters.location));
      }
      
      if (filters.verified !== undefined) {
        q = query(q, where('verified', '==', filters.verified));
      }
      
      if (filters.featured !== undefined) {
        q = query(q, where('featured', '==', filters.featured));
      }
      
      // Price range filters
      if (filters.priceMin !== undefined) {
        q = query(q, where('priceRange.max', '>=', filters.priceMin));
      }
      if (filters.priceMax !== undefined) {
        q = query(q, where('priceRange.min', '<=', filters.priceMax));
      }
      
      // Amenities (array contains any)
      if (filters.amenities && filters.amenities.length > 0) {
        q = query(q, where('amenities', 'array-contains-any', filters.amenities));
      }
      
      // Minimum rating
      if (filters.rating !== undefined) {
        q = query(q, where('averageRating', '>=', filters.rating));
      }
    }

    // Apply sorting
    const sortField = getSortField(options.sortBy || 'rating-desc');
    q = query(q, orderBy(sortField.field, sortField.direction));

    // Apply pagination
    if (options.lastVisible) {
      q = query(q, startAfter(options.lastVisible));
    }
    q = query(q, limit(options.limit));

    const snapshot = await getDocs(q);
    const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;
    
    const hostels = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Hostel[];

    return { hostels, lastVisible };
  },

  // Get single hostel by ID
  async getHostelById(hostelId: string): Promise<Hostel | null> {
    const hostelRef = doc(hostelsCollection, hostelId);
    const hostelSnap = await getDoc(hostelRef);
    
    if (hostelSnap.exists()) {
      return {
        id: hostelSnap.id,
        ...hostelSnap.data(),
        createdAt: hostelSnap.data().createdAt?.toDate(),
        updatedAt: hostelSnap.data().updatedAt?.toDate(),
      } as Hostel;
    }
    return null;
  },

  // Create new hostel
  async createHostel(hostelData: Omit<Hostel, 'id' | 'createdAt' | 'updatedAt'>) {
    const hostelRef = doc(hostelsCollection);
    const now = Timestamp.now();
    
    await setDoc(hostelRef, {
      ...hostelData,
      averageRating: 0,
      reviewCount: 0,
      favoriteCount: 0,
      views: 0,
      createdAt: now,
      updatedAt: now,
    });
    
    return hostelRef.id;
  },

  // Update hostel
  async updateHostel(hostelId: string, hostelData: Partial<Hostel>) {
    const hostelRef = doc(hostelsCollection, hostelId);
    await updateDoc(hostelRef, {
      ...hostelData,
      updatedAt: Timestamp.now(),
    });
  },

  // Increment view count
  async incrementViewCount(hostelId: string) {
    const hostelRef = doc(hostelsCollection, hostelId);
    await updateDoc(hostelRef, {
      views: increment(1)
    });
  },

  // Listen to hostel changes (real-time)
  onHostelChange(hostelId: string, callback: (hostel: Hostel | null) => void): Unsubscribe {
    const hostelRef = doc(hostelsCollection, hostelId);
    return onSnapshot(hostelRef, (doc) => {
      if (doc.exists()) {
        callback({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        } as Hostel);
      } else {
        callback(null);
      }
    });
  }
};

// ==================== Review Operations ====================

export const reviewService = {
  // Get reviews for a hostel
  async getHostelReviews(hostelId: string, options: PaginationOptions = { limit: 20 }) {
    const reviewsRef = getReviewsCollection(hostelId);
    let q = query(
      reviewsRef,
      orderBy('createdAt', 'desc'),
      limit(options.limit)
    );
    
    if (options.lastVisible) {
      q = query(q, startAfter(options.lastVisible));
    }
    
    const snapshot = await getDocs(q);
    const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;
    
    const reviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Review[];
    
    return { reviews, lastVisible };
  },

  // Add a review
  async addReview(hostelId: string, userId: string, reviewData: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>) {
    const reviewsRef = getReviewsCollection(hostelId);
    const batch = writeBatch(db);
    
    // Add the review
    const reviewRef = doc(reviewsRef);
    batch.set(reviewRef, {
      ...reviewData,
      userId,
      helpful: 0,
      reported: false,
      verified: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    
    // Update hostel stats
    const hostelRef = doc(hostelsCollection, hostelId);
    const hostelSnap = await getDoc(hostelRef);
    const currentData = hostelSnap.data();
    const newCount = (currentData?.reviewCount || 0) + 1;
    const newAvg = ((currentData?.averageRating || 0) * (currentData?.reviewCount || 0) + reviewData.rating) / newCount;
    
    batch.update(hostelRef, {
      reviewCount: increment(1),
      averageRating: newAvg,
      updatedAt: Timestamp.now(),
    });
    
    // Update user review count
    const userRef = doc(usersCollection, userId);
    batch.update(userRef, {
      reviewCount: increment(1),
    });
    
    await batch.commit();
    return reviewRef.id;
  },

  // Mark review as helpful
  async markHelpful(reviewId: string, hostelId: string) {
    const reviewRef = doc(getReviewsCollection(hostelId), reviewId);
    await updateDoc(reviewRef, {
      helpful: increment(1)
    });
  },

  // Listen to reviews in real-time
  onReviewsChange(hostelId: string, callback: (reviews: Review[]) => void): Unsubscribe {
    const reviewsRef = getReviewsCollection(hostelId);
    const q = query(reviewsRef, orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const reviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Review[];
      callback(reviews);
    });
  }
};

// ==================== Favorite Operations ====================

export const favoriteService = {
  // Get user's favorites
  async getUserFavorites(userId: string): Promise<Favorite[]> {
    const favoritesRef = getFavoritesCollection(userId);
    const snapshot = await getDocs(favoritesRef);
    
    return snapshot.docs.map(doc => ({
      hostelId: doc.id,
      ...doc.data(),
      savedAt: doc.data().savedAt?.toDate(),
    })) as Favorite[];
  },

  // Toggle favorite
  async toggleFavorite(userId: string, hostelId: string) {
    const favoriteRef = doc(getFavoritesCollection(userId), hostelId);
    const hostelRef = doc(hostelsCollection, hostelId);
    const batch = writeBatch(db);
    
    const favoriteDoc = await getDoc(favoriteRef);
    
    if (favoriteDoc.exists()) {
      // Remove favorite
      batch.delete(favoriteRef);
      batch.update(hostelRef, {
        favoriteCount: increment(-1)
      });
    } else {
      // Add favorite
      batch.set(favoriteRef, {
        savedAt: Timestamp.now(),
        hostelId
      });
      batch.update(hostelRef, {
        favoriteCount: increment(1)
      });
    }
    
    await batch.commit();
    return !favoriteDoc.exists(); // Returns new state (true if added)
  },

  // Check if hostel is favorited
  async isFavorited(userId: string, hostelId: string): Promise<boolean> {
    const favoriteRef = doc(getFavoritesCollection(userId), hostelId);
    const favoriteDoc = await getDoc(favoriteRef);
    return favoriteDoc.exists();
  },

  // Listen to favorite status (real-time)
  onFavoriteStatus(userId: string, hostelId: string, callback: (isFavorited: boolean) => void): Unsubscribe {
    const favoriteRef = doc(getFavoritesCollection(userId), hostelId);
    return onSnapshot(favoriteRef, (doc) => {
      callback(doc.exists());
    });
  }
};

// ==================== Helper Functions ====================

function getSortField(sortBy: SortOption): { field: string; direction: 'asc' | 'desc' } {
  switch (sortBy) {
    case 'rating-desc':
      return { field: 'averageRating', direction: 'desc' };
    case 'price-asc':
      return { field: 'priceRange.min', direction: 'asc' };
    case 'price-desc':
      return { field: 'priceRange.max', direction: 'desc' };
    case 'newest':
      return { field: 'createdAt', direction: 'desc' };
    case 'popularity':
      return { field: 'views', direction: 'desc' };
    default:
      return { field: 'averageRating', direction: 'desc' };
  }
}

// ==================== Batch Operations (for admin) ====================

export const adminService = {
  async deleteHostel(hostelId: string) {
    const hostelRef = doc(hostelsCollection, hostelId);
    const reviewsRef = getReviewsCollection(hostelId);
    const batch = writeBatch(db);
    
    // Delete all reviews
    const reviewsSnap = await getDocs(reviewsRef);
    reviewsSnap.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Delete hostel
    batch.delete(hostelRef);
    
    await batch.commit();
  },

  async verifyHostel(hostelId: string) {
    const hostelRef = doc(hostelsCollection, hostelId);
    await updateDoc(hostelRef, {
      verified: true,
      updatedAt: Timestamp.now(),
    });
  }
};