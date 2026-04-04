
import { Movie, UserProfile } from "@/lib/types";

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
    type: "movie",
    isTrending: true,
    isNew: true
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
    type: "movie",
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
    releaseYear: "2024",
    type: "movie"
  },
  {
    id: "4",
    title: "QUANTUM SHIFT",
    description: "A seasonal anthology series exploring the ethics of time travel through the eyes of various historical figures.",
    thumbnailUrl: "https://picsum.photos/seed/replica-s1/1920/1080",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    genres: ["Drama", "Sci-Fi"],
    rating: "9.4",
    duration: "Season 2",
    releaseYear: "2024",
    type: "show",
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
    releaseYear: "2023",
    type: "movie"
  },
  {
    id: "6",
    title: "NEO-TOKYO NIGHTS",
    description: "Follow the lives of five underground hackers as they navigate the neon-lit underworld of a mega-city.",
    thumbnailUrl: "https://picsum.photos/seed/replica-s2/1920/1080",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    genres: ["Cyberpunk", "Drama"],
    rating: "9.1",
    duration: "Season 1",
    releaseYear: "2024",
    type: "show",
    isNew: true
  },
  {
    id: "7",
    title: "STELAR HORIZON",
    description: "The last colony of humanity faces an impossible choice when their star begins to collapse.",
    thumbnailUrl: "https://picsum.photos/seed/replica-m7/1920/1080",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    genres: ["Sci-Fi", "Drama"],
    rating: "8.9",
    duration: "2h 30m",
    releaseYear: "2024",
    type: "movie",
    isTrending: true
  },
  {
    id: "8",
    title: "BINARY SOUL",
    description: "Can love exist in a purely digital form? Two consciousnesses struggle to find intimacy in a world of code.",
    thumbnailUrl: "https://picsum.photos/seed/replica-m8/1920/1080",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    genres: ["Romance", "Cyberpunk"],
    rating: "8.4",
    duration: "1h 45m",
    releaseYear: "2023",
    type: "movie"
  },
  {
    id: "9",
    title: "OMEGA PROTOCOL",
    description: "A secret military project goes rogue, unleashing a digital virus that infects the global power grid.",
    thumbnailUrl: "https://picsum.photos/seed/replica-m9/1920/1080",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackAds.mp4",
    genres: ["Action", "Thriller"],
    rating: "8.1",
    duration: "2h 00m",
    releaseYear: "2024",
    type: "movie"
  },
  {
    id: "10",
    title: "THE GRID: ASCENSION",
    description: "A high-stakes competition inside a virtual gladiatorial arena determines the fate of the working class.",
    thumbnailUrl: "https://picsum.photos/seed/replica-s3/1920/1080",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    genres: ["Action", "Sci-Fi"],
    rating: "9.0",
    duration: "Season 3",
    releaseYear: "2024",
    type: "show",
    isTrending: true
  },
  {
    id: "11",
    title: "COBALT SKY",
    description: "An environmental researcher discovers a secret underwater civilization that holds the key to Earth's survival.",
    thumbnailUrl: "https://picsum.photos/seed/replica-m11/1920/1080",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
    genres: ["Documentary", "Sci-Fi"],
    rating: "8.6",
    duration: "1h 30m",
    releaseYear: "2023",
    type: "movie"
  },
  {
    id: "12",
    title: "NETHERWORLD",
    description: "A paranormal investigator uses quantum technology to communicate with entities beyond our dimension.",
    thumbnailUrl: "https://picsum.photos/seed/replica-m12/1920/1080",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    genres: ["Horror", "Mystery"],
    rating: "7.9",
    duration: "1h 50m",
    releaseYear: "2024",
    type: "movie",
    isNew: true
  },
  {
    id: "13",
    title: "PULSE",
    description: "A high-octane racing series set in the megacities of Mars.",
    thumbnailUrl: "https://picsum.photos/seed/replica-s4/1920/1080",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
    genres: ["Action", "Sports"],
    rating: "8.3",
    duration: "Season 1",
    releaseYear: "2024",
    type: "show"
  },
  {
    id: "14",
    title: "SYNAPSE",
    description: "A detective with a neural link to the victim's last memories must solve a murder before his own brain fries.",
    thumbnailUrl: "https://picsum.photos/seed/replica-m14/1920/1080",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    genres: ["Noir", "Cyberpunk"],
    rating: "9.1",
    duration: "2h 10m",
    releaseYear: "2024",
    type: "movie",
    isTrending: true
  },
  {
    id: "15",
    title: "DATA DRIFT",
    description: "A group of teenage outcasts accidentally stumbles upon a way to access the world's most secure servers.",
    thumbnailUrl: "https://picsum.photos/seed/replica-s5/1920/1080",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    genres: ["Adventure", "Cyberpunk"],
    rating: "8.7",
    duration: "Season 1",
    releaseYear: "2024",
    type: "show",
    isNew: true
  }
];

export const MOCK_PROFILES: UserProfile[] = [
  { id: "1", name: "Guest User", avatarUrl: "https://picsum.photos/seed/avatar1/200/200" },
  { id: "2", name: "Cyberpunk", avatarUrl: "https://picsum.photos/seed/avatar2/200/200" },
  { id: "3", name: "The Collector", avatarUrl: "https://picsum.photos/seed/avatar3/200/200" }
];
