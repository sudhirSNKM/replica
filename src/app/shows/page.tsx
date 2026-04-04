
"use client";

import React, { useState } from "react";
import { ReplicaNavbar } from "@/components/ReplicaNavbar";
import { ReplicaHero } from "@/components/ReplicaHero";
import { ShowRow } from "@/components/ShowRow";
import { MOCK_MOVIES } from "@/app/lib/mock-data";
import { Movie } from "@/lib/types";
import { Toaster } from "@/components/ui/toaster";
import { Monitor, Tv, Layers } from "lucide-react";
import { ReplicaFooter } from "@/components/ReplicaFooter";

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

      <div className="relative z-20 -mt-32 md:-mt-64 space-y-16 pb-32">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/90 to-background -z-10 h-[500px]" />
        
        {/* Category Selector */}
        <div className="flex items-center gap-6 px-6 md:px-12 overflow-x-auto scrollbar-hide py-4">
          {[
            { id: 'all', name: 'All Shows', icon: Tv },
            { id: 'trending', name: 'Trending', icon: Layers },
            { id: 'dramas', name: 'Dramas', icon: Monitor },
          ].map(cat => (
            <button key={cat.id} className="flex-none flex items-center gap-2 px-6 py-3 rounded-2xl glass border border-white/5 hover:border-primary/50 text-white/60 hover:text-white transition-all text-sm font-bold uppercase tracking-widest whitespace-nowrap">
              <cat.icon className="w-4 h-4 text-primary" /> {cat.name}
            </button>
          ))}
        </div>

        <ShowRow 
          title="Trending Shows" 
          shows={shows.filter(s => s.isTrending)} 
          onHover={handleMovieHover} 
        />

        <ShowRow 
          title="Cyberpunk Dramas" 
          shows={shows.filter(s => s.genres.includes("Cyberpunk"))} 
          onHover={handleMovieHover} 
        />
        
        <ShowRow 
          title="New Arrivals" 
          shows={shows.filter(s => s.isNew)} 
          onHover={handleMovieHover}
        />

        <ShowRow 
          title="All TV Series" 
          shows={shows} 
          onHover={handleMovieHover}
        />
      </div>
      <ReplicaFooter />
      <Toaster />
    </main>
  );
}
