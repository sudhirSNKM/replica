
"use client";

import React from "react";
import { ReplicaNavbar } from "@/components/ReplicaNavbar";
import { MovieCard } from "@/components/MovieCard";
import { motion } from "framer-motion";
import { Ghost, Loader2 } from "lucide-react";
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
    <main className="min-h-screen bg-background text-foreground pt-32 px-6 md:px-12">
      <ReplicaNavbar />
      
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl md:text-6xl font-headline font-bold text-white tracking-tighter">
            My <span className="text-primary">List</span>
          </h1>
          <p className="text-white/40 text-lg">Your curated collection of future experiences.</p>
        </div>

        {watchlist && watchlist.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
            {watchlist.map((item) => (
              <WatchlistItem key={item.id} itemId={item.id} contentId={item.contentId} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
            <div className="w-24 h-24 rounded-full glass flex items-center justify-center">
              <Ghost className="w-12 h-12 text-white/20" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-headline font-bold text-white">Your list is a void</h3>
              <p className="text-white/40">Synchronize some content to populate your nexus.</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
