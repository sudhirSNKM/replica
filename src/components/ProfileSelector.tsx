
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, Loader2, Sparkles, ShieldCheck, ArrowRight, Zap, X, ShieldAlert } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { collection, doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ProfileSelectorProps {
  onSelect: (profileId: string) => void;
}

export const ProfileSelector = ({ onSelect }: ProfileSelectorProps) => {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [isEditMode, setIsEditMode] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    if (user) {
      const skip = localStorage.getItem(`verified_${user.uid}`);
      if (skip) setIsVerified(true);
    }
  }, [user]);

  const userAccountRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, "userAccounts", user.uid);
  }, [firestore, user]);

  const { data: accountData } = useDoc(userAccountRef);

  const profilesRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, "userAccounts", user.uid, "userProfiles");
  }, [firestore, user]);

  const { data: profiles, isLoading: isProfilesLoading } = useCollection(profilesRef);

  if (accountData?.isBanned) {
    return (
      <div className="fixed inset-0 z-[600] bg-black flex items-center justify-center p-6">
        <div className="glass p-12 rounded-[4rem] border-destructive/20 text-center space-y-8 max-w-md w-full">
          <div className="w-20 h-20 bg-destructive/10 rounded-3xl flex items-center justify-center mx-auto border border-destructive/20">
            <ShieldAlert className="w-10 h-10 text-destructive" />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-headline font-bold text-white">Access Denied</h2>
            <p className="text-white/40">This identity node has been terminated from the matrix for policy violations.</p>
          </div>
          <Button variant="outline" onClick={() => window.location.reload()} className="w-full h-16 rounded-2xl glass border-white/5 text-white">Synchronize Identity</Button>
        </div>
      </div>
    );
  }

  const handleVerify = () => {
    if (verificationCode.length !== 6) return;
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      if (user) localStorage.setItem(`verified_${user.uid}`, "true");
      toast({ title: "Neural Link Active", description: "Identity authorized." });
    }, 800);
  };

  const handleAddProfile = async () => {
    if (!firestore || !user || !accountData) return;

    const tier = accountData.subscriptionTier || 'free';
    const limit = tier === 'pro' ? 10 : 3;

    if (profiles && profiles.length >= limit) {
      setShowUpgradeModal(true);
      return;
    }

    const id = "p-" + Math.random().toString(36).substring(7);
    const profileRef = doc(firestore, "userAccounts", user.uid, "userProfiles", id);
    
    await setDoc(profileRef, {
      id,
      userAccountId: user.uid,
      name: `Nexus ${profiles?.length ? profiles.length + 1 : 1}`,
      avatarUrl: `https://picsum.photos/seed/${id}/200/200`,
      createdAt: new Date().toISOString()
    });
    
    toast({ title: "Profile Initialized" });
  };

  const handleRequestUpgrade = async () => {
    if (!firestore || !user) return;
    setIsRequesting(true);
    try {
      const accountRef = doc(firestore, "userAccounts", user.uid);
      await updateDoc(accountRef, { isUpgradePending: true });
      toast({ title: "Signal Sent", description: "Your upgrade request has been queued for admin verification." });
      setShowUpgradeModal(false);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Error", description: e.message });
    } finally {
      setIsRequesting(false);
    }
  };

  if (!isVerified) {
    return (
      <div className="fixed inset-0 z-[500] bg-[#050507] flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass p-12 rounded-[4rem] border-white/5 w-full max-w-md text-center space-y-10">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto border border-primary/20">
            <ShieldCheck className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-headline font-bold text-white">Verification</h2>
            <p className="text-white/40 text-sm">Enter the 6-digit sync code to initialize the library.</p>
          </div>
          <Input 
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            className="h-20 bg-white/5 border-white/10 text-white text-center text-4xl font-headline font-bold tracking-[0.5em] rounded-3xl"
          />
          <Button onClick={handleVerify} disabled={verificationCode.length !== 6 || isVerifying} className="w-full h-16 rounded-2xl bg-primary text-white font-bold text-lg">
            {isVerifying ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Verify Link <ArrowRight className="w-5 h-5 ml-2" /></>}
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[500] bg-[#050507] flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-20 max-w-6xl w-full">
        <div className="space-y-6">
          <h1 className="text-6xl md:text-8xl font-headline font-bold text-white tracking-tighter">
            Who's watching <span className="text-primary text-glow">Replica</span>?
          </h1>
          <div className="text-white/20 uppercase tracking-[0.5em] font-black text-xs flex items-center justify-center gap-4">
            <Sparkles className="w-4 h-4 text-primary" /> Neural Synchronization Active
            <Badge variant="outline" className="ml-4 border-primary text-primary px-4 py-1 rounded-full">
              Tier: {accountData?.subscriptionTier?.toUpperCase() || 'FREE'}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-10 md:gap-16">
          {profiles?.map((profile) => (
            <motion.div key={profile.id} className="group flex flex-col items-center gap-6">
              <div 
                onClick={() => !isEditMode && onSelect(profile.id)}
                className="relative w-32 h-32 md:w-48 md:h-48 rounded-[2.5rem] overflow-hidden border-2 border-transparent group-hover:border-primary transition-all cursor-pointer bg-white/5"
              >
                <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                {isEditMode && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-4">
                    <button onClick={(e) => { e.stopPropagation(); deleteDoc(doc(firestore!, "userAccounts", user!.uid, "userProfiles", profile.id)); }} className="w-full py-3 rounded-xl bg-destructive/20 text-destructive text-[10px] font-black uppercase tracking-widest">Delete</button>
                  </div>
                )}
              </div>
              <span className="text-white/40 group-hover:text-white font-bold text-2xl transition-all">{profile.name}</span>
            </motion.div>
          ))}

          <div onClick={handleAddProfile} className="group flex flex-col items-center gap-6 cursor-pointer">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-[2.5rem] border-2 border-dashed border-white/10 flex items-center justify-center group-hover:border-primary bg-white/5">
              <Plus className="w-14 h-14 text-white/10 group-hover:text-primary" />
            </div>
            <span className="text-white/10 group-hover:text-white font-bold text-2xl transition-all">Add Profile</span>
          </div>
        </div>

        <div className="flex gap-6 justify-center">
          <Button 
            variant="outline"
            onClick={() => setIsEditMode(!isEditMode)}
            className="rounded-full border-white/10 px-16 h-16 glass text-white/40 hover:text-white uppercase tracking-[0.3em] text-[10px]"
          >
            {isEditMode ? "Finalize Changes" : "Manage Neural Identities"}
          </Button>
          
          {accountData?.subscriptionTier === 'free' && (
            <Button 
              onClick={() => setShowUpgradeModal(true)}
              className="rounded-full bg-accent hover:neon-glow-accent px-16 h-16 text-white font-black uppercase tracking-[0.3em] text-[10px]"
            >
              <Zap className="w-4 h-4 mr-2" /> {accountData.isUpgradePending ? "Upgrade Pending" : "Request Pro Upgrade"}
            </Button>
          )}
        </div>
      </motion.div>

      {/* Upgrade Modal */}
      <AnimatePresence>
        {showUpgradeModal && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
              onClick={() => setShowUpgradeModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative glass p-12 rounded-[4rem] border-primary/20 max-w-lg w-full text-center space-y-8"
            >
              <button onClick={() => setShowUpgradeModal(false)} className="absolute top-8 right-8 text-white/20 hover:text-white"><X className="w-6 h-6" /></button>
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto border border-primary/20">
                <Zap className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-4">
                <h3 className="text-4xl font-headline font-bold text-white tracking-tighter">Expand Your Matrix</h3>
                <p className="text-white/40">The Free plan is limited to 3 neural profiles and 2 synchronized movies. Request an upgrade to authorize 10 profiles and unlimited cinematic protocols.</p>
              </div>
              <div className="space-y-4">
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 text-left space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">Replica Pro</span>
                    <span className="text-primary font-black">$9.99 / cycle</span>
                  </div>
                  <ul className="text-sm text-white/40 space-y-2">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> 10 Neural Profiles</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Unlimited Library Sync</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> 4K Ultra Stream Bitrate</li>
                  </ul>
                </div>
                {accountData?.isUpgradePending ? (
                  <div className="bg-primary/10 border border-primary/20 p-6 rounded-2xl text-primary font-bold">
                    Upgrade Request Sent
                  </div>
                ) : (
                  <Button onClick={handleRequestUpgrade} disabled={isRequesting} className="w-full h-16 rounded-2xl bg-primary text-white font-bold text-lg hover:neon-glow-primary">
                    {isRequesting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Request Pro Link"}
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
