"use client";

import React, { useState } from "react";
import ScrollStack, { ScrollStackItem } from "./ScrollStack";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Filter, Loader2 } from "lucide-react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, limit } from "firebase/firestore";
import { Movie } from "@/lib/types";

export const ScrollStackShowcase = () => {
  const [expandedGenre, setExpandedGenre] = useState<string | null>(null);
  const firestore = useFirestore();

  const genres = ["Cyberpunk", "Action", "Sci-Fi", "Thriller", "Drama"];

  const contentRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "content"), limit(100));
  }, [firestore]);

  const { data: movies, isLoading } = useCollection<Movie>(contentRef);

  const handleCardClick = (genre: string) => {
    setExpandedGenre(expandedGenre === genre ? null : genre);
  };

  if (isLoading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full px-6 py-24">
      <div className="max-w-4xl mx-auto mb-20 space-y-4">
        <div className="flex items-center gap-3 text-primary font-black uppercase tracking-[0.4em] text-[10px]">
          <Filter className="w-4 h-4" />
          Neural Classification
        </div>
        <h2 className="text-3xl md:text-8xl font-headline font-bold text-white tracking-tighter">
          Explore the <span className="text-primary text-glow">Matrix</span>
        </h2>
      </div>

      <div className="w-full max-w-5xl mx-auto">
        <div className="h-[60vh] w-full rounded-[2rem] md:rounded-[3rem] border border-white/5 bg-black/40 backdrop-blur-3xl overflow-hidden shadow-2xl relative">
          <ScrollStack 
            itemDistance={40} 
            itemStackDistance={50} 
            stackPosition="12%"
            baseScale={0.85}
            blurAmount={4}
            rotationAmount={1}
            itemScale={0.05}
            useWindowScroll={false}
          >
          {genres.map((genre, index) => {
            const genreMovies = (movies || []).filter(m => 
              m.genres?.some(g => g.toLowerCase().includes(genre.toLowerCase()))
            );

            return (
              <ScrollStackItem 
                key={genre} 
                colorIndex={index}
                onClick={() => handleCardClick(genre)}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl md:text-4xl font-headline font-bold text-white tracking-tight text-glow-sm">
                      {genre} <span className="text-primary font-black opacity-30 text-xs md:text-lg">PROT_0{index + 1}</span>
                    </h2>
                    <ChevronRight className={`w-8 h-8 text-white/20 transition-transform ${expandedGenre === genre ? 'rotate-90 text-primary' : ''}`} />
                  </div>
                  
                  <p className="text-white/40 text-sm font-medium uppercase tracking-widest mb-6 border-l-2 border-primary/30 pl-4">
                    {genreMovies.length} Neural Protocols Detected
                  </p>

                  <AnimatePresence>
                    {expandedGenre === genre && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="scroll-stack-content-grid">
                          {genreMovies.map(movie => (
                            <div key={movie.id} className="content-item group">
                              <div className="aspect-[16/9] rounded-lg overflow-hidden mb-3 border border-white/5 group-hover:border-primary/50 transition-colors shadow-lg">
                                <img src={movie.thumbnailUrl} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                              </div>
                              <h4 className="text-white font-bold text-sm truncate uppercase tracking-tighter">{movie.title}</h4>
                              <p className="text-white/30 text-[10px] uppercase font-black tracking-widest">{movie.releaseYear} • {movie.duration}</p>
                            </div>
                          ))}
                          {genreMovies.length === 0 && (
                            <div className="col-span-full py-10 text-center text-white/20 uppercase tracking-[0.3em] font-black text-xs">
                              No protocols available in this sector.
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </ScrollStackItem>
            );
          })}
        </ScrollStack>
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-primary/30 rounded-tl-[2rem] md:rounded-tl-[3rem] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-primary/30 rounded-br-[2rem] md:rounded-br-[3rem] pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
