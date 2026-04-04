
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogIn, UserPlus, Loader2, ArrowRight, ShieldCheck, Mail, Lock, Phone, Sparkles } from "lucide-react";
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
  const { user, isUserLoading, auth, firestore } = useFirebase();
  const { toast } = useToast();

  const [authMode, setAuthMode] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // We only auto-redirect if NOT coming from a fresh demo attempt
    // handleDemoLogin will handle its own redirection
  }, [user, isUserLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) {
      toast({ title: "Auth Protocol Offline", description: "The authentication service is not responding.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      if (authMode === 'email') {
        await signInWithEmailAndPassword(auth, email, password);
        router.push('/');
      } else {
        // Phone Auth Simulation for Prototype: One Number - One Profile Persistence
        const userCredential = await signInAnonymously(auth);
        const uid = userCredential.user.uid;
        
        // Use the phone number as a key to find or create the persistent identity
        const userRef = doc(firestore, "users", uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          await setDoc(userRef, {
            id: uid,
            phoneNumber: phone,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          
          const profileId = "primary-" + uid.substring(0, 5);
          await setDoc(doc(firestore, "users", uid, "profiles", profileId), {
            id: profileId,
            userId: uid,
            name: `Nexus ${phone.slice(-4) || 'Alpha'}`,
            avatarUrl: `https://picsum.photos/seed/${phone}/200/200`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
        router.push('/');
      }
      toast({ title: "Neural Link Established", description: "Identity verified. Welcome to the Nexus." });
    } catch (e: any) {
      toast({ 
        title: "Sync Failed", 
        description: e.message || "Invalid credentials.", 
        variant: "destructive" 
      });
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    if (!auth) return;
    setIsLoading(true);
    try {
      await signInAnonymously(auth);
      toast({ 
        title: "Admin Demo Active", 
        description: "Redirecting to Management Nexus...", 
      });
      // Specifically redirect to admin page for demo protocol
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
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="space-y-12 hidden lg:block"
        >
          <div className="text-8xl font-headline font-bold text-white tracking-tighter">
            <span className="text-primary text-glow">RE</span>
            <span>PLICA</span>
          </div>
          <h1 className="text-6xl font-headline font-bold text-white leading-tight">
            Sync your identity with the <span className="text-primary">matrix</span>.
          </h1>
          <p className="text-white/40 text-2xl max-w-xl font-medium leading-relaxed">
            One number, one identity. Every link creates a unique cinematic nexus that stays with you forever.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="glass p-12 rounded-[4rem] border-white/5 shadow-[0_30px_100px_rgba(0,0,0,0.8)] relative group">
            <div className="space-y-10">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/10">
                  <ShieldCheck className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-4xl font-headline font-bold text-white tracking-tight">Access Nexus</h2>
                <p className="text-white/30 font-medium">Initialize your neural bridge.</p>
              </div>

              <div className="flex p-1 bg-white/5 rounded-2xl">
                <button 
                  onClick={() => setAuthMode('email')}
                  className={cn("flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all", authMode === 'email' ? 'bg-primary text-white shadow-lg' : 'text-white/40 hover:text-white')}
                >
                  Matrix Addr
                </button>
                <button 
                  onClick={() => setAuthMode('phone')}
                  className={cn("flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all", authMode === 'phone' ? 'bg-primary text-white shadow-lg' : 'text-white/40 hover:text-white')}
                >
                  Neural Link
                </button>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                {authMode === 'email' ? (
                  <>
                    <div className="relative group/input">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within/input:text-primary transition-colors" />
                      <Input 
                        type="email" 
                        placeholder="Matrix Address (Email)" 
                        className="h-16 bg-white/5 border-white/10 text-white rounded-2xl pl-14 pr-6 text-lg focus:ring-primary focus:border-primary transition-all"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="relative group/input">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within/input:text-primary transition-colors" />
                      <Input 
                        type="password" 
                        placeholder="Sync Key (Password)" 
                        className="h-16 bg-white/5 border-white/10 text-white rounded-2xl pl-14 pr-6 text-lg focus:ring-primary focus:border-primary transition-all"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </>
                ) : (
                  <div className="relative group/input">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within/input:text-primary transition-colors" />
                    <Input 
                      type="tel" 
                      placeholder="+1 (555) 000-0000" 
                      className="h-16 bg-white/5 border-white/10 text-white rounded-2xl pl-14 pr-6 text-lg focus:ring-primary focus:border-primary transition-all"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                )}

                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg neon-glow-primary transition-all active:scale-95 group"
                >
                  {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                    <>Initialize Sync <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" /></>
                  )}
                </Button>
                
                <Button 
                  type="button"
                  variant="outline"
                  onClick={handleDemoLogin}
                  disabled={isLoading}
                  className="w-full h-14 rounded-2xl glass border-white/10 text-white/60 hover:text-white hover:border-primary/50 transition-all gap-2"
                >
                  <Sparkles className="w-4 h-4 text-primary" /> Admin Demo Protocol
                </Button>
              </form>

              <div className="text-center pt-4 border-t border-white/5">
                <Link href="/register">
                  <Button variant="ghost" className="text-primary hover:text-primary/80 font-bold uppercase tracking-widest text-[10px]">
                    <UserPlus className="w-4 h-4 mr-2" /> Register Neural Identity
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
