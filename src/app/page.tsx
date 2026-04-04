
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
import { SeedContent } from "@/components/SeedContent";
import { ReplicaFooter } from "@/components/ReplicaFooter";
import { ArrowRight, Play, Shield, Zap, Globe, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  // Removed automatic redirect to login to show the Landing Page instead

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

  if (!user && !isAuthLoading) {
    return (
      <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
        <ReplicaNavbar />
        
        {/* Cinematic Hero Landing */}
        <section className="relative h-screen flex items-center justify-center text-center px-6 overflow-hidden">
          <div className="absolute inset-0 z-0">
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center brightness-[0.2] scale-110 blur-[2px]" />
             <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
             <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background/80" />
          </div>

          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            className="relative z-10 max-w-5xl space-y-12"
          >
            <div className="space-y-6">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-xl text-primary text-[10px] font-black uppercase tracking-[0.4em]"
              >
                <Sparkles className="w-3 h-3 fill-current" /> Next-Gen Neural Streaming
              </motion.div>
              <h1 className="text-6xl md:text-9xl font-headline font-bold text-white tracking-tighter leading-[0.9] drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                Unlimited <span className="text-primary text-glow">Movies</span> & <br className="hidden md:block" />TV Episodes.
              </h1>
              <p className="text-xl md:text-3xl text-white/40 font-medium max-w-3xl mx-auto leading-relaxed">
                Experience the world's most advanced decentralized streaming network. Watch anywhere, synchronize anytime.
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-8">
              <Button 
                onClick={() => router.push('/login')}
                className="h-20 px-12 rounded-full bg-white text-black hover:bg-primary hover:text-white font-black text-xl transition-all shadow-2xl hover:scale-105 active:scale-95 group"
              >
                Get Started <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/register')}
                className="h-20 px-12 rounded-full border-white/10 glass text-white hover:bg-white/10 font-bold text-xl transition-all shadow-xl"
              >
                Create Account
              </Button>
            </div>

            <p className="text-sm text-white/20 uppercase tracking-[0.3em] font-black">Ready to watch? Enter the matrix today.</p>
          </motion.div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-20">
             <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center p-1">
                <div className="w-1 h-2 bg-white rounded-full" />
             </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-48 px-6 md:px-12 lg:px-24 bg-white/[0.01]">
          <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-24">
            <div className="space-y-8 group">
              <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(var(--primary),0.1)]">
                <Shield className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-headline font-bold text-white">Encrypted Privacy</h3>
              <p className="text-lg text-white/40 leading-relaxed">Your neural signatures are protected by military-grade decentralized encryption. You own your data.</p>
            </div>
            <div className="space-y-8 group">
              <div className="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(var(--accent),0.1)]">
                <Zap className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-headline font-bold text-white">Ultra Low Latency</h3>
              <p className="text-lg text-white/40 leading-relaxed">Global CDN powered by edge-computing nodes ensures instant buffering and seamless 4K playback.</p>
            </div>
            <div className="space-y-8 group">
              <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(var(--primary),0.1)]">
                <Globe className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-headline font-bold text-white">Watch Anywhere</h3>
              <p className="text-lg text-white/40 leading-relaxed">Synchronize your sessions across all hardware - from mobile rigs to VR neural links.</p>
            </div>
          </div>
        </section>

        <ReplicaFooter />
      </main>
    );
  }

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

        <SeedContent />
      </div>

      <ReplicaFooter />
      <Toaster />
    </main>
  );
}
