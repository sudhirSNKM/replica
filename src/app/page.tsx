
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
import { collection, query, where, limit, Timestamp } from "firebase/firestore";
import { ShowRow } from "@/components/ShowRow";
import { MOCK_MOVIES } from "@/app/lib/mock-data";
import { ReplicaFooter } from "@/components/ReplicaFooter";
import { ArrowRight, Shield, Zap, Globe, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();
  const { user, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch only published content
  const contentRef = useMemoFirebase(() => {
    if (!firestore) return null;
    // For non-admins, security rules will handle the publishDate filter, 
    // but we add it here for cleaner UI listing.
    const now = new Date().toISOString();
    return query(
      collection(firestore, "content"),
      where("publishDate", "<=", now),
      limit(60)
    );
  }, [firestore]);

  const { data: firestoreContent, isLoading: isContentLoading } = useCollection<Movie>(contentRef);
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);

  const allContent = (firestoreContent && firestoreContent.length > 0) ? firestoreContent : MOCK_MOVIES;

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
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-10">
          <div className="text-8xl md:text-[10rem] font-headline font-bold tracking-tighter text-white">
            <span className="text-primary text-glow">RE</span><span>PLICA</span>
          </div>
          <div className="w-80 h-1 bg-white/5 rounded-full overflow-hidden relative">
            <motion.div initial={{ x: "-100%" }} animate={{ x: "100%" }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent w-full h-full" />
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
        <section className="relative h-screen flex items-center justify-center text-center px-6 overflow-hidden">
          <div className="absolute inset-0 z-0">
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center brightness-[0.2] scale-110 blur-[2px]" />
             <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          </div>
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1 }} className="relative z-10 max-w-5xl space-y-12">
            <h1 className="text-6xl md:text-9xl font-headline font-bold text-white tracking-tighter leading-[0.9]">
              Unlimited <span className="text-primary text-glow">Movies</span> & <br className="hidden md:block" />TV Episodes.
            </h1>
            <p className="text-xl md:text-3xl text-white/40 font-medium max-w-3xl mx-auto">
              Experience the world's most advanced decentralized streaming network. Watch anywhere, synchronize anytime.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-8">
              <Button onClick={() => router.push('/login')} className="h-20 px-12 rounded-full bg-white text-black hover:bg-primary hover:text-white font-black text-xl transition-all shadow-2xl group">
                Get Started <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
              </Button>
            </div>
          </motion.div>
        </section>
        <ReplicaFooter />
      </main>
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
          <motion.div key={featuredMovie.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}>
            <ReplicaHero movie={featuredMovie} />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="relative z-30 -mt-24 md:-mt-32 space-y-32 pb-48">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/95 to-background -z-10 h-[1000px] pointer-events-none" />
        <section className="relative pt-12 md:pt-24">
          <MovieRow title="Global Trending Now" movies={allContent.filter(m => m.isTrending).slice(0, 15)} onMovieHover={setFeaturedMovie} />
        </section>
        <section className="relative">
          <ShowRow title="Top Series for You" shows={allContent.filter(m => m.type === 'show').slice(0, 12)} onHover={setFeaturedMovie} />
        </section>
        <section className="relative py-24 bg-white/[0.01] border-y border-white/[0.05]">
          <AIRecommendations />
        </section>
      </div>
      <ReplicaFooter />
      <Toaster />
    </main>
  );
}
