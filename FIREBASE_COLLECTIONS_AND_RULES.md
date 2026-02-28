# Firestore Collections & Security Rules

## Collections Structure

### 1. users
- **Purpose:** Store user profiles and roles.
- **Fields:**
  - `uid` (string, doc id)
  - `name` (string)
  - `email` (string)
  - `role` (string: 'admin' | 'manager' | 'user')
  - `createdAt` (timestamp)

### 2. hostels
- **Purpose:** Store hostel listings.
- **Fields:**
  - `id` (string, doc id)
  - `name` (string)
  - `location` (string)
  - `description` (string)
  - `images` (array of strings)
  - `managerId` (string, user uid)
  - `price` (number)
  - `amenities` (array of strings)
  - `createdAt` (timestamp)

### 3. bookings
- **Purpose:** Track hostel bookings by users.
- **Fields:**
  - `id` (string, doc id)
  - `userId` (string, user uid)
  - `hostelId` (string, hostel id)
  - `status` (string: 'pending' | 'approved' | 'rejected')
  - `createdAt` (timestamp)

### 4. favorites
- **Purpose:** Store user favorite hostels.
- **Fields:**
  - `id` (string, doc id)
  - `userId` (string, user uid)
  - `hostelId` (string, hostel id)
  - `createdAt` (timestamp)

### 5. reviews
- **Purpose:** Store reviews for hostels.
- **Fields:**
  - `id` (string, doc id)
  - `userId` (string, user uid)
  - `hostelId` (string, hostel id)
  - `rating` (number)
  - `comment` (string)
  - `createdAt` (timestamp)

### 6. notifications
- **Purpose:** Store in-app and push notifications for users.
- **Fields:**
  - `id` (string, doc id)
  - `userId` (string, user uid)
  - `type` (string: 'booking' | 'admin' | 'system' | ...)
  - `message` (string)
  - `read` (boolean)
  - `createdAt` (timestamp)

### 7. transactions
- **Purpose:** Track payments, refunds, and billing for bookings.
- **Fields:**
  - `id` (string, doc id)
  - `userId` (string, user uid)
  - `bookingId` (string, booking id)
  - `amount` (number)
  - `status` (string: 'pending' | 'completed' | 'failed' | 'refunded')
  - `method` (string: 'card' | 'mobile money' | ...)
  - `createdAt` (timestamp)

### 8. support_tickets
- **Purpose:** Allow users/managers to submit support requests or report issues.
- **Fields:**
  - `id` (string, doc id)
  - `userId` (string, user uid)
  - `subject` (string)
  - `message` (string)
  - `status` (string: 'open' | 'in_progress' | 'closed')
  - `assignedTo` (string, admin uid)
  - `createdAt` (timestamp)
  - `resolvedAt` (timestamp)

### 9. chat_rooms & messages
- **Purpose:** Enable real-time chat between users and managers/admins.
- **chat_rooms Fields:**
  - `id` (string, doc id)
  - `userIds` (array of strings)
  - `createdAt` (timestamp)
- **messages Fields:**
  - `id` (string, doc id)
  - `roomId` (string, chat room id)
  - `senderId` (string, user uid)
  - `content` (string)
  - `type` (string: 'text' | 'image' | ...)
  - `createdAt` (timestamp)

### 10. activity_logs
- **Purpose:** Track important actions for auditing.
- **Fields:**
  - `id` (string, doc id)
  - `userId` (string, user uid)
  - `action` (string)
  - `targetType` (string: 'user' | 'hostel' | ...)
  - `targetId` (string)
  - `details` (string)
  - `createdAt` (timestamp)

### 11. announcements
- **Purpose:** Admins can post news, updates, or urgent alerts.
- **Fields:**
  - `id` (string, doc id)
  - `title` (string)
  - `content` (string)
  - `audience` (string: 'all' | 'managers' | 'users')
  - `createdAt` (timestamp)
  - `expiresAt` (timestamp)

### 12. reports
- **Purpose:** Users/managers can report hostels, reviews, or users for violations.
- **Fields:**
  - `id` (string, doc id)
  - `reporterId` (string, user uid)
  - `targetType` (string: 'hostel' | 'review' | 'user')
  - `targetId` (string)
  - `reason` (string)
  - `status` (string: 'open' | 'reviewed' | 'closed')
  - `createdAt` (timestamp)

---

## Firestore Security Rules (Sample)

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users: Only user or admin can read/update their profile
    match /users/{userId} {
      allow read, update: if request.auth != null && (request.auth.uid == userId || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow create: if request.auth != null;
      allow delete: if false;
    }

    // Hostels: Admins and managers can create/update, anyone can read
    match /hostels/{hostelId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null && (
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'manager']
      );
    }

    // Bookings: Only authenticated users can create, read their own; admins/managers can read all
    match /bookings/{bookingId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && (
        resource.data.userId == request.auth.uid || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'manager']
      );
      allow update, delete: if request.auth != null && (
        resource.data.userId == request.auth.uid || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'manager']
      );
    }

    // Favorites: Only user can create/read/delete their own
    match /favorites/{favoriteId} {
      allow create, read, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    // Reviews: Only authenticated users can create, update/delete their own
    match /reviews/{reviewId} {
      allow create: if request.auth != null;
      allow read: if true;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

---

## Firestore Security Rules (Advanced)

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users: Only user or admin can read/update their profile
    match /users/{userId} {
      allow read, update: if request.auth != null && (request.auth.uid == userId || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow create: if request.auth != null;
      allow delete: if false;
    }

    // Hostels: Admins and managers can create/update, anyone can read
    match /hostels/{hostelId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null && (
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'manager']
      );
    }

    // Bookings: Only authenticated users can create, read their own; admins/managers can read all
    match /bookings/{bookingId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && (
        resource.data.userId == request.auth.uid || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'manager']
      );
      allow update, delete: if request.auth != null && (
        resource.data.userId == request.auth.uid || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'manager']
      );
    }

    // Favorites: Only user can create/read/delete their own
    match /favorites/{favoriteId} {
      allow create, read, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    // Reviews: Only authenticated users can create, update/delete their own
    match /reviews/{reviewId} {
      allow create: if request.auth != null;
      allow read: if true;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    // Notifications: Only user can read their notifications
    match /notifications/{notificationId} {
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow read, update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    // Transactions: Only user and admin can read their own
    match /transactions/{transactionId} {
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow read: if request.auth != null && (resource.data.userId == request.auth.uid || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow update, delete: if false;
    }

    // Support Tickets: User can create/read their own, admin can read all
    match /support_tickets/{ticketId} {
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow read: if request.auth != null && (resource.data.userId == request.auth.uid || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow update, delete: if request.auth != null && (resource.data.userId == request.auth.uid || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }

    // Chat Rooms: Only participants can read/write
    match /chat_rooms/{roomId} {
      allow create: if request.auth != null && request.auth.uid in request.resource.data.userIds;
      allow read: if request.auth != null && request.auth.uid in resource.data.userIds;
      allow update, delete: if false;
    }
    match /messages/{messageId} {
      allow create: if request.auth != null && request.auth.uid == request.resource.data.senderId;
      allow read: if request.auth != null && get(/databases/$(database)/documents/chat_rooms/$(resource.data.roomId)).data.userIds.hasAny([request.auth.uid]);
      allow update, delete: if false;
    }

    // Activity Logs: Only admin can read
    match /activity_logs/{logId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow update, delete: if false;
    }

    // Announcements: Anyone can read, only admin can create
    match /announcements/{announcementId} {
      allow create: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow read: if true;
      allow update, delete: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Reports: Only reporter and admin can read, only admin can update/close
    match /reports/{reportId} {
      allow create: if request.auth != null && request.resource.data.reporterId == request.auth.uid;
      allow read: if request.auth != null && (resource.data.reporterId == request.auth.uid || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow update, delete: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```