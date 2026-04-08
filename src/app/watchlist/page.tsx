
"use client";

import React from "react";
import { ReplicaNavbar } from "@/components/ReplicaNavbar";
import { MovieCard } from "@/components/MovieCard";
import { motion } from "framer-motion";
import { Ghost, Loader2, CreditCard, ShieldCheck, Zap, User, PlusCircle, AlertCircle } from "lucide-react";
import { useCollection, useFirestore, useUser, useMemoFirebase, useDoc } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function WatchlistItem({ contentId }: { contentId: string }) {
  const firestore = useFirestore();
  const contentRef = useMemoFirebase(() => {
    if (!firestore || !contentId) return null;
    return doc(firestore, "content", contentId);
  }, [firestore, contentId]);

  const { data: movie } = useDoc(contentRef);

  if (!movie) return (
    <div className="aspect-[2/3] w-full rounded-2xl shimmer-container" />
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <MovieCard movie={movie} />
    </motion.div>
  );
}

export default function WatchlistPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const activeProfileId = typeof window !== 'undefined' ? localStorage.getItem('replica_active_profile') : null;

  const accountRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, "userAccounts", user.uid);
  }, [firestore, user]);

  const { data: accountData } = useDoc(accountRef);

  const watchlistRef = useMemoFirebase(() => {
    if (!firestore || !user || !activeProfileId) return null;
    return collection(firestore, "userAccounts", user.uid, "userProfiles", activeProfileId, "watchlistItems");
  }, [firestore, user, activeProfileId]);

  const { data: watchlist, isLoading } = useCollection(watchlistRef);

  if (isUserLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <span className="font-headline font-bold text-white tracking-widest uppercase text-xs">Accessing Nexus</span>
        </div>
      </div>
    );
  }

  const isFree = accountData?.subscriptionTier === 'free';
  const slotsRemaining = isFree ? Math.max(0, 2 - (watchlist?.length || 0)) : Infinity;

  return (
    <main className="min-h-screen bg-background text-foreground pt-36 pb-32">
      <ReplicaNavbar />
      
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 space-y-24">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 border-b border-white/5 pb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-primary font-black uppercase tracking-[0.4em] text-[10px]">
              <div className="w-8 h-[1px] bg-primary" />
              Identity Tier: {isFree ? "Free Node" : "Pro Core"}
            </div>
            <h1 className="text-6xl md:text-8xl font-headline font-bold text-white tracking-tighter leading-none">
              Account <span className="text-primary text-glow">Nexus</span>
            </h1>
            <p className="text-white/40 text-xl max-w-2xl font-medium">Manage your synchronized experiences and neural subscription protocols.</p>
          </div>
          
          <div className="flex gap-6">
            <div className="p-8 rounded-[2.5rem] glass border border-white/5 text-center min-w-[160px] space-y-2 hover:border-primary/50 transition-colors">
              <div className="text-primary font-black text-4xl font-headline">{watchlist?.length || 0}</div>
              <div className="text-[10px] text-white/40 uppercase font-black tracking-widest">Linked Syncs</div>
            </div>
            <div className={`p-8 rounded-[2.5rem] glass border ${isFree ? 'border-white/5' : 'border-primary/20 bg-primary/5'} text-center min-w-[160px] space-y-2`}>
              <div className={`text-white font-black text-4xl font-headline italic ${!isFree && 'text-glow'}`}>{isFree ? 'FREE' : 'PRO'}</div>
              <div className="text-[10px] text-primary uppercase font-black tracking-widest">Active Plan</div>
            </div>
          </div>
        </div>

        {/* Watchlist Section */}
        <div className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-2 h-10 bg-primary rounded-full neon-glow-primary" />
              <h2 className="text-4xl font-headline font-bold text-white tracking-tight">
                Synchronized <span className="text-white/30">Watchlist</span>
              </h2>
            </div>
            
            {isFree && (
              <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-widest">
                <AlertCircle className="w-4 h-4" /> {slotsRemaining} Slots Remaining in Free Matrix
              </div>
            )}
          </div>
          
          {watchlist && watchlist.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
              {watchlist.map((item) => (
                <WatchlistItem key={item.id} contentId={item.contentId} />
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-32 text-center space-y-8 glass rounded-[4rem] border border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent"
            >
              <div className="w-32 h-32 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10">
                <Ghost className="w-16 h-16 text-white/10" />
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-headline font-bold text-white">Your list is currently a void</h3>
                <p className="text-white/40 text-lg">Synchronize content to your personal nexus for instant cross-device access.</p>
              </div>
              <Link href="/">
                <Button size="lg" className="bg-primary hover:bg-primary/90 rounded-full px-12 py-8 text-xl font-bold neon-glow-primary active:scale-95 transition-all mt-4">
                  <PlusCircle className="w-6 h-6 mr-3" /> Explore Matrix
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
