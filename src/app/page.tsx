
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ReplicaNavbar } from "@/components/ReplicaNavbar";
import { ReplicaHero } from "@/components/ReplicaHero";
import { MovieRow } from "@/components/MovieRow";
import { ProfileSelector } from "@/components/ProfileSelector";
import { AIRecommendations } from "@/components/AIRecommendations";
import { Movie } from "@/lib/types";
import { Toaster } from "@/components/ui/toaster";
import { motion, AnimatePresence } from "framer-motion";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, limit } from "firebase/firestore";
import { ShowRow } from "@/components/ShowRow";
import { MOCK_MOVIES } from "@/app/lib/mock-data";

export default function Home() {
  const router = useRouter();
  const { user, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real content for the rows
  const contentRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "content"), limit(60));
  }, [firestore]);

  const { data: firestoreContent, isLoading: isContentLoading } = useCollection<Movie>(contentRef);
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);

  // Fallback to MOCK_MOVIES if Firestore is empty
  const allContent = (firestoreContent && firestoreContent.length > 0) ? firestoreContent : MOCK_MOVIES;

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  useEffect(() => {
    const savedProfile = localStorage.getItem('replica_active_profile');
    if (savedProfile) setSelectedProfileId(savedProfile);
  }, []);

  useEffect(() => {
    if (!isAuthLoading && !isContentLoading && user) {
      const timer = setTimeout(() => setIsLoading(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isAuthLoading, isContentLoading, user]);

  useEffect(() => {
    if (allContent && allContent.length > 0 && !featuredMovie) {
      const featured = allContent.find(m => m.isTrending) || allContent[0];
      setFeaturedMovie(featured);
    }
  }, [allContent, featuredMovie]);

  const handleProfileSelect = (id: string) => {
    setSelectedProfileId(id);
    localStorage.setItem('replica_active_profile', id);
  };

  if (isAuthLoading || (user && isLoading)) {
    return (
      <div className="fixed inset-0 bg-[#0B0B0F] flex flex-col items-center justify-center z-[500]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-10"
        >
          <div className="text-8xl md:text-[10rem] font-headline font-bold tracking-[ -0.08em] text-white">
            <span className="text-primary text-glow">RE</span>
            <span>PLICA</span>
          </div>
          <div className="w-80 h-1 bg-white/5 rounded-full overflow-hidden relative">
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent w-full h-full"
            />
          </div>
          <p className="text-white/20 font-bold uppercase tracking-[0.5em] text-[10px] animate-pulse">Initializing Neural Bridge</p>
        </motion.div>
      </div>
    );
  }

  if (!user) return null;

  if (!selectedProfileId) {
    return <ProfileSelector onSelect={handleProfileSelect} />;
  }

  const moviesOnly = allContent.filter(m => m.type === 'movie');
  const showsOnly = allContent.filter(m => m.type === 'show');

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <ReplicaNavbar activeProfileId={selectedProfileId} />
      
      <AnimatePresence mode="wait">
        {featuredMovie && (
          <motion.div
            key={featuredMovie.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <ReplicaHero movie={featuredMovie} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-30 -mt-24 md:-mt-32 space-y-32 pb-48">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/95 to-background -z-10 h-[1000px] pointer-events-none" />
        
        <div className="space-y-32">
          {/* Trending Row - Added padding to clear Hero footer */}
          <section className="relative pt-12 md:pt-24">
            <MovieRow 
              title="Global Trending Now" 
              movies={allContent.filter(m => m.isTrending).slice(0, 15)} 
              onMovieHover={setFeaturedMovie} 
            />
          </section>

          {/* Shows Section */}
          <section className="relative">
            <ShowRow 
              title="Top Series for You" 
              shows={showsOnly.slice(0, 12)} 
              onHover={setFeaturedMovie} 
            />
          </section>
          
          {/* AI recommendations */}
          <section className="relative py-24 bg-white/[0.01] border-y border-white/[0.05]">
            <AIRecommendations />
          </section>

          {/* Genre specific rows */}
          <section className="space-y-32">
            <MovieRow 
              title="Neo-Tokyo Noir" 
              movies={moviesOnly.filter(m => 
                m.genres.some(g => g.toLowerCase().includes("cyberpunk") || g.toLowerCase().includes("noir"))
              ).slice(0, 15)} 
              onMovieHover={setFeaturedMovie}
            />

            <ShowRow 
              title="Binge-Worthy Protocols" 
              shows={showsOnly.filter(s => s.genres.includes("Drama")).slice(0, 12)} 
              onHover={setFeaturedMovie} 
            />

            <MovieRow 
              title="Sci-Fi Blockbusters" 
              movies={moviesOnly.filter(m => 
                m.genres.some(g => g.toLowerCase().includes("sci-fi"))
              ).slice(0, 15)} 
              onMovieHover={setFeaturedMovie}
            />
            
            <MovieRow 
              title="Fresh Synchronization" 
              movies={allContent.filter(m => m.isNew).slice(0, 15)} 
              onMovieHover={setFeaturedMovie}
            />
          </section>
        </div>
      </div>

      <footer className="bg-[#050507] border-t border-white/5 py-48 px-6 md:px-12">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-5 gap-24">
          <div className="col-span-1 md:col-span-2 space-y-12">
            <div className="text-5xl font-headline font-bold tracking-tighter text-white">
              <span className="text-primary">RE</span>
              <span>PLICA</span>
            </div>
            <p className="text-white/30 text-xl leading-relaxed max-w-md font-medium">
              The future of decentralized, high-fidelity cinematic entertainment. Experience storytelling tailored to your neural patterns.
            </p>
            <div className="flex items-center gap-6">
              {['Twitter', 'Matrix', 'Discord'].map(social => (
                <button key={social} className="text-xs font-black uppercase tracking-widest text-white/40 hover:text-primary transition-colors">{social}</button>
              ))}
            </div>
          </div>
          
          <div className="space-y-10">
            <h4 className="text-white font-black text-xs uppercase tracking-[0.4em]">Nexus</h4>
            <ul className="text-white/30 space-y-6 text-lg font-medium">
              <li className="hover:text-primary cursor-pointer transition-colors">Neural Library</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Replica Originals</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Live Streams</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Protocols</li>
            </ul>
          </div>
          
          <div className="space-y-10">
            <h4 className="text-white font-black text-xs uppercase tracking-[0.4em]">Core</h4>
            <ul className="text-white/30 space-y-6 text-lg font-medium">
              <li className="hover:text-primary cursor-pointer transition-colors">Support Node</li>
              <li className="hover:text-primary cursor-pointer transition-colors">User Agreement</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Privacy Module</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Security Matrix</li>
            </ul>
          </div>

          <div className="space-y-10">
            <h4 className="text-white font-black text-xs uppercase tracking-[0.4em]">Sync List</h4>
            <div className="flex flex-col gap-6">
              <p className="text-white/20 text-sm">Join 2.4M nodes in the matrix.</p>
              <div className="relative">
                <input 
                  placeholder="Enter matrix address" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-sm focus:outline-none focus:border-primary transition-all text-white placeholder:text-white/20" 
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary text-white rounded-xl px-6 py-2.5 font-bold hover:neon-glow-primary transition-all active:scale-95 text-xs uppercase tracking-widest">
                  Sync
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-[1600px] mx-auto mt-48 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
          <div>© 2024 REPLICA SYSTEMS INC. ALL RIGHTS RESERVED.</div>
          <div className="flex items-center gap-12">
            <span>VERSION 2.4.0-STABLE</span>
            <span>NEURAL ENCRYPTION: ACTIVE</span>
          </div>
        </div>
      </footer>
      <Toaster />
    </main>
  );
}
