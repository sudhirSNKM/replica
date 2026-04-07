
"use client";

import React, { useState, useRef, useMemo } from "react";
import { Play, Info, Volume2, VolumeX, Star, Clock, Flame, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Movie } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { WatchlistButton } from "./WatchlistButton";

interface ReplicaHeroProps {
  movie: Movie;
}

export const ReplicaHero = ({ movie }: ReplicaHeroProps) => {
  const [isMuted, setIsMuted] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Dynamic Neural Viewer Data
  const viewerData = useMemo(() => {
    const baseCount = Math.floor((parseFloat(movie.rating) || 8.5) * 10 + Math.random() * 20);
    return {
      count: `+${baseCount}K`,
      seeds: Array.from({ length: 4 }, (_, i) => `${movie.id}-view-${i + 1}-${Math.floor(Math.random() * 1000)}`)
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
      className="relative h-screen w-full overflow-hidden bg-background"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={movie.id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
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
                className="w-full h-full object-cover scale-110"
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>
          ) : (
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ 
                backgroundImage: `url(${movie.thumbnailUrl})`,
                transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px) scale(1.1)` 
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 h-full flex items-center px-6 md:px-12 lg:px-24 pt-20">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 w-full items-center">
          <motion.div
            initial={{ x: -80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="lg:col-span-7 space-y-8"
          >
            <div className="flex flex-wrap items-center gap-4">
              <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 backdrop-blur-xl px-4 py-1.5 text-xs font-bold tracking-widest uppercase rounded-full flex items-center gap-2">
                <Flame className="w-3.5 h-3.5 fill-current" /> Trending Protocol
              </Badge>
              <div className="flex items-center gap-4">
                {movie.genres.map((g) => (
                  <span key={g} className="text-xs font-bold text-white/50 tracking-widest uppercase flex items-center gap-2">
                    <span className="w-1 h-1 bg-primary/40 rounded-full" />
                    {g}
                  </span>
                ))}
              </div>
            </div>

            <motion.div
              style={{ 
                x: mousePosition.x * -15,
                y: mousePosition.y * -8
              }}
            >
              <h1 
                onClick={handleDetailsClick}
                className="text-6xl md:text-[8rem] font-headline font-bold text-white leading-[0.85] tracking-tighter drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] cursor-pointer hover:text-primary transition-colors"
              >
                {movie.title}
              </h1>
            </motion.div>

            <div className="flex items-center gap-8 text-white/60 font-bold">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-primary fill-primary" />
                <span className="text-white">{movie.rating} Match</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{movie.duration}</span>
              </div>
              <span className="border border-white/20 px-3 py-1 rounded text-[10px] font-black tracking-widest uppercase">4K Neural Stream</span>
            </div>

            <p className="text-xl md:text-2xl text-white/70 max-w-2xl font-medium leading-relaxed drop-shadow-md line-clamp-3">
              {movie.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-6">
              <Button 
                size="lg" 
                onClick={handleDetailsClick}
                className="bg-white text-black hover:bg-primary hover:text-white rounded-full px-12 h-16 font-bold text-xl transition-all shadow-2xl"
              >
                <Play className="w-6 h-6 mr-3 fill-current" /> Play Protocol
              </Button>
              <WatchlistButton movieId={movie.id} className="h-16 px-10 text-xl font-bold bg-white/5 backdrop-blur-xl" />
              <Button 
                onClick={handleDetailsClick}
                size="icon" 
                variant="outline" 
                className="rounded-full border-white/20 glass hover:bg-white/10 h-16 w-16"
              >
                <Info className="w-8 h-8" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-12 left-6 md:left-12 lg:left-24 z-20 flex items-center gap-10">
        <div className="flex items-center gap-6">
          <div className="flex -space-x-4">
            {viewerData.seeds.map((seed, i) => (
              <motion.div 
                key={`${movie.id}-viewer-${i}`}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + (i * 0.1) }}
                className="w-12 h-12 rounded-full border-4 border-background overflow-hidden"
              >
                <img 
                  src={`https://picsum.photos/seed/${seed}/50/50`} 
                  className="w-full h-full object-cover" 
                  alt="Viewer" 
                />
              </motion.div>
            ))}
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.3 }}
              className="w-12 h-12 rounded-full bg-primary flex items-center justify-center border-4 border-background text-[10px] font-black"
            >
              {viewerData.count}
            </motion.div>
          </div>
          <div className="text-white/40 text-xs font-bold uppercase tracking-widest">Watching Now</div>
        </div>
        
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="w-14 h-14 rounded-full glass flex items-center justify-center hover:bg-white/20 transition-all"
        >
          {isMuted ? <VolumeX className="w-6 h-6 text-white/60" /> : <Volume2 className="w-6 h-6 text-white" />}
        </button>
      </div>
    </div>
  );
};
