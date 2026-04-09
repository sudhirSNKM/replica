
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogIn, ShieldCheck, Sparkles, Loader2, Key, Info } from "lucide-react";
import { useFirebase } from "@/firebase";
import { 
  signInWithEmailAndPassword, 
  signInAnonymously, 
  createUserWithEmailAndPassword 
} from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function LoginPage() {
  const router = useRouter();
  const { auth, firestore, user, isUserLoading } = useFirebase();
  const { toast } = useToast();

  const [authMode, setAuthMode] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirection for already linked nodes
  React.useEffect(() => {
    if (user && !isUserLoading && firestore) {
      async function checkPath() {
        if (!user || !firestore) return;
        const isExplicitAdmin = user.email === 'admin@replica.com';
        if (isExplicitAdmin) {
          router.replace('/admin');
          return;
        }
        
        const accountSnap = await getDoc(doc(firestore!, "userAccounts", user.uid));
        const data = accountSnap.data();
        if (data?.role === 'admin') {
          router.replace('/admin');
        } else {
          router.replace('/');
        }
      }
      checkPath();
    }
  }, [user, isUserLoading, router, firestore]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) return;

    setIsLoading(true);
    try {
      let uid = "";
      const isExplicitAdmin = email === 'admin@replica.com';

      if (authMode === 'email') {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          uid = userCredential.user.uid;
        } catch (err: any) {
          if (isExplicitAdmin && (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential')) {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            uid = userCredential.user.uid;
          } else {
            throw err;
          }
        }
      } else {
        const cleanPhone = phone.replace(/\D/g, "");
        if (cleanPhone.length < 10) throw new Error("Full 10-digit identifier required.");
        
        const mockEmail = `phone_${cleanPhone}@replica.nexus`;
        const mockPass = `pass_${cleanPhone}`;

        try {
          const userCredential = await signInWithEmailAndPassword(auth, mockEmail, mockPass);
          uid = userCredential.user.uid;
        } catch (err: any) {
          const userCredential = await createUserWithEmailAndPassword(auth, mockEmail, mockPass);
          uid = userCredential.user.uid;
        }
      }

      const userRef = doc(firestore, "userAccounts", uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          id: uid,
          email: authMode === 'email' ? email : null,
          phoneNumber: authMode === 'phone' ? phone : null,
          role: isExplicitAdmin ? 'admin' : 'user',
          subscriptionTier: 'free',
          createdAt: new Date().toISOString()
        });
        
        if (isExplicitAdmin) {
          await setDoc(doc(firestore, "roles_admin", uid), {
            uid,
            email: "admin@replica.com",
            promotedAt: new Date().toISOString()
          });
        }

        const profileId = "primary-" + uid.substring(0, 5);
        await setDoc(doc(firestore, "userAccounts", uid, "userProfiles", profileId), {
          id: profileId,
          userAccountId: uid,
          name: authMode === 'phone' ? `Nexus ${phone.slice(-4)}` : "Primary Node",
          avatarUrl: `https://picsum.photos/seed/${uid}/200/200`,
          createdAt: new Date().toISOString()
        });
      }

      toast({ title: "Neural Link Established", description: "Identity verified. Welcome to the Nexus." });
      
      // Explicit Routing after record establishment
      if (isExplicitAdmin) {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (e: any) {
      toast({ title: "Sync Failed", description: e.message, variant: "destructive" });
      setIsLoading(false);
    }
  };



  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-[#050507] flex items-center justify-center">
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
                <div className="lg:hidden text-center mb-6">
                  <div className="text-5xl font-headline font-bold text-white tracking-tighter">
                    <span className="text-primary text-glow">RE</span><span>PLICA</span>
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 mt-2">Identity Nexus</div>
                </div>

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
                


                <div className="p-8 rounded-[2.5rem] bg-primary/[0.03] border border-primary/20 space-y-4 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                    <Key className="w-12 h-12 text-primary" />
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                    <Sparkles className="w-3 h-3" />
                    Admin Access Node
                  </div>
                  <div className="space-y-2 relative z-10">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/30 font-bold uppercase tracking-widest">Address:</span>
                      <span className="text-white font-mono bg-white/5 px-2 py-0.5 rounded">admin@replica.com</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/30 font-bold uppercase tracking-widest">Secret:</span>
                      <span className="text-white font-mono bg-white/5 px-2 py-0.5 rounded">replica2024</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] text-primary/40 font-bold uppercase pt-2 italic">
                    <Info className="w-3 h-3" /> Use "Matrix Addr" mode to login manually
                  </div>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
