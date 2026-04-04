
"use client";

import React, { useState } from "react";
import { ReplicaNavbar } from "@/components/ReplicaNavbar";
import { ReplicaHero } from "@/components/ReplicaHero";
import { MovieRow } from "@/components/MovieRow";
import { MOCK_MOVIES } from "@/app/lib/mock-data";
import { Movie } from "@/lib/types";
import { Toaster } from "@/components/ui/toaster";

export default function TVShowsPage() {
  const shows = MOCK_MOVIES.filter(m => m.type === 'show');
  const [featuredShow, setFeaturedShow] = useState<Movie>(shows[0] || MOCK_MOVIES[0]);

  const handleMovieHover = (movie: Movie) => {
    if (featuredShow.id !== movie.id) {
      setFeaturedShow(movie);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <ReplicaNavbar />
      <ReplicaHero movie={featuredShow} />

      <div className="relative z-20 -mt-32 md:-mt-64 space-y-12 pb-32">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/90 to-background -z-10 h-[500px]" />
        
        <MovieRow 
          title="Trending Shows" 
          movies={shows.filter(s => s.isTrending)} 
          onMovieHover={handleMovieHover} 
        />

        <MovieRow 
          title="Cyberpunk Dramas" 
          movies={shows.filter(s => s.genres.includes("Cyberpunk"))} 
          onMovieHover={handleMovieHover} 
        />
        
        <MovieRow 
          title="New Arrivals" 
          movies={shows.filter(s => s.isNew)} 
          onMovieHover={handleMovieHover}
        />

        <MovieRow 
          title="All TV Series" 
          movies={shows} 
          onMovieHover={handleMovieHover}
        />
      </div>
      <Toaster />
    </main>
  );
}
