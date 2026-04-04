
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
  const [showPreview, setShowPreview] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (isHovered) {
      // Delay preview to ensure intentional hover
      hoverTimeoutRef.current = setTimeout(() => {
        setShowPreview(true);
        if (videoRef.current) {
          videoRef.current.play().catch(() => {});
        }
      }, 600);
    } else {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      setShowPreview(false);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }

    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
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
        whileHover={{ scale: 1.15, zIndex: 100, y: -30 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        layoutId={`movie-card-${movie.id}`}
      >
        <img 
          src={movie.thumbnailUrl} 
          alt={movie.title} 
          className={cn(
            "w-full h-full object-cover transition-opacity duration-700",
            showPreview ? "opacity-0" : "opacity-100"
          )}
        />
        
        {/* Video Preview Layer */}
        <div className={cn(
          "absolute inset-0 transition-opacity duration-700",
          showPreview ? "opacity-100" : "opacity-0"
        )}>
          <video
            ref={videoRef}
            src={movie.videoUrl}
            muted={isMuted}
            loop
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>
        
        {/* Card Info Overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 p-4 space-y-2 bg-gradient-to-t from-black via-black/80 to-transparent"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-[0_0_10px_rgba(var(--primary),0.5)]">
                  {movie.isNew ? "NEW" : "HOT"}
                </span>
                <span className="text-white/80 text-[10px] font-bold flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5 fill-primary text-primary" /> {movie.rating}
                </span>
                <span className="text-white/40 text-[10px]">{movie.duration}</span>
              </div>
              
              <h3 className="font-headline font-bold text-sm md:text-base text-white leading-tight truncate">
                {movie.title}
              </h3>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:bg-primary hover:text-white transition-all transform hover:scale-110 active:scale-90 shadow-lg">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </button>
                  <button className="w-8 h-8 rounded-full border border-white/20 text-white flex items-center justify-center hover:bg-white/10 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMuted(!isMuted);
                  }}
                  className="text-white/60 hover:text-white transition-colors p-1"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
              
              <div className="flex flex-wrap gap-1.5">
                {movie.genres.slice(0, 2).map(g => (
                  <span key={g} className="text-[9px] text-white/40 uppercase tracking-tight">{g}</span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
