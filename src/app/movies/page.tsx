
"use client";

import React, { useState } from "react";
import { ReplicaNavbar } from "@/components/ReplicaNavbar";
import { ReplicaHero } from "@/components/ReplicaHero";
import { MovieRow } from "@/components/MovieRow";
import { MOCK_MOVIES } from "@/app/lib/mock-data";
import { Movie } from "@/lib/types";
import { Toaster } from "@/components/ui/toaster";

export default function MoviesPage() {
  const movies = MOCK_MOVIES.filter(m => m.type === 'movie');
  const [featuredMovie, setFeaturedMovie] = useState<Movie>(movies[0] || MOCK_MOVIES[0]);

  const handleMovieHover = (movie: Movie) => {
    if (featuredMovie.id !== movie.id) {
      setFeaturedMovie(movie);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <ReplicaNavbar />
      <ReplicaHero movie={featuredMovie} />

      <div className="relative z-20 -mt-32 md:-mt-64 space-y-12 pb-32">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/90 to-background -z-10 h-[500px]" />
        
        <MovieRow 
          title="Blockbuster Movies" 
          movies={movies.filter(m => m.isTrending)} 
          onMovieHover={handleMovieHover} 
        />

        <MovieRow 
          title="Sci-Fi Thrillers" 
          movies={movies.filter(m => m.genres.includes("Sci-Fi"))} 
          onMovieHover={handleMovieHover} 
        />
        
        <MovieRow 
          title="Action Packed" 
          movies={movies.filter(m => m.genres.includes("Action"))} 
          onMovieHover={handleMovieHover}
        />

        <MovieRow 
          title="All Cinematic Experiences" 
          movies={movies} 
          onMovieHover={handleMovieHover}
        />
      </div>
      <Toaster />
    </main>
  );
}
