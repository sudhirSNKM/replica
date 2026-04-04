
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
import { ShowRow } from "@/components/ShowRow";
import { MOCK_MOVIES } from "@/app/lib/mock-data";
import { SeedContent } from "@/components/SeedContent";

export default function Home() {
  const { user, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real content for the rows
  const contentRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "content"), limit(50));
  }, [firestore]);

  const { data: firestoreContent, isLoading: isContentLoading } = useCollection<Movie>(contentRef);
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);

  // Fallback to MOCK_MOVIES if Firestore is empty
  const allContent = (firestoreContent && firestoreContent.length > 0) ? firestoreContent : MOCK_MOVIES;

  useEffect(() => {
    if (!isAuthLoading && !isContentLoading) {
      const timer = setTimeout(() => setIsLoading(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isAuthLoading, isContentLoading]);

  useEffect(() => {
    if (allContent && allContent.length > 0 && !featuredMovie) {
      const featured = allContent.find(m => m.isTrending) || allContent[0];
      setFeaturedMovie(featured);
    }
  }, [allContent, featuredMovie]);

  const handleMovieHover = (movie: Movie) => {
    // Optional: Update hero or preview state
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

  const moviesOnly = allContent.filter(m => m.type === 'movie');
  const showsOnly = allContent.filter(m => m.type === 'show');

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <ReplicaNavbar />
      
      {featuredMovie && <ReplicaHero movie={featuredMovie} />}

      <div className="relative z-20 -mt-40 md:-mt-72 space-y-32 pb-32">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/95 to-background -z-10 h-[800px] pointer-events-none" />
        
        <div className="space-y-32">
          {/* Trending Row */}
          <section className="relative">
            <MovieRow 
              title="Global Trending" 
              movies={allContent.filter(m => m.isTrending).slice(0, 12)} 
              onMovieHover={handleMovieHover} 
            />
          </section>

          {/* Shows Section */}
          <section className="relative">
            <ShowRow 
              title="Series Spotlight" 
              shows={showsOnly.slice(0, 10)} 
              onHover={handleMovieHover} 
            />
          </section>
          
          {/* AI recommendations */}
          <section className="relative py-12 bg-white/[0.02] border-y border-white/[0.05]">
            <AIRecommendations />
          </section>

          {/* Genre specific rows */}
          <section className="space-y-32">
            <MovieRow 
              title="Cyberpunk Noir" 
              movies={moviesOnly.filter(m => 
                m.genres.some(g => g.toLowerCase().includes("cyberpunk") || g.toLowerCase().includes("noir"))
              ).slice(0, 12)} 
              onMovieHover={handleMovieHover}
            />

            <ShowRow 
              title="Binge-Worthy Dramas" 
              shows={showsOnly.filter(s => s.genres.includes("Drama")).slice(0, 10)} 
              onHover={handleMovieHover} 
            />

            <MovieRow 
              title="Sci-Fi Blockbusters" 
              movies={moviesOnly.filter(m => 
                m.genres.some(g => g.toLowerCase().includes("sci-fi"))
              ).slice(0, 12)} 
              onMovieHover={handleMovieHover}
            />
            
            <MovieRow 
              title="Fresh Arrivals" 
              movies={allContent.filter(m => m.isNew).slice(0, 12)} 
              onMovieHover={handleMovieHover}
            />
          </section>
        </div>

        <SeedContent />
      </div>

      <footer className="bg-[#050507] border-t border-white/5 py-32 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-20">
          <div className="col-span-1 md:col-span-2 space-y-10">
            <div className="text-4xl font-headline font-bold tracking-tighter text-white">
              <span className="text-primary">RE</span>
              <span>PLICA</span>
            </div>
            <p className="text-white/40 text-lg leading-relaxed max-w-sm">
              The future of immersive cinematic entertainment. Experience high-fidelity storytelling, decentralized and tailored for you.
            </p>
          </div>
          
          <div className="space-y-8">
            <h4 className="text-white font-bold text-sm uppercase tracking-widest">Nexus</h4>
            <ul className="text-white/40 space-y-5 text-base">
              <li className="hover:text-primary cursor-pointer transition-colors">Neural Library</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Originals</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Live Matrix</li>
            </ul>
          </div>
          
          <div className="space-y-8">
            <h4 className="text-white font-bold text-sm uppercase tracking-widest">Core</h4>
            <ul className="text-white/40 space-y-5 text-base">
              <li className="hover:text-primary cursor-pointer transition-colors">Help Module</li>
              <li className="hover:text-primary cursor-pointer transition-colors">User Protocol</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Security Node</li>
            </ul>
          </div>

          <div className="space-y-8">
            <h4 className="text-white font-bold text-sm uppercase tracking-widest">Newsletter</h4>
            <div className="flex flex-col gap-5">
              <input 
                placeholder="Enter matrix address" 
                className="bg-white/5 border border-white/10 rounded-full px-6 py-4 text-sm focus:outline-none focus:border-primary transition-all" 
              />
              <button className="bg-primary text-white rounded-full py-4 font-bold hover:neon-glow-primary transition-all active:scale-95">
                Synchronize
              </button>
            </div>
          </div>
        </div>
      </footer>
      <Toaster />
    </main>
  );
}
