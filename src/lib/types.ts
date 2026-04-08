
export type ContentStatus = 'draft' | 'processing' | 'published' | 'archived';

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
  isTrending?: boolean;
  isNew?: boolean;
  cast?: string[];
  director?: string;
  tagline?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl: string;
}
