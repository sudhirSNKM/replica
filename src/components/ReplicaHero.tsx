"use client";

import React, { useState, useRef, useMemo } from "react";
import { Play, Info, Volume2, VolumeX, Star, Clock, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Movie } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { WatchlistButton } from "./WatchlistButton";
import { cn } from "@/lib/utils";

interface ReplicaHeroProps {
  movie: Movie;
}

export const ReplicaHero = ({ movie }: ReplicaHeroProps) => {
  const [isMuted, setIsMuted] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const viewerData = useMemo(() => {
    const baseCount = Math.floor((parseFloat(movie.rating) || 8.5) * 10 + Math.random() * 20);
    return {
      count: `+${baseCount}K`,
      seeds: Array.from({ length: 3 }, (_, i) => `${movie.id}-view-${i + 1}`)
    };
  }, [movie.id, movie.rating]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    setMousePosition({ x, y });
  };

  const handleDetailsClick = () => {
    router.push(`/content/${movie.id}`);
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative h-[90vh] md:h-screen w-full overflow-hidden bg-background"
    >
      {/* Visual Protocol Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={movie.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 z-0"
        >
          {movie.videoUrl ? (
            <div className="absolute inset-0">
              <video
                src={movie.videoUrl}
                autoPlay
                muted={isMuted}
                loop
                playsInline
                className="w-full h-full object-cover scale-105"
              />
            </div>
          ) : (
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ 
                backgroundImage: `url(${movie.thumbnailUrl})`,
                transform: `scale(1.1)` 
              }}
            />
          )}
          {/* Enhanced Gradient Matrix */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent md:via-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent hidden md:block" />
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[0.5px] md:hidden" />
        </motion.div>
      </AnimatePresence>

      {/* Content Layer */}
      <div className="relative z-10 h-full flex flex-col justify-end pb-12 md:pb-0 md:justify-center px-6 md:px-12 lg:px-24">
        <div className="max-w-[1400px] mx-auto w-full">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="space-y-4 md:space-y-8 max-w-3xl"
          >
            {/* Header Protocol */}
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-primary text-white border-none px-3 py-1 text-[10px] font-black tracking-widest uppercase">
                <Flame className="w-3 h-3 mr-1 fill-current" /> Trending
              </Badge>
              <div className="flex items-center gap-2 text-[10px] font-bold text-white/60 tracking-widest uppercase">
                <Star className="w-3 h-3 text-primary fill-primary" /> {movie.rating} Match
                <span className="w-1 h-1 bg-white/20 rounded-full" />
                {movie.releaseYear}
              </div>
            </div>

            {/* Cinematic Title */}
            <h1 
              onClick={handleDetailsClick}
              className="text-4xl md:text-7xl lg:text-[8rem] font-headline font-bold text-white leading-tight md:leading-[0.85] tracking-tighter drop-shadow-2xl cursor-pointer hover:text-primary transition-colors"
            >
              {movie.title}
            </h1>

            {/* Mobile-Optimized Description */}
            <p className="text-base md:text-2xl text-white/70 max-w-2xl font-medium leading-relaxed line-clamp-2 md:line-clamp-none">
              {movie.description}
            </p>

            {/* Action Matrix */}
            <div className="flex flex-col md:flex-row items-center gap-4 pt-4 md:pt-6">
              <Button 
                onClick={handleDetailsClick}
                className="w-full md:w-auto h-14 md:h-16 px-10 rounded-2xl md:rounded-full bg-white text-black hover:bg-primary hover:text-white font-black text-lg transition-all shadow-xl"
              >
                <Play className="w-5 h-5 mr-3 fill-current" /> Play Protocol
              </Button>
              
              <div className="flex w-full md:w-auto gap-3">
                <WatchlistButton 
                  movieId={movie.id} 
                  className="flex-1 md:flex-none h-14 md:h-16 rounded-2xl md:rounded-full glass border-white/10" 
                />
                <Button 
                  onClick={handleDetailsClick}
                  variant="outline" 
                  className="w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-full glass border-white/10"
                >
                  <Info className="w-6 h-6" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer Meta Nodes (Desktop Only or Repositioned) */}
      <div className="absolute bottom-8 right-6 md:right-12 z-20 flex items-center gap-6">
        <div className="hidden md:flex items-center gap-4">
          <div className="flex -space-x-3">
            {viewerData.seeds.map((seed, i) => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-background overflow-hidden">
                <img src={`https://picsum.photos/seed/${seed}/40/40`} className="w-full h-full object-cover" alt="Node" />
              </div>
            ))}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Watching: {viewerData.count}</span>
        </div>
        
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="w-12 h-12 md:w-14 md:h-14 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-all"
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-white/40" /> : <Volume2 className="w-5 h-5 text-white" />}
        </button>
      </div>
    </div>
  );
};
