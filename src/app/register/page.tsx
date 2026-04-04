
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UserPlus, Loader2, User, Mail, Lock } from "lucide-react";
import { useFirebase } from "@/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const { auth, firestore } = useFirebase();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore || !email || !password || !name) {
      toast({ title: "Nexus Link Interrupted", description: "Missing required identity parameters.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user document in userAccounts
      await setDoc(doc(firestore, "userAccounts", user.uid), {
        id: user.uid,
        email: email,
        createdAt: new Date().toISOString()
      });

      // Create a default profile in userProfiles subcollection
      const profileId = "primary-" + Math.random().toString(36).substring(7);
      await setDoc(doc(firestore, "userAccounts", user.uid, "userProfiles", profileId), {
        id: profileId,
        userAccountId: user.uid,
        name: name,
        avatarUrl: `https://picsum.photos/seed/${profileId}/200/200`,
        createdAt: new Date().toISOString()
      });

      toast({ 
        title: "Protocol Established", 
        description: "Your neural identity has been added to the matrix." 
      });
      router.push('/');
    } catch (e: any) {
      toast({ 
        title: "Registration Error", 
        description: e.message, 
        variant: "destructive" 
      });
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050507] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-12 space-y-4">
          <Link href="/login" className="text-3xl font-headline font-bold tracking-tighter text-white inline-flex items-center gap-1">
            <span className="text-primary">RE</span>
            <span>PLICA</span>
          </Link>
          <h1 className="text-4xl font-headline font-bold text-white">New Identity</h1>
        </div>

        <div className="glass p-12 rounded-[4rem] border-white/5 shadow-[0_30px_100px_rgba(0,0,0,0.8)]">
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="relative group/input">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within/input:text-primary transition-colors" />
              <Input 
                placeholder="Display Name" 
                className="h-16 bg-white/5 border-white/10 text-white rounded-2xl pl-14 pr-6 text-lg"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="relative group/input">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within/input:text-primary transition-colors" />
              <Input 
                type="email" 
                placeholder="Matrix Address (Email)" 
                className="h-16 bg-white/5 border-white/10 text-white rounded-2xl pl-14 pr-6 text-lg"
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
                className="h-16 bg-white/5 border-white/10 text-white rounded-2xl pl-14 pr-6 text-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button 
              type="submit"
              disabled={isLoading}
              className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg neon-glow-primary active:scale-95 transition-all"
            >
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Establish Link"}
            </Button>
          </form>

          <div className="text-center mt-10">
            <Link href="/login" className="text-[10px] text-white/40 hover:text-white uppercase tracking-widest font-black transition-colors">
              Already verified? Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
