
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
  isTrending?: boolean;
  isNew?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl: string;
}
