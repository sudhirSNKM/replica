
"use client";

import React from "react";
import { ReplicaNavbar } from "@/components/ReplicaNavbar";
import { MovieCard } from "@/components/MovieCard";
import { motion } from "framer-motion";
import { Ghost, Loader2, CreditCard, ShieldCheck, Zap, User, PlusCircle } from "lucide-react";
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
  const activeProfileId = "default-profile";

  const watchlistRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, "users", user.uid, "profiles", activeProfileId, "watchlist");
  }, [firestore, user]);

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

  return (
    <main className="min-h-screen bg-background text-foreground pt-36 pb-32">
      <ReplicaNavbar />
      
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 space-y-24">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 border-b border-white/5 pb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-primary font-black uppercase tracking-[0.4em] text-[10px]">
              <div className="w-8 h-[1px] bg-primary" />
              User Protocol 8.2
            </div>
            <h1 className="text-6xl md:text-8xl font-headline font-bold text-white tracking-tighter leading-none">
              Account <span className="text-primary text-glow">Nexus</span>
            </h1>
            <p className="text-white/40 text-xl max-w-2xl font-medium">Manage your synchronized experiences, neural viewing history, and core subscription protocols.</p>
          </div>
          
          <div className="flex gap-6">
            <div className="p-8 rounded-[2.5rem] glass border border-white/5 text-center min-w-[160px] space-y-2 hover:border-primary/50 transition-colors">
              <div className="text-primary font-black text-4xl font-headline">{watchlist?.length || 0}</div>
              <div className="text-[10px] text-white/40 uppercase font-black tracking-widest">In List</div>
            </div>
            <div className="p-8 rounded-[2.5rem] glass border border-primary/20 text-center min-w-[160px] bg-primary/5 space-y-2">
              <div className="text-white font-black text-4xl font-headline italic">PRO</div>
              <div className="text-[10px] text-primary uppercase font-black tracking-widest">Active Tier</div>
            </div>
          </div>
        </div>

        {/* Watchlist Section */}
        <div className="space-y-12">
          <div className="flex items-center gap-6">
            <div className="w-2 h-10 bg-primary rounded-full neon-glow-primary" />
            <h2 className="text-4xl font-headline font-bold text-white tracking-tight">
              Synchronized <span className="text-white/30">Watchlist</span>
            </h2>
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

        {/* Subscription & Feature Section */}
        <div className="rounded-[4rem] p-10 md:p-20 relative overflow-hidden border border-white/10 glass bg-gradient-to-br from-primary/10 via-background/80 to-blue-900/10">
          <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
            <CreditCard className="w-96 h-96 rotate-12" />
          </div>
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/20 border border-primary/30 text-primary text-[10px] font-black tracking-[0.3em] uppercase">
                <ShieldCheck className="w-4 h-4" /> Neural Status: Active
              </div>
              <h2 className="text-5xl md:text-6xl font-headline font-bold text-white leading-tight tracking-tighter">
                Manage Your <span className="text-primary">Subscription</span> Protocols
              </h2>
              <p className="text-white/60 text-xl leading-relaxed max-w-xl">Your current neural bridge is high-fidelity. All synchronization protocols are running at zero latency.</p>
              
              <div className="flex flex-wrap gap-6">
                <Button className="h-16 px-10 rounded-3xl bg-white text-black font-black text-lg hover:bg-primary hover:text-white transition-all shadow-2xl">Update Billing</Button>
                <Button variant="outline" className="h-16 px-10 rounded-3xl glass border-white/10 text-white font-black text-lg hover:bg-white/5 transition-all">Cancel Synchronization</Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { title: 'Zero Latency', icon: Zap, desc: 'Unlimited streaming with instant neural loading.' },
                { title: 'Local Matrix', icon: User, desc: 'Synchronize content to your local cache for offline viewing.' }
              ].map((feature, i) => (
                <div key={i} className="p-10 rounded-[3rem] glass border border-white/5 space-y-6 hover:border-primary/40 transition-all hover:bg-white/[0.03] group">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-2xl font-bold text-white">{feature.title}</h4>
                    <p className="text-white/40 text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
