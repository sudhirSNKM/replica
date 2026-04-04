
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Check, X, Loader2, Trash2, UserPlus, Sparkles } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, setDoc, deleteDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ProfileSelectorProps {
  onSelect: (profileId: string) => void;
}

export const ProfileSelector = ({ onSelect }: ProfileSelectorProps) => {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [newProfileName, setNewProfileName] = useState("");

  const profilesRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, "users", user.uid, "profiles");
  }, [firestore, user]);

  const { data: profiles, isLoading: isProfilesLoading } = useCollection(profilesRef);

  const handleAddProfile = async () => {
    if (!firestore || !user) return;
    const id = Math.random().toString(36).substring(7);
    const profileRef = doc(firestore, "users", user.uid, "profiles", id);
    
    const newName = !profiles || profiles.length === 0 ? "Primary Protocol" : "Sub-Protocol";
    
    await setDoc(profileRef, {
      id,
      userId: user.uid,
      name: newName,
      avatarUrl: `https://picsum.photos/seed/${id}/200/200`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    toast({ title: "Profile Initialized", description: `${newName} added to your nexus.` });
  };

  const handleUpdateProfileName = async (id: string) => {
    if (!firestore || !user) return;
    const profileRef = doc(firestore, "users", user.uid, "profiles", id);
    await setDoc(profileRef, { name: newProfileName, updatedAt: new Date().toISOString() }, { merge: true });
    setEditingProfileId(null);
    toast({ title: "Profile Synced", description: "Identity protocol updated." });
  };

  const handleDeleteProfile = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!firestore || !user) return;
    const profileRef = doc(firestore, "users", user.uid, "profiles", id);
    await deleteDoc(profileRef);
    toast({ title: "Profile Terminated", description: "Identity removed from nexus." });
  };

  return (
    <div className="fixed inset-0 z-[500] bg-[#050507] flex items-center justify-center px-6 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none opacity-40" />
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center space-y-20 max-w-6xl w-full relative z-10"
      >
        <div className="space-y-6">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-6xl md:text-8xl font-headline font-bold text-white tracking-tighter"
          >
            Who's watching <span className="text-primary text-glow">Replica</span>?
          </motion.h1>
          <p className="text-white/20 uppercase tracking-[0.5em] font-black text-xs flex items-center justify-center gap-4">
            <Sparkles className="w-4 h-4 text-primary" /> Neural Synchronization Active
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-10 md:gap-16">
          {isProfilesLoading ? (
            <div className="flex flex-col items-center gap-6">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <span className="text-xs text-white/20 uppercase tracking-widest font-black animate-pulse">Accessing Nexus...</span>
            </div>
          ) : (
            <>
              {profiles?.map((profile) => (
                <motion.div 
                  key={profile.id} 
                  layout
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="group flex flex-col items-center gap-6"
                >
                  <div 
                    onClick={() => !isEditMode && onSelect(profile.id)}
                    className="relative w-32 h-32 md:w-48 md:h-48 rounded-[2.5rem] overflow-hidden border-2 border-transparent transition-all duration-500 cursor-pointer group-hover:border-primary group-hover:neon-glow-primary hover:scale-105 active:scale-95 bg-white/5 shadow-2xl"
                  >
                    <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    
                    {isEditMode && (
                      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="flex flex-col gap-3 w-full">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setEditingProfileId(profile.id); setNewProfileName(profile.name); }}
                            className="w-full py-3 rounded-xl bg-white/20 hover:bg-white/40 border border-white/20 text-white flex items-center justify-center gap-2 transition-all text-xs font-black uppercase tracking-widest"
                          >
                            <Edit2 className="w-4 h-4" /> Edit
                          </button>
                          <button 
                            onClick={(e) => handleDeleteProfile(profile.id, e)}
                            className="w-full py-3 rounded-xl bg-destructive/20 hover:bg-destructive/40 border border-destructive/20 text-destructive flex items-center justify-center gap-2 transition-all text-xs font-black uppercase tracking-widest"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {editingProfileId === profile.id ? (
                    <div className="flex items-center gap-2 mt-2">
                      <Input 
                        value={newProfileName}
                        onChange={(e) => setNewProfileName(e.target.value)}
                        className="bg-white/10 border-white/20 text-white h-10 w-44 text-center rounded-xl font-bold"
                        autoFocus
                      />
                      <button onClick={() => handleUpdateProfileName(profile.id)} className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg"><Check className="w-5 h-5" /></button>
                    </div>
                  ) : (
                    <span className="text-white/40 group-hover:text-white font-bold text-2xl transition-all tracking-tight">
                      {profile.name}
                    </span>
                  )}
                </motion.div>
              ))}

              <motion.div 
                onClick={handleAddProfile}
                className="group flex flex-col items-center gap-6 cursor-pointer"
              >
                <div className="w-32 h-32 md:w-48 md:h-48 rounded-[2.5rem] border-2 border-dashed border-white/10 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/5 transition-all bg-white/5 hover:neon-glow-primary">
                  <Plus className="w-14 h-14 text-white/10 group-hover:text-primary transition-colors" />
                </div>
                <span className="text-white/10 group-hover:text-white font-bold text-2xl transition-all tracking-tight">
                  Add Profile
                </span>
              </motion.div>
            </>
          )}
        </div>

        <div className="flex justify-center pt-10">
          <Button 
            variant="outline"
            onClick={() => {
              setIsEditMode(!isEditMode);
              setEditingProfileId(null);
            }}
            className="rounded-full border-white/10 px-16 h-16 glass text-white/40 hover:text-white hover:border-primary transition-all font-black uppercase tracking-[0.3em] text-[10px]"
          >
            {isEditMode ? "Finalize Changes" : "Manage Neural Identites"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
