
"use client";

import React from "react";
import { ReplicaNavbar } from "@/components/ReplicaNavbar";
import { MovieCard } from "@/components/MovieCard";
import { MovieRow } from "@/components/MovieRow";
import { Movie } from "@/lib/types";
import { motion } from "framer-motion";
import { Ghost, Loader2, Clock, History as HistoryIcon, Trophy, CreditCard, ShieldCheck, Zap, ArrowRight, User } from "lucide-react";
import { useCollection, useFirestore, useUser, useMemoFirebase, useDoc } from "@/firebase";
import { collection, doc } from "firebase/firestore";

function WatchlistItem({ itemId, contentId }: { itemId: string, contentId: string }) {
  const firestore = useFirestore();
  const contentRef = useMemoFirebase(() => {
    if (!firestore || !contentId) return null;
    return doc(firestore, "content", contentId);
  }, [firestore, contentId]);

  const { data: movie } = useDoc(contentRef);

  if (!movie) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <MovieCard movie={movie} />
    </motion.div>
  );
}

export default function WatchlistPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const activeProfileId = "default-profile";

  const watchlistRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, "users", user.uid, "profiles", activeProfileId, "watchlist");
  }, [firestore, user]);

  const { data: watchlist, isLoading } = useCollection(watchlistRef);

  if (isUserLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

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
              <div className="text-primary font-bold text-2xl">{watchlist?.length || 0}</div>
              <div className="text-[10px] text-white/40 uppercase font-black tracking-widest">In List</div>
            </div>
            <div className="p-4 rounded-2xl glass border border-primary/20 text-center min-w-[120px] bg-primary/5">
              <div className="text-white font-bold text-2xl font-headline italic">PRO</div>
              <div className="text-[10px] text-primary uppercase font-black tracking-widest">Tier</div>
            </div>
          </div>
        </div>

        {/* Watchlist Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-headline font-bold text-white tracking-tight flex items-center gap-3">
              <div className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
              My <span className="text-white/40">Watchlist</span>
            </h2>
          </div>
          
          {watchlist && watchlist.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
              {watchlist.map((item) => (
                <WatchlistItem key={item.id} itemId={item.id} contentId={item.contentId} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center space-y-6 glass rounded-[40px] border border-white/5">
              <Ghost className="w-20 h-20 text-white/10 mx-auto" />
              <div className="space-y-2">
                <h3 className="text-2xl font-headline font-bold text-white">Your list is a void</h3>
                <p className="text-white/40">Synchronize content to your nexus for instant access.</p>
              </div>
              <button onClick={() => window.location.href = '/'} className="bg-primary text-white rounded-full px-8 py-3 font-bold hover:neon-glow-primary transition-all">
                Explore Library
              </button>
            </div>
          )}
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
              <p className="text-white/60 text-lg leading-relaxed">Your current neural bridge is active. Next synchronization payment will be processed soon.</p>
              
              <div className="flex flex-wrap gap-4">
                <button className="px-8 py-4 rounded-2xl bg-white text-black font-bold hover:neon-glow-primary transition-all">Update Billing</button>
                <button className="px-8 py-4 rounded-2xl glass border border-white/10 text-white font-bold hover:bg-white/5 transition-all">Cancel Synchronization</button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: 'Unlimited Sync', icon: Zap, desc: 'Zero latency streaming across all neural nodes.' },
                { title: 'Offline Matrix', icon: Trophy, desc: 'Store content in local cache.' }
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
