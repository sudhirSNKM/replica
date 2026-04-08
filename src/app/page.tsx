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
import { collection, query, limit, orderBy } from "firebase/firestore";
import { ShowRow } from "@/components/ShowRow";
import { MOCK_MOVIES } from "@/app/lib/mock-data";
import { ReplicaFooter } from "@/components/ReplicaFooter";

export default function Home() {
  const router = useRouter();
  const { user, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace('/login');
    } else if (user?.email === 'admin@replica.com') {
      router.replace('/admin');
    }
  }, [user, isAuthLoading, router]);

  const contentRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, "content"),
      orderBy("publishDate", "desc"),
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
          <p className="text-white/20 font-bold uppercase tracking-[0.5em] text-[10px] animate-pulse">Initializing Identity Nexus</p>
        </motion.div>
      </div>
    );
  }

  if (!user) return null;

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
