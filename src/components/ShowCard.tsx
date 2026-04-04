
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Plus, Info, Star, Layers } from "lucide-react";
import { Movie } from "@/lib/types";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface ShowCardProps {
  show: Movie;
  onHover?: (show: Movie) => void;
}

export const ShowCard = ({ show, onHover }: ShowCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  return (
    <div 
      className="relative flex-none w-[280px] md:w-[400px] aspect-video group cursor-pointer"
      onMouseEnter={() => {
        setIsHovered(true);
        onHover?.(show);
      }}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => router.push(`/watch/${show.id}`)}
    >
      <motion.div
        className="relative w-full h-full rounded-3xl overflow-hidden border border-white/5 transition-all duration-500 group-hover:border-primary/50 bg-black"
        whileHover={{ scale: 1.05, zIndex: 50 }}
      >
        <img 
          src={show.thumbnailUrl} 
          alt={show.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
          <div className="flex items-center gap-3">
            <span className="bg-white/10 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full border border-white/10 flex items-center gap-1">
              <Layers className="w-3 h-3 text-primary" /> SERIES
            </span>
            <span className="text-white/80 text-[10px] font-bold flex items-center gap-1">
              <Star className="w-3 h-3 fill-primary text-primary" /> {show.rating}
            </span>
          </div>
          
          <h3 className="font-headline font-bold text-xl md:text-2xl text-white leading-tight">
            {show.title}
          </h3>
          
          <AnimatePresence>
            {isHovered && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 pt-2"
              >
                <p className="text-white/60 text-xs line-clamp-2 font-medium leading-relaxed">
                  {show.description}
                </p>
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-xs font-bold hover:neon-glow-primary transition-all">
                    <Play className="w-3.5 h-3.5 fill-current" /> Watch Now
                  </button>
                  <button className="w-10 h-10 rounded-full border border-white/20 text-white flex items-center justify-center hover:bg-white/10 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
