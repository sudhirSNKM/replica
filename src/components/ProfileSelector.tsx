
"use client";

import React from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { MOCK_PROFILES } from "@/app/lib/mock-data";

interface ProfileSelectorProps {
  onSelect: (profileId: string) => void;
}

export const ProfileSelector = ({ onSelect }: ProfileSelectorProps) => {
  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-12 max-w-4xl"
      >
        <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter text-white">
          Who's watching <span className="text-primary">Replica</span>?
        </h1>

        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
          {MOCK_PROFILES.map((profile, idx) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group cursor-pointer flex flex-col items-center gap-4"
              onClick={() => onSelect(profile.id)}
            >
              <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-2 border-transparent transition-all duration-300 group-hover:border-primary group-hover:neon-glow-primary scale-100 group-hover:scale-105">
                <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-white/60 group-hover:text-white font-medium text-lg transition-colors">
                {profile.name}
              </span>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: MOCK_PROFILES.length * 0.1 }}
            className="group cursor-pointer flex flex-col items-center gap-4"
          >
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl border-2 border-dashed border-white/20 flex items-center justify-center group-hover:border-white/50 transition-all bg-white/5 group-hover:bg-white/10">
              <Plus className="w-10 h-10 text-white/40 group-hover:text-white transition-colors" />
            </div>
            <span className="text-white/40 group-hover:text-white font-medium text-lg transition-colors">
              Add Profile
            </span>
          </motion.div>
        </div>

        <button className="text-white/40 hover:text-white/80 border border-white/20 hover:border-white/40 rounded-full px-8 py-2 text-sm font-medium tracking-widest uppercase transition-all mt-8">
          Manage Profiles
        </button>
      </motion.div>
    </div>
  );
};
