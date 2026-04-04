
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Check, X, Phone, ShieldCheck, Loader2, Trash2, UserPlus } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, setDoc, deleteDoc, query, onSnapshot, getDocs } from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ProfileSelectorProps {
  onSelect: (profileId: string) => void;
}

export const ProfileSelector = ({ onSelect }: ProfileSelectorProps) => {
  const { user, isUserLoading, auth } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [step, setStep] = useState<'login' | 'verify' | 'profiles'>('login');
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [newProfileName, setNewProfileName] = useState("");

  const profilesRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, "users", user.uid, "profiles");
  }, [firestore, user]);

  const { data: profiles, isLoading: isProfilesLoading } = useCollection(profilesRef);

  useEffect(() => {
    if (user) {
      setStep('profiles');
    }
  }, [user]);

  const handleLogin = async () => {
    if (phoneNumber.length < 10) {
      toast({ title: "Invalid Protocol", description: "Please enter a valid neural link (phone number).", variant: "destructive" });
      return;
    }
    setIsVerifying(true);
    setTimeout(() => {
      setStep('verify');
      setIsVerifying(false);
      toast({ title: "Verification Sent", description: "Neural code transmitted to your link." });
    }, 1500);
  };

  const handleVerify = async () => {
    if (verificationCode !== "123456") {
      toast({ title: "Sync Failed", description: "The verification code is incorrect.", variant: "destructive" });
      return;
    }
    setIsVerifying(true);
    try {
      if (auth) {
        await signInAnonymously(auth);
        setStep('profiles');
      }
    } catch (e: any) {
      toast({ title: "Neural Link Error", description: e.message, variant: "destructive" });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAddProfile = async () => {
    if (!firestore || !user) return;
    const id = Math.random().toString(36).substring(7);
    const profileRef = doc(firestore, "users", user.uid, "profiles", id);
    
    const newName = profiles && profiles.length === 0 ? "Main Profile" : "New Profile";
    
    await setDoc(profileRef, {
      id,
      userId: user.uid,
      name: newName,
      avatarUrl: `https://picsum.photos/seed/${id}/200/200`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    toast({ title: "Profile Initialized", description: `${newName} created in the matrix.` });
  };

  const handleUpdateProfileName = async (id: string) => {
    if (!firestore || !user) return;
    const profileRef = doc(firestore, "users", user.uid, "profiles", id);
    await setDoc(profileRef, { name: newProfileName, updatedAt: new Date().toISOString() }, { merge: true });
    setEditingProfileId(null);
    toast({ title: "Profile Synced", description: "Identity updated in the matrix." });
  };

  const handleDeleteProfile = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!firestore || !user) return;
    const profileRef = doc(firestore, "users", user.uid, "profiles", id);
    await deleteDoc(profileRef);
    toast({ title: "Profile Terminated", description: "The profile has been removed from the nexus." });
  };

  if (isUserLoading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center z-[600]">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="w-16 h-16 text-primary animate-spin" />
          <p className="text-white/20 uppercase tracking-[0.5em] font-black text-[10px] animate-pulse">Establishing Connection</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[500] bg-[#050507] flex items-center justify-center px-6 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none opacity-40" />
      
      <AnimatePresence mode="wait">
        {step === 'login' && (
          <motion.div 
            key="login"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full max-w-md space-y-10 glass p-12 rounded-[3.5rem] border-white/5 shadow-[0_30px_100px_rgba(0,0,0,0.8)] relative"
          >
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-primary/20 blur-[40px] rounded-full" />
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/10 group">
                <Phone className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
              </div>
              <h2 className="text-4xl font-headline font-bold text-white tracking-tight">Neural Link</h2>
              <p className="text-white/30 font-medium">Synchronize your link with the matrix.</p>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <Input 
                  type="tel" 
                  placeholder="+1 (555) 000-0000" 
                  className="h-16 bg-white/5 border-white/10 text-white rounded-2xl px-6 text-xl focus:ring-primary focus:border-primary transition-all text-center"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleLogin}
                disabled={isVerifying}
                className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg neon-glow-primary transition-all active:scale-95"
              >
                {isVerifying ? <Loader2 className="w-6 h-6 animate-spin" /> : "Request Protocol Code"}
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'verify' && (
          <motion.div 
            key="verify"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full max-w-md space-y-10 glass p-12 rounded-[3.5rem] border-white/5 shadow-[0_30px_100px_rgba(0,0,0,0.8)]"
          >
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-accent/20">
                <ShieldCheck className="w-8 h-8 text-accent" />
              </div>
              <h2 className="text-4xl font-headline font-bold text-white tracking-tight">Security Node</h2>
              <p className="text-white/30 font-medium">Transmission complete. Enter code.</p>
            </div>
            <div className="space-y-8">
              <Input 
                maxLength={6}
                placeholder="0 0 0 0 0 0" 
                className="h-20 bg-white/5 border-white/10 text-white rounded-2xl text-center text-4xl font-bold tracking-[0.4em] focus:border-accent transition-all"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
              <div className="flex flex-col gap-6">
                <Button 
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className="w-full h-16 rounded-2xl bg-accent hover:bg-accent/90 text-white font-bold text-lg neon-glow-accent transition-all active:scale-95"
                >
                  {isVerifying ? <Loader2 className="w-6 h-6 animate-spin" /> : "Finalize Sync"}
                </Button>
                <button onClick={() => setStep('login')} className="text-white/20 hover:text-white transition-colors text-xs uppercase tracking-[0.3em] font-black">
                  Wrong Link? Re-initialize
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'profiles' && (
          <motion.div 
            key="profiles"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-20 max-w-6xl w-full"
          >
            <div className="space-y-6">
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-6xl md:text-8xl font-headline font-bold text-white tracking-tighter"
              >
                Who's watching <span className="text-primary text-glow">Replica</span>?
              </motion.h1>
              <p className="text-white/20 uppercase tracking-[0.5em] font-black text-xs">Neural Synchronization Active</p>
            </div>

            <div className="flex flex-wrap justify-center gap-10 md:gap-16">
              {isProfilesLoading ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <span className="text-xs text-white/20 uppercase tracking-widest font-black">Loading Nexus</span>
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
                        className="relative w-32 h-32 md:w-48 md:h-48 rounded-[2.5rem] overflow-hidden border-2 border-transparent transition-all duration-500 cursor-pointer group-hover:border-primary group-hover:neon-glow-primary hover:scale-105 active:scale-95 bg-white/5"
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
                {isEditMode ? "Done Managing" : "Manage Profiles"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
