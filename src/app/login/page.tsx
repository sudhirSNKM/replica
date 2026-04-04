
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, UserPlus, Loader2, ArrowRight, Sparkles, ShieldCheck, Mail, Lock } from "lucide-react";
import { useUser } from "@/firebase";
import { signInWithEmailAndPassword, signInAnonymously } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { user, isUserLoading, auth } = useUser();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !email || !password) return;

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Neural Link Established", description: "Identity verified. Welcome to the Nexus." });
      router.push('/');
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
      toast({ title: "Demo Protocol Active", description: "Accessing as temporary guest node." });
      router.push('/');
    } catch (e: any) {
      toast({ title: "Demo Sync Failed", description: e.message, variant: "destructive" });
      setIsLoading(false);
    }
  };

  if (isUserLoading) return null;

  return (
    <main className="min-h-screen bg-[#050507] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Cinematic Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
      
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
            Experience high-fidelity storytelling tailored to your neural patterns. Access your personal nexus from any node.
          </p>
          <div className="flex items-center gap-10">
            <div className="space-y-2">
              <div className="text-primary font-black text-4xl">4K</div>
              <div className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-black">Ultra Fidelity</div>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="space-y-2">
              <div className="text-accent font-black text-4xl">0ms</div>
              <div className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-black">Latency</div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="glass p-12 rounded-[4rem] border-white/5 shadow-[0_30px_100px_rgba(0,0,0,0.8)] relative group">
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-primary/20 blur-[40px] rounded-full group-hover:bg-primary/30 transition-all" />
            
            <div className="space-y-10">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/10">
                  <ShieldCheck className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-4xl font-headline font-bold text-white tracking-tight">Access Nexus</h2>
                <p className="text-white/30 font-medium">Verify your neural link to synchronize.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
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

                <div className="flex flex-col gap-4">
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
                    className="w-full h-14 rounded-2xl glass border-white/10 text-white/60 hover:text-white hover:border-primary/50 transition-all"
                  >
                    Try Demo Protocol
                  </Button>
                </div>
              </form>

              <div className="text-center space-y-4 pt-4 border-t border-white/5">
                <p className="text-sm text-white/20">New to the Nexus?</p>
                <Link href="/register">
                  <Button variant="ghost" className="text-primary hover:text-primary/80 font-bold uppercase tracking-widest text-xs">
                    <UserPlus className="w-4 h-4 mr-2" /> Register Neural Identity
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3 text-[10px] text-white/10 font-black uppercase tracking-[0.5em]">
        <Sparkles className="w-4 h-4" /> Replica Systems v2.4.0
      </div>
    </main>
  );
}
