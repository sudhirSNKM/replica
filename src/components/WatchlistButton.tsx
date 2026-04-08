
"use client";

import React, { useState, useEffect } from "react";
import { Plus, Check, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFirestore, useUser, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { collection, query, where, doc } from "firebase/firestore";
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";

interface WatchlistButtonProps {
  movieId: string;
  className?: string;
  variant?: "outline" | "default" | "ghost";
}

export const WatchlistButton = ({ movieId, className, variant = "outline" }: WatchlistButtonProps) => {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const savedProfile = localStorage.getItem('replica_active_profile');
    setActiveProfileId(savedProfile);
  }, []);

  const accountRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, "userAccounts", user.uid);
  }, [firestore, user]);

  const { data: accountData } = useDoc(accountRef);

  const fullWatchlistQuery = useMemoFirebase(() => {
    if (!firestore || !user || !activeProfileId) return null;
    return collection(firestore, "userAccounts", user.uid, "userProfiles", activeProfileId, "watchlistItems");
  }, [firestore, user, activeProfileId]);

  const { data: fullWatchlist } = useCollection(fullWatchlistQuery);

  const watchlistQuery = useMemoFirebase(() => {
    if (!firestore || !user || !activeProfileId) return null;
    return query(
      collection(firestore, "userAccounts", user.uid, "userProfiles", activeProfileId, "watchlistItems"),
      where("contentId", "==", movieId)
    );
  }, [firestore, user, movieId, activeProfileId]);

  const { data: watchlistItem, isLoading } = useCollection(watchlistQuery);
  const isInWatchlist = watchlistItem && watchlistItem.length > 0;

  const toggleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!firestore || !user || !activeProfileId || !accountData) return;

    if (isInWatchlist) {
      const itemToDelete = watchlistItem[0];
      const docRef = doc(firestore, "userAccounts", user.uid, "userProfiles", activeProfileId, "watchlistItems", itemToDelete.id);
      deleteDocumentNonBlocking(docRef);
      toast({ title: "Removed from Matrix", description: "Cinematic node de-synchronized." });
    } else {
      const isFree = accountData.subscriptionTier === 'free';
      if (isFree && (fullWatchlist?.length || 0) >= 2) {
        toast({ 
          title: "Matrix Slot Full", 
          description: "Free nodes are limited to 2 syncs. Request a Pro Upgrade to expand.",
          variant: "destructive"
        });
        return;
      }

      const colRef = collection(firestore, "userAccounts", user.uid, "userProfiles", activeProfileId, "watchlistItems");
      addDocumentNonBlocking(colRef, {
        userAccountId: user.uid,
        userProfileId: activeProfileId,
        contentId: movieId,
        addedAt: new Date().toISOString()
      });
      toast({ title: "Sync Established", description: "Added to your personal nexus." });
    }
  };

  return (
    <Button
      variant={variant}
      size="lg"
      onClick={toggleWatchlist}
      disabled={!hasMounted || isLoading || !activeProfileId}
      className={cn(
        "rounded-full transition-all duration-300 min-w-[140px]",
        isInWatchlist ? "bg-accent/20 border-accent text-accent" : "border-white/20 hover:bg-white/10",
        className
      )}
    >
      {!hasMounted || isLoading ? (
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
