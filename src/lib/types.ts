
export type ContentStatus = 'draft' | 'processing' | 'published' | 'archived';
export type SubscriptionTier = 'free' | 'pro';

export interface Episode {
  id: string;
  episodeNumber: number;
  seasonNumber: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: string;
  views?: number;
}

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
  episodes?: Episode[];
  quality?: string;
  isTrending?: boolean;
  isNew?: boolean;
  cast?: string[];
  director?: string;
  tagline?: string;
  createdAt?: string;
  updatedAt?: string;
  uploaderId?: string;
  views?: number;
  weeklyViews?: number;
  trendingScore?: number;
  qualityOptions?: string[];
}

export interface UserAccount {
  id: string;
  email: string | null;
  phoneNumber: string | null;
  role: 'admin' | 'user';
  subscriptionTier: SubscriptionTier;
  isUpgradePending?: boolean;
  isBanned?: boolean;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  userAccountId: string;
  name: string;
  avatarUrl: string;
  createdAt: string;
}
