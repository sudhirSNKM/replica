
"use client";

import React, { useState } from "react";
import { ReplicaNavbar } from "@/components/ReplicaNavbar";
import { ReplicaHero } from "@/components/ReplicaHero";
import { MovieRow } from "@/components/MovieRow";
import { MOCK_MOVIES } from "@/app/lib/mock-data";
import { Movie } from "@/lib/types";
import { Toaster } from "@/components/ui/toaster";
import { motion } from "framer-motion";
import { Globe, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { ReplicaFooter } from "@/components/ReplicaFooter";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";

const LANGUAGES = [
  { id: 'en', code: 'US', name: 'English', native: 'ENGLISH' },
  { id: 'es', code: 'ES', name: 'Spanish', native: 'ESPAÑOL' },
  { id: 'fr', code: 'FR', name: 'French', native: 'FRANÇAIS' },
  { id: 'de', code: 'DE', name: 'German', native: 'DEUTSCH' },
  { id: 'jp', code: 'JP', name: 'Japanese', native: '日本語' },
  { id: 'kr', code: 'KR', name: 'Korean', native: '한국어' },
];

export default function MoviesPage() {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const firestore = useFirestore();

  const moviesRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "content"), where("type", "==", "movie"));
  }, [firestore]);

  const { data: moviesData, isLoading } = useCollection<Movie>(moviesRef);
  const movies = moviesData || [];
  
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);

  // Set featured movie when data arrives
  React.useEffect(() => {
    if (movies.length > 0 && !featuredMovie) {
      setFeaturedMovie(movies[0]);
    }
  }, [movies, featuredMovie]);

  const handleLanguageSelect = (langId: string) => {
    setIsTransitioning(true);
    // Simulate neural link synchronization
    setTimeout(() => {
      setSelectedLanguage(langId);
      setIsTransitioning(false);
    }, 1200);
  };

  const handleMovieHover = (movie: Movie) => {
    if (featuredMovie?.id !== movie.id) {
      setFeaturedMovie(movie);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#050507] flex flex-col items-center justify-center gap-6">
        <Loader2 className="w-16 h-16 text-primary animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Syncing Cinematic Nexus</span>
      </div>
    );
  }

  if (!selectedLanguage) {
    return (
      <main className="min-h-screen bg-[#050507] text-foreground flex flex-col items-center justify-center p-6 overflow-hidden relative">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        
        <ReplicaNavbar />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl w-full space-y-16 text-center relative z-10"
        >
          <div className="space-y-6">
            <h1 className="text-6xl md:text-8xl font-headline font-bold text-white tracking-tighter leading-none">
              Select Your <span className="text-primary text-glow">Dialect</span>
            </h1>
            <p className="text-white/40 text-xl font-medium max-w-2xl mx-auto">
              Choose the language protocol for your cinematic experience.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {LANGUAGES.map((lang, idx) => (
              <motion.button
                key={lang.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.08, duration: 0.5 }}
                onClick={() => handleLanguageSelect(lang.id)}
                className="group relative aspect-square md:aspect-auto md:h-64 rounded-[2.5rem] glass border border-white/5 hover:border-primary/40 transition-all duration-500 overflow-hidden flex flex-col items-center justify-center gap-4 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
              >
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors" />
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <span className="text-white/20 font-headline font-black text-2xl md:text-3xl tracking-widest group-hover:text-primary transition-colors">
                    {lang.code}
                  </span>
                  <div className="space-y-1">
                    <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">{lang.name}</h3>
                    <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.3em] group-hover:text-white/60 transition-colors">
                      {lang.native}
                    </p>
                  </div>
                </div>
                
                <div className="absolute bottom-6 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                  <ArrowRight className="w-6 h-6 text-primary" />
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
        
        {isTransitioning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-background/90 backdrop-blur-3xl z-[500] flex flex-col items-center justify-center gap-8"
          >
            <div className="relative">
              <div className="w-24 h-24 border-4 border-primary/20 rounded-full animate-spin border-t-primary shadow-[0_0_40px_rgba(var(--primary),0.2)]" />
              <Globe className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-pulse" />
            </div>
            <div className="space-y-2 text-center">
              <span className="font-headline font-bold tracking-[0.5em] uppercase text-white block">Initializing Protocol</span>
              <span className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em] animate-pulse">Syncing Neural Dialect</span>
            </div>
          </motion.div>
        )}
      </main>
    );
  }

  const activeLangData = LANGUAGES.find(l => l.id === selectedLanguage);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <ReplicaNavbar />
      {featuredMovie && <ReplicaHero movie={featuredMovie} />}

      <div className="relative z-20 -mt-32 md:-mt-64 space-y-24 pb-48">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/95 to-background -z-10 h-[800px] pointer-events-none" />
        
        <div className="px-6 md:px-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-2 h-10 bg-primary rounded-full neon-glow-primary" />
            <div className="space-y-1">
              <h2 className="text-3xl md:text-4xl font-headline font-bold text-white tracking-tight uppercase">
                {activeLangData?.name} <span className="text-white/20">Protocol</span>
              </h2>
              <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.4em]">Cinematic Nexus Activated</p>
            </div>
          </div>
          
          <button 
            onClick={() => setSelectedLanguage(null)}
            className="flex items-center gap-3 px-6 py-3 rounded-full glass border border-white/5 text-white/40 hover:text-white hover:border-primary/50 transition-all text-[10px] font-black uppercase tracking-widest group"
          >
            <Globe className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" /> 
            Change Dialect
          </button>
        </div>

        <div className="space-y-32">
          <MovieRow 
            title={`Top ${activeLangData?.name} Hits`} 
            movies={movies.filter(m => m.isTrending)} 
            onMovieHover={handleMovieHover} 
          />

          <MovieRow 
            title="Global Sci-Fi Classics" 
            movies={movies.filter(m => m.genres.includes("Sci-Fi"))} 
            onMovieHover={handleMovieHover} 
          />
          
          <section className="relative py-20 px-6 md:px-12">
            <div className="max-w-[1600px] mx-auto glass p-12 md:p-20 rounded-[4rem] border-white/5 flex flex-col md:flex-row items-center justify-between gap-12 bg-gradient-to-br from-primary/10 to-transparent">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em]">
                  <Sparkles className="w-3 h-3" /> Enhanced Experience
                </div>
                <h3 className="text-4xl md:text-5xl font-headline font-bold text-white tracking-tighter max-w-xl">
                  High-Fidelity {activeLangData?.name} Dubbing and Subtitles
                </h3>
                <p className="text-white/40 text-lg max-w-lg">
                  Every frame is synchronized with premium audio protocols for the ultimate {activeLangData?.name.toLowerCase()} speaking cinematic journey.
                </p>
              </div>
              <div className="w-full md:w-auto">
                <div className="p-8 rounded-[3rem] glass border-white/10 text-center space-y-4 min-w-[240px]">
                  <div className="text-5xl font-headline font-bold text-primary italic">4K</div>
                  <div className="text-[10px] text-white/20 uppercase font-black tracking-widest">Ultra Stream Bitrate</div>
                </div>
              </div>
            </div>
          </section>

          <MovieRow 
            title="All Cinematic Protocols" 
            movies={movies} 
            onMovieHover={handleMovieHover}
          />
        </div>
      </div>
      
      <ReplicaFooter />
      <Toaster />
    </main>
  );
}
