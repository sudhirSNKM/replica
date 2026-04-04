
"use client";

import React, { useMemo } from "react";
import { Plus, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";

interface WatchlistButtonProps {
  movieId: string;
  className?: string;
  variant?: "outline" | "default" | "ghost";
}

export const WatchlistButton = ({ movieId, className, variant = "outline" }: WatchlistButtonProps) => {
  const firestore = useFirestore();
  const { user } = useUser();
  const activeProfileId = "default-profile"; // In a real app, this would come from profile state

  const watchlistQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, "users", user.uid, "profiles", activeProfileId, "watchlist"),
      where("contentId", "==", movieId)
    );
  }, [firestore, user, movieId]);

  const { data: watchlistItem, isLoading } = useCollection(watchlistQuery);
  const isInWatchlist = watchlistItem && watchlistItem.length > 0;

  const toggleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!firestore || !user) return;

    if (isInWatchlist) {
      const itemToDelete = watchlistItem[0];
      const docRef = doc(firestore, "users", user.uid, "profiles", activeProfileId, "watchlist", itemToDelete.id);
      deleteDocumentNonBlocking(docRef);
    } else {
      const colRef = collection(firestore, "users", user.uid, "profiles", activeProfileId, "watchlist");
      addDocumentNonBlocking(colRef, {
        userProfileId: activeProfileId,
        contentId: movieId,
        addedAt: new Date().toISOString()
      });
    }
  };

  return (
    <Button
      variant={variant}
      size="lg"
      onClick={toggleWatchlist}
      disabled={isLoading}
      className={cn(
        "rounded-full transition-all duration-300 min-w-[140px]",
        isInWatchlist ? "bg-accent/20 border-accent text-accent" : "border-white/20 hover:bg-white/10",
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : isInWatchlist ? (
        <>
          <Check className="w-5 h-5 mr-2" /> In List
        </>
      ) : (
        <>
          <Plus className="w-5 h-5 mr-2" /> My List
        </>
      )}
    </Button>
  );
};
