
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Plus, Info, Volume2, VolumeX, Star, Clock, Flame, ChevronRight } from "lucide-react";
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
          transition={{ duration: 1.5, ease: "easeOut" }}
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
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-accent/10 opacity-30" />
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
                <Flame className="w-3.5 h-3.5 fill-current" /> Trending Protocol #1
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
              <span className="border border-white/20 px-3 py-1 rounded text-[10px] font-black tracking-widest">4K DOLBY VISION</span>
            </div>

            <p className="text-xl md:text-2xl text-white/70 max-w-2xl font-medium leading-relaxed drop-shadow-md line-clamp-3">
              {movie.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-6">
              <Button 
                size="lg" 
                onClick={handleDetailsClick}
                className="bg-white text-black hover:bg-primary hover:text-white rounded-full px-12 h-16 font-bold text-xl transition-all hover:scale-105 active:scale-95 shadow-2xl"
              >
                <Play className="w-6 h-6 mr-3 fill-current" /> Play Protocol
              </Button>
              <WatchlistButton movieId={movie.id} className="h-16 px-10 text-xl font-bold bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10" />
              <Button 
                onClick={handleDetailsClick}
                size="icon" 
                variant="outline" 
                className="rounded-full border-white/20 glass hover:bg-white/10 h-16 w-16 transition-transform hover:rotate-90"
              >
                <Info className="w-8 h-8" />
              </Button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ scale: 0.8, opacity: 0, x: 50 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 1.2 }}
            className="hidden lg:flex lg:col-span-5 flex-col justify-center items-end relative"
            style={{
              x: mousePosition.x * 20,
              y: mousePosition.y * 15
            }}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -z-10" />
            
            <div 
              onClick={handleDetailsClick}
              className="relative w-full max-w-[400px] aspect-[2/3] glass-card rounded-[4rem] p-5 group rotate-3 hover:rotate-0 transition-transform duration-700 cursor-pointer"
            >
               <div className="w-full h-full rounded-[3.5rem] overflow-hidden relative">
                 <img src={movie.thumbnailUrl} className="w-full h-full object-cover brightness-75 group-hover:brightness-100 transition-all duration-700 scale-105 group-hover:scale-100" alt={movie.title} />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                 
                 <div className="absolute bottom-12 left-10 right-10 space-y-4">
                    <div className="flex items-center justify-between text-[10px] text-white/60 font-black tracking-widest uppercase">
                      <span>Sync Details</span>
                      <ChevronRight className="w-4 h-4 text-primary" />
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ delay: 1, duration: 1.5 }}
                        className="h-full bg-primary neon-glow-primary" 
                      />
                    </div>
                 </div>
               </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-12 left-6 md:left-12 lg:left-24 z-20 flex items-center gap-10">
        <div className="flex items-center gap-6">
          <div className="flex -space-x-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="w-12 h-12 rounded-full border-4 border-background overflow-hidden hover:translate-y-[-5px] transition-transform cursor-pointer">
                <img src={`https://picsum.photos/seed/viewer-${i}/50/50`} className="w-full h-full object-cover" alt="Viewer" />
              </div>
            ))}
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center border-4 border-background text-[10px] font-black tracking-tighter">
              +82K
            </div>
          </div>
          <div className="text-white/40 text-xs font-bold uppercase tracking-widest">Watching Now</div>
        </div>
        
        <div className="h-12 w-px bg-white/10 hidden md:block" />
        
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="w-14 h-14 rounded-full glass flex items-center justify-center hover:bg-white/20 transition-all hover:scale-110 active:scale-95 group"
          >
            {isMuted ? <VolumeX className="w-6 h-6 text-white/60 group-hover:text-white" /> : <Volume2 className="w-6 h-6 text-white group-hover:text-primary" />}
          </button>
          <div className="glass px-6 py-2 rounded-2xl font-headline font-black text-2xl tracking-tighter text-white">18+</div>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
      </div>
    </div>
  );
};
