
"use client";

import React, { useState, useEffect } from "react";
import { ReplicaNavbar } from "@/components/ReplicaNavbar";
import { ReplicaHero } from "@/components/ReplicaHero";
import { MovieRow } from "@/components/MovieRow";
import { MOCK_MOVIES } from "@/app/lib/mock-data";
import { Movie } from "@/lib/types";
import { Toaster } from "@/components/ui/toaster";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, ArrowRight } from "lucide-react";
import { ReplicaFooter } from "@/components/ReplicaFooter";

const LANGUAGES = [
  { id: 'en', name: 'English', native: 'English', icon: '🇺🇸' },
  { id: 'es', name: 'Spanish', native: 'Español', icon: '🇪🇸' },
  { id: 'fr', name: 'French', native: 'Français', icon: '🇫🇷' },
  { id: 'de', name: 'German', native: 'Deutsch', icon: '🇩🇪' },
  { id: 'jp', name: 'Japanese', native: '日本語', icon: '🇯🇵' },
  { id: 'kr', name: 'Korean', native: '한국어', icon: '🇰🇷' },
];

export default function MoviesPage() {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const movies = MOCK_MOVIES.filter(m => m.type === 'movie');
  const [featuredMovie, setFeaturedMovie] = useState<Movie>(movies[0] || MOCK_MOVIES[0]);

  const handleLanguageSelect = (langId: string) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedLanguage(langId);
      setIsTransitioning(false);
    }, 800);
  };

  const handleMovieHover = (movie: Movie) => {
    if (featuredMovie.id !== movie.id) {
      setFeaturedMovie(movie);
    }
  };

  if (!selectedLanguage) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
        <ReplicaNavbar />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl w-full space-y-12 text-center"
        >
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-headline font-bold text-white tracking-tighter">
              Select Your <span className="text-primary">Dialect</span>
            </h1>
            <p className="text-white/40 text-xl font-light">Choose the language protocol for your cinematic experience.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {LANGUAGES.map((lang, idx) => (
              <motion.button
                key={lang.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => handleLanguageSelect(lang.id)}
                className="group relative p-8 rounded-3xl glass border border-white/5 hover:border-primary/50 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors" />
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <span className="text-4xl">{lang.icon}</span>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-white mb-1">{lang.name}</h3>
                    <p className="text-xs text-white/40 uppercase tracking-widest">{lang.native}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-white/0 group-hover:text-primary group-hover:translate-x-2 transition-all" />
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
        
        {isTransitioning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-background z-[200] flex items-center justify-center"
          >
            <div className="text-primary animate-pulse flex flex-col items-center gap-4">
              <Globe className="w-12 h-12 animate-spin-slow" />
              <span className="font-headline font-bold tracking-widest uppercase">Initializing Protocol</span>
            </div>
          </motion.div>
        )}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <ReplicaNavbar />
      <ReplicaHero movie={featuredMovie} />

      <div className="relative z-20 -mt-32 md:-mt-64 space-y-12 pb-32">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/90 to-background -z-10 h-[500px]" />
        
        <div className="px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="w-2 h-8 bg-primary rounded-full" />
            <h2 className="text-2xl font-headline font-bold text-white uppercase tracking-widest">
              Language: {LANGUAGES.find(l => l.id === selectedLanguage)?.name}
            </h2>
          </div>
          <button 
            onClick={() => setSelectedLanguage(null)}
            className="text-white/40 hover:text-white transition-colors flex items-center gap-2 text-sm font-bold uppercase"
          >
            <Globe className="w-4 h-4" /> Change Language
          </button>
        </div>

        <MovieRow 
          title="Blockbuster Movies" 
          movies={movies.filter(m => m.isTrending)} 
          onMovieHover={handleMovieHover} 
        />

        <MovieRow 
          title="Sci-Fi Thrillers" 
          movies={movies.filter(m => m.genres.includes("Sci-Fi"))} 
          onMovieHover={handleMovieHover} 
        />
        
        <MovieRow 
          title="Action Packed" 
          movies={movies.filter(m => m.genres.includes("Action"))} 
          onMovieHover={handleMovieHover}
        />

        <MovieRow 
          title="All Cinematic Experiences" 
          movies={movies} 
          onMovieHover={handleMovieHover}
        />
      </div>
      <ReplicaFooter />
      <Toaster />
    </main>
  );
}
