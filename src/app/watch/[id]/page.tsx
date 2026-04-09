
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, Loader2, Info, RotateCcw, RotateCw, Subtitles, Activity, Check, AlertTriangle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { MOCK_MOVIES } from "@/app/lib/mock-data";
import { cn } from "@/lib/utils";

import { useToast } from "@/hooks/use-toast";

export default function VideoPlayer() {
  const router = useRouter();
  const { id } = useParams();
  const firestore = useFirestore();
  const { toast } = useToast();

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
  const [quality, setQuality] = useState(movie?.quality || "4K ULTRA HDR");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<{title: string, detail: string} | null>(null);
  const [hasIncrementedView, setHasIncrementedView] = useState(false);

  useEffect(() => {
    if (isPlaying && !hasIncrementedView && firestore && id) {
      setHasIncrementedView(true);
      const incrementView = async () => {
        try {
          const { increment, updateDoc } = await import("firebase/firestore");
          const ref = doc(firestore, "content", id as string);
          await updateDoc(ref, {
            views: increment(1),
            weeklyViews: increment(1),
            updatedAt: new Date().toISOString()
          });
        } catch (e) {
          console.warn("View Sync Failed:", e);
        }
      };
      incrementView();
    }
  }, [isPlaying, hasIncrementedView, firestore, id]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const hideControls = () => setShowControls(false);
    const resetTimer = () => {
      setShowControls(true);
      clearTimeout(timer);
      timer = setTimeout(hideControls, 3000);
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("touchstart", resetTimer);
    resetTimer();

    return () => {
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("touchstart", resetTimer);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (videoRef.current && movie?.videoUrl) {
      setError(null);
      videoRef.current.load();
    }
  }, [movie?.videoUrl]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.error("Playback Authorization Denied:", err);
          setError({
            title: "NEURAL LINK INTERRUPTED",
            detail: "Browser restricted automatic synchronization. Manual override required."
          });
        });
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleSkip = (seconds: number) => {
    if (videoRef.current) videoRef.current.currentTime += seconds;
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
      if (isFinite(total) && total > 0) setProgress((current / total) * 100);
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

  const handleVideoError = () => {
    const video = videoRef.current;
    if (!video) return;
    
    let detail = "The cinematic protocol failed to initialize.";
    if (video.error?.code === 4) detail = "Media source unreachable or codec protocol unsupported.";
    else if (video.error?.code === 3) detail = "Decoding pipeline failed during transmission.";
    
    setError({
      title: "HARDWARE DECRYPTION ERROR",
      detail: detail
    });
  };

  if (isMovieLoading) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[500] gap-6">
        <Loader2 className="w-16 h-16 text-primary animate-spin" />
        <p className="text-white/20 uppercase tracking-[0.5em] font-black text-xs">Synchronizing Protocol</p>
      </div>
    );
  }

  if (!movie || error) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[500] text-white p-8 text-center">
        <div className="relative mb-12">
          <Activity className="w-24 h-24 text-destructive animate-pulse" />
          <div className="absolute inset-0 bg-destructive/20 blur-3xl rounded-full" />
        </div>
        <div className="space-y-4 max-w-md">
          <h2 className="text-3xl md:text-4xl font-headline font-bold uppercase tracking-tighter text-glow-destructive">
            {error?.title || "Signal Interrupted"}
          </h2>
          <p className="text-white/40 font-medium leading-relaxed">
            {error?.detail || "The requested identifier is not synchronized with the nexus."}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mt-16 w-full max-w-sm">
          <Button 
            onClick={() => window.location.reload()} 
            className="flex-1 bg-white text-black hover:bg-primary hover:text-white h-16 rounded-2xl font-bold uppercase tracking-widest text-xs"
          >
            Retry Sequence
          </Button>
          <Button 
            variant="outline"
            onClick={() => router.push("/")} 
            className="flex-1 glass border-white/10 text-white h-16 rounded-2xl font-bold uppercase tracking-widest text-xs"
          >
            Return to Nexus
          </Button>
        </div>
        <div className="mt-12 p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3 text-white/20 text-[10px] font-black uppercase tracking-widest">
          <AlertTriangle className="w-4 h-4" />
          Neural Diagnostic: Source_Code_{videoRef.current?.error?.code || 'Null'}
        </div>
      </div>
    );
  }

  return (
    <div ref={playerContainerRef} className="fixed inset-0 bg-black z-[200] flex items-center justify-center group overflow-hidden">
      <video
        ref={videoRef}
        src={movie.videoUrl}
        className="w-full h-full transition-all duration-700"
        style={{
          filter: quality === "720P HD" ? "brightness(0.9) contrast(1.1)" :
                  quality === "480P SD" ? "blur(1.5px) brightness(0.8) contrast(1.2)" :
                  quality === "360P MOBILE" ? "blur(4px) brightness(0.7) contrast(1.3) grayscale(0.2)" :
                  "none"
        }}
        onTimeUpdate={handleTimeUpdate}
        onClick={togglePlay}
        onError={handleVideoError}
        playsInline
        preload="metadata"
        controlsList="nodownload"
      />

      <AnimatePresence>
        {(!isPlaying || showControls) && (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/70 pointer-events-none" />
            
            {/* Header Controls */}
            <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute top-0 left-0 right-0 p-8 flex items-center justify-between z-50">
              <button onClick={() => router.back()} className="flex items-center gap-6 text-white group">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full glass flex items-center justify-center group-hover:scale-110 transition-all">
                  <ArrowLeft className="w-6 h-6 md:w-7 md:h-7" />
                </div>
                <span className="text-xl md:text-3xl font-headline font-bold text-glow hidden sm:block">{movie.title}</span>
              </button>
              <div className="flex items-center gap-4 md:gap-6">
                <button 
                  onClick={() => router.push(`/content/${movie.id}`)}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full glass flex items-center justify-center text-white/60 hover:text-white transition-all"
                >
                  <Info className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-10 h-10 md:w-12 md:h-12 rounded-full glass flex items-center justify-center text-white/60 hover:text-white transition-all">
                      <Settings className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="glass border-white/10 text-white w-56 z-[300]" align="end">
                    <DropdownMenuLabel>Playback Sync</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem className="hover:bg-white/10 cursor-pointer flex justify-between" onClick={() => {
                      const speeds = [1, 1.25, 1.5, 2];
                      const next = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
                      setPlaybackSpeed(next);
                      if (videoRef.current) videoRef.current.playbackRate = next;
                    }}>
                      Neural Speed <span>{playbackSpeed}x</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-white/40">Stream Quality</DropdownMenuLabel>
                    {["1080P FULL HD", "720P HD", "480P SD", "360P MOBILE"].map((q) => (
                      <DropdownMenuItem 
                        key={q} 
                        className={`hover:bg-white/10 cursor-pointer flex justify-between group/q ${quality === q ? 'text-primary' : 'text-white/70'}`}
                        onClick={() => {
                          setQuality(q);
                          toast({ 
                            title: "Quality Adjusted", 
                            description: `Stream synchronized to ${q}.`,
                          });
                        }}
                      >
                        {q}
                        {quality === q && <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_#FF2E63]" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>

            {/* Central Play Button (Initial/Paused State) */}
            <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
              {!isPlaying && (
                <button 
                  onClick={togglePlay} 
                  className="pointer-events-auto w-24 h-24 md:w-32 md:h-32 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 shadow-2xl transition-transform active:scale-95"
                >
                  <Play className="w-10 h-10 md:w-14 md:h-14 fill-current ml-2" />
                </button>
              )}
            </div>

            {/* Footer Controls */}
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute bottom-0 left-0 right-0 p-6 md:p-12 pt-24 z-50">
              <Slider 
                value={[progress]} 
                max={100} 
                step={0.01} 
                onValueChange={(v) => { if (videoRef.current) videoRef.current.currentTime = (v[0] / 100) * videoRef.current.duration; }} 
                className="h-1.5 mb-6 md:mb-8 cursor-pointer" 
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 md:gap-8">
                  <button onClick={togglePlay} className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 shadow-xl transition-transform">
                    {isPlaying ? <Pause className="w-6 h-6 md:w-10 md:h-10 fill-current" /> : <Play className="w-6 h-6 md:w-10 md:h-10 fill-current ml-1.5" />}
                  </button>
                  <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-6 text-white/40 font-black text-[10px] tracking-widest uppercase">
                    <span>{currentTime} / {duration}</span>
                    <span className="hidden md:block w-1 h-1 rounded-full bg-white/10" />
                    <span className="text-primary/60">{quality}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 md:gap-8">
                  <button onClick={() => handleSkip(-10)} className="text-white/40 hover:text-white transition-colors"><RotateCcw className="w-6 h-6 md:w-8 md:h-8" /></button>
                  <button onClick={() => handleSkip(10)} className="text-white/40 hover:text-white transition-colors"><RotateCw className="w-6 h-6 md:w-8 md:h-8" /></button>
                  <button onClick={toggleFullScreen} className="text-white/40 hover:text-white transition-colors">
                    {isFullscreen ? <Minimize className="w-6 h-6 md:w-8 md:h-8" /> : <Maximize className="w-6 h-6 md:w-8 md:h-8" />}
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
