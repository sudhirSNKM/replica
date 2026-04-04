
"use client";

import React, { useState, useEffect } from "react";
import { ReplicaNavbar } from "@/components/ReplicaNavbar";
import { ReplicaHero } from "@/components/ReplicaHero";
import { MovieRow } from "@/components/MovieRow";
import { ProfileSelector } from "@/components/ProfileSelector";
import { AIRecommendations } from "@/components/AIRecommendations";
import { Movie } from "@/lib/types";
import { Toaster } from "@/components/ui/toaster";
import { motion } from "framer-motion";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, limit } from "firebase/firestore";

export default function Home() {
  const { user, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real content for the rows
  const contentRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "content"), limit(20));
  }, [firestore]);

  const { data: allMovies, isLoading: isContentLoading } = useCollection<Movie>(contentRef);
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !isContentLoading) {
      const timer = setTimeout(() => setIsLoading(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isAuthLoading, isContentLoading]);

  useEffect(() => {
    if (allMovies && allMovies.length > 0 && !featuredMovie) {
      setFeaturedMovie(allMovies[0]);
    }
  }, [allMovies, featuredMovie]);

  const handleMovieHover = (movie: Movie) => {
    if (featuredMovie?.id !== movie.id) {
      setFeaturedMovie(movie);
    }
  };

  if (isLoading || isAuthLoading) {
    return (
      <div className="fixed inset-0 bg-[#0B0B0F] flex flex-col items-center justify-center z-[500]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-8"
        >
          <div className="text-7xl md:text-9xl font-headline font-bold tracking-tighter text-white">
            <span className="text-primary text-glow">RE</span>
            <span>PLICA</span>
          </div>
          <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden relative">
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent w-full h-full"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  if (!selectedProfile) {
    return <ProfileSelector onSelect={(id) => setSelectedProfile(id)} />;
  }

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <ReplicaNavbar />
      
      {featuredMovie && <ReplicaHero movie={featuredMovie} />}

      <div className="relative z-20 -mt-32 md:-mt-64 space-y-12 pb-32">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/90 to-background -z-10 h-[500px]" />
        
        {allMovies && (
          <>
            <MovieRow 
              title="Trending Experiences" 
              movies={allMovies.filter(m => m.isTrending)} 
              onMovieHover={handleMovieHover} 
            />
            
            <AIRecommendations />

            <MovieRow 
              title="Neo-Tokyo Noir" 
              movies={[...allMovies].reverse()} 
              onMovieHover={handleMovieHover}
            />

            <MovieRow 
              title="Sci-Fi Blockbusters" 
              movies={allMovies.filter(m => m.genres.includes("Sci-Fi"))} 
              onMovieHover={handleMovieHover}
            />
            
            <MovieRow 
              title="Newly Added" 
              movies={allMovies.filter(m => m.isNew)} 
              onMovieHover={handleMovieHover}
            />
          </>
        )}
      </div>

      <footer className="bg-[#050507] border-t border-white/5 py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-16">
          <div className="col-span-1 md:col-span-2 space-y-8">
            <div className="text-4xl font-headline font-bold tracking-tighter text-white">
              <span className="text-primary">RE</span>
              <span>PLICA</span>
            </div>
            <p className="text-white/40 text-lg leading-relaxed max-w-sm">
              The future of immersive cinematic entertainment. Experience high-fidelity storytelling, decentralized and tailored for you.
            </p>
          </div>
          
          <div className="space-y-6">
            <h4 className="text-white font-bold text-xl">Nexus</h4>
            <ul className="text-white/40 space-y-4">
              <li className="hover:text-primary cursor-pointer transition-colors">Neural Library</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Originals</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Live Matrix</li>
            </ul>
          </div>
          
          <div className="space-y-6">
            <h4 className="text-white font-bold text-xl">Core</h4>
            <ul className="text-white/40 space-y-4">
              <li className="hover:text-primary cursor-pointer transition-colors">Help Module</li>
              <li className="hover:text-primary cursor-pointer transition-colors">User Protocol</li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-white font-bold text-xl">Newsletter</h4>
            <div className="flex flex-col gap-4">
              <input placeholder="Enter matrix address" className="bg-white/5 border border-white/10 rounded-full px-6 py-3 text-sm focus:outline-none focus:border-primary" />
              <button className="bg-primary text-white rounded-full py-3 font-bold hover:neon-glow-primary transition-all">Synchronize</button>
            </div>
          </div>
        </div>
      </footer>
      <Toaster />
    </main>
  );
}
