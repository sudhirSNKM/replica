
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
  Languages,
  HighDefinition,
  Subtitles
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
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Streaming Settings
  const [quality, setQuality] = useState("4K ULTRA HDR");
  const [language, setLanguage] = useState("English (Neural)");
  const [subtitle, setSubtitle] = useState("Off");

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
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
  }, [isPlaying]);

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
      <div className="fixed inset-0 bg-black flex items-center justify-center z-[500]">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[500] text-white p-6">
        <p className="text-2xl mb-4 font-headline font-bold text-glow uppercase tracking-widest">Media Protocol Missing</p>
        <Button onClick={() => router.push("/")} className="bg-primary hover:neon-glow-primary rounded-xl px-10 py-6 font-bold uppercase tracking-widest text-xs">
          Return to Portal
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
        ref={videoRef}
        src={movie.videoUrl}
        className="w-full h-full cursor-pointer"
        autoPlay
        onTimeUpdate={handleTimeUpdate}
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

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
                className="flex items-center gap-4 text-white group/back"
              >
                <div className="w-12 h-12 rounded-full glass flex items-center justify-center group-hover/back:bg-white/20 transition-all">
                  <ArrowLeft className="w-6 h-6 group-hover/back:-translate-x-1 transition-transform" />
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="text-[10px] text-white/50 uppercase tracking-[0.3em] font-black">Watching</span>
                  <span className="text-2xl font-headline font-bold text-glow tracking-tight">{movie.title}</span>
                </div>
              </button>

              <div className="flex items-center gap-6">
                <button 
                  onClick={() => router.push(`/content/${movie.id}`)}
                  className="w-12 h-12 rounded-full glass flex items-center justify-center text-white/60 hover:text-white transition-all"
                >
                  <Info className="w-6 h-6" />
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-12 h-12 rounded-full glass flex items-center justify-center text-white/60 hover:text-white transition-all">
                      <Settings className="w-6 h-6" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="glass border-white/10 text-white w-64 mt-4 rounded-3xl" align="end">
                    <DropdownMenuLabel className="font-headline font-bold uppercase tracking-widest text-[10px]">Neural Sync Settings</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10" />
                    
                    <DropdownMenuLabel className="text-[10px] text-white/40 uppercase mt-2">Quality</DropdownMenuLabel>
                    {["4K ULTRA HDR", "1080P HD", "720P SD"].map(q => (
                      <DropdownMenuItem key={q} onClick={() => setQuality(q)} className="rounded-xl flex justify-between cursor-pointer">
                        {q} {quality === q && <div className="w-1.5 h-1.5 bg-primary rounded-full" />}
                      </DropdownMenuItem>
                    ))}

                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuLabel className="text-[10px] text-white/40 uppercase mt-2">Language Protocol</DropdownMenuLabel>
                    {["English (Neural)", "Spanish", "Japanese"].map(l => (
                      <DropdownMenuItem key={l} onClick={() => setLanguage(l)} className="rounded-xl flex justify-between cursor-pointer">
                        {l} {language === l && <div className="w-1.5 h-1.5 bg-primary rounded-full" />}
                      </DropdownMenuItem>
                    ))}

                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem className="rounded-xl flex justify-between cursor-pointer" onClick={() => {
                      const speeds = [1, 1.25, 1.5, 2];
                      const next = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
                      setPlaybackSpeed(next);
                      if (videoRef.current) videoRef.current.playbackRate = next;
                    }}>
                      Playback Speed <span>{playbackSpeed}x</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>

            {/* Central Play/Skip Controls (Visible on hover/pause) */}
            <div className="absolute inset-0 flex items-center justify-center gap-16 pointer-events-none">
              {!isPlaying && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-12 pointer-events-auto"
                >
                  <button onClick={() => handleSkip(-10)} className="text-white/60 hover:text-white transition-all hover:scale-110">
                    <RotateCcw className="w-12 h-12" />
                  </button>
                  <button 
                    onClick={togglePlay}
                    className="w-24 h-24 rounded-full bg-white text-black flex items-center justify-center hover:bg-primary hover:text-white transition-all hover:scale-110 shadow-[0_0_50px_rgba(255,255,255,0.4)]"
                  >
                    <Play className="w-10 h-10 fill-current ml-1" />
                  </button>
                  <button onClick={() => handleSkip(10)} className="text-white/60 hover:text-white transition-all hover:scale-110">
                    <RotateCw className="w-12 h-12" />
                  </button>
                </motion.div>
              )}
            </div>

            {/* Bottom Controls */}
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 p-8 pt-20 z-10"
            >
              <div className="space-y-4 mb-8">
                <Slider
                  value={[progress]}
                  max={100}
                  step={0.1}
                  onValueChange={handleSeek}
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-white/40 font-bold uppercase tracking-widest text-[10px]">
                  <span>{currentTime}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-primary">{quality}</span>
                    <span>{duration}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-10">
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={togglePlay} 
                      className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:bg-primary hover:text-white transition-all hover:scale-110 shadow-xl group/btn relative"
                    >
                      {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                      <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-black rounded-full border border-white/20 flex items-center justify-center text-[10px] font-black group-hover/btn:border-primary transition-colors">N</div>
                    </button>
                    
                    <div className="flex items-center gap-4 group/vol w-44">
                      <button onClick={() => setIsMuted(!isMuted)} className="text-white/60 hover:text-white transition-colors">
                        {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                      </button>
                      <Slider
                        value={[isMuted ? 0 : volume]}
                        max={100}
                        onValueChange={handleVolumeChange}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-white/40">
                    <button onClick={() => handleSkip(-10)} className="hover:text-white transition-colors"><RotateCcw className="w-6 h-6" /></button>
                    <button onClick={() => handleSkip(10)} className="hover:text-white transition-colors"><RotateCw className="w-6 h-6" /></button>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <button onClick={() => setSubtitle(prev => prev === "Off" ? "English" : "Off")} className={subtitle !== "Off" ? "text-primary" : "text-white/40 hover:text-white"}>
                    <Subtitles className="w-6 h-6" />
                  </button>
                  <button onClick={toggleFullScreen} className="text-white/40 hover:text-white transition-all hover:scale-110">
                    {isFullscreen ? <Minimize className="w-7 h-7" /> : <Maximize className="w-7 h-7" />}
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

