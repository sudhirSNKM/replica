
"use client";

import React, { useState, useEffect } from "react";
import { ReplicaNavbar } from "@/components/ReplicaNavbar";
import { ReplicaHero } from "@/components/ReplicaHero";
import { MovieRow } from "@/components/MovieRow";
import { ProfileSelector } from "@/components/ProfileSelector";
import { AIRecommendations } from "@/components/AIRecommendations";
import { MOCK_MOVIES } from "@/app/lib/mock-data";
import { Movie } from "@/lib/types";
import { Toaster } from "@/components/ui/toaster";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/firebase";

export default function Home() {
  const { isUserLoading: isAuthLoading } = useUser();
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [featuredMovie, setFeaturedMovie] = useState<Movie>(MOCK_MOVIES[0]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait for auth to settle and provide a short splash feel
    if (!isAuthLoading) {
      const timer = setTimeout(() => setIsLoading(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isAuthLoading]);

  const handleMovieHover = (movie: Movie) => {
    if (featuredMovie.id !== movie.id) {
      setFeaturedMovie(movie);
    }
  };

  if (isLoading) {
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
      
      <ReplicaHero movie={featuredMovie} />

      <div className="relative z-20 -mt-32 md:-mt-64 space-y-12 pb-32">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/90 to-background -z-10 h-[500px]" />
        
        <MovieRow 
          title="Continue Watching" 
          movies={MOCK_MOVIES.slice(0, 3)} 
          onMovieHover={handleMovieHover} 
        />

        <MovieRow 
          title="Trending Experiences" 
          movies={MOCK_MOVIES} 
          onMovieHover={handleMovieHover} 
        />
        
        <AIRecommendations />

        <MovieRow 
          title="Neo-Tokyo Noir" 
          movies={[...MOCK_MOVIES].reverse()} 
          onMovieHover={handleMovieHover}
        />

        <MovieRow 
          title="Sci-Fi Blockbusters" 
          movies={MOCK_MOVIES.filter(m => m.genres.includes("Sci-Fi"))} 
          onMovieHover={handleMovieHover}
        />
        
        <MovieRow 
          title="Newly Added" 
          movies={MOCK_MOVIES.slice(2, 5)} 
          onMovieHover={handleMovieHover}
        />
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
            <div className="flex gap-4">
              {['Twitter', 'Instagram', 'Discord', 'Github'].map(s => (
                <div key={s} className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-white/40 hover:text-white hover:border-primary/50 transition-all cursor-pointer">
                  <span className="sr-only">{s}</span>
                  <div className="w-5 h-5 bg-current rounded-sm opacity-50" />
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-6">
            <h4 className="text-white font-bold text-xl">Nexus</h4>
            <ul className="text-white/40 space-y-4">
              <li className="hover:text-primary cursor-pointer transition-colors">Neural Library</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Originals</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Live Matrix</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Virtual Reality</li>
            </ul>
          </div>
          
          <div className="space-y-6">
            <h4 className="text-white font-bold text-xl">Core</h4>
            <ul className="text-white/40 space-y-4">
              <li className="hover:text-primary cursor-pointer transition-colors">Help Module</li>
              <li className="hover:text-primary cursor-pointer transition-colors">User Protocol</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Privacy Encryption</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Nodes</li>
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
        
        <div className="max-w-7xl mx-auto mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-white/20 text-sm">
          <p>© 2024 Replica Media Matrix. All protocols reserved.</p>
          <div className="flex gap-8">
            <span className="hover:text-white cursor-pointer">Service Level Agreement</span>
            <span className="hover:text-white cursor-pointer">Security Protocol</span>
          </div>
        </div>
      </footer>
      <Toaster />
    </main>
  );
}
