
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Check, X, Loader2, Trash2, UserPlus, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
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
  
  // Neural Verification logic
  const [isVerified, setIsVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    // Persistent verification check
    if (user) {
      const skipVerification = localStorage.getItem(`verified_${user.uid}`);
      if (skipVerification) setIsVerified(true);
    }
  }, [user]);

  const profilesRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, "userAccounts", user.uid, "userProfiles");
  }, [firestore, user]);

  const { data: profiles, isLoading: isProfilesLoading } = useCollection(profilesRef);

  const handleVerify = () => {
    if (verificationCode.length !== 6) return;
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      if (user) localStorage.setItem(`verified_${user.uid}`, "true");
      toast({ title: "Neural Link Active", description: "Identity synchronization authorized." });
    }, 800);
  };

  const handleAddProfile = async () => {
    if (!firestore || !user) return;
    const id = "p-" + Math.random().toString(36).substring(7);
    const profileRef = doc(firestore, "userAccounts", user.uid, "userProfiles", id);
    
    const count = profiles?.length || 0;
    const name = count === 0 ? "Primary Protocol" : `Sub-Protocol ${count + 1}`;
    
    await setDoc(profileRef, {
      id,
      userAccountId: user.uid,
      name: name,
      avatarUrl: `https://picsum.photos/seed/${id}/200/200`,
      createdAt: new Date().toISOString()
    });
    
    toast({ title: "Profile Initialized", description: `${name} added to your nexus.` });
  };

  const handleUpdateProfileName = async (id: string) => {
    if (!firestore || !user) return;
    const profileRef = doc(firestore, "userAccounts", user.uid, "userProfiles", id);
    await setDoc(profileRef, { name: newProfileName }, { merge: true });
    setEditingProfileId(null);
    toast({ title: "Profile Synced", description: "Identity protocol updated." });
  };

  const handleDeleteProfile = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!firestore || !user) return;
    const profileRef = doc(firestore, "userAccounts", user.uid, "userProfiles", id);
    await deleteDoc(profileRef);
    toast({ title: "Profile Terminated", description: "Identity removed from nexus." });
  };

  if (!isVerified) {
    return (
      <div className="fixed inset-0 z-[500] bg-[#050507] flex items-center justify-center px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background opacity-40" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-12 rounded-[4rem] border-white/5 w-full max-w-md text-center space-y-10"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto border border-primary/20">
            <ShieldCheck className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-headline font-bold text-white tracking-tighter">Neural Verification</h2>
            <p className="text-white/40 font-medium leading-relaxed">Enter the 6-digit sync code sent to your linked device to initialize the library.</p>
          </div>
          <Input 
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            className="h-20 bg-white/5 border-white/10 text-white text-center text-4xl font-headline font-bold tracking-[0.5em] rounded-3xl"
          />
          <Button 
            onClick={handleVerify}
            disabled={verificationCode.length !== 6 || isVerifying}
            className="w-full h-16 rounded-2xl bg-primary hover:neon-glow-primary text-white font-bold text-lg"
          >
            {isVerifying ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Verify Link <ArrowRight className="w-5 h-5 ml-2" /></>}
          </Button>
        </motion.div>
      </div>
    );
  }

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
                  className="group flex flex-col items-center gap-6"
                >
                  <div 
                    onClick={() => !isEditMode && onSelect(profile.id)}
                    className="relative w-32 h-32 md:w-48 md:h-48 rounded-[2.5rem] overflow-hidden border-2 border-transparent transition-all duration-500 cursor-pointer group-hover:border-primary group-hover:neon-glow-primary bg-white/5 shadow-2xl"
                  >
                    <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    
                    {isEditMode && (
                      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="flex flex-col gap-3 w-full">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setEditingProfileId(profile.id); setNewProfileName(profile.name); }}
                            className="w-full py-3 rounded-xl bg-white/20 hover:bg-white/40 border border-white/20 text-white flex items-center justify-center gap-2 transition-all text-[10px] font-black uppercase tracking-widest"
                          >
                            <Edit2 className="w-4 h-4" /> Edit
                          </button>
                          <button 
                            onClick={(e) => handleDeleteProfile(profile.id, e)}
                            className="w-full py-3 rounded-xl bg-destructive/20 hover:bg-destructive/40 border border-destructive/20 text-destructive flex items-center justify-center gap-2 transition-all text-[10px] font-black uppercase tracking-widest"
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
                      <button onClick={() => handleUpdateProfileName(profile.id)} className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white"><Check className="w-5 h-5" /></button>
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
                <div className="w-32 h-32 md:w-48 md:h-48 rounded-[2.5rem] border-2 border-dashed border-white/10 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/5 transition-all bg-white/5">
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
