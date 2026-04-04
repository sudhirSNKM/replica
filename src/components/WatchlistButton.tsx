
"use client";

import React, { useState } from "react";
import { Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WatchlistButtonProps {
  movieId: string;
  className?: string;
  variant?: "outline" | "default" | "ghost";
}

export const WatchlistButton = ({ movieId, className, variant = "outline" }: WatchlistButtonProps) => {
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  const toggleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsInWatchlist(!isInWatchlist);
  };

  return (
    <Button
      variant={variant}
      size="lg"
      onClick={toggleWatchlist}
      className={cn(
        "rounded-full transition-all duration-300",
        isInWatchlist ? "bg-accent/20 border-accent text-accent" : "border-white/20 hover:bg-white/10",
        className
      )}
    >
      {isInWatchlist ? (
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
