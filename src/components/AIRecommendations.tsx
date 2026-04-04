
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Play, RefreshCw, X } from "lucide-react";
import { getPersonalizedMovieRecommendations, PersonalizedMovieRecommendationsOutput } from "@/ai/flows/personalized-movie-recommendations-flow";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export const AIRecommendations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<PersonalizedMovieRecommendationsOutput['recommendations'] | null>(null);
  const router = useRouter();

  const handleGetRecommendations = async () => {
    setIsLoading(true);
    try {
      const result = await getPersonalizedMovieRecommendations({
        genrePreference: "Sci-Fi, Cyberpunk, Thriller",
        watchHistorySummary: "The user enjoys futuristic settings, complex plots, and high-stakes action. Recently watched Neon Protocol and Silicon Dreams."
      });
      setRecommendations(result.recommendations);
    } catch (error) {
      console.error("AI Recommendation failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-6 md:px-12 py-24 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-primary/20 text-primary font-bold text-sm">
              <Sparkles className="w-4 h-4" /> AI POWERED
            </div>
            <h2 className="text-4xl md:text-6xl font-headline font-bold text-white tracking-tighter">
              Discover Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Obsession</span>
            </h2>
            <p className="text-white/60 text-lg max-w-xl">
              Our advanced neural engine analyzes your cinematic patterns to curate a personalized collection just for you.
            </p>
          </div>
          
          <Button 
            onClick={handleGetRecommendations}
            disabled={isLoading}
            size="lg"
            className="bg-primary hover:bg-primary/90 rounded-full px-12 py-8 text-xl font-bold neon-glow-primary group"
          >
            {isLoading ? (
              <RefreshCw className="w-6 h-6 animate-spin mr-3" />
            ) : (
              <Sparkles className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
            )}
            {recommendations ? "Refresh Predictions" : "Generate Predictions"}
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {recommendations && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8"
            >
              {recommendations.map((rec, idx) => (
                <motion.div
                  key={rec.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass-card rounded-[2.5rem] p-8 space-y-6 hover:translate-y-[-10px] transition-transform"
                >
                  <div className="space-y-2">
                    <span className="text-primary text-xs font-bold uppercase tracking-widest">{rec.genre}</span>
                    <h3 className="text-2xl font-headline font-bold text-white">{rec.title}</h3>
                  </div>
                  <p className="text-white/40 text-sm leading-relaxed h-20 line-clamp-3">
                    {rec.description}
                  </p>
                  <div className="flex items-center justify-between pt-4">
                    <Button variant="ghost" className="text-white/60 hover:text-white px-0 font-bold group">
                      Learn More <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Button size="icon" className="rounded-full bg-white text-black hover:bg-primary hover:text-white">
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
