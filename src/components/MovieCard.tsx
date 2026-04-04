
"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Plus, Info, Volume2, VolumeX, Star, Clock } from "lucide-react";
import { Movie } from "@/lib/types";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
      // Delay preview to ensure intentional hover (OTT standard)
      hoverTimeoutRef.current = setTimeout(() => {
        setShowPreview(true);
        if (videoRef.current) {
          videoRef.current.play().catch(() => {});
        }
      }, 700);
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

  const handleCardClick = () => {
    router.push(`/content/${movie.id}`);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/watch/${movie.id}`);
  };

  return (
    <div 
      className="relative flex-none w-[180px] md:w-[260px] aspect-[2/3] group cursor-pointer"
      onMouseEnter={() => {
        setIsHovered(true);
        onHover?.(movie);
      }}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <motion.div
        className="relative w-full h-full rounded-2xl overflow-hidden border border-white/5 bg-black"
        whileHover={{ 
          scale: 1.25, 
          zIndex: 100, 
          y: -40,
          transition: { type: "spring", stiffness: 400, damping: 25 }
        }}
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col justify-end p-5 space-y-3"
            >
              <div className="flex items-center gap-2">
                <Badge className="bg-primary text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-[0_0_10px_rgba(var(--primary),0.5)]">
                  {movie.isNew ? "NEW" : "FEATURED"}
                </Badge>
                <div className="flex items-center gap-1 text-white text-[10px] font-bold">
                  <Star className="w-3 h-3 fill-primary text-primary" /> {movie.rating}
                </div>
              </div>
              
              <h3 className="font-headline font-bold text-base md:text-lg text-white leading-tight drop-shadow-md">
                {movie.title}
              </h3>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handlePlayClick}
                    className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-primary hover:text-white transition-all transform hover:scale-110 shadow-xl"
                  >
                    <Play className="w-5 h-5 fill-current ml-1" />
                  </button>
                  <button 
                    onClick={(e) => e.stopPropagation()}
                    className="w-10 h-10 rounded-full border-2 border-white/20 text-white flex items-center justify-center hover:bg-white/10 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMuted(!isMuted);
                  }}
                  className="w-8 h-8 rounded-full glass flex items-center justify-center text-white/60 hover:text-white"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
              
              <div className="flex items-center gap-3 text-[10px] text-white/40 font-bold uppercase tracking-tight">
                <span>{movie.duration}</span>
                <span className="w-1 h-1 bg-white/20 rounded-full" />
                <span className="truncate">{movie.genres.join(" • ")}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
