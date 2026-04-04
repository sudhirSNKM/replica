
"use client";

import React, { useState } from "react";
import { ReplicaNavbar } from "@/components/ReplicaNavbar";
import { ReplicaHero } from "@/components/ReplicaHero";
import { MovieRow } from "@/components/MovieRow";
import { MOCK_MOVIES } from "@/app/lib/mock-data";
import { Movie } from "@/lib/types";
import { Toaster } from "@/components/ui/toaster";

export default function TrendingPage() {
  const trending = MOCK_MOVIES.filter(m => m.isTrending);
  const [featured, setFeatured] = useState<Movie>(trending[0] || MOCK_MOVIES[0]);

  const handleMovieHover = (movie: Movie) => {
    if (featured.id !== movie.id) {
      setFeatured(movie);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <ReplicaNavbar />
      <ReplicaHero movie={featured} />

      <div className="relative z-20 -mt-32 md:-mt-64 space-y-12 pb-32">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/90 to-background -z-10 h-[500px]" />
        
        <MovieRow 
          title="Most Watched Today" 
          movies={trending} 
          onMovieHover={handleMovieHover} 
        />

        <MovieRow 
          title="Rising Stars" 
          movies={MOCK_MOVIES.filter(m => m.isNew)} 
          onMovieHover={handleMovieHover} 
        />
        
        <MovieRow 
          title="Global Hits" 
          movies={[...MOCK_MOVIES].reverse()} 
          onMovieHover={handleMovieHover}
        />
      </div>
      <Toaster />
    </main>
  );
}
