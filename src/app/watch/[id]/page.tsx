
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Maximize, 
  SkipForward, 
  Settings, 
  Subtitles, 
  Languages,
  FastForward
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MOCK_MOVIES } from "@/app/lib/mock-data";
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

export default function VideoPlayer() {
  const router = useRouter();
  const { id } = useParams();
  const movie = MOCK_MOVIES.find(m => m.id === id) || MOCK_MOVIES[0];

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [showNextEpisode, setShowNextEpisode] = useState(false);

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
        const percent = (current / total) * 100;
        setProgress(percent);
        
        // Skip intro logic (show between 10s and 40s)
        setShowSkipIntro(current > 10 && current < 40);
        
        // Next episode logic (show after 80%)
        setShowNextEpisode(percent > 80);
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

  const skipForward = () => {
    if (videoRef.current) videoRef.current.currentTime += 10;
  };

  const skipBackward = () => {
    if (videoRef.current) videoRef.current.currentTime -= 10;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

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

  return (
    <div className="fixed inset-0 bg-black z-[200] flex items-center justify-center group overflow-hidden select-none">
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

      {/* Cinematic Gradient Overlays */}
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
                <div className="flex flex-col items-start">
                  <span className="text-xs text-white/50 uppercase tracking-widest font-bold">Watching {movie.type === 'show' ? 'Series' : 'Movie'}</span>
                  <span className="text-2xl font-headline font-bold text-glow">{movie.title}</span>
                </div>
              </button>

              <div className="flex items-center gap-6">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-12 h-12 rounded-full glass flex items-center justify-center text-white/60 hover:text-white transition-all">
                      <Settings className="w-6 h-6" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="glass border-white/10 text-white w-56" align="end">
                    <DropdownMenuLabel>Playback Settings</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem className="hover:bg-white/10 cursor-pointer flex justify-between" onClick={() => {
                      const newSpeed = playbackSpeed === 2 ? 1 : playbackSpeed + 0.5;
                      setPlaybackSpeed(newSpeed);
                      if (videoRef.current) videoRef.current.playbackRate = newSpeed;
                    }}>
                      Speed <span>{playbackSpeed}x</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-white/10 cursor-pointer flex justify-between">
                      Quality <span>1080p HD</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="w-px h-6 bg-white/20" />
                <span className="text-white font-headline font-bold text-xl tracking-tighter">HD</span>
              </div>
            </motion.div>

            {/* Bottom Controls */}
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 p-8 pt-20 z-10"
            >
              {/* Progress Bar */}
              <div className="space-y-4 mb-8">
                <Slider
                  value={[progress]}
                  max={100}
                  step={0.1}
                  onValueChange={handleSeek}
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-white/60 font-mono text-sm">
                  <span>{currentTime}</span>
                  <span>{duration}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <button 
                    onClick={togglePlay} 
                    className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:bg-primary hover:text-white transition-all hover:scale-110 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                  >
                    {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
                  </button>
                  
                  <div className="flex items-center gap-4">
                    <button onClick={skipBackward} className="text-white/60 hover:text-white transition-colors">
                      <RotateCcw className="w-6 h-6" />
                    </button>
                    <button onClick={skipForward} className="text-white/60 hover:text-white transition-colors">
                      <RotateCw className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 group/vol w-40">
                    <button 
                      onClick={() => {
                        const newMute = !isMuted;
                        setIsMuted(newMute);
                        if (videoRef.current) videoRef.current.muted = newMute;
                      }}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                    </button>
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      max={100}
                      step={1}
                      onValueChange={handleVolumeChange}
                      className="w-full opacity-0 group-hover/vol:opacity-100 transition-opacity"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <button className="text-white/60 hover:text-white transition-colors">
                    <Subtitles className="w-6 h-6" />
                  </button>
                  <button className="text-white/60 hover:text-white transition-colors">
                    <Languages className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={toggleFullscreen}
                    className="text-white/60 hover:text-white transition-colors hover:scale-110"
                  >
                    <Maximize className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Action Buttons */}
      <AnimatePresence>
        {showSkipIntro && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="absolute right-10 bottom-40 z-20"
          >
            <Button 
              onClick={() => {
                if (videoRef.current) videoRef.current.currentTime = 40;
                setShowSkipIntro(false);
              }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-none px-8 py-6 text-lg font-bold hover:bg-white/20 transition-all hover:scale-105 group"
            >
              <SkipForward className="w-5 h-5 mr-3 group-hover:translate-x-1 transition-transform" /> Skip Intro
            </Button>
          </motion.div>
        )}

        {showNextEpisode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute right-10 bottom-40 z-20"
          >
            <Button 
              className="bg-primary hover:bg-primary/90 text-white rounded-none px-10 py-8 text-xl font-bold neon-glow-primary group"
              onClick={() => router.push(`/watch/${MOCK_MOVIES[Math.floor(Math.random() * MOCK_MOVIES.length)].id}`)}
            >
              Next Episode <FastForward className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cinema Curtain Effect on load */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 bg-background z-[300] origin-left"
      />
    </div>
  );
}

