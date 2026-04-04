
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Check, X, Phone, ShieldCheck, Loader2, Trash2 } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, setDoc, deleteDoc, query, onSnapshot } from "firebase/firestore";
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

  // Persistence of auth step
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
    // Simulate network delay for verification code broadcast
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
    
    await setDoc(profileRef, {
      id,
      userId: user.uid,
      name: "New Profile",
      avatarUrl: `https://picsum.photos/seed/${id}/200/200`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setEditingProfileId(id);
    setNewProfileName("New Profile");
  };

  const handleUpdateProfileName = async (id: string) => {
    if (!firestore || !user) return;
    const profileRef = doc(firestore, "users", user.uid, "profiles", id);
    await setDoc(profileRef, { name: newProfileName, updatedAt: new Date().toISOString() }, { merge: true });
    setEditingProfileId(null);
    toast({ title: "Profile Synced", description: "Identity updated in the matrix." });
  };

  const handleDeleteProfile = async (id: string) => {
    if (!firestore || !user) return;
    const profileRef = doc(firestore, "users", user.uid, "profiles", id);
    await deleteDoc(profileRef);
    toast({ title: "Profile Terminated", description: "The profile has been removed from the nexus." });
  };

  if (isUserLoading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[500] bg-background flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />
      
      <AnimatePresence mode="wait">
        {step === 'login' && (
          <motion.div 
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md space-y-8 glass p-12 rounded-[3rem] border-white/5 shadow-2xl"
          >
            <div className="text-center space-y-4">
              <Phone className="w-12 h-12 text-primary mx-auto" />
              <h2 className="text-3xl font-headline font-bold text-white">Neural Link</h2>
              <p className="text-white/40">Enter your link address to synchronize with the matrix.</p>
            </div>
            <div className="space-y-4">
              <Input 
                type="tel" 
                placeholder="+1 (555) 000-0000" 
                className="h-14 bg-white/5 border-white/10 text-white rounded-2xl px-6 text-lg"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <Button 
                onClick={handleLogin}
                disabled={isVerifying}
                className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg neon-glow-primary transition-all"
              >
                {isVerifying ? <Loader2 className="w-6 h-6 animate-spin" /> : "Request Sync Code"}
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'verify' && (
          <motion.div 
            key="verify"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md space-y-8 glass p-12 rounded-[3rem] border-white/5 shadow-2xl"
          >
            <div className="text-center space-y-4">
              <ShieldCheck className="w-12 h-12 text-accent mx-auto" />
              <h2 className="text-3xl font-headline font-bold text-white">Security Protocol</h2>
              <p className="text-white/40">Enter the 6-digit sync code transmitted to your link.</p>
            </div>
            <div className="space-y-6">
              <Input 
                maxLength={6}
                placeholder="0 0 0 0 0 0" 
                className="h-16 bg-white/5 border-white/10 text-white rounded-2xl text-center text-3xl font-bold tracking-[0.5em] focus:border-accent transition-all"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
              <div className="flex flex-col gap-4">
                <Button 
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className="w-full h-14 rounded-2xl bg-accent hover:bg-accent/90 text-white font-bold text-lg neon-glow-accent transition-all"
                >
                  {isVerifying ? <Loader2 className="w-6 h-6 animate-spin" /> : "Verify Synchronization"}
                </Button>
                <button onClick={() => setStep('login')} className="text-white/40 hover:text-white transition-colors text-sm uppercase tracking-widest font-black">
                  Wrong Link? Return
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'profiles' && (
          <motion.div 
            key="profiles"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-16 max-w-6xl w-full"
          >
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-headline font-bold text-white tracking-tighter">
                Who's watching <span className="text-primary text-glow">Replica</span>?
              </h1>
              <p className="text-white/30 uppercase tracking-[0.3em] font-black text-xs">Neural Sync Established</p>
            </div>

            <div className="flex flex-wrap justify-center gap-10 md:gap-16">
              {profiles?.map((profile) => (
                <div key={profile.id} className="group flex flex-col items-center gap-6">
                  <div 
                    onClick={() => !isEditMode && onSelect(profile.id)}
                    className="relative w-32 h-32 md:w-44 md:h-44 rounded-[2rem] overflow-hidden border-2 border-transparent transition-all duration-500 cursor-pointer group-hover:border-primary group-hover:neon-glow-primary hover:scale-105 active:scale-95"
                  >
                    <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    {isEditMode && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingProfileId(profile.id); setNewProfileName(profile.name); }}
                          className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/40 border border-white/20 text-white flex items-center justify-center transition-all"
                        >
                          <Edit2 className="w-6 h-6" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {editingProfileId === profile.id ? (
                    <div className="flex items-center gap-2 mt-2">
                      <Input 
                        value={newProfileName}
                        onChange={(e) => setNewProfileName(e.target.value)}
                        className="bg-white/10 border-white/20 text-white h-10 w-40 text-center rounded-xl"
                        autoFocus
                      />
                      <button onClick={() => handleUpdateProfileName(profile.id)} className="text-primary hover:scale-110 transition-transform"><Check /></button>
                      <button onClick={() => handleDeleteProfile(profile.id)} className="text-destructive hover:scale-110 transition-transform ml-2"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  ) : (
                    <span className="text-white/60 group-hover:text-white font-bold text-xl transition-colors">
                      {profile.name}
                    </span>
                  )}
                </div>
              ))}

              <div 
                onClick={handleAddProfile}
                className="group flex flex-col items-center gap-6 cursor-pointer"
              >
                <div className="w-32 h-32 md:w-44 md:h-44 rounded-[2rem] border-2 border-dashed border-white/10 flex items-center justify-center group-hover:border-white/40 transition-all bg-white/5 hover:bg-white/10">
                  <Plus className="w-12 h-12 text-white/20 group-hover:text-white transition-colors" />
                </div>
                <span className="text-white/20 group-hover:text-white font-bold text-xl transition-colors">
                  Add Profile
                </span>
              </div>
            </div>

            <div className="flex justify-center pt-8">
              <Button 
                variant="outline"
                onClick={() => setIsEditMode(!isEditMode)}
                className="rounded-full border-white/20 px-12 h-14 glass text-white/60 hover:text-white hover:border-primary transition-all font-bold uppercase tracking-widest text-xs"
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
