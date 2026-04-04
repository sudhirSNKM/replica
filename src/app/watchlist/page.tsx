
"use client";

import React, { useState, useEffect } from "react";
import { ReplicaNavbar } from "@/components/ReplicaNavbar";
import { MovieCard } from "@/components/MovieCard";
import { MovieRow } from "@/components/MovieRow";
import { MOCK_MOVIES } from "@/app/lib/mock-data";
import { Movie } from "@/lib/types";
import { motion } from "framer-motion";
import { Ghost, Clock, History as HistoryIcon, Trophy, CreditCard, ShieldCheck, Zap, ArrowRight, User } from "lucide-react";

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [lastSeen, setLastSeen] = useState<Movie[]>([]);
  const [history, setHistory] = useState<Movie[]>([]);

  useEffect(() => {
    setWatchlist(MOCK_MOVIES.slice(0, 3));
    setLastSeen(MOCK_MOVIES.slice(3, 5));
    setHistory([...MOCK_MOVIES].reverse().slice(0, 5));
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground pt-36 pb-32">
      <ReplicaNavbar />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-24">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-primary font-bold uppercase tracking-[0.3em] text-xs">
              <User className="w-4 h-4" /> User Protocol
            </div>
            <h1 className="text-5xl md:text-7xl font-headline font-bold text-white tracking-tighter">
              Account <span className="text-primary text-glow">Nexus</span>
            </h1>
            <p className="text-white/40 text-lg max-w-xl">Manage your synchronized experiences, viewing history, and neural subscription protocols.</p>
          </div>
          
          <div className="flex gap-4">
            <div className="p-4 rounded-2xl glass border border-white/5 text-center min-w-[120px]">
              <div className="text-primary font-bold text-2xl">24</div>
              <div className="text-[10px] text-white/40 uppercase font-black tracking-widest">Seen</div>
            </div>
            <div className="p-4 rounded-2xl glass border border-primary/20 text-center min-w-[120px] bg-primary/5">
              <div className="text-white font-bold text-2xl font-headline italic">PRO</div>
              <div className="text-[10px] text-primary uppercase font-black tracking-widest">Tier</div>
            </div>
          </div>
        </div>

        {/* Continue Watching Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-headline font-bold text-white tracking-tight flex items-center gap-3">
              <div className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
              Continue <span className="text-white/40">Watching</span>
            </h2>
          </div>
          <MovieRow title="" movies={watchlist} />
        </div>

        {/* Last Seen Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-headline font-bold text-white tracking-tight flex items-center gap-3">
              <div className="w-1.5 h-8 bg-orange-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.5)]" />
              Last <span className="text-white/40">Seen</span>
            </h2>
            <button className="text-white/40 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              Deep Scan <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {lastSeen.map(movie => (
              <div key={movie.id} className="space-y-3 group">
                <div className="aspect-video rounded-2xl overflow-hidden glass border border-white/5 relative">
                  <img src={movie.thumbnailUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={movie.title} />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/0 transition-colors" />
                  <div className="absolute bottom-0 left-0 h-1 bg-primary w-2/3 shadow-[0_0_10px_rgba(var(--primary),0.8)]" />
                </div>
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs font-bold text-white/80">{movie.title}</span>
                  <span className="text-[10px] text-white/40 uppercase">42m Left</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* History Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-headline font-bold text-white tracking-tight flex items-center gap-3">
              <div className="w-1.5 h-8 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
              Neural <span className="text-white/40">History</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {history.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </div>

        {/* Subscription Management Section */}
        <div className="rounded-[40px] p-8 md:p-16 relative overflow-hidden border border-white/10 glass bg-gradient-to-br from-primary/10 via-transparent to-blue-500/5">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <CreditCard className="w-64 h-64 rotate-12" />
          </div>
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-black tracking-widest uppercase">
                <ShieldCheck className="w-4 h-4" /> Tier: High-Fidelity (Active)
              </div>
              <h2 className="text-4xl md:text-5xl font-headline font-bold text-white leading-tight">
                Manage Your <span className="text-primary">Subscription</span> Protocols
              </h2>
              <p className="text-white/60 text-lg leading-relaxed">Your current neural bridge is active. Next synchronization payment will be processed on April 24, 2024.</p>
              
              <div className="flex flex-wrap gap-4">
                <button className="px-8 py-4 rounded-2xl bg-white text-black font-bold hover:neon-glow-primary transition-all">Update Billing</button>
                <button className="px-8 py-4 rounded-2xl glass border border-white/10 text-white font-bold hover:bg-white/5 transition-all">Cancel Synchronization</button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: 'Unlimited Sync', icon: Zap, desc: 'Zero latency streaming across all neural nodes.' },
                { title: 'Offline Matrix', icon: Trophy, desc: 'Store up to 100TB of content in local cache.' }
              ].map((feature, i) => (
                <div key={i} className="p-8 rounded-3xl glass border border-white/5 space-y-4 hover:border-primary/30 transition-colors">
                  <feature.icon className="w-8 h-8 text-primary" />
                  <h4 className="text-xl font-bold text-white">{feature.title}</h4>
                  <p className="text-white/40 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
