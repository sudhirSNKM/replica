
export type ContentStatus = 'draft' | 'processing' | 'published' | 'archived';
export type SubscriptionTier = 'free' | 'pro';

export interface Movie {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  genres: string[];
  rating: string;
  duration: string;
  releaseYear: string;
  type: 'movie' | 'show';
  status: ContentStatus;
  quality?: string;
  isTrending?: boolean;
  isNew?: boolean;
  cast?: string[];
  director?: string;
  tagline?: string;
}

export interface UserAccount {
  id: string;
  email: string | null;
  phoneNumber: string | null;
  role: 'admin' | 'user';
  subscriptionTier: SubscriptionTier;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  userAccountId: string;
  name: string;
  avatarUrl: string;
  createdAt: string;
}
