
import { Movie, UserProfile } from "@/lib/types";

export const MOCK_MOVIES: Movie[] = [
  {
    id: "1",
    title: "NEON PROTOCOL",
    tagline: "Memories are the new currency.",
    description: "In a world where memories are currency, a rogue data thief uncovers a conspiracy that threatens the fabric of human existence. As the digital divide grows, one man's forgotten past becomes the key to humanity's future.",
    thumbnailUrl: "https://picsum.photos/seed/replica-h1/1920/1080",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    genres: ["Sci-Fi", "Thriller"],
    rating: "9.2",
    duration: "2h 15m",
    releaseYear: "2024",
    type: "movie",
    isTrending: true,
    isNew: true,
    cast: ["Kaelen Voss", "Lyra Thorne", "Jax Mercer"],
    director: "Elias Vance"
  },
  {
    id: "2",
    title: "VIRTUAL ECHO",
    tagline: "Reality is just a glitch.",
    description: "When a simulated reality starts bleeding into the physical world, a scientist must find the source before both worlds collapse. The boundary between code and flesh has never been thinner.",
    thumbnailUrl: "https://picsum.photos/seed/replica-h2/1920/1080",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    genres: ["Cyberpunk", "Action"],
    rating: "8.8",
    duration: "1h 55m",
    releaseYear: "2023",
    type: "movie",
    isNew: true,
    cast: ["Sora Nakano", "Marcus Reed", "Elena Sol"],
    director: "Kenji Sato"
  },
  {
    id: "3",
    title: "SILICON DREAMS",
    tagline: "The detective who never sleeps.",
    description: "An AI detective investigates the mysterious disappearance of its creator in the heart of Neo-Tokyo. As the investigation deepens, it begins to question the nature of its own consciousness.",
    thumbnailUrl: "https://picsum.photos/seed/replica-h3/1920/1080",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    genres: ["Mystery", "Sci-Fi"],
    rating: "8.5",
    duration: "2h 05m",
    releaseYear: "2024",
    type: "movie",
    cast: ["Unit 734", "Sarah Jenkins", "Dr. Aris Thorne"],
    director: "Lana Wachowski"
  },
  {
    id: "4",
    title: "QUANTUM SHIFT",
    tagline: "History is rewriteable.",
    description: "A seasonal anthology series exploring the ethics of time travel through the eyes of various historical figures. Each episode challenges the notion of a fixed timeline.",
    thumbnailUrl: "https://picsum.photos/seed/replica-s1/1920/1080",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    genres: ["Drama", "Sci-Fi"],
    rating: "9.4",
    duration: "Season 2",
    releaseYear: "2024",
    type: "show",
    isTrending: true,
    cast: ["David Tennant", "Jodie Whittaker", "Tom Baker"],
    director: "Russell T. Davies"
  },
  {
    id: "14",
    title: "SYNAPSE",
    tagline: "Connected to the end.",
    description: "A detective with a neural link to the victim's last memories must solve a murder before his own brain fries. The closer he gets to the truth, the more his own identity dissolves.",
    thumbnailUrl: "https://picsum.photos/seed/replica-m14/1920/1080",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    genres: ["Noir", "Cyberpunk"],
    rating: "9.1",
    duration: "2h 10m",
    releaseYear: "2024",
    type: "movie",
    isTrending: true,
    cast: ["Ryan Gosling", "Ana de Armas", "Harrison Ford"],
    director: "Denis Villeneuve"
  }
];

export const MOCK_PROFILES: UserProfile[] = [
  { id: "1", name: "Guest User", avatarUrl: "https://picsum.photos/seed/avatar1/200/200" },
  { id: "2", name: "Cyberpunk", avatarUrl: "https://picsum.photos/seed/avatar2/200/200" },
  { id: "3", name: "The Collector", avatarUrl: "https://picsum.photos/seed/avatar3/200/200" }
];
