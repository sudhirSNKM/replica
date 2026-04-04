
"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Plus, Info, Volume2, VolumeX, Star } from "lucide-react";
import { Movie } from "@/lib/types";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface MovieCardProps {
  movie: Movie;
  onHover?: (movie: Movie) => void;
}

export const MovieCard = ({ movie, onHover }: MovieCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isHovered && videoRef.current) {
      videoRef.current.play().catch(() => {});
    } else if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isHovered]);

  return (
    <div 
      className="relative flex-none w-[160px] md:w-[240px] aspect-[2/3] group cursor-pointer perspective-1000"
      onMouseEnter={() => {
        setIsHovered(true);
        onHover?.(movie);
      }}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => router.push(`/watch/${movie.id}`)}
    >
      <motion.div
        className="relative w-full h-full rounded-2xl overflow-hidden border border-white/5 transition-all duration-500 group-hover:neon-glow-primary group-hover:border-primary/50 bg-black"
        whileHover={{ scale: 1.1, zIndex: 50, y: -20 }}
        layoutId={`movie-card-${movie.id}`}
      >
        <img 
          src={movie.thumbnailUrl} 
          alt={movie.title} 
          className={cn(
            "w-full h-full object-cover transition-opacity duration-500",
            isHovered ? "opacity-0" : "opacity-100"
          )}
        />
        
        {/* Video Preview */}
        <div className={cn(
          "absolute inset-0 transition-opacity duration-500",
          isHovered ? "opacity-100" : "opacity-0"
        )}>
          <video
            ref={videoRef}
            src={movie.videoUrl}
            muted={isMuted}
            loop
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        </div>
        
        {/* Glow Overlay & Info */}
        <AnimatePresence>
          {isHovered && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-0 left-0 right-0 p-4 space-y-2"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded">NEW</span>
                <span className="text-white/80 text-[10px] font-bold flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5 fill-primary text-primary" /> {movie.rating}
                </span>
              </div>
              
              <h3 className="font-headline font-bold text-base text-white leading-tight truncate">
                {movie.title}
              </h3>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </button>
                  <button className="w-8 h-8 rounded-full border border-white/40 text-white flex items-center justify-center hover:border-white transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMuted(!isMuted);
                  }}
                  className="text-white/60 hover:text-white"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {movie.genres.slice(0, 2).map(g => (
                  <span key={g} className="text-[8px] text-white/40 uppercase tracking-tighter">{g}</span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
