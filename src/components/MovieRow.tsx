
"use client";

import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Movie } from "@/lib/types";
import { MovieCard } from "./MovieCard";
import { cn } from "@/lib/utils";

interface MovieRowProps {
  title: string;
  movies: Movie[];
  onMovieHover?: (movie: Movie) => void;
  isAI?: boolean;
}

export const MovieRow = ({ title, movies, onMovieHover, isAI }: MovieRowProps) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const handleScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setShowLeft(scrollLeft > 0);
      setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const { clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.8;
      const scrollTo = direction === "left" 
        ? rowRef.current.scrollLeft - scrollAmount 
        : rowRef.current.scrollLeft + scrollAmount;
      
      rowRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <div className="relative group/row py-4">
      <div className="flex items-center justify-between px-6 md:px-12 mb-4">
        <h2 className="text-lg md:text-2xl font-headline font-bold text-white flex items-center gap-3">
          {isAI && <Sparkles className="w-5 h-5 text-primary" />}
          {title}
          <span className="w-16 h-[2px] bg-gradient-to-r from-primary/50 to-transparent" />
        </h2>
        <button className="text-white/40 hover:text-primary font-bold text-xs uppercase tracking-widest transition-colors">
          View All
        </button>
      </div>

      <div className="relative">
        <button 
          onClick={() => scroll("left")}
          className={cn(
            "absolute left-0 top-0 bottom-0 z-40 w-16 bg-gradient-to-r from-background via-background/60 to-transparent flex items-center justify-center transition-all duration-300",
            showLeft ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <div className="w-12 h-12 rounded-full glass flex items-center justify-center hover:bg-white/10">
            <ChevronLeft className="w-8 h-8 text-white" />
          </div>
        </button>

        <div 
          ref={rowRef}
          onScroll={handleScroll}
          className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide px-6 md:px-12 snap-x snap-mandatory pb-8 pt-4"
        >
          {movies.map((movie) => (
            <div key={movie.id} className="snap-start">
              <MovieCard movie={movie} onHover={onMovieHover} />
            </div>
          ))}
        </div>

        <button 
          onClick={() => scroll("right")}
          className={cn(
            "absolute right-0 top-0 bottom-0 z-40 w-16 bg-gradient-to-l from-background via-background/60 to-transparent flex items-center justify-center transition-all duration-300",
            showRight ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <div className="w-12 h-12 rounded-full glass flex items-center justify-center hover:bg-white/10">
            <ChevronRight className="w-8 h-8 text-white" />
          </div>
        </button>
      </div>
    </div>
  );
};
