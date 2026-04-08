
"use client";

import React, { useState, useMemo } from "react";
import { Play, Info, Volume2, VolumeX, Star, Clock, Flame, Users } from "lucide-react";
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
  const router = useRouter();

  const viewerData = useMemo(() => {
    const baseCount = Math.floor((parseFloat(movie.rating) || 8.5) * 10 + Math.random() * 20);
    return {
      count: `+${baseCount}K`,
      seeds: Array.from({ length: 3 }, (_, i) => `${movie.id}-view-${i + 1}`)
    };
  }, [movie.id, movie.rating]);

  const handleDetailsClick = () => {
    router.push(`/content/${movie.id}`);
  };

  return (
    <div className="relative min-h-[85vh] md:h-[85vh] w-full overflow-hidden bg-background">
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
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent hidden md:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent md:from-background md:via-transparent md:to-transparent" />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] md:backdrop-blur-none" />
        </motion.div>
      </AnimatePresence>

      {/* Content Layer */}
      <div className="relative z-10 h-full flex flex-col justify-end px-6 md:px-12 lg:px-24 pb-12 md:pb-20 pt-32 md:pt-0">
        <div className="max-w-[1600px] mx-auto w-full">
          <motion.div
            initial={{ x: -80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="max-w-4xl flex flex-col space-y-6 md:space-y-8"
          >
            {/* Tags & Genres */}
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 backdrop-blur-xl px-3 py-1 text-[10px] md:text-xs font-bold tracking-widest uppercase rounded-full flex items-center gap-2">
                <Flame className="w-3 md:w-3.5 h-3 md:h-3.5 fill-current" /> Trending
              </Badge>
              <div className="flex flex-wrap items-center gap-2 md:gap-4">
                {(movie.genres || []).map((g) => (
                  <span key={g} className="text-[10px] md:text-xs font-bold text-white/50 tracking-widest uppercase flex items-center gap-1.5 md:gap-2">
                    <span className="w-1 h-1 bg-primary/40 rounded-full" />
                    {g}
                  </span>
                ))}
              </div>
            </div>

            {/* Title */}
            <h1 
              onClick={handleDetailsClick}
              className="text-4xl md:text-7xl lg:text-8xl font-headline font-bold text-white leading-[1.1] md:leading-[0.85] tracking-tighter drop-shadow-2xl cursor-pointer hover:text-primary transition-all duration-500 break-words"
            >
              {movie.title}
            </h1>

            {/* Specs */}
            <div className="flex flex-wrap items-center gap-4 md:gap-8 text-white/60 font-bold text-xs md:text-base">
              <div className="flex items-center gap-1.5 md:gap-2 text-primary">
                <Star className="w-3.5 md:w-5 h-3.5 md:h-5 fill-current" />
                <span className="text-white">{movie.rating} Match</span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2">
                <Clock className="w-3.5 md:w-5 h-3.5 md:h-5" />
                <span>{movie.duration}</span>
              </div>
              <span className="border border-white/20 px-2 py-0.5 md:px-3 md:py-1 rounded text-[7px] md:text-[10px] font-black tracking-widest uppercase">4K Stream</span>
            </div>

            {/* Description */}
            <p className="text-sm md:text-xl lg:text-2xl text-white/70 max-w-2xl font-medium leading-relaxed line-clamp-2 md:line-clamp-3">
              {movie.description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 pt-4 w-full md:w-auto">
              <Button 
                size="lg" 
                onClick={handleDetailsClick}
                className="w-full md:w-auto bg-white text-black hover:bg-primary hover:text-white rounded-full px-12 h-14 md:h-16 font-bold text-lg md:text-xl transition-all shadow-2xl active:scale-95"
              >
                <Play className="w-5 h-5 md:w-6 md:h-6 mr-3 fill-current" /> Play Protocol
              </Button>
              
              <div className="flex items-center gap-3 w-full md:w-auto">
                <WatchlistButton 
                  movieId={movie.id} 
                  className="flex-1 md:flex-none h-14 md:h-16 px-10 text-lg md:text-xl font-bold bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10" 
                />
                <Button 
                  onClick={handleDetailsClick}
                  size="icon" 
                  variant="outline" 
                  className="h-14 w-14 md:h-16 md:w-16 rounded-full border-white/20 glass hover:bg-white/10 shrink-0"
                >
                  <Info className="w-6 h-6" />
                </Button>
              </div>
            </div>

            {/* Mobile Status Bar (Inside content flow) */}
            <div className="md:hidden flex items-center justify-between pt-8 border-t border-white/5">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {viewerData.seeds.map((seed, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-background overflow-hidden shadow-lg">
                      <img src={`https://picsum.photos/seed/${seed}/80/80`} className="w-full h-full object-cover" alt="Node" />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary text-glow">Streaming: {viewerData.count}</span>
                </div>
              </div>
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="w-12 h-12 rounded-full glass border-white/10 flex items-center justify-center"
              >
                {isMuted ? <VolumeX className="w-5 h-5 text-white/40" /> : <Volume2 className="w-5 h-5 text-white" />}
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Desktop Bottom Bar (Absolute) */}
      <div className="hidden md:flex absolute bottom-12 left-6 md:left-12 lg:left-24 right-6 md:right-12 lg:right-24 z-20 items-center justify-between pointer-events-none">
        <div className="flex items-center gap-6 pointer-events-auto">
          <div className="flex -space-x-4">
            {viewerData.seeds.map((seed, i) => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-background overflow-hidden shadow-xl">
                <img src={`https://picsum.photos/seed/${seed}/100/100`} className="w-full h-full object-cover" alt="Node" />
              </div>
            ))}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Status: Active</span>
            <span className="text-[11px] font-black uppercase tracking-widest text-primary text-glow">Streaming: {viewerData.count}</span>
          </div>
        </div>
        
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="pointer-events-auto w-14 h-14 rounded-full glass border-white/10 flex items-center justify-center hover:bg-white/10 transition-all group relative"
        >
          <div className="absolute inset-0 rounded-full bg-primary/20 opacity-0 group-hover:opacity-100 blur-md transition-opacity" />
          {isMuted ? <VolumeX className="w-6 h-6 text-white/40" /> : <Volume2 className="w-6 h-6 text-white" />}
        </button>
      </div>
    </div>
  );
};
