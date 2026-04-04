
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  Settings, 
  Loader2,
  Info,
  RotateCcw,
  RotateCw,
  Subtitles,
  Activity,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { MOCK_MOVIES } from "@/app/lib/mock-data";
import { cn } from "@/lib/utils";

export default function VideoPlayer() {
  const router = useRouter();
  const { id } = useParams();
  const firestore = useFirestore();

  const movieRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, "content", id as string);
  }, [firestore, id]);

  const { data: firestoreMovie, isLoading: isMovieLoading } = useDoc(movieRef);
  const movie = firestoreMovie || MOCK_MOVIES.find(m => m.id === id);

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Streaming Settings (Functional Mock)
  const [quality, setQuality] = useState("4K ULTRA HDR");
  const [language, setLanguage] = useState("English (Neural)");
  const [subtitle, setSubtitle] = useState("Off");

  useEffect(() => {
    if (videoRef.current && movie?.videoUrl) {
      videoRef.current.load();
    }
  }, [movie?.videoUrl]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(console.error);
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleSkip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      playerContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      
      if (isFinite(total) && total > 0) {
        setProgress((current / total) * 100);
      }
      
      const formatTime = (time: number) => {
        if (!isFinite(time)) return "0:00";
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
      };
      
      setCurrentTime(formatTime(current));
      setDuration(formatTime(total));
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current && isFinite(videoRef.current.duration)) {
      const newTime = (value[0] / 100) * videoRef.current.duration;
      videoRef.current.currentTime = newTime;
      setProgress(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVol = value[0];
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol / 100;
      setIsMuted(newVol === 0);
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch(e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          toggleFullScreen();
          break;
        case 'm':
          setIsMuted(prev => !prev);
          break;
        case 'arrowright':
          handleSkip(10);
          break;
        case 'arrowleft':
          handleSkip(-10);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3000);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timeout);
    };
  }, [isPlaying]);

  if (isMovieLoading) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[500] gap-6">
        <Loader2 className="w-16 h-16 text-primary animate-spin" />
        <p className="text-white/20 uppercase tracking-[0.5em] font-black text-xs animate-pulse">Establishing Neural Link</p>
      </div>
    );
  }

  if (!movie || !movie.videoUrl) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[500] text-white p-6">
        <Activity className="w-20 h-20 text-destructive mb-8 animate-pulse" />
        <p className="text-2xl mb-4 font-headline font-bold text-glow uppercase tracking-widest">Protocol Signal Lost</p>
        <p className="text-white/40 mb-12 text-center max-w-md">The requested media protocol identifier is missing or corrupted within the matrix.</p>
        <Button onClick={() => router.push("/")} className="bg-primary hover:neon-glow-primary rounded-2xl px-12 h-16 font-bold uppercase tracking-widest">
          Return to Nexus
        </Button>
      </div>
    );
  }

  return (
    <div 
      ref={playerContainerRef}
      className="fixed inset-0 bg-black z-[200] flex items-center justify-center group overflow-hidden select-none"
    >
      <video
        key={movie.videoUrl}
        ref={videoRef}
        src={movie.videoUrl}
        className="w-full h-full cursor-pointer"
        autoPlay
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setIsLoaded(true)}
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        Your browser does not support the video protocol.
      </video>

      <AnimatePresence>
        {showControls && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/70 pointer-events-none"
            />

            {/* Top Bar */}
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="absolute top-0 left-0 right-0 p-8 flex items-center justify-between z-10"
            >
              <button 
                onClick={() => router.back()}
                className="flex items-center gap-6 text-white group/back"
              >
                <div className="w-14 h-14 rounded-full glass flex items-center justify-center group-hover/back:bg-white/20 transition-all border-white/5">
                  <ArrowLeft className="w-7 h-7 group-hover/back:-translate-x-1 transition-transform" />
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="text-[10px] text-white/50 uppercase tracking-[0.4em] font-black">Syncing Node</span>
                  <span className="text-3xl font-headline font-bold text-glow tracking-tighter">{movie.title}</span>
                </div>
              </button>

              <div className="flex items-center gap-6">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-14 h-14 rounded-full glass flex items-center justify-center text-white/60 hover:text-white transition-all border-white/5">
                      <Settings className="w-7 h-7" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="glass border-white/10 text-white w-72 mt-6 rounded-[2.5rem] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)]" align="end">
                    <DropdownMenuLabel className="font-headline font-bold uppercase tracking-[0.3em] text-[10px] text-primary px-4 py-2">Neural Settings</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10 mx-2" />
                    
                    <DropdownMenuLabel className="text-[10px] text-white/30 uppercase tracking-widest mt-4 px-4">Bitrate (Quality)</DropdownMenuLabel>
                    {["4K ULTRA HDR", "1080P FULL HD", "720P SD"].map(q => (
                      <DropdownMenuItem key={q} onClick={() => setQuality(q)} className="rounded-2xl flex justify-between cursor-pointer py-3 px-4 hover:bg-white/5">
                        <span className={cn("font-bold text-sm", quality === q ? "text-primary" : "text-white/60")}>{q}</span>
                        {quality === q && <Check className="w-4 h-4 text-primary" />}
                      </DropdownMenuItem>
                    ))}

                    <DropdownMenuSeparator className="bg-white/10 mx-2 mt-4" />
                    <DropdownMenuLabel className="text-[10px] text-white/30 uppercase tracking-widest mt-4 px-4">Language Protocol</DropdownMenuLabel>
                    {["English (Neural)", "Spanish (Castilian)", "Japanese (Original)"].map(l => (
                      <DropdownMenuItem key={l} onClick={() => setLanguage(l)} className="rounded-2xl flex justify-between cursor-pointer py-3 px-4 hover:bg-white/5">
                        <span className={cn("font-bold text-sm", language === l ? "text-primary" : "text-white/60")}>{l}</span>
                        {language === l && <Check className="w-4 h-4 text-primary" />}
                      </DropdownMenuItem>
                    ))}

                    <DropdownMenuSeparator className="bg-white/10 mx-2 mt-4" />
                    <DropdownMenuItem className="rounded-2xl flex justify-between cursor-pointer py-4 px-4 group" onClick={() => {
                      const speeds = [1, 1.25, 1.5, 2];
                      const next = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
                      setPlaybackSpeed(next);
                      if (videoRef.current) videoRef.current.playbackRate = next;
                    }}>
                      <span className="font-bold text-sm text-white/60 group-hover:text-white">Playback Speed</span>
                      <span className="text-primary font-black">{playbackSpeed}x</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>

            {/* Central Play/Skip Controls */}
            <div className="absolute inset-0 flex items-center justify-center gap-24 pointer-events-none">
              {!isPlaying && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-16 pointer-events-auto"
                >
                  <button onClick={() => handleSkip(-10)} className="text-white/40 hover:text-white transition-all hover:scale-125">
                    <RotateCcw className="w-16 h-16" />
                  </button>
                  <button 
                    onClick={togglePlay}
                    className="w-32 h-32 rounded-full bg-white text-black flex items-center justify-center hover:bg-primary hover:text-white transition-all hover:scale-110 shadow-[0_0_80px_rgba(255,255,255,0.3)]"
                  >
                    <Play className="w-14 h-14 fill-current ml-2" />
                  </button>
                  <button onClick={() => handleSkip(10)} className="text-white/40 hover:text-white transition-all hover:scale-125">
                    <RotateCw className="w-16 h-16" />
                  </button>
                </motion.div>
              )}
            </div>

            {/* Bottom Controls */}
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 p-8 md:p-12 pt-24 z-10"
            >
              <div className="space-y-6 mb-10">
                <Slider
                  value={[progress]}
                  max={100}
                  step={0.01}
                  onValueChange={handleSeek}
                  className="cursor-pointer h-2"
                />
                <div className="flex justify-between text-white/40 font-black uppercase tracking-[0.3em] text-[10px]">
                  <span>{currentTime}</span>
                  <div className="flex items-center gap-6">
                    <span className="text-primary animate-pulse flex items-center gap-2">
                      <div className="w-1 h-1 bg-primary rounded-full" /> {quality}
                    </span>
                    <span>{duration}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-12">
                  <div className="flex items-center gap-8">
                    <button 
                      onClick={togglePlay} 
                      className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center hover:bg-primary hover:text-white transition-all hover:scale-110 shadow-2xl relative group/play"
                    >
                      {isPlaying ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current ml-1.5" />}
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-black rounded-full border-2 border-white/10 flex items-center justify-center text-[10px] font-black group-hover/play:border-primary group-hover/play:text-primary transition-all shadow-xl">N</div>
                    </button>
                    
                    <div className="flex items-center gap-6 group/vol w-52">
                      <button onClick={() => setIsMuted(!isMuted)} className="text-white/40 hover:text-white transition-colors">
                        {isMuted || volume === 0 ? <VolumeX className="w-7 h-7" /> : <Volume2 className="w-7 h-7" />}
                      </button>
                      <Slider
                        value={[isMuted ? 0 : volume]}
                        max={100}
                        onValueChange={handleVolumeChange}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-8 text-white/30">
                    <button onClick={() => handleSkip(-10)} className="hover:text-white transition-all hover:scale-110"><RotateCcw className="w-8 h-8" /></button>
                    <button onClick={() => handleSkip(10)} className="hover:text-white transition-all hover:scale-110"><RotateCw className="w-8 h-8" /></button>
                  </div>
                </div>

                <div className="flex items-center gap-10">
                  <button 
                    onClick={() => setSubtitle(prev => prev === "Off" ? "English" : "Off")} 
                    className={cn(
                      "flex items-center gap-2 px-6 py-3 rounded-2xl glass border border-white/5 transition-all text-[10px] font-black uppercase tracking-widest",
                      subtitle !== "Off" ? "text-primary border-primary/40 bg-primary/5" : "text-white/40 hover:text-white"
                    )}
                  >
                    <Subtitles className="w-5 h-5" />
                    {subtitle !== "Off" ? "Neural Subtitles" : "Subtitles"}
                  </button>
                  <button 
                    onClick={toggleFullScreen} 
                    className="w-14 h-14 rounded-full glass border-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all hover:scale-125"
                  >
                    {isFullscreen ? <Minimize className="w-8 h-8" /> : <Maximize className="w-8 h-8" />}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
