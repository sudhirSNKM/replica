
"use client";

import React, { useState } from "react";
import { useFirestore } from "@/firebase";
import { collection, doc, setDoc, getDocs } from "firebase/firestore";
import { MOCK_MOVIES } from "@/app/lib/mock-data";
import { Database, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";

export const SeedContent = () => {
  const firestore = useFirestore();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const seed = async () => {
    if (!firestore) return;
    setStatus("loading");
    setMessage("Initializing synchronization...");

    try {
      const collectionRef = collection(firestore, "content");
      const snapshot = await getDocs(collectionRef);
      
      if (!snapshot.empty) {
        setStatus("error");
        setMessage("Nexus already contains data protocols.");
        return;
      }

      for (const movie of MOCK_MOVIES) {
        await setDoc(doc(collectionRef, movie.id), movie);
      }

      setStatus("success");
      setMessage("Sample protocols stored to the media matrix.");
    } catch (error: any) {
      console.error(error);
      setStatus("error");
      setMessage(`Sync failed: ${error.message}`);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-8 glass border border-white/5 rounded-3xl max-w-sm mx-auto my-12">
      <div className="flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-[10px]">
        <Database className="w-3 h-3" /> Data Protocol
      </div>
      <h3 className="text-xl font-headline font-bold text-white text-center">Sync Sample Data</h3>
      <p className="text-white/40 text-center text-sm leading-relaxed mb-4">
        Populate your decentralized neural matrix with sample cinematic experiences.
      </p>

      {status === "idle" && (
        <Button onClick={seed} className="w-full bg-primary hover:neon-glow-primary text-white font-bold py-6 rounded-2xl">
          Initialize Sync
        </Button>
      )}

      {status === "loading" && (
        <div className="flex items-center gap-3 text-white/60">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="font-mono text-xs">{message}</span>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col items-center gap-4 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 animate-pulse" />
          <span className="text-green-500 font-bold text-sm">{message}</span>
          <Button variant="outline" onClick={() => window.location.reload()} className="mt-2 glass border-white/10 text-white rounded-xl">
            Reload Interface
          </Button>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <span className="text-destructive font-bold text-sm tracking-tight">{message}</span>
          <Button variant="outline" onClick={() => setStatus("idle")} className="mt-2 glass border-white/10 text-white rounded-xl">
            Retry Sequence
          </Button>
        </div>
      )}
    </div>
  );
};
