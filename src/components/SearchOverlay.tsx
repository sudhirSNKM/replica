
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Sparkles, Film, Clock, Star } from "lucide-react";
import { naturalLanguageContentSearch } from "@/ai/flows/natural-language-content-search-flow";
import { MOCK_MOVIES } from "@/app/lib/mock-data";
import { Movie } from "@/lib/types";
import { useRouter } from "next/navigation";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchOverlay = ({ isOpen, onClose }: SearchOverlayProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        // AI-powered search logic
        const params = await naturalLanguageContentSearch({ query });
        
        let filtered = MOCK_MOVIES.filter(m => {
          const matchTitle = params.titleSearch 
            ? m.title.toLowerCase().includes(params.titleSearch.toLowerCase()) 
            : true;
          const matchGenre = params.genres?.length 
            ? params.genres.some(g => m.genres.some(mg => mg.toLowerCase().includes(g.toLowerCase()))) 
            : true;
          const matchKeyword = params.keywords?.length
            ? params.keywords.some(k => m.description.toLowerCase().includes(k.toLowerCase()) || m.title.toLowerCase().includes(k.toLowerCase()))
            : true;
          
          return (matchTitle || matchKeyword) && (matchGenre || matchKeyword);
        });

        // Basic fallback search if AI returns nothing or too specific
        if (filtered.length === 0) {
          filtered = MOCK_MOVIES.filter(m => 
            m.title.toLowerCase().includes(query.toLowerCase()) || 
            m.genres.some(g => g.toLowerCase().includes(query.toLowerCase()))
          );
        }

        setResults(filtered);
      } catch (error) {
        console.error("Search error", error);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] glass flex flex-col p-8 md:p-16"
        >
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors"
          >
            <X className="w-10 h-10" />
          </button>

          <div className="max-w-4xl mx-auto w-full space-y-12">
            <div className="relative">
              <input
                autoFocus
                placeholder="Search for movies, genres, or moods..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent border-b-2 border-white/10 py-6 text-4xl md:text-6xl font-headline font-bold text-white placeholder:text-white/10 focus:outline-none focus:border-primary transition-colors"
              />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-4">
                {isSearching ? (
                  <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                ) : (
                  <Search className="w-8 h-8 text-white/20" />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {results.length > 0 ? (
                results.map((movie) => (
                  <motion.div
                    key={movie.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => {
                      router.push(`/watch/${movie.id}`);
                      onClose();
                    }}
                    className="flex gap-6 group cursor-pointer glass-card p-4 rounded-3xl"
                  >
                    <div className="w-24 h-32 flex-none rounded-xl overflow-hidden">
                      <img src={movie.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-headline font-bold text-white group-hover:text-primary transition-colors">{movie.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-white/40">
                        <span className="flex items-center gap-1"><Star className="w-3 h-3 text-primary fill-primary" /> {movie.rating}</span>
                        <span>{movie.releaseYear}</span>
                        <span>{movie.duration}</span>
                      </div>
                      <p className="text-sm text-white/40 line-clamp-2">{movie.description}</p>
                    </div>
                  </motion.div>
                ))
              ) : query && !isSearching ? (
                <div className="col-span-2 text-center py-20">
                  <Film className="w-16 h-16 text-white/10 mx-auto mb-4" />
                  <p className="text-white/40 text-xl">No cinematic experiences found for "{query}"</p>
                </div>
              ) : null}
            </div>

            {!query && (
              <div className="space-y-6">
                <h4 className="text-white/40 uppercase tracking-widest text-sm font-bold">Suggested Searches</h4>
                <div className="flex flex-wrap gap-4">
                  {["Action packed sci-fi", "Chill movies from the 90s", "Cyberpunk", "Mind-bending thrillers"].map(tag => (
                    <button
                      key={tag}
                      onClick={() => setQuery(tag)}
                      className="px-6 py-3 glass rounded-full text-white/60 hover:text-white hover:border-primary/50 transition-all"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
