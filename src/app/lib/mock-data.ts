
import { Movie, UserProfile } from "@/lib/types";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export const MOCK_MOVIES: Movie[] = [
  {
    id: "1",
    title: "NEON PROTOCOL",
    description: "In a world where memories are currency, a rogue data thief uncovers a conspiracy that threatens the fabric of human existence.",
    thumbnailUrl: "https://picsum.photos/seed/replica-h1/1920/1080",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    genres: ["Sci-Fi", "Thriller"],
    rating: "9.2",
    duration: "2h 15m",
    releaseYear: "2024",
    isTrending: true
  },
  {
    id: "2",
    title: "VIRTUAL ECHO",
    description: "When a simulated reality starts bleeding into the physical world, a scientist must find the source before both worlds collapse.",
    thumbnailUrl: "https://picsum.photos/seed/replica-h2/1920/1080",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    genres: ["Cyberpunk", "Action"],
    rating: "8.8",
    duration: "1h 55m",
    releaseYear: "2023",
    isNew: true
  },
  {
    id: "3",
    title: "SILICON DREAMS",
    description: "An AI detective investigates the mysterious disappearance of its creator in the heart of Neo-Tokyo.",
    thumbnailUrl: "https://picsum.photos/seed/replica-h3/1920/1080",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    genres: ["Mystery", "Sci-Fi"],
    rating: "8.5",
    duration: "2h 05m",
    releaseYear: "2024"
  },
  {
    id: "4",
    title: "KINETIC SHIFT",
    description: "Gravity-defying warriors battle for the last energy source in the galaxy.",
    thumbnailUrl: "https://picsum.photos/seed/replica-h4/1920/1080",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    genres: ["Action", "Adventure"],
    rating: "8.9",
    duration: "1h 48m",
    releaseYear: "2024",
    isTrending: true
  },
  {
    id: "5",
    title: "VOID RUNNER",
    description: "A pilot must navigate the dangerous space between dimensions to save his stranded crew.",
    thumbnailUrl: "https://picsum.photos/seed/replica-h5/1920/1080",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    genres: ["Space", "Adventure"],
    rating: "8.2",
    duration: "2h 10m",
    releaseYear: "2023"
  }
];

export const MOCK_PROFILES: UserProfile[] = [
  { id: "1", name: "Guest User", avatarUrl: "https://picsum.photos/seed/avatar1/200/200" },
  { id: "2", name: "Cyberpunk", avatarUrl: "https://picsum.photos/seed/avatar2/200/200" },
  { id: "3", name: "The Collector", avatarUrl: "https://picsum.photos/seed/avatar3/200/200" }
];
