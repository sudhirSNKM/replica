
"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Play, 
  Share2, 
  Star, 
  Clock, 
  Calendar, 
  User, 
  Film,
  Info,
  ChevronLeft
} from "lucide-react";
import { ReplicaNavbar } from "@/components/ReplicaNavbar";
import { MovieRow } from "@/components/MovieRow";
import { WatchlistButton } from "@/components/WatchlistButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_MOVIES } from "@/app/lib/mock-data";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function ContentDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  const { toast } = useToast();
  const firestore = useFirestore();

  const contentRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, "content", id as string);
  }, [firestore, id]);

  const { data: firestoreMovie, isLoading } = useDoc(contentRef);
  const movie = firestoreMovie || MOCK_MOVIES.find(m => m.id === id);

  const relatedMovies = MOCK_MOVIES.filter(m => 
    m.id !== id && m.genres.some(g => movie?.genres.includes(g))
  ).slice(0, 8);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-white/20 uppercase tracking-[0.4em] font-black text-xs animate-pulse">Synchronizing Neural Records</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-headline font-bold mb-4">Content Protocol Offline</h1>
        <p className="text-white/40 mb-8">The requested identifier is not synchronized with the nexus.</p>
        <Button onClick={() => router.push("/")} className="rounded-full bg-primary px-8">Return Home</Button>
      </div>
    );
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Protocol Shared",
      description: "Neural transmission address added to clipboard.",
    });
  };

  return (
    <main className="min-h-screen bg-background text-foreground pb-32">
      <ReplicaNavbar />
      
      {/* Hero Backdrop Section */}
      <div className="relative h-[85vh] w-full overflow-hidden">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0"
        >
          <img 
            src={movie.thumbnailUrl} 
            className="w-full h-full object-cover brightness-[0.4]" 
            alt={movie.title}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
        </motion.div>

        <div className="absolute top-32 left-6 md:left-12 lg:left-24 z-20">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors uppercase font-black text-[10px] tracking-[0.3em] group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Nexus
          </button>
        </div>

        <div className="relative z-10 h-full flex flex-col justify-end px-6 md:px-12 lg:px-24 pb-20 max-w-[1600px] mx-auto w-full">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-8 max-w-4xl"
          >
            <div className="flex items-center gap-4">
              <Badge className="bg-primary text-white font-black uppercase tracking-widest px-3 py-1 rounded shadow-[0_0_15px_rgba(var(--primary),0.5)]">
                {movie.type === 'movie' ? 'Cinematic' : 'Series'}
              </Badge>
              <div className="flex items-center gap-1.5 text-white/60 text-sm font-bold">
                <Star className="w-4 h-4 text-primary fill-primary" />
                <span className="text-white">{movie.rating} Neural Match</span>
              </div>
            </div>

            <h1 className="text-6xl md:text-8xl font-headline font-bold text-white tracking-tighter leading-none drop-shadow-2xl">
              {movie.title}
            </h1>

            {movie.tagline && (
              <p className="text-2xl md:text-3xl font-headline text-primary/80 italic font-medium">
                "{movie.tagline}"
              </p>
            )}

            <div className="flex items-center gap-8 text-white/40 text-sm font-bold uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" /> {movie.releaseYear}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" /> {movie.duration}
              </div>
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4" /> {movie.genres.join(" • ")}
              </div>
            </div>

            <p className="text-xl md:text-2xl text-white/60 max-w-3xl leading-relaxed">
              {movie.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-6">
              <Button 
                onClick={() => router.push(`/watch/${movie.id}`)}
                className="h-16 px-12 rounded-full bg-white text-black hover:bg-primary hover:text-white font-black text-xl transition-all shadow-2xl hover:scale-105 active:scale-95"
              >
                <Play className="w-6 h-6 mr-3 fill-current" /> Play Protocol
              </Button>
              <WatchlistButton movieId={movie.id} className="h-16 px-10 text-xl font-bold bg-white/5 backdrop-blur-xl" />
              <Button 
                onClick={handleShare}
                variant="outline" 
                className="w-16 h-16 rounded-full glass border-white/10 hover:bg-white/10"
              >
                <Share2 className="w-6 h-6" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Deep Details Section */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24 -mt-12 relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 space-y-20">
          <section className="space-y-8">
            <h2 className="text-2xl font-headline font-bold text-white uppercase tracking-widest flex items-center gap-4">
              <span className="w-1.5 h-6 bg-primary rounded-full" />
              Neural Cast
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {(movie.cast || ["Lead Protocol", "Supporting Node", "Guest System"]).map((member, i) => (
                <div key={i} className="glass p-6 rounded-3xl border border-white/5 flex flex-col items-center gap-4 text-center group hover:border-primary/50 transition-all">
                  <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/20 group-hover:text-primary transition-colors">
                    <User className="w-10 h-10" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">{member}</h4>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest">Protocol Lead</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-8">
            <h2 className="text-2xl font-headline font-bold text-white uppercase tracking-widest flex items-center gap-4">
              <span className="w-1.5 h-6 bg-accent rounded-full" />
              Production Core
            </h2>
            <div className="glass p-8 rounded-[2.5rem] border border-white/5 grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-2">
                <span className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-black">Architecture (Director)</span>
                <p className="text-2xl font-headline font-bold text-white">{movie.director || "The Architect"}</p>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-black">Studio Nexus</span>
                <p className="text-2xl font-headline font-bold text-white">Replica Original Systems</p>
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-12">
          <div className="glass p-10 rounded-[3rem] border border-white/5 space-y-8">
            <h3 className="text-xl font-headline font-bold text-white flex items-center gap-3">
              <Info className="w-5 h-5 text-primary" /> Synchronization Specs
            </h3>
            <div className="space-y-6">
              {[
                { label: "Stream Quality", value: "4K ULTRA HDR" },
                { label: "Audio Profile", value: "Spatial Neural 7.1" },
                { label: "Language Protocol", value: "Global Universal" },
                { label: "IMDb Synchro", value: movie.rating }
              ].map((spec, i) => (
                <div key={i} className="flex justify-between items-center border-b border-white/5 pb-4">
                  <span className="text-xs text-white/40 font-bold uppercase tracking-widest">{spec.label}</span>
                  <span className="text-sm text-white font-bold">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-32">
        <MovieRow title="Related Syncs" movies={relatedMovies} />
      </div>

      <Toaster />
    </main>
  );
}
