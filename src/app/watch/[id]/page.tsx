
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Maximize, SkipForward, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MOCK_MOVIES } from "@/app/lib/mock-data";
import { Progress } from "@/components/ui/progress";

export default function VideoPlayer() {
  const router = useRouter();
  const { id } = useParams();
  const movie = MOCK_MOVIES.find(m => m.id === id) || MOCK_MOVIES[0];

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
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

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && isFinite(videoRef.current.duration)) {
      const { left, width } = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - left;
      const percentage = Math.max(0, Math.min(1, clickX / width));
      videoRef.current.currentTime = percentage * videoRef.current.duration;
    }
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-[200] flex items-center justify-center group overflow-hidden">
      <video
        ref={videoRef}
        src={movie.videoUrl}
        className="w-full h-full"
        autoPlay
        onTimeUpdate={handleTimeUpdate}
        onClick={togglePlay}
      />

      {/* Overlays */}
      <AnimatePresence>
        {showControls && (
          <>
            {/* Top Bar */}
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="absolute top-0 left-0 right-0 p-8 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent pointer-events-auto"
            >
              <button 
                onClick={() => router.back()}
                className="flex items-center gap-4 text-white group/back"
              >
                <ArrowLeft className="w-8 h-8 group-hover/back:-translate-x-2 transition-transform" />
                <div className="flex flex-col items-start">
                  <span className="text-xs text-white/50 uppercase tracking-widest font-bold">Back to browse</span>
                  <span className="text-xl font-headline font-bold">{movie.title}</span>
                </div>
              </button>
              <div className="flex items-center gap-6">
                <Settings className="w-6 h-6 text-white/60 hover:text-white cursor-pointer" />
                <div className="w-px h-6 bg-white/20" />
                <span className="text-white font-headline font-bold">HD</span>
              </div>
            </motion.div>

            {/* Bottom Controls */}
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 p-8 pt-20 bg-gradient-to-t from-black/80 to-transparent pointer-events-auto"
            >
              {/* Progress Bar */}
              <div 
                className="relative h-1 w-full bg-white/20 rounded-full mb-8 cursor-pointer group/progress"
                onClick={handleSeek}
              >
                <div 
                  className="absolute left-0 top-0 h-full bg-primary neon-glow-primary rounded-full"
                  style={{ width: `${progress}%` }}
                />
                <div 
                  className="absolute h-4 w-4 bg-primary rounded-full top-1/2 -translate-y-1/2 -translate-x-1/2 opacity-0 group-hover/progress:opacity-100 transition-opacity"
                  style={{ left: `${progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <button onClick={togglePlay} className="text-white hover:text-primary transition-colors">
                    {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current" />}
                  </button>
                  <button className="text-white hover:text-white/80"><RotateCcw className="w-6 h-6" /></button>
                  <button className="text-white hover:text-white/80"><RotateCw className="w-6 h-6" /></button>
                  <div className="flex items-center gap-4 group/vol">
                    <button onClick={() => setIsMuted(!isMuted)}>
                      {isMuted ? <VolumeX className="text-white" /> : <Volume2 className="text-white" />}
                    </button>
                    <div className="w-20 h-1 bg-white/20 rounded-full overflow-hidden">
                      <div className="w-2/3 h-full bg-white" />
                    </div>
                  </div>
                  <span className="text-white/60 font-mono text-sm tracking-tighter">
                    {currentTime} / {duration}
                  </span>
                </div>

                <div className="flex items-center gap-6">
                  <button className="flex items-center gap-2 glass px-4 py-2 rounded-lg text-white font-bold text-sm hover:bg-white/10">
                    <SkipForward className="w-4 h-4" /> Skip Intro
                  </button>
                  <button className="text-white hover:text-white/80"><Maximize className="w-6 h-6" /></button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Cinema Curtain Effect on load */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 bg-background z-[300] origin-left"
      />
    </div>
  );
}
