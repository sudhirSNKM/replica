"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { Movie } from "@/lib/types";
import { MovieCard } from "./MovieCard";
import { cn } from "@/lib/utils";

interface TrendingRowProps {
  title: string;
  movies: Movie[];
}

export const TrendingRow = ({ title, movies }: TrendingRowProps) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const { clientWidth } = rowRef.current;
      rowRef.current.scrollBy({ left: direction === "left" ? -clientWidth : clientWidth, behavior: "smooth" });
    }
  };

  return (
    <div className="relative group/row py-8 px-6 md:px-12 lg:px-24">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl md:text-5xl font-headline font-bold text-white tracking-tighter flex items-center gap-4">
          <Zap className="w-8 h-8 text-primary fill-primary animate-pulse" />
          {title}
        </h2>
      </div>

      <div className="relative group">
        <button 
          onClick={() => scroll("left")}
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full glass border-white/10 hidden group-hover:flex items-center justify-center hover:bg-white/10"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>

        <div 
          ref={rowRef}
          className="flex gap-8 overflow-x-auto scrollbar-hide snap-x snap-mandatory pt-4 pb-12"
        >
          {movies.map((movie, index) => (
            <div key={movie.id} className="flex-none snap-start flex items-end">
              <div className="text-[12rem] md:text-[18rem] font-headline font-black leading-none -mb-6 md:-mb-10 mr-[-2rem] md:mr-[-4rem] text-transparent stroke-white/20 select-none" style={{ WebkitTextStroke: '2px rgba(255,255,255,0.1)' }}>
                {index + 1}
              </div>
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>

        <button 
          onClick={() => scroll("right")}
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full glass border-white/10 hidden group-hover:flex items-center justify-center hover:bg-white/10"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
};
