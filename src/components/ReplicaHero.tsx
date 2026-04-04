
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Plus, Info, Volume2, VolumeX, Star, Clock } from "lucide-react";
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

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    setMousePosition({ x, y });
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative h-[110vh] w-full overflow-hidden bg-background"
    >
      {/* Dynamic Background Image with Multi-layered Ken Burns Effect */}
      <AnimatePresence mode="wait">
        <motion.div
          key={movie.id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center animate-ken-burns scale-110"
            style={{ 
              backgroundImage: `url(${movie.thumbnailUrl})`,
              transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px) scale(1.1)` 
            }}
          />
          {/* Advanced Multi-layered Overlays for depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-accent/10 opacity-50" />
        </motion.div>
      </AnimatePresence>

      {/* Content Layer */}
      <div className="relative z-10 h-full flex items-center px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-12 w-full">
          <motion.div
            initial={{ x: -80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="lg:col-span-8 space-y-8"
          >
            <div className="flex flex-wrap items-center gap-4">
              <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 backdrop-blur-xl px-4 py-1.5 text-xs font-bold tracking-widest uppercase rounded-full">
                #1 Worldwide Trending
              </Badge>
              <div className="flex items-center gap-4">
                {movie.genres.map((g) => (
                  <span key={g} className="text-xs font-bold text-white/50 tracking-widest uppercase flex items-center gap-2">
                    <span className="w-1 h-1 bg-white/30 rounded-full" />
                    {g}
                  </span>
                ))}
              </div>
            </div>

            <motion.div
              style={{ 
                x: mousePosition.x * -25,
                y: mousePosition.y * -15
              }}
            >
              <h1 className="text-6xl md:text-9xl font-headline font-bold text-white leading-[0.9] tracking-tighter drop-shadow-2xl">
                {movie.title}
              </h1>
            </motion.div>

            <div className="flex items-center gap-8 text-white/60 font-bold">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-primary fill-primary" />
                <span>{movie.rating} Match</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{movie.duration}</span>
              </div>
              <span className="border border-white/20 px-2 py-0.5 rounded text-xs">4K Ultra HD</span>
            </div>

            <p className="text-xl md:text-2xl text-white/70 max-w-2xl font-medium leading-relaxed drop-shadow-md">
              {movie.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-6">
              <Button 
                size="lg" 
                onClick={() => router.push(`/watch/${movie.id}`)}
                className="bg-white text-black hover:bg-primary hover:text-white rounded-full px-12 h-16 font-bold text-xl transition-all hover:scale-105 active:scale-95 shadow-2xl"
              >
                <Play className="w-6 h-6 mr-3 fill-current" /> Watch Now
              </Button>
              <WatchlistButton movieId={movie.id} className="h-16 px-10 text-xl font-bold bg-white/5" />
              <Button size="icon" variant="outline" className="rounded-full border-white/20 glass hover:bg-white/10 h-16 w-16 transition-transform hover:rotate-90">
                <Info className="w-8 h-8" />
              </Button>
            </div>
          </motion.div>

          {/* Floating Depth Card Preview */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0, x: 50 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 1.2 }}
            className="hidden lg:flex lg:col-span-4 flex-col justify-center items-end"
            style={{
              x: mousePosition.x * 40,
              y: mousePosition.y * 30
            }}
          >
            <div className="relative w-full max-w-[320px] aspect-[2/3] glass-card rounded-[3rem] p-4 group">
               <img src={movie.thumbnailUrl} className="w-full h-full object-cover rounded-[2.5rem] brightness-75 group-hover:brightness-100 transition-all duration-700" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-[2.5rem]" />
               <div className="absolute bottom-10 left-8 right-8 space-y-2">
                  <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-primary" />
                  </div>
                  <p className="text-white text-xs font-bold uppercase tracking-widest text-center">Resume from 42:12</p>
               </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Controls & Social proof */}
      <div className="absolute bottom-20 right-10 z-20 flex items-center gap-6">
        <div className="flex -space-x-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="w-10 h-10 rounded-full border-2 border-background overflow-hidden">
              <img src={`https://picsum.photos/seed/user-${i}/40/40`} className="w-full h-full object-cover" />
            </div>
          ))}
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center border-2 border-background text-[10px] font-bold">
            +42k
          </div>
        </div>
        <div className="h-12 w-px bg-white/10" />
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="w-14 h-14 rounded-full glass flex items-center justify-center hover:bg-white/20 transition-all hover:scale-110"
        >
          {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </button>
        <span className="text-white font-headline font-bold text-2xl tracking-tighter glass px-4 py-2 rounded-xl">18+</span>
      </div>

      {/* Hero Particles/Subtle Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-background/0 via-background/0 to-background" />
      </div>
    </div>
  );
};
