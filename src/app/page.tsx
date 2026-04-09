
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
import { collection, query, limit, orderBy, where } from "firebase/firestore";
import { ShowRow } from "@/components/ShowRow";
import { MOCK_MOVIES } from "@/app/lib/mock-data";
import { ReplicaFooter } from "@/components/ReplicaFooter";
import { ScrollStackShowcase } from "@/components/ScrollStackShowcase";
import { TrendingRow } from "@/components/TrendingRow";

export default function Home() {
  const router = useRouter();
  const { user, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);



  const contentRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, "content"),
      limit(60)
    );
  }, [firestore]);

  const { data: firestoreContent, isLoading: isContentLoading } = useCollection<Movie>(contentRef);
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);

  const allContent = firestoreContent || [];

  useEffect(() => {
    const savedProfile = localStorage.getItem('replica_active_profile');
    if (savedProfile) setSelectedProfileId(savedProfile);
  }, []);

  useEffect(() => {
    if (!isAuthLoading && !isContentLoading && user) {
      const timer = setTimeout(() => setIsLoading(false), 800);
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

  const sortedContent = [...allContent].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA;
  });

  const trendingTop10 = [...allContent]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 10);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#0B0B0F] flex flex-col items-center justify-center z-[500]">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-10">
          <div className="text-8xl md:text-[10rem] font-headline font-bold tracking-tighter text-white">
            <span className="text-primary text-glow">RE</span><span>PLICA</span>
          </div>
          <p className="text-white/20 font-bold uppercase tracking-[0.5em] text-[10px] animate-pulse">Synchronizing Library</p>
        </motion.div>
      </div>
    );
  }

  if (!selectedProfileId) {
    return <ProfileSelector onSelect={handleProfileSelect} />;
  }

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

      <div className="relative z-30 -mt-16 md:-mt-32 space-y-16 md:space-y-32 pb-48">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/95 to-background -z-10 h-[1000px] pointer-events-none" />
        
        {/* Continue Watching / Trending */}
        <section className="relative pt-12 md:pt-24">
          <MovieRow title="Continue Watching" movies={sortedContent.filter(m => m.isTrending).slice(0, 15)} onMovieHover={setFeaturedMovie} />
        </section>

        {/* Global Top 10 */}
        <section className="relative">
          <TrendingRow title="Top 10 Global Protocols" movies={trendingTop10} />
        </section>

        {/* Newly Added Series */}
        <section className="relative">
          <ShowRow title="Newly Added Protocols" shows={sortedContent.filter(m => m.type === 'show').slice(0, 12)} onHover={setFeaturedMovie} />
        </section>

        {/* Recent Movies */}
        <section className="relative px-6 md:px-12 lg:px-24">
          <MovieRow title="Recent Protocols" movies={sortedContent.slice(0, 12)} onMovieHover={setFeaturedMovie} />
        </section>

        {/* Explore Stack */}
        <section className="relative bg-white/[0.01] border-y border-white/[0.05]">
          <ScrollStackShowcase />
        </section>

        {/* Language Selection */}
        <section className="relative px-6 md:px-12 lg:px-24">
          <div className="max-w-[1600px] mx-auto space-y-12">
            <h3 className="text-2xl md:text-5xl font-headline font-bold text-white tracking-tighter">Language <span className="text-primary text-glow">Protocols</span></h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {['English', 'Hindi', 'Tamil', 'Telugu', 'Spanish', 'French'].map((lang) => (
                <button 
                  key={lang} 
                  onClick={() => router.push(`/movies?lang=${lang}`)}
                  className="h-32 rounded-2xl glass border-white/5 flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-white/5 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    {lang.charAt(0)}
                  </div>
                  <span className="text-sm font-bold text-white/60 tracking-widest uppercase">{lang}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="relative">
          <AIRecommendations />
        </section>
      </div>

      <ReplicaFooter />
      <Toaster />
    </main>
  );
}
