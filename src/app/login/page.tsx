
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogIn, ShieldCheck, Sparkles, Loader2 } from "lucide-react";
import { useFirebase } from "@/firebase";
import { signInWithEmailAndPassword, signInAnonymously } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function LoginPage() {
  const router = useRouter();
  const { auth, firestore, isUserLoading } = useFirebase();
  const { toast } = useToast();

  const [authMode, setAuthMode] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) return;

    setIsLoading(true);
    try {
      let uid = "";
      if (authMode === 'email') {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        uid = userCredential.user.uid;
      } else {
        // Use the phone number as a deterministic seed for demo/anonymous logic
        // In a real production app, this would be actual Phone Auth
        const userCredential = await signInAnonymously(auth);
        uid = userCredential.user.uid;
      }

      // Ensure user account node exists
      const userRef = doc(firestore, "userAccounts", uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          id: uid,
          email: authMode === 'email' ? email : null,
          phoneNumber: authMode === 'phone' ? phone : null,
          createdAt: new Date().toISOString()
        });
        
        // Create default profile for the first sync
        const profileId = "primary-" + uid.substring(0, 5);
        await setDoc(doc(firestore, "userAccounts", uid, "userProfiles", profileId), {
          id: profileId,
          userAccountId: uid,
          name: authMode === 'phone' ? `Nexus ${phone.slice(-4) || 'Alpha'}` : "Primary Node",
          avatarUrl: `https://picsum.photos/seed/${uid}/200/200`,
          createdAt: new Date().toISOString()
        });
      }

      toast({ title: "Neural Link Established", description: "Identity verified. Welcome to the Nexus." });
      router.push('/');
    } catch (e: any) {
      toast({ title: "Sync Failed", description: e.message, variant: "destructive" });
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    if (!auth || !firestore) return;
    setIsLoading(true);
    try {
      const userCredential = await signInAnonymously(auth);
      const uid = userCredential.user.uid;
      
      // Auto-promote demo user to admin if it's a fresh nexus
      const adminRef = doc(firestore, "roles_admin", uid);
      await setDoc(adminRef, {
        uid,
        email: "demo@replica.nexus",
        promotedAt: new Date().toISOString()
      });

      toast({ title: "Admin Demo Active", description: "Redirecting to Management Nexus..." });
      router.push('/admin');
    } catch (e: any) {
      toast({ title: "Demo Sync Failed", description: e.message, variant: "destructive" });
      setIsLoading(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#050507] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background pointer-events-none" />
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-24 items-center relative z-10">
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }} className="space-y-12 hidden lg:block">
          <div className="text-8xl font-headline font-bold text-white tracking-tighter">
            <span className="text-primary text-glow">RE</span><span>PLICA</span>
          </div>
          <h1 className="text-6xl font-headline font-bold text-white leading-tight">
            Sync your identity with the <span className="text-primary">matrix</span>.
          </h1>
          <p className="text-white/40 text-2xl max-w-xl font-medium leading-relaxed">
            One number, one identity. Every link creates a unique cinematic nexus that stays with you forever.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md mx-auto">
          <div className="glass p-12 rounded-[4rem] border-white/5 shadow-[0_30px_100px_rgba(0,0,0,0.8)]">
            <div className="space-y-10">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/10">
                  <ShieldCheck className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-4xl font-headline font-bold text-white tracking-tight">Access Nexus</h2>
              </div>

              <div className="flex p-1 bg-white/5 rounded-2xl">
                <button onClick={() => setAuthMode('email')} className={cn("flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all", authMode === 'email' ? 'bg-primary text-white' : 'text-white/40')}>Matrix Addr</button>
                <button onClick={() => setAuthMode('phone')} className={cn("flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all", authMode === 'phone' ? 'bg-primary text-white' : 'text-white/40')}>Neural Link</button>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                {authMode === 'email' ? (
                  <>
                    <Input type="email" placeholder="Email" className="h-16 bg-white/5 border-white/10 text-white rounded-2xl px-6" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <Input type="password" placeholder="Password" className="h-16 bg-white/5 border-white/10 text-white rounded-2xl px-6" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </>
                ) : (
                  <Input type="tel" placeholder="+1 (555) 000-0000" className="h-16 bg-white/5 border-white/10 text-white rounded-2xl px-6" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                )}

                <Button type="submit" disabled={isLoading} className="w-full h-16 rounded-2xl bg-primary hover:neon-glow-primary text-white font-bold text-lg">
                  {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Initialize Sync"}
                </Button>
                
                <Button type="button" variant="outline" onClick={handleDemoLogin} disabled={isLoading} className="w-full h-14 rounded-2xl glass border-white/10 text-white/60 hover:text-white transition-all gap-2">
                  <Sparkles className="w-4 h-4 text-primary" /> Admin Demo Protocol
                </Button>
              </form>

              <div className="text-center pt-4 border-t border-white/5">
                <Link href="/register">
                  <Button variant="ghost" className="text-primary font-bold uppercase tracking-widest text-[10px]">
                    Register Neural Identity
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
