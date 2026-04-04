
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, ShieldCheck, Loader2, ArrowRight, Sparkles } from "lucide-react";
import { useUser } from "@/firebase";
import { signInAnonymously } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const { user, isUserLoading, auth } = useUser();
  const { toast } = useToast();

  const [step, setStep] = useState<'login' | 'verify'>('login');
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const handleLogin = async () => {
    if (phoneNumber.length < 10) {
      toast({ title: "Invalid Protocol", description: "Please enter a valid neural link (phone number).", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    // Simulate verification delay
    setTimeout(() => {
      setStep('verify');
      setIsLoading(false);
      toast({ title: "Verification Sent", description: "Neural code transmitted to your link." });
    }, 1500);
  };

  const handleVerify = async () => {
    if (verificationCode !== "123456") {
      toast({ title: "Sync Failed", description: "The verification code is incorrect. Use 123456.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      if (auth) {
        await signInAnonymously(auth);
        router.push('/');
      }
    } catch (e: any) {
      toast({ title: "Neural Link Error", description: e.message, variant: "destructive" });
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
            Sync your neural link with the <span className="text-primary">matrix</span>.
          </h1>
          <p className="text-white/40 text-2xl max-w-xl font-medium leading-relaxed">
            Experience high-fidelity storytelling tailored to your neural patterns. One identity, infinite synchronization.
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
            <div className="w-px h-12 bg-white/10" />
            <div className="space-y-2">
              <div className="text-white font-black text-4xl">∞</div>
              <div className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-black">Protocols</div>
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
            
            <AnimatePresence mode="wait">
              {step === 'login' ? (
                <motion.div 
                  key="login-step"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-10"
                >
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/10">
                      <Phone className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-4xl font-headline font-bold text-white tracking-tight">Neural Login</h2>
                    <p className="text-white/30 font-medium">Enter your link to synchronize.</p>
                  </div>

                  <div className="space-y-6">
                    <Input 
                      type="tel" 
                      placeholder="+1 (555) 000-0000" 
                      className="h-16 bg-white/5 border-white/10 text-white rounded-2xl px-6 text-xl focus:ring-primary focus:border-primary transition-all text-center"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                    <Button 
                      onClick={handleLogin}
                      disabled={isLoading}
                      className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg neon-glow-primary transition-all active:scale-95 group"
                    >
                      {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                        <>Request Protocol <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" /></>
                      )}
                    </Button>
                    <p className="text-[10px] text-white/20 text-center uppercase tracking-widest leading-relaxed">
                      By establishing a link, you agree to the <span className="text-white/40 underline cursor-pointer">Neural Protocol Agreement</span>.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="verify-step"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-10"
                >
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-accent/20">
                      <ShieldCheck className="w-8 h-8 text-accent" />
                    </div>
                    <h2 className="text-4xl font-headline font-bold text-white tracking-tight">Sync Code</h2>
                    <p className="text-white/30 font-medium">Transmission complete. Verify link.</p>
                  </div>

                  <div className="space-y-8">
                    <Input 
                      maxLength={6}
                      placeholder="· · · · · ·" 
                      className="h-20 bg-white/5 border-white/10 text-white rounded-2xl text-center text-4xl font-bold tracking-[0.4em] focus:border-accent transition-all"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                    />
                    <div className="flex flex-col gap-6">
                      <Button 
                        onClick={handleVerify}
                        disabled={isLoading}
                        className="w-full h-16 rounded-2xl bg-accent hover:bg-accent/90 text-white font-bold text-lg neon-glow-accent transition-all active:scale-95"
                      >
                        {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Establish Sync"}
                      </Button>
                      <button 
                        onClick={() => setStep('login')} 
                        className="text-white/20 hover:text-white transition-colors text-xs uppercase tracking-[0.3em] font-black"
                      >
                        Re-initialize Link
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
