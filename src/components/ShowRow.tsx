
"use client";

import React, { useRef } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Movie } from "@/lib/types";
import { ShowCard } from "./ShowCard";

interface ShowRowProps {
  title: string;
  shows: Movie[];
  onHover?: (show: Movie) => void;
}

export const ShowRow = ({ title, shows, onHover }: ShowRowProps) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6 group/row relative">
      <div className="px-6 md:px-12 flex items-center justify-between">
        <h2 className="text-lg md:text-3xl font-headline font-bold text-white tracking-tight flex items-center gap-3">
          <span className="w-1.5 h-6 bg-primary rounded-full" />
          {title}
        </h2>
        <div className="hidden lg:flex items-center gap-3">
          <button 
            onClick={() => scroll('left')}
            className="w-10 h-10 rounded-full border border-white/5 bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:border-primary transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="w-10 h-10 rounded-full border border-white/5 bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:border-primary transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)]"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div 
        ref={rowRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide px-6 md:px-12 pb-10 pt-4"
      >
        {shows.map((show) => (
          <ShowCard 
            key={show.id} 
            show={show} 
            onHover={onHover}
          />
        ))}
      </div>
    </div>
  );
};
