
"use client";

import React, { useState, useEffect } from "react";
import { ReplicaNavbar } from "@/components/ReplicaNavbar";
import { MovieCard } from "@/components/MovieCard";
import { MOCK_MOVIES } from "@/app/lib/mock-data";
import { Movie } from "@/lib/types";
import { motion } from "framer-motion";
import { Ghost } from "lucide-react";

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<Movie[]>([]);

  useEffect(() => {
    // In a real app, we'd fetch from Firestore. 
    // Here we'll simulate by picking a few items for the "working condition" demo.
    setWatchlist(MOCK_MOVIES.slice(0, 3));
  }, []);

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

        {watchlist.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
            {watchlist.map((movie, idx) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <MovieCard movie={movie} />
              </motion.div>
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
