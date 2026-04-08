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
  ChevronLeft,
  CheckCircle2,
  PlayCircle
} from "lucide-react";
import { ReplicaNavbar } from "@/components/ReplicaNavbar";
import { MovieRow } from "@/components/MovieRow";
import { WatchlistButton } from "@/components/WatchlistButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Episode, Movie } from "@/lib/types";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { MOCK_MOVIES } from "@/app/lib/mock-data";
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
  const movie = (firestoreMovie as unknown as Movie) || MOCK_MOVIES.find(m => m.id === id);

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
      <div className="relative min-h-[100vh] w-full overflow-hidden">
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
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-transparent opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent hidden md:block" />
        </motion.div>

        <div className="relative z-10 h-full flex flex-col justify-end px-6 md:px-12 lg:px-24 pb-20 pt-32 max-w-[1600px] mx-auto w-full">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-8 max-w-4xl"
          >
            {/* Navigation Element */}
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-white/40 hover:text-white transition-colors uppercase font-black text-[10px] tracking-[0.3em] group mb-4 w-fit"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Nexus
            </button>

            <div className="flex flex-wrap items-center gap-4">
              <Badge className="bg-primary text-white font-black uppercase tracking-widest px-3 py-1 rounded shadow-[0_0_15px_rgba(var(--primary),0.5)]">
                {movie.type === 'movie' ? 'Cinematic' : 'Series'}
              </Badge>
              <div className="flex items-center gap-1.5 text-white/60 text-sm font-bold">
                <Star className="w-4 h-4 text-primary fill-primary" />
                <span className="text-white">{movie.rating} Neural Match</span>
              </div>
            </div>

            <h1 className="text-5xl md:text-8xl font-headline font-bold text-white tracking-tighter leading-none drop-shadow-2xl">
              {movie.title}
            </h1>

            {movie.tagline && (
              <p className="text-xl md:text-3xl font-headline text-primary/80 italic font-medium">
                "{movie.tagline}"
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-white/40 text-[10px] md:text-sm font-bold uppercase tracking-widest">
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

            <p className="text-lg md:text-2xl text-white/60 max-w-3xl leading-relaxed line-clamp-4 md:line-clamp-none">
              {movie.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-6">
              <Button 
                onClick={() => router.push(`/watch/${movie.id}`)}
                className="h-14 md:h-16 w-full md:w-auto px-12 rounded-full bg-white text-black hover:bg-primary hover:text-white font-black text-lg md:text-xl transition-all shadow-2xl active:scale-95"
              >
                <Play className="w-6 h-6 mr-3 fill-current" /> Play Protocol
              </Button>
              
              <div className="flex items-center gap-4 w-full md:w-auto">
                <WatchlistButton 
                  movieId={movie.id} 
                  className="h-14 md:h-16 flex-1 md:flex-none px-10 text-lg md:text-xl font-bold bg-white/5 backdrop-blur-xl" 
                />
                <Button 
                  onClick={handleShare}
                  variant="outline" 
                  className="w-14 h-14 md:w-16 md:h-16 rounded-full glass border-white/10 hover:bg-white/10 shrink-0"
                >
                  <Share2 className="w-6 h-6" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Deep Details Section */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24 -mt-12 relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 space-y-20">
          
          {/* Episodes Section - Show only for series */}
          {movie.type === 'show' && (
            <section className="space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
              <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <h2 className="text-3xl font-headline font-bold text-white uppercase tracking-tighter flex items-center gap-4">
                  <span className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
                  Episodic Protocols
                </h2>
                <Badge variant="outline" className="border-primary/30 text-primary py-1 px-4 rounded-full font-black tracking-widest text-[10px]">
                  {movie.episodes?.length || 0} NODES DETECTED
                </Badge>
              </div>

              <div className="space-y-4">
                {movie.episodes && movie.episodes.length > 0 ? (
                  movie.episodes.map((episode: Episode, idx: number) => (
                    <div 
                      key={episode.id} 
                      className="group glass p-4 md:p-6 rounded-[2rem] border border-white/5 hover:border-primary/30 hover:bg-white/[0.03] transition-all flex flex-col md:flex-row gap-6 cursor-pointer"
                      onClick={() => router.push(`/watch/${movie.id}?ep=${episode.id}`)}
                    >
                      <div className="relative w-full md:w-64 h-36 rounded-2xl overflow-hidden shrink-0 border border-white/5">
                        <img src={episode.thumbnailUrl || movie.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={episode.title} />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <PlayCircle className="w-10 h-10 text-white fill-white/20" />
                        </div>
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 backdrop-blur-md rounded text-[8px] font-black text-white/60 tracking-widest">
                          {episode.duration}
                        </div>
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-center space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-primary font-black uppercase tracking-widest text-[10px]">EP {episode.episodeNumber}</span>
                            <h3 className="text-xl font-headline font-bold text-white group-hover:text-primary transition-colors">{episode.title}</h3>
                          </div>
                          {/* Viewed Protocol - Logic to be linked with user history */}
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/20 group-hover:text-white/40 transition-colors">
                             <CheckCircle2 className="w-4 h-4 text-primary/20 group-hover:text-primary/40" />
                             Unseen Protocol
                          </div>
                        </div>
                        <p className="text-white/40 text-sm line-clamp-2 leading-relaxed">
                          {episode.description}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem] space-y-4">
                    <Film className="w-12 h-12 text-white/10 mx-auto" />
                    <p className="text-white/20 uppercase tracking-[0.4em] font-black text-[10px]">No episodic components synchronized for this identity.</p>
                  </div>
                )}
              </div>
            </section>
          )}

          <section className="space-y-8">
            <h2 className="text-2xl font-headline font-bold text-white uppercase tracking-widest flex items-center gap-4">
              <span className="w-1.5 h-6 bg-primary rounded-full" />
              Neural Cast
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {(movie.cast || ["Lead Protocol", "Supporting Node", "Guest System"]).map((member: string, i: number) => (
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
              ].map((spec, i: number) => (
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
