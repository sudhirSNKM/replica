
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, Loader2, Info, RotateCcw, RotateCw, Subtitles, Activity, Check 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (videoRef.current && movie?.videoUrl) {
      setError(null);
      videoRef.current.load();
    }
  }, [movie?.videoUrl]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(err => {
          console.error("Playback Error:", err);
          setError("Codec Sync Failed");
        });
        setIsPlaying(true);
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
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[500] text-white p-6">
        <Activity className="w-20 h-20 text-destructive mb-8 animate-pulse" />
        <p className="text-2xl font-headline font-bold uppercase tracking-widest">{error || "Signal Interrupted"}</p>
        <Button onClick={() => router.push("/")} className="mt-12 bg-primary px-12 h-16 rounded-2xl font-bold">Return to Nexus</Button>
      </div>
    );
  }

  return (
    <div ref={playerContainerRef} className="fixed inset-0 bg-black z-[200] flex items-center justify-center group overflow-hidden">
      <video
        ref={videoRef}
        src={movie.videoUrl}
        className="w-full h-full"
        autoPlay
        onTimeUpdate={handleTimeUpdate}
        onClick={togglePlay}
        onError={() => setError("Hardware Decryption Error")}
      />

      <AnimatePresence>
        {showControls && (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/70 pointer-events-none" />
            <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute top-0 left-0 right-0 p-8 flex items-center justify-between">
              <button onClick={() => router.back()} className="flex items-center gap-6 text-white">
                <div className="w-14 h-14 rounded-full glass flex items-center justify-center"><ArrowLeft className="w-7 h-7" /></div>
                <span className="text-3xl font-headline font-bold text-glow">{movie.title}</span>
              </button>
            </motion.div>

            <div className="absolute inset-0 flex items-center justify-center gap-24 pointer-events-none">
              {!isPlaying && (
                <button onClick={togglePlay} className="pointer-events-auto w-32 h-32 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 shadow-2xl">
                  <Play className="w-14 h-14 fill-current ml-2" />
                </button>
              )}
            </div>

            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute bottom-0 left-0 right-0 p-12 pt-24">
              <Slider value={[progress]} max={100} step={0.01} onValueChange={(v) => { if (videoRef.current) videoRef.current.currentTime = (v[0] / 100) * videoRef.current.duration; }} className="h-2 mb-6" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <button onClick={togglePlay} className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 shadow-xl">
                    {isPlaying ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current ml-1.5" />}
                  </button>
                  <div className="flex items-center gap-6 text-white/40 font-black text-[10px] tracking-widest uppercase">
                    <span>{currentTime} / {duration}</span>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <button onClick={() => handleSkip(-10)} className="text-white/40 hover:text-white"><RotateCcw className="w-8 h-8" /></button>
                  <button onClick={() => handleSkip(10)} className="text-white/40 hover:text-white"><RotateCw className="w-8 h-8" /></button>
                  <button onClick={toggleFullScreen} className="text-white/40 hover:text-white">{isFullscreen ? <Minimize className="w-8 h-8" /> : <Maximize className="w-8 h-8" />}</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
